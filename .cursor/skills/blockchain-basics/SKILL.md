# Skill: blockchain-basics

## Scope

- Blockchain fundamentals: consensus mechanisms, cryptography, distributed systems
- Transaction lifecycle and block structure
- Network architecture and node types
- Cryptographic primitives (hash functions, digital signatures, Merkle trees)

Does NOT cover:
- Smart contract development (see `solidity-development` or `solana-dev`)
- Frontend integration (see `web3-frontend`)
- Security auditing (see `smart-contract-security`)

## Principles

- Consensus mechanisms determine how networks achieve agreement (PoW, PoS, BFT)
- Cryptographic primitives provide security (hash functions, digital signatures)
- Distributed systems enable decentralization (P2P networks, gossip protocols)
- Transactions are atomic units of state change
- Blocks batch transactions and provide ordering
- Finality varies by consensus mechanism (probabilistic vs deterministic)

## Constraints

- MUST understand consensus mechanism before building on a chain
- MUST use cryptographic primitives correctly (hashes are one-way, signatures verify authenticity)
- SHOULD understand finality characteristics (PoW is probabilistic, PoS can be deterministic)
- AVOID trusting `block.timestamp` for critical logic (miners can manipulate)
- AVOID confusing hash functions with encryption (hashes are one-way)

## Consensus Mechanisms

### Proof of Work (PoW)
- Miners compete to solve cryptographic puzzles
- Difficulty adjusts to maintain block time
- Finality is probabilistic (6+ confirmations recommended)
- High energy consumption

### Proof of Stake (PoS)
- Validators stake tokens to participate
- Slashing penalizes malicious behavior
- Can achieve deterministic finality
- Lower energy consumption

### Byzantine Fault Tolerance (BFT)
- Requires 2/3+ honest nodes
- Leader election and view changes
- Deterministic finality
- Used in permissioned networks

## Cryptographic Primitives

### Hash Functions
- One-way functions (SHA-256, Keccak-256)
- Deterministic output for same input
- Avalanche effect (small input change → large output change)
- Used for: block hashes, Merkle roots, address derivation

### Digital Signatures
- ECDSA (Ethereum), Ed25519 (Solana)
- Prove ownership without revealing private key
- Used for: transaction signing, message authentication

### Merkle Trees
- Efficient proof of inclusion
- Root hash commits to all leaves
- Used for: transaction verification, state proofs

## Network Architecture

### Node Types
- **Full nodes**: Store complete blockchain, validate all transactions
- **Light clients**: Store headers only, request data from full nodes
- **Archive nodes**: Store all historical state

### P2P Networks
- Gossip protocols for block/transaction propagation
- Peer discovery mechanisms
- Relay networks for faster propagation

## Transaction Lifecycle

1. **Creation**: User signs transaction with private key
2. **Broadcast**: Transaction sent to network (mempool)
3. **Validation**: Nodes validate signature and state
4. **Inclusion**: Miner/validator includes in block
5. **Confirmation**: Block added to chain, confirmations accumulate
6. **Finality**: Transaction considered final (varies by consensus)

## Trade-offs

- **PoW vs PoS**: PoW provides proven security but high energy cost. PoS is energy-efficient but requires economic security assumptions.
- **Full nodes vs light clients**: Full nodes provide security and privacy but require significant storage. Light clients are resource-efficient but trust full nodes.
- **Finality**: Probabilistic finality (PoW) requires waiting for confirmations. Deterministic finality (PoS/BFT) provides immediate finality but may have different security properties.

## Interactions

- Provides foundation for `ethereum-development` and `solana-dev`
- Complements `smart-contract-security` with cryptographic understanding
- Supports `web3-frontend` with transaction lifecycle knowledge

## External Resources

- [Ethereum Whitepaper](https://ethereum.org/en/whitepaper/) - Ethereum fundamentals
- [Solana Documentation](https://docs.solana.com/) - Solana architecture
