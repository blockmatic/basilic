# Skill: nft-development

## Scope

- NFT token standards (ERC-721, ERC-721A, ERC-1155, DN404)
- Metadata design patterns (on-chain, IPFS, Arweave)
- Marketplace integration (OpenSea, royalties, operator filters)
- On-chain art generation (SVG, deterministic randomness)
- Gas optimization for NFT contracts

Does NOT cover:
- General Solidity development (see `solidity-development` skill)
- Frontend integration (see `web3-frontend` skill)
- Security auditing (see `smart-contract-security` skill)

## Principles

- Use ERC-721A for batch minting (gas efficient)
- Use OpenZeppelin Contracts for standard implementations
- Implement EIP-2981 for royalties
- Use operator filters for royalty enforcement
- Store metadata off-chain (IPFS/Arweave) for large collections
- Generate on-chain art deterministically from token ID

## Constraints

- MUST use OpenZeppelin Contracts for standard implementations
- SHOULD use ERC-721A for batch minting (saves ~80% gas vs ERC-721)
- SHOULD implement EIP-2981 for marketplace royalty support
- SHOULD use operator filters for royalty enforcement (if needed)
- SHOULD validate metadata JSON structure (OpenSea standard)
- AVOID storing large metadata on-chain (use IPFS/Arweave)
- AVOID using standard ERC-721 for batch mints (use ERC-721A)

## Patterns

### ERC-721A Mint Pattern

Use ERC-721A for gas-efficient batch minting:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721A, Ownable {
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant PRICE = 0.08 ether;

    error MaxSupplyReached();
    error InsufficientPayment();

    constructor() ERC721A("MyNFT", "MNFT") Ownable(msg.sender) {}

    function mint(uint256 quantity) external payable {
        if (_totalMinted() + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (msg.value < PRICE * quantity) revert InsufficientPayment();

        _mint(msg.sender, quantity);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
```

### EIP-2981 Royalty Pattern

Implement royalties for marketplace support:

```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract NFTWithRoyalty is ERC721A, ERC2981 {
    constructor(string memory name, string memory symbol) ERC721A(name, symbol) {
        _setDefaultRoyalty(msg.sender, 500); // 5%
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### On-Chain SVG Pattern

Generate SVG art deterministically:

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    uint256 seed = seeds[tokenId];

    string memory svg = string(abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
        '<rect width="400" height="400" fill="#', _getColor(seed), '"/>',
        '<circle cx="200" cy="200" r="80" fill="#', _getColor(seed >> 24), '"/>',
        '</svg>'
    ));

    string memory json = string(abi.encodePacked(
        '{"name":"Art #', tokenId.toString(),
        '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
    ));

    return string(abi.encodePacked(
        "data:application/json;base64,",
        Base64.encode(bytes(json))
    ));
}
```

## Token Standards Comparison

| Standard | Best For | Gas (1 mint) | Gas (5 mints) |
|----------|----------|--------------|---------------|
| ERC-721 | Simple NFTs | ~100k | ~500k |
| ERC-721A | PFP collections | ~100k | ~120k |
| ERC-1155 | Game items | ~50k | ~80k |
| DN404 | Divisible NFTs | Variable | Variable |

## Metadata Standards

### OpenSea Metadata Format

```json
{
  "name": "Cool NFT #1",
  "description": "A very cool NFT",
  "image": "ipfs://QmXxx.../1.png",
  "animation_url": "ipfs://QmXxx.../1.mp4",
  "external_url": "https://example.com/1",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Rarity", "value": "Legendary" },
    { "display_type": "number", "trait_type": "Power", "value": 100 }
  ]
}
```

## Trade-offs

- **ERC-721 vs ERC-721A**: ERC-721A saves ~80% gas for batch mints but adds complexity. Use ERC-721A for collections with batch minting.
- **On-chain vs off-chain metadata**: On-chain provides permanence but costs gas. Off-chain (IPFS) is cheaper but requires pinning.
- **Operator filters**: Enforce royalties but may limit marketplace compatibility. Use only if royalty enforcement is critical.

## Interactions

- Uses `solidity-development` for contract patterns
- Uses `web3-frontend` for marketplace integration
- Uses OpenZeppelin Contracts for standard implementations

## External Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) - Standard implementations
- [ERC-721A Documentation](https://erc721a.org/) - Gas-optimized NFT standard
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards) - Marketplace integration
