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
        tokenA = new MockERC20("Wrapped Ether", "WETH", 1000E18, 18);
        tokenB = new MockERC20("USD Circle", "USDC", 1000E6, 6);
        tokenC = new MockERC20("BitCoin", "BTC", 1000E8, 8);
        tokenD = new MockERC20("DAI", "DAI", 1000E18, 18);

        tokenA.mint(user, 1000 ether);
        tokenB.mint(user, 1000 ether);
        tokenC.mint(user, 1000 ether);
        tokenD.mint(user, 1000 ether);
    }
}
