// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract USDTest is ERC20, AccessControl {

    // @notice "MINTER" role is used to mint new tokens
    bytes32 public constant MINTER = keccak256("MINTER");

    /*
    * @notice Constructor for the USDTest token - sets the name, symbol and setup "DEFAULT_ADMIN_ROLE" role.
    */
    constructor() ERC20("ERC20 USDT Test", "USDT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /*
    * @notice Mints amount of new tokens to the specified address
    * @param address to : address who will receive the new tokens
    * @param uint256 amount : amount of tokens to be minted
    */
    function mint(address to, uint256 amount) external {
        require(hasRole(MINTER, msg.sender), "Caller is not a minter");
        _mint(to, amount);
    }

    /*
    * @notice Grants "MINTER" role to the specified address
    * @param address minter : address to be granted the "MINTER" role
    */
    function addMinter(address minter) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _grantRole(MINTER, minter);
    }
}
