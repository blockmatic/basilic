// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TestToken} from "../src/TestToken.sol";

contract TestTokenTest is Test {
    TestToken public token;
    address public minter;
    address public user1;
    address public user2;

    event Mint(address indexed account, uint256 amount);
    event Burn(address indexed account, uint256 amount);

    function setUp() public {
        minter = address(this);
        user1 = address(0xBEEF);
        user2 = address(0xCAFE);
        token = new TestToken("Test Token", "TEST", minter, 18);
    }

    function test_Mint() public {
        uint256 amount = 1000 * 10 ** 18;
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, amount);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_Burn() public {
        uint256 amount = 1000 * 10 ** 18;
        token.mint(user1, amount);
        
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount);
        token.burn(user1, amount);
        
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.totalSupply(), 0);
    }

    function test_Decimals() public view {
        assertEq(token.decimals(), 18);
    }

    function test_AnyoneCanMint() public {
        uint256 amount = 500 * 10 ** 18;
        
        // User1 mints for themselves
        vm.prank(user1);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
        
        // User2 mints for user1 (anyone can mint)
        vm.prank(user2);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount * 2);
    }

    function test_AnyoneCanBurn() public {
        uint256 amount = 1000 * 10 ** 18;
        token.mint(user1, amount);
        
        // User2 burns from user1 (anyone can burn)
        vm.prank(user2);
        token.burn(user1, amount);
        
        assertEq(token.balanceOf(user1), 0);
    }

    function test_MultipleUsersMint() public {
        uint256 amount1 = 1000 * 10 ** 18;
        uint256 amount2 = 2000 * 10 ** 18;
        
        vm.prank(user1);
        token.mint(user1, amount1);
        
        vm.prank(user2);
        token.mint(user2, amount2);
        
        assertEq(token.balanceOf(user1), amount1);
        assertEq(token.balanceOf(user2), amount2);
        assertEq(token.totalSupply(), amount1 + amount2);
    }

    function test_MintZeroAmount() public {
        token.mint(user1, 0);
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.totalSupply(), 0);
    }

    function test_BurnZeroAmount() public {
        uint256 amount = 1000 * 10 ** 18;
        token.mint(user1, amount);
        
        token.burn(user1, 0);
        assertEq(token.balanceOf(user1), amount);
    }

    function testFuzz_Mint(uint256 amount) public {
        // Bound to reasonable values to avoid overflow
        amount = bound(amount, 0, type(uint256).max / 2);
        
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
    }

    function testFuzz_Burn(uint256 mintAmount, uint256 burnAmount) public {
        // Bound to avoid overflow
        mintAmount = bound(mintAmount, 0, type(uint256).max / 2);
        burnAmount = bound(burnAmount, 0, mintAmount);
        
        token.mint(user1, mintAmount);
        token.burn(user1, burnAmount);
        
        assertEq(token.balanceOf(user1), mintAmount - burnAmount);
    }

    function test_DecimalsWithDifferentValues() public {
        TestToken token6 = new TestToken("Token6", "T6", minter, 6);
        TestToken token8 = new TestToken("Token8", "T8", minter, 8);
        TestToken token18 = new TestToken("Token18", "T18", minter, 18);
        
        assertEq(token6.decimals(), 6);
        assertEq(token8.decimals(), 8);
        assertEq(token18.decimals(), 18);
    }

    function test_MintEventEmitted() public {
        uint256 amount = 1000 * 10 ** 18;
        
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, amount);
        
        token.mint(user1, amount);
    }

    function test_BurnEventEmitted() public {
        uint256 amount = 1000 * 10 ** 18;
        token.mint(user1, amount);
        
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount);
        
        token.burn(user1, amount);
    }

    function test_MinterFieldExists() public view {
        // Minter field exists but is not enforced
        assertEq(token.minter(), minter);
    }
}
