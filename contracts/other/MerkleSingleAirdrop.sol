// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdrop {
    address public immutable token; // @notice Token contract address
    bytes32 public immutable merkleRoot; // @notice Merkle root

    mapping(address => bool) public isClaimed; // @notice Mapping of address to boolean indicating if the address has claimed

    /*
    * @notice Constructor for the MerkleAirdrop contract
    * @param address tokenAddress : address of the token contract
    * @param bytes32 merkleRoot_ : merkle root
    */
    constructor(address token_, bytes32 merkleRoot_) {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    /*
    * @notice Claim "account" tokens with specified amount and merkle proof
    * @param address account : address of the account to claim tokens for
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claim(address account, uint256 amount, bytes32[] calldata merkleProof) external {
        require(!isClaimed[account], 'Already claimed.');

        bytes32 node = keccak256(abi.encodePacked(account, amount));

        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRoot, node);

        require(isValidProof, 'Invalid proof.');

        isClaimed[account] = true;
        require(
            IERC20(token).transfer(account, amount),
            'Transfer failed.'
        );
    }

    /*
    * @notice View function to check if the address can claim tokens
    * @param address account : address of the account to check
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    * @return bool : true if the address can claim tokens, false otherwise
    */
    function userCanClaim(address account, uint amount, bytes32[] calldata merkleProof) external view returns (bool) {

        if (isClaimed[account]) {
            return false;
        }

        bytes32 node = keccak256(abi.encodePacked(account, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRoot, node);

        if (!isValidProof) {
            return false;
        }

        return true;
    }
}
