// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdrop {
    address public immutable token;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public isClaimed;

    constructor(address token_, bytes32 merkleRoot_) {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
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
