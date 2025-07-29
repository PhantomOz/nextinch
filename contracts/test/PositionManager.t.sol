// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {MockERC20} from "./MockERC20.sol";

contract PositionManagerTest is Test {
    PositionManager positionManager;
    address orderManager;
    address user;
    MockERC20 tokenA;
    MockERC20 tokenB;

    function setUp() public {
        orderManager = makeAddr("ownerManager");
        user = makeAddr("user");
        positionManager = new PositionManager(orderManager);
        tokenA = new MockERC20("Wrapped Ether", "WETH", 1000E18, 18);
        tokenB = new MockERC20("USD Circle", "USDC", 1000E6, 6);

        tokenA.mint(user, 1000 ether);
        tokenB.mint(user, 1000 ether);
    }

    function test_createPosition() public {
        vm.startPrank(user);
        uint256 _amount = 0.01 ether;
        uint256 _buying = 100_000_000;
        uint256 _priceLower = 0.0009999 ether;
        uint256 _priceUpper = 0.0022 ether;
        tokenA.approve(address(positionManager), _amount);
        uint256 positionId = positionManager.createPosition(
            address(tokenA),
            address(tokenB),
            _amount,
            _buying,
            _priceLower,
            _priceUpper
        );
        uint256 _nextPID = positionManager.nextPositionId();
        assert(_nextPID > positionId);
    }

    function test_releaseFunds() public {
        vm.startPrank(user);
        uint256 _amountSelling = 0.01 ether;
        uint256 _amountBuying = 100_000_000;
        uint256 _priceLower = 0.0009999 ether;
        uint256 _priceUpper = 0.0022 ether;
        tokenA.approve(address(positionManager), _amountSelling);
        uint256 positionId = positionManager.createPosition(
            address(tokenA),
            address(tokenB),
            _amountSelling,
            _amountBuying,
            _priceLower,
            _priceUpper
        );
        uint256 _nextPID = positionManager.nextPositionId();
        assert(_nextPID > positionId);

        vm.stopPrank();
        vm.startPrank(orderManager);

        positionManager.releaseFundsToSystem(positionId);
    }
}
