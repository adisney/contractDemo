pragma solidity ^0.6.2;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * @title MoneyToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract MoneyToken is ERC20 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public ERC20("MoneyToken", "CASH") {
        _mint(msg.sender, 1000000000);
    }
}
