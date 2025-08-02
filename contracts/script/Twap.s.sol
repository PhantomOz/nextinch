// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {TwapCore} from "../src/Twap.sol";
import {MockERC20} from "../test/MockERC20.sol";

contract TwapCoreTest is Script {
    TwapCore twapCore;
    address worker = 0x50B2aE1368f058ed5e1E97aEa87Ff12C01f6210C;
    MockERC20 tokenA;
    MockERC20 tokenB;
    MockERC20 tokenC;
    MockERC20 tokenD;

    function run() public {
        vm.startBroadcast();
        tokenA = new MockERC20("Wrapped Ether", "WETH", 1000E18, 18);
        tokenB = new MockERC20("USD Circle", "USDC", 1000E6, 6);
        tokenC = new MockERC20("Wrapped BitCoin", "WBTC", 1000E8, 8);
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
