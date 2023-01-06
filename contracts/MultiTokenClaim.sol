// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiTokenClaim is Ownable, Pausable {

    bytes32 public merkleRootERC20; // @notice Merkle root ERC20 tokens
    bytes32 public merkleRootERC721; // @notice Merkle root ERC721 tokens

    mapping(address => mapping(address => uint256)) public amountClaimedByContractAddress; // @notice Mapping of address to amount claimed

    event Claimed(address indexed contractAddress, address indexed account, uint256 amount);

    // @notice Constructor for the MultiTokenClaim contract
    constructor() {}

    /*
    * @notice Claim "msg.sender" ERC20 tokens with specified contract, amount and merkle proof
    * @param address contractAddress : address of ERC20 contract (this contract must have token balance)
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claimERC20(address contractAddress, uint256 amount, bytes32[] calldata merkleProof) external whenNotPaused {
        require(IERC20(contractAddress).balanceOf(address(this)) >= amount, "Contract doesn't have enough tokens");

        bytes32 node = keccak256(abi.encodePacked(contractAddress, msg.sender, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRootERC20, node);
        require(isValidProof, 'Invalid proof.');

        require(amountClaimedByContractAddress[contractAddress][msg.sender] != amount, 'Nothing to claim.');
        uint256 claimableAmount = amount - amountClaimedByContractAddress[contractAddress][msg.sender];
        amountClaimedByContractAddress[contractAddress][msg.sender] += amount;

        IERC20(contractAddress).transfer(msg.sender, claimableAmount);

        emit Claimed(contractAddress, msg.sender, claimableAmount);
    }

    /*
    * @notice Claim "msg.sender" ERC721 tokens with specified contract, amount and merkle proof
    * @param address contractAddress : address of ERC721 contract (this contract must have token balance)
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claimERC721(address contractAddress, uint256 amount, bytes32[] calldata merkleProof) external whenNotPaused {
        require(IERC721(contractAddress).balanceOf(address(this)) >= amount, "Contract doesn't have enough tokens");

        bytes32 node = keccak256(abi.encodePacked(contractAddress, msg.sender, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRootERC721, node);
        require(isValidProof, 'Invalid proof.');

        require(amountClaimedByContractAddress[contractAddress][msg.sender] != amount, 'Nothing to claim.');
        uint256 claimableAmount = amount - amountClaimedByContractAddress[contractAddress][msg.sender];
        amountClaimedByContractAddress[contractAddress][msg.sender] += amount;

        for (uint i = 0; i < claimableAmount; i++) {
            uint256[] memory tokenIds = getERC721TokenListOfContract(contractAddress);
            uint16 randomIdToMint = uint16(tokenIds[random(tokenIds.length - 1)]);

            IERC721(contractAddress).transferFrom(address(this), msg.sender, randomIdToMint);
        }

        emit Claimed(contractAddress, msg.sender, claimableAmount);
    }

    /*
    * @notice Updates the merkle root ERC20
    * @param bytes32 merkleRootERC20_ : merkle root
    */
    function updateMerkleRootERC20(bytes32 _merkleRootERC20) external onlyOwner {
        merkleRootERC20 = _merkleRootERC20;
    }

    /*
    * @notice Updates the merkle root ERC721
    * @param bytes32 merkleRootERC721_ : merkle root
    */
    function updateMerkleRootERC721(bytes32 _merkleRootERC721) external onlyOwner {
        merkleRootERC721 = _merkleRootERC721;
    }


    /*
    * @notice Returns the list of NFT IDs of this contract.
    * @param address contractAddress : address of ERC721 contract
    * @return uint256[] : List of tokenIds.
    */
    function getERC721TokenListOfContract(address contractAddress) public view returns (uint256[] memory) {
        uint totalSupply = IERC721(contractAddress).totalSupply();
        uint256[] memory tmpList = new uint256[](totalSupply);
        uint256 counter = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (IERC721(contractAddress).ownerOf(i) == address(this)) {
                tmpList[counter] = i;
                counter++;
            }
        }

        uint256[] memory nftList = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            nftList[i] = tmpList[i];
        }

        return nftList;
    }

    /*
    * @notice Get random number from 0 to num.
    * @param uint256 num : max number
    */
    function random(uint num) public view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % num;
    }

    /* ********************************** */
    /*               Pauser               */
    /* ********************************** */

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}

// @notice "ERC721" interface is used to interact with the token contract
interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function totalSupply() external view returns (uint256);
}

// @notice "ERC20" interface is used to interact with the token contract
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address _owner) external view returns (uint256);
}