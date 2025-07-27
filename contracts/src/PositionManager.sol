// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PositionManager {
    using SafeERC20 for IERC20;

    mapping(uint256 => CLPosition) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public nextPositionId;

    struct CLPosition {
        address owner;
        address tokenA;
        address tokenB;
        uint256 amountDeposited;
        uint256 priceLower; // Price range lower bound
        uint256 priceUpper; // Price range upper bound
        uint256 currentTick; // Current active price level
        uint256 totalFees; // Fees earned so far
        uint256 createdAt;
        bool isActive;
        bytes32[] orderHashes; // References to off-chain orders
    }

    event PositionCreated(
        uint256 indexed positionId,
        address indexed owner,
        address tokenA,
        address tokenB,
        uint256 amount,
        uint256 priceLower,
        uint256 priceUpper
    );

    event PositionClosed(
        uint256 indexed positionId,
        uint256 finalValue,
        uint256 feesEarned
    );

    function createPosition(
        address _tokenA,
        address _tokenB,
        uint256 _amount,
        uint256 _priceLower,
        uint256 _priceUpper
    ) external returns (uint256 positionId) {
        require(_priceLower < _priceUpper, "Invalid range");
        require(_amount > 0, "Amount must be positive");

        // Transfer tokens from user
        IERC20(_tokenA).safeTransferFrom(msg.sender, address(this), _amount);

        positionId = nextPositionId++;

        positions[positionId] = CLPosition({
            owner: msg.sender,
            tokenA: _tokenA,
            tokenB: _tokenB,
            amountDeposited: _amount,
            priceLower: _priceLower,
            priceUpper: _priceUpper,
            currentTick: _priceLower, // Start at lower bound
            totalFees: 0,
            createdAt: block.timestamp,
            isActive: true,
            orderHashes: new bytes32[](0)
        });

        userPositions[msg.sender].push(positionId);

        emit PositionCreated(
            positionId,
            msg.sender,
            _tokenA,
            _tokenB,
            _amount,
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

        // Calculate final value (simplified for demo)
        uint256 finalValue = position.amountDeposited + position.totalFees;

        emit PositionClosed(_positionId, finalValue, position.totalFees);
    }
}
