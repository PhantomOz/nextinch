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
        worker = 0x50B2aE1368f058ed5e1E97aEa87Ff12C01f6210C;
        user = 0x50B2aE1368f058ed5e1E97aEa87Ff12C01f6210C;
        tokenA = MockERC20(0x8388d11770031E6a4A113A0D8aFa2226323F0bCb);
        tokenB = MockERC20(0x5Aa8F9123B3Bdf340F33DBfA5A5A8EF6654438EC);
        tokenC = MockERC20(0xD87993eb709c1ADf214EF4648d560ADeABc7AdA3);
        tokenD = MockERC20(0x75fDf32739e8701B7AF7E40aD888440BEE93fbc1);
        // address[] memory supportedToken = new address[](4);
        // supportedToken[0] = address(tokenA);
        // supportedToken[1] = address(tokenB);
        // supportedToken[2] = address(tokenC);
        // supportedToken[3] = address(tokenD);
        twapCore = TwapCore(0xf1E7d9D06127028f2f022Ff45B478735E41C267b);

        tokenA.mint(user, 5_000 ether);
        tokenB.mint(user, 5_000 ether);
        tokenC.mint(user, 5_000 ether);
        tokenD.mint(user, 5_000 ether);
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

    function testChunkRevertOnCancelled() public {
        testOrderLifecycle();
        bytes32 orderId = twapCore.getUserOrders(user)[0];

        // Verify events emitted
        vm.expectRevert();

        // Worker completes first chunk
        vm.startPrank(worker);
        twapCore.completeChunk(orderId, 0);
    }
}
