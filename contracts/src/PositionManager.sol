// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PositionManager {
    using SafeERC20 for IERC20;

    mapping(uint256 => CLPosition) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public nextPositionId;
    address orderManager;

    struct CLPosition {
        address owner;
        address tokenA;
        address tokenB;
        uint256 amountSelling;
        uint256 amountBuying;
        uint256 priceLower; // Price range lower bound
        uint256 priceUpper; // Price range upper bound
        uint256 currentTick; // Current active price level
        uint256 totalFees; // Fees earned so far
        uint256 createdAt;
        bool isReleaseFunds;
        bool isActive;
        bytes32[] orderHashes; // References to off-chain orders
    }

    event PositionCreated(
        uint256 indexed positionId,
        address indexed owner,
        address tokenA,
        address tokenB,
        uint256 amountSelling,
        uint256 amountBuying,
        uint256 priceLower,
        uint256 priceUpper
    );

    event PositionClosed(uint256 indexed positionId);

    event OrderFilled(
        uint256 indexed positionId,
        bytes32 orderHash,
        uint256 price,
        uint256 amount
    );

    event FundsReleasedToSystem(
        uint256 indexed positionId,
        address indexed orderManager
    );

    modifier onlyOrderManager() {
        if (msg.sender != orderManager) {
            revert("Not Order Manager");
        }
        _;
    }

    constructor(address _orderManager) {
        orderManager = _orderManager;
    }

    function createPosition(
        address _tokenA,
        address _tokenB,
        uint256 _amountSelling,
        uint256 _amountBuying,
        uint256 _priceLower,
        uint256 _priceUpper
    ) external returns (uint256 positionId) {
        require(_priceLower < _priceUpper, "Invalid range");
        require(_priceLower > 0, "Invalid range");
        require(_amountSelling > 0, "Amount must be positive");
        require(_amountBuying > 0, "Amount must be positive");

        // Transfer tokens from user
        IERC20(_tokenA).safeTransferFrom(
            msg.sender,
            address(this),
            _amountSelling
        );

        positionId = nextPositionId++;

        positions[positionId] = CLPosition({
            owner: msg.sender,
            tokenA: _tokenA,
            tokenB: _tokenB,
            amountSelling: _amountSelling,
            amountBuying: _amountBuying,
            priceLower: _priceLower,
            priceUpper: _priceUpper,
            currentTick: _priceLower, // Start at lower bound
            totalFees: 0,
            createdAt: block.timestamp,
            isReleaseFunds: false,
            isActive: true,
            orderHashes: new bytes32[](0)
        });

        userPositions[msg.sender].push(positionId);

        emit PositionCreated(
            positionId,
            msg.sender,
            _tokenA,
            _tokenB,
            _amountSelling,
            _amountBuying,
            _priceLower,
            _priceUpper
        );

        return positionId;
    }

    function closePosition(uint256 _positionId) external {
        CLPosition storage position = positions[_positionId];
        require(position.owner == msg.sender, "Not position owner");
        require(position.isActive, "Position already closed");

        position.isActive = false;

        emit PositionClosed(_positionId);
    }

    function reportOrderFilled(
        uint256 _positionId,
        bytes32 _orderHash,
        uint256 _executionPrice,
        uint256 _amount,
        uint256 _fees
    ) external onlyOrderManager {
        CLPosition storage position = positions[_positionId];
        require(position.isActive, "Position not active");

        // Update position state
        position.currentTick = _executionPrice;
        position.totalFees += _fees;
        position.orderHashes.push(_orderHash);

        emit OrderFilled(_positionId, _orderHash, _executionPrice, _amount);
    }

    function releaseFundsToSystem(
        uint256 _positionId
    ) external onlyOrderManager {
        CLPosition storage position = positions[_positionId];
        require(position.isActive, "Position already closed");
        require(!position.isReleaseFunds, "Position has already release");

        position.isReleaseFunds = true;
        IERC20(position.tokenA).safeTransfer(
            orderManager,
            position.amountSelling
        );
        emit FundsReleasedToSystem(_positionId, orderManager);
    }
}
