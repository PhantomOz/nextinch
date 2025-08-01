// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TwapCore {
    using SafeERC20 for IERC20;

    // Order storage
    address worker;
    mapping(bytes32 => TWAPOrder) public orders;
    mapping(address => bytes32[]) public userOrders;
    mapping(address => bool) public isSupportedToken;

    // TWAP order structure
    struct TWAPOrder {
        address maker;
        address makerAsset;
        address takerAsset;
        uint256 totalAmount;
        uint256 chunkSize;
        uint256 chunks;
        uint256 interval;
        uint256 startTime;
        uint256 slippageBips;
        uint256 chunksExecuted;
        bool cancelled;
    }

    // Events
    event OrderCreated(bytes32 indexed orderId);
    event ChunkScheduled(
        bytes32 indexed orderId,
        uint256 chunkIndex,
        uint256 executeAfter
    );
    event ChunkCompleted(bytes32 indexed orderId, uint256 chunkIndex);
    event OrderCancelled(bytes32 indexed orderId);

    modifier onlyWorker() {
        if (msg.sender != worker) {
            revert("Not Worker");
        }
        _;
    }

    constructor(address _worker, address[] memory _supportedToken) {
        worker = _worker;
        for (uint8 i = 0; i < _supportedToken.length; i++) {
            isSupportedToken[_supportedToken[i]] = true;
        }
    }

    /**
     * @notice Creates a new TWAP order
     */
    function createTWAPOrder(
        address makerAsset,
        address takerAsset,
        uint256 totalAmount,
        uint256 chunks,
        uint256 interval,
        uint256 slippageBips
    ) external returns (bytes32 orderId) {
        require(
            isSupportedToken[makerAsset] && isSupportedToken[takerAsset],
            "Not A Supported Asset"
        );
        require(chunks > 0 && chunks <= 20, "Invalid chunks");
        require(interval > 0, "Invalid interval");
        require(slippageBips < 500, "Slippage too high");

        uint256 chunkSize = totalAmount / chunks;
        require(chunkSize > 0, "Chunk too small");

        orderId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                makerAsset,
                takerAsset,
                totalAmount
            )
        );

        orders[orderId] = TWAPOrder({
            maker: msg.sender,
            makerAsset: makerAsset,
            takerAsset: takerAsset,
            totalAmount: totalAmount,
            chunkSize: chunkSize,
            chunks: chunks,
            interval: interval,
            startTime: block.timestamp,
            slippageBips: slippageBips,
            chunksExecuted: 0,
            cancelled: false
        });

        userOrders[msg.sender].push(orderId);

        // Transfer funds to contract
        IERC20(makerAsset).safeTransferFrom(
            msg.sender,
            address(this),
            totalAmount
        );

        // Schedule first chunk
        _scheduleChunk(orderId, 0);

        emit OrderCreated(orderId);
    }

    /**
     * @notice Called by worker after off-chain execution
     */
    function completeChunk(
        bytes32 orderId,
        uint256 chunkIndex
    ) external onlyWorker {
        TWAPOrder storage order = orders[orderId];
        require(!order.cancelled, "Order cancelled");
        require(chunkIndex == order.chunksExecuted, "Invalid chunk sequence");

        // Update state
        order.chunksExecuted++;

        // Schedule next chunk if applicable
        if (order.chunksExecuted < order.chunks) {
            _scheduleChunk(orderId, order.chunksExecuted);
        }

        emit ChunkCompleted(orderId, chunkIndex);
    }

    /**
     * @notice Cancels order and returns remaining funds
     */
    function cancelOrder(bytes32 orderId) external {
        TWAPOrder storage order = orders[orderId];
        require(order.maker == msg.sender, "Not order maker");
        require(!order.cancelled, "Already cancelled");

        // Calculate remaining amount
        uint256 remaining = order.totalAmount -
            (order.chunksExecuted * order.chunkSize);
        if (remaining > 0) {
            IERC20(order.makerAsset).safeTransfer(order.maker, remaining);
        }

        order.cancelled = true;
        emit OrderCancelled(orderId);
    }

    /**
     * @dev Internal: Schedule a chunk for execution
     */
    function _scheduleChunk(bytes32 orderId, uint256 chunkIndex) private {
        TWAPOrder storage order = orders[orderId];
        uint256 executeAfter = order.startTime + (chunkIndex * order.interval);

        emit ChunkScheduled(orderId, chunkIndex, executeAfter);
    }

    // View functions
    function getUserOrders(
        address user
    ) external view returns (bytes32[] memory) {
        return userOrders[user];
    }

    function getOrderDetails(
        bytes32 orderId
    ) external view returns (TWAPOrder memory) {
        return orders[orderId];
    }
}
