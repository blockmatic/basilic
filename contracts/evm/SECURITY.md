# Security Notes

## OpenZeppelin Contracts Version

**Status**: ⚠️ Security Advisory

The vendored OpenZeppelin Contracts library is currently at version **5.2.0**, which contains a critical vulnerability in the `lastIndexOf(bytes,byte,uint256)` function that may access uninitialized memory.

**Required Action**: Update to OpenZeppelin Contracts **5.4.0 or later** to patch this vulnerability.

**References**:

- [OpenZeppelin Security Advisory](https://github.com/OpenZeppelin/openzeppelin-contracts/security)
- [OpenZeppelin Contracts Releases](https://github.com/OpenZeppelin/openzeppelin-contracts/releases)

**Update Process**:

1. Replace the `contracts/evm/lib/openzeppelin-contracts` directory with the updated version (≥5.4.0)
2. Verify that all imports and function signatures remain compatible
3. Run full test suite: `forge test`
4. Verify harness contracts compile: `forge build`
5. Update `contracts/evm/lib/openzeppelin-contracts/package.json` version field

**Note**: This is a vendored dependency, so the update requires replacing the entire library directory.
