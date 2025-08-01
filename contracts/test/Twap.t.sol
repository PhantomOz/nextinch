// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TwapCore} from "../src/Twap.sol";
import {MockERC20} from "./MockERC20.sol";

contract TwapCoreTest is Test {
    TwapCore twapCore;
    address worker;
    address user;
    MockERC20 tokenA;
    MockERC20 tokenB;
    MockERC20 tokenC;
    MockERC20 tokenD;

    function setUp() public {
        worker = makeAddr("ownerManager");
        user = makeAddr("user");
        twapCore = new TwapCore();
        tokenA = new MockERC20("Wrapped Ether", "tokenA", 1000E18, 18);
        tokenB = new MockERC20("USD Circle", "tokenB", 1000E6, 6);
        tokenC = new MockERC20("BitCoin", "BTC", 1000E8, 8);
        tokenD = new MockERC20("DAI", "DAI", 1000E18, 18);

        tokenA.mint(user, 1000 ether);
        tokenB.mint(user, 1000 ether);
        tokenC.mint(user, 1000 ether);
        tokenD.mint(user, 1000 ether);
    }

    function testOrderLifecycle() public {
        vm.startPrank(user);

        // Approve tokenB
        tokenB.approve(address(twapCore), 5_000 * 1e6);

        // Create TWAP order
        bytes32 orderId = twapCore.createTWAPOrder(
            address(tokenB),
            address(tokenA),
            5_000 * 1e6, // 5k tokenB
            5, // 5 chunks
            300, // 5 min intervals
            100 // 1% slippage
        );

        vm.stopPrank();

        // Verify order creation
        TwapCore.TWAPOrder memory order = twapCore.getOrderDetails(orderId);
        assertEq(order.maker, user);
        assertEq(order.chunks, 5);

        // Simulate worker processing first chunk
        vm.startPrank(worker);
        twapCore.completeChunk(orderId, 0);

        // Verify state update
        order = twapCore.getOrderDetails(orderId);
        assertEq(order.chunksExecuted, 1);

        // Cancel order
        vm.startPrank(user);
        twapCore.cancelOrder(orderId);
        order = twapCore.getOrderDetails(orderId);
        assertTrue(order.cancelled);
    }
}
