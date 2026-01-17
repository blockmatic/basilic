// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestToken
 * @notice Test token contract for testing and faucet purposes. Mint function is open to anyone.
 *         Burn function only allows callers to burn their own tokens (no cross-account burning).
 *         This is intentional for testing environments and faucet functionality.
 * @dev This contract extends OpenZeppelin's ERC20 implementation with open minting and
 *      self-only burning. The minter parameter is kept for reference but not enforced.
 */
contract TestToken is ERC20 {
    /// @notice The number of decimals for this token
    uint8 private immutable decimals_;

    /// @notice Reference to the original minter address (not enforced, kept for reference only)
    address public immutable minter;

    /// @notice Emitted when tokens are minted
    /// @param account The account receiving the tokens
    /// @param amount The amount of tokens minted
    event Mint(address indexed account, uint256 amount);

    /// @notice Emitted when tokens are burned
    /// @param account The account from which tokens are burned
    /// @param amount The amount of tokens burned
    event Burn(address indexed account, uint256 amount);

    /// @notice Constructs a new TestToken
    /// @param _name The name of the token
    /// @param _symbol The symbol of the token
    /// @param _minter The minter address (kept for reference, not enforced)
    /// @param _decimals The number of decimals for the token
    constructor(string memory _name, string memory _symbol, address _minter, uint8 _decimals)
        ERC20(_name, _symbol)
    {
        minter = _minter;
        decimals_ = _decimals;
    }

    /// @notice Mints tokens to an account. Open to anyone for testing and faucet purposes.
    /// @param _account The account to receive the tokens
    /// @param _amount The amount of tokens to mint
    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
        emit Mint(_account, _amount);
    }

    /// @notice Burns tokens from an account. Only allows callers to burn their own tokens.
    /// @dev This function enforces that the caller can only burn tokens from their own account
    ///      (require(_account == msg.sender)). This is intentional for testing environments
    ///      where users need to burn their own tokens, but should be reviewed for production use.
    /// @param _account The account from which to burn tokens (must be msg.sender)
    /// @param _amount The amount of tokens to burn
    function burn(address _account, uint256 _amount) external {
        require(_account == msg.sender, "TestToken: can only burn own tokens");
        _burn(_account, _amount);
        emit Burn(_account, _amount);
    }

    /// @notice Returns the number of decimals for this token
    /// @return The number of decimals
    function decimals() public view override returns (uint8) {
        return decimals_;
    }
}