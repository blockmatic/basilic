// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TestToken} from "../src/TestToken.sol";

contract TestTokenScript is Script {
    function run() external {
        // Get deployer address
        address deployer = msg.sender;
        
        // Default parameters - can be overridden via environment variables
        string memory name = vm.envOr("TOKEN_NAME", string("Test Token"));
        string memory symbol = vm.envOr("TOKEN_SYMBOL", string("TEST"));
        address minter = vm.envOr("TOKEN_MINTER", deployer);
        uint8 decimals = uint8(vm.envOr("TOKEN_DECIMALS", uint256(18)));
        
        console.log("Deploying TestToken:");
        console.log("  Name:", name);
        console.log("  Symbol:", symbol);
        console.log("  Minter:", minter);
        console.log("  Decimals:", decimals);
        console.log("  Deployer:", deployer);
        
        vm.startBroadcast();
        
        TestToken token = new TestToken(name, symbol, minter, decimals);
        
        vm.stopBroadcast();
        
        console.log("TestToken deployed at:", address(token));
    }
}

