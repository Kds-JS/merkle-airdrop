// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiTokenClaim is Ownable, Pausable, ERC1155Holder, ERC721Holder {

    bytes32 public merkleRootERC20; // @notice Merkle root ERC20 tokens
    bytes32 public merkleRootERC721; // @notice Merkle root ERC721 tokens
    bytes32 public merkleRootERC1155; // @notice Merkle root ERC1155 tokens
    bytes32 public merkleRootAVAX; // @notice Merkle root AVAX tokens

    mapping(address => mapping(address => uint256)) public amountClaimedByContractAddress; // @notice Mapping of contract address to user address to claimed amount
    mapping(address => mapping(address => mapping(uint => uint))) public ERC1155ClaimedByContractAddress; // @notice Mapping of contract address to user address to ERC1155 token ID to claimed amount
    mapping(address => uint) public amountClaimedAVAX; // @notice Mapping of user address to claimed AVAX amount

    // @notice ERC20 events, claimed and merkle root updated
    event ERC20Claimed(address indexed contractAddress, address indexed account, uint256 amount);
    event ERC20MerkleRootUpdated(bytes32 merkleRootERC20);

    // @notice ERC721 events, claimed and merkle root updated
    event ERC721Claimed(address indexed contractAddress, address indexed account, uint256 tokenId);
    event ERC721MerkleRootUpdated(bytes32 merkleRootERC721);

    // @notice ERC1155 events, claimed and merkle root updated
    event ERC1155MerkleRootUpdated(bytes32 merkleRootERC1155);
    event ERC1155Claimed(address indexed contractAddress, address indexed account, uint256 tokenId, uint256 amount);

    // @notice AVAX events, claimed and merkle root updated
    event AVAXClaimed(address indexed account, uint256 amount);
    event AVAXMerkleRootUpdated(bytes32 merkleRootAVAX);

    /*
    * @notice Claim "msg.sender" ERC20 tokens with specified contract, amount and merkle proof
    * @param address contractAddress : address of ERC20 contract (this contract must have token balance)
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claimERC20(address contractAddress, uint256 amount, bytes32[] calldata merkleProof) public whenNotPaused {
        require(IERC20(contractAddress).balanceOf(address(this)) >= amount, "Contract doesn't have enough tokens");

        bytes32 node = keccak256(abi.encodePacked(contractAddress, msg.sender, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRootERC20, node);
        require(isValidProof, 'Invalid proof.');

        require(amountClaimedByContractAddress[contractAddress][msg.sender] < amount, 'Nothing to claim.');
        uint256 claimableAmount = amount - amountClaimedByContractAddress[contractAddress][msg.sender];
        amountClaimedByContractAddress[contractAddress][msg.sender] += amount;
        IERC20(contractAddress).transfer(msg.sender, claimableAmount);

        emit ERC20Claimed(contractAddress, msg.sender, claimableAmount);
    }

    /*
    * @notice Claim "msg.sender" ERC721 tokens with specified contract, amount and merkle proof
    * @param address contractAddress : address of ERC721 contract (this contract must have token balance)
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claimERC721(address contractAddress, uint256 amount, bytes32[] calldata merkleProof) public whenNotPaused {
        require(IERC721(contractAddress).balanceOf(address(this)) >= amount, "Contract doesn't have enough tokens");

        bytes32 node = keccak256(abi.encodePacked(contractAddress, msg.sender, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRootERC721, node);
        require(isValidProof, 'Invalid proof.');

        require(amountClaimedByContractAddress[contractAddress][msg.sender] < amount, 'Nothing to claim.');
        uint256 claimableAmount = amount - amountClaimedByContractAddress[contractAddress][msg.sender];
        amountClaimedByContractAddress[contractAddress][msg.sender] += amount;

        for (uint i = 0; i < claimableAmount; i++) {
            uint256[] memory tokenIds = getERC721TokenListOfContract(contractAddress);
            uint16 randomIdToMint = uint16(tokenIds[random(tokenIds.length - 1)]);

            IERC721(contractAddress).transferFrom(address(this), msg.sender, randomIdToMint);
        }

        emit ERC721Claimed(contractAddress, msg.sender, claimableAmount);
    }

    /*
    * @notice Claim "msg.sender" ERC1155 tokens with specified contract, amount and merkle proof
    * @param address contractAddress : address of ERC721 contract (this contract must have token balance)
    * @param uint256 tokenId: token ID
    * @param uint256 amount : amount of tokens
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claimERC1155(address contractAddress, uint256 tokenId, uint256 amount, bytes32[] calldata merkleProof) public whenNotPaused {
        require(IERC1155(contractAddress).balanceOf(address(this), tokenId) >= amount, "Contract doesn't have enough tokens");

        bytes32 node = keccak256(abi.encodePacked(contractAddress, msg.sender, tokenId, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRootERC1155, node);
        require(isValidProof, 'Invalid proof.');

        require(ERC1155ClaimedByContractAddress[contractAddress][msg.sender][tokenId] < amount, 'Nothing to claim.');
        uint256 claimableAmount = amount - ERC1155ClaimedByContractAddress[contractAddress][msg.sender][tokenId];
        ERC1155ClaimedByContractAddress[contractAddress][msg.sender][tokenId] += amount;

        IERC1155(contractAddress).safeTransferFrom(address(this), msg.sender, tokenId, claimableAmount, "");

        emit ERC1155Claimed(contractAddress, msg.sender, tokenId, claimableAmount);
    }

    /*
    * @notice Claim "msg.sender" AVAX with specified amount and merkle proof
    * @param uint256 amount : amount of AVAX
    * @param bytes32[] calldata merkleProof : merkle proof
    */
    function claimAVAX(uint256 amount, bytes32[] calldata merkleProof) public payable whenNotPaused {
        require(amount <= address(this).balance, "Contract doesn't have enough tokens");

        bytes32 node = keccak256(abi.encodePacked(msg.sender, amount));
        bool isValidProof = MerkleProof.verifyCalldata(merkleProof, merkleRootAVAX, node);
        require(isValidProof, 'Invalid proof.');

        require(amountClaimedAVAX[msg.sender] < amount, 'Nothing to claim.');
        uint256 claimableAmount = amount - amountClaimedAVAX[msg.sender];
        amountClaimedAVAX[msg.sender] += amount;

        payable(msg.sender).transfer(claimableAmount);
        emit AVAXClaimed(msg.sender, claimableAmount);
    }


    /*
    * @notice Claim of rewards in batches. Multi tokens can be claimed in one transaction (ERC20/ERC721/ERC1155).
    * @param address[] calldata contractAddresses : array of contract addresses
    * @param uint256[] calldata tokenIds : array of token IDs (use for ERC1155, set 0 for ERC20/ERC721)
    * @param uint256[] calldata amounts : array of amounts
    * @param bytes32[][] calldata merkleProofs : array of merkle proofs
    * @param uint8[] calldata tokenTypes : array of token types (0 - ERC20, 1 - ERC721, 2 - ERC1155, 3 - AVAX)
    */
    function batchClaim(
        address[] calldata contractAddresses,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs,
        uint8[] calldata tokenTypes
    ) external whenNotPaused {
        if (contractAddresses.length != tokenIds.length || contractAddresses.length != amounts.length || contractAddresses.length != merkleProofs.length || contractAddresses.length != tokenTypes.length) {
            revert("Invalid input data");
        }
        for (uint i = 0; i < contractAddresses.length; i++) {
            if (tokenTypes[i] == 0) {
                claimERC20(contractAddresses[i], amounts[i], merkleProofs[i]);
            } else if (tokenTypes[i] == 1) {
                claimERC721(contractAddresses[i], amounts[i], merkleProofs[i]);
            } else if (tokenTypes[i] == 2) {
                claimERC1155(contractAddresses[i], tokenIds[i], amounts[i], merkleProofs[i]);
            } else if (tokenTypes[i] == 3) {
                claimAVAX(amounts[i], merkleProofs[i]);
            } else {
                revert("Invalid token type.");
            }
        }
    }

    /*
    * @notice Admin function to recover any assets on this contract by address
    * @param address[] calldata contractAddresses : array of contract addresses
    * @param address[] calldata toAddress : array of addresses to send assets
    * @param uint256[][] calldata tokenIds : array of array of token IDs (use for ERC1155, set 0 for ERC20/ERC721)
    * @param uint8[] calldata tokenTypes : array of token types (0 - ERC20, 1 - ERC721, 2 - ERC1155)
    */
    function adminWithdraw(
        address[] calldata contractAddresses,
        address[] calldata toAddresses,
        uint256[][] calldata tokenIds,
        uint8[] calldata tokenTypes
    ) external onlyOwner {
        if (contractAddresses.length != tokenIds.length || contractAddresses.length != tokenTypes.length || contractAddresses.length != toAddresses.length) {
            revert("Invalid input data");
        }
        for (uint i = 0; i < contractAddresses.length; i++) {
            if (tokenTypes[i] == 0) {
                IERC20(contractAddresses[i]).transfer(toAddresses[i], IERC20(contractAddresses[i]).balanceOf(address(this)));
            } else if (tokenTypes[i] == 1) {
                uint256[] memory tokenIdsOfContract = getERC721TokenListOfContract(contractAddresses[i]);
                for (uint j = 0; j < tokenIdsOfContract.length; j++) {
                    IERC721(contractAddresses[i]).transferFrom(address(this), toAddresses[i], tokenIdsOfContract[j]);
                }
            } else if (tokenTypes[i] == 2) {
                for (uint j = 0; j < tokenIds[i].length; j++) {
                    IERC1155(contractAddresses[i]).safeTransferFrom(address(this), toAddresses[i], tokenIds[i][j], IERC1155(contractAddresses[i]).balanceOf(address(this), tokenIds[i][j]), "");
                }
            }
        }
    }

    /*
    * @notice Updates the merkle root ERC20
    * @param bytes32 _merkleRootERC20 : merkle root
    */
    function updateMerkleRootERC20(bytes32 _merkleRootERC20) external onlyOwner {
        merkleRootERC20 = _merkleRootERC20;
        emit ERC20MerkleRootUpdated(_merkleRootERC20);
    }

    /*
    * @notice Updates the merkle root ERC721
    * @param bytes32 _merkleRootERC721 : merkle root
    */
    function updateMerkleRootERC721(bytes32 _merkleRootERC721) external onlyOwner {
        merkleRootERC721 = _merkleRootERC721;
        emit ERC721MerkleRootUpdated(_merkleRootERC721);
    }

    /*
    * @notice Updates the merkle root ERC1155
    * @param bytes32 _merkleRootERC1155 : merkle root
    */
    function updateMerkleRootERC1155(bytes32 _merkleRootERC1155) external onlyOwner {
        merkleRootERC1155 = _merkleRootERC1155;
        emit ERC1155MerkleRootUpdated(_merkleRootERC1155);
    }

    /*
    * @notice Updates the merkle root AVAX
    * @param bytes32 _merkleRootAVAX : merkle root
    */
    function updateMerkleRootAVAX(bytes32 _merkleRootAVAX) external onlyOwner {
        merkleRootAVAX = _merkleRootAVAX;
        emit AVAXMerkleRootUpdated(_merkleRootAVAX);
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

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
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

// @notice "ERC1155" interface is used to interact with the token contract
interface IERC1155 {
    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;
    function balanceOf(address _owner, uint256 _id) external view returns (uint256);
}
