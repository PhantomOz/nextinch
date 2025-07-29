// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {MockERC20} from "../test/MockERC20.sol";

contract PositionManagerScript is Script {
    address WETH;
    address USDC;
    PositionManager positionManager;
    address orderManager = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    function run() public {
        vm.startBroadcast();
        WETH = address(new MockERC20("Wrapped ETHER", "WETH", 1000 ether, 18));
        USDC = address(new MockERC20("USD CIRCLE", "USDC", 1000_000_000, 6));
        positionManager = new PositionManager(orderManager);

        console.log("WETH ADDRESS >>> ", WETH);
        console.log("USDC ADDRESS >>> ", USDC);
        console.log("positionManger ADDRESS >>> ", address(positionManager));
    }
}
