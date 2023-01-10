// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTest is ERC721 {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    /*
    * @notice Constructor for the USDTest token - sets the name, symbol and setup "DEFAULT_ADMIN_ROLE" role.
    */
    constructor() ERC721("ERC721 NFT Test", "NFTT") {
    }

    /*
    * @notice Mints amount of new tokens to the specified address
    * @param address to : address who will receive the new tokens
    * @param uint256 amount : amount of tokens to be minted
    */
    function mint(address to, uint256 amount) external {
        for (uint i = 0; i < amount; i++) {
            uint newTokenID = _tokenIds.current();
            _mint(to, newTokenID);
            _tokenIds.increment();
        }
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

}
