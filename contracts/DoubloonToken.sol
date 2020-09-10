pragma solidity ^0.6.2;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * @title DoubloonToken
 * @dev Worth its weight in gold... because it is gold.
 */
contract DoubloonToken is ERC20 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public ERC20("DoubloonToken", "FREEREALESTATE") {
        _mint(msg.sender, 1000000000);
    }
}
