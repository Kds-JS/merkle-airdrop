// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// @notice "Token" interface is used to interact with the token contract (mint)
interface Token {
    function mint(address to, uint256 amount) external;
}

contract MerkleMultipleAirdrop is Ownable {

    Token public immutable token; // @notice Token contract address
    bytes32 public merkleRoot; // @notice Merkle root

    mapping(address => uint256) public amountClaimed; // @notice Mapping of address to amount claimed

    /*
    * @notice Constructor for the MerkleAirdrop contract
    * @param address tokenAddress : address of the token contract
    * @param bytes32 merkleRoot_ : merkle root
    */
    constructor(Token token_, bytes32 merkleRoot_) {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    /*
    * @notice Claim "msg.sender" tokens with specified amount and merkle proof
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(amountClaimed[msg.sender] != amount, "Drop already claimed.");

        bytes32 node = keccak256(abi.encodePacked(msg.sender, amount));

        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRoot, node);

        require(isValidProof, 'Invalid proof.');

        uint256 claimableAmount = amount - amountClaimed[msg.sender];
        amountClaimed[msg.sender] += amount;

        token.mint(msg.sender, claimableAmount);
    }

    /*
    * @notice Updates the merkle root
    * @param bytes32 merkleRoot_ : merkle root
    */
    function updateMerkleRoot(bytes32 merkleRoot_) external onlyOwner {
        merkleRoot = merkleRoot_;
    }
}
