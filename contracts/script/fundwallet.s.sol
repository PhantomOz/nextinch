// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MockERC20} from "../test/MockERC20.sol";

contract FundWalletTest is Script {
    address user = 0x4a3aF8C69ceE81182A9E74b2392d4bDc616Bf7c7;
    MockERC20 weth = MockERC20(0x8388d11770031E6a4A113A0D8aFa2226323F0bCb);
    MockERC20 usdc = MockERC20(0x5Aa8F9123B3Bdf340F33DBfA5A5A8EF6654438EC);
    MockERC20 wbtc = MockERC20(0xD87993eb709c1ADf214EF4648d560ADeABc7AdA3);
    MockERC20 dai = MockERC20(0x75fDf32739e8701B7AF7E40aD888440BEE93fbc1);

    function run() public {
        vm.startBroadcast();
        weth.mint(user, 10_000 ether);
        usdc.mint(user, 10_000 ether);
        wbtc.mint(user, 10_000 ether);
        dai.mint(user, 10_000 ether);
        vm.stopBroadcast();
    }
}
