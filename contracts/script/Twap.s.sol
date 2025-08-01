// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TwapCore} from "../src/Twap.sol";
import {MockERC20} from "../test/MockERC20.sol";

contract TwapCoreTest is Test {
    TwapCore twapCore;
    address worker;
    MockERC20 tokenA;
    MockERC20 tokenB;
    MockERC20 tokenC;
    MockERC20 tokenD;

    function run() public {
        vm.startBroadcast();
        tokenA = new MockERC20("Wrapped Ether", "tokenA", 1000E18, 18);
        tokenB = new MockERC20("USD Circle", "tokenB", 1000E6, 6);
        tokenC = new MockERC20("BitCoin", "BTC", 1000E8, 8);
        tokenD = new MockERC20("DAI", "DAI", 1000E18, 18);
        address[] memory supportedToken = new address[](4);
        supportedToken[0] = address(tokenA);
        supportedToken[1] = address(tokenB);
        supportedToken[2] = address(tokenC);
        supportedToken[3] = address(tokenD);
        twapCore = new TwapCore(worker, supportedToken);
        vm.stopBroadcast();
    }
}
