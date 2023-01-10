// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract sNFTest is ERC1155 {

    uint256 public constant NFT_1 = 0;
    uint256 public constant NFT_2 = 1;
    uint256 public constant Token_1 = 2;
    uint256 public constant Token_2 = 3;

    /*
    * @notice Constructor
    */
    constructor() ERC1155("uri") {
    }

    /*
    * @notice Mints amount of new tokens to the specified address
    * @param address to : address who will receive the new tokens
    */
    function mint(address to) external {
        _mint(to, NFT_1, 1000, "");
        _mint(to, NFT_2, 1000, "");
        _mint(to, Token_1, 100**18 , "");
        _mint(to, Token_2, 100**18, "");
    }

}
