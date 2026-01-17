// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TestToken} from "../src/TestToken.sol";

contract DNMCScript is Script {
    function run() external {
        address deployer = msg.sender;
        
        string memory name = vm.envOr("TOKEN_NAME", string("Dynamic Arcade Token"));
        string memory symbol = vm.envOr("TOKEN_SYMBOL", string("DNMC"));
        address minter = vm.envOr("TOKEN_MINTER", deployer);
        uint8 decimals = uint8(vm.envOr("TOKEN_DECIMALS", uint256(18)));
        
        console.log("Deploying DNMC (Dynamic Arcade Token):");
        console.log("  Name:", name);
        console.log("  Symbol:", symbol);
        console.log("  Minter:", minter);
        console.log("  Decimals:", decimals);
        console.log("  Deployer:", deployer);
        
        vm.startBroadcast();
        
        TestToken token = new TestToken(name, symbol, minter, decimals);
        
        vm.stopBroadcast();
        
        console.log("DNMC deployed at:", address(token));
    }
}

