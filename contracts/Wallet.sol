pragma solidity ^0.6.2;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@nomiclabs/buidler/console.sol";

/**
 * @title Wallet
 * @dev Hold your funds on chain instead of in your pocket (or browser or phone or hardware wallet).
 */
contract Wallet {
    // TODO add a modifier for allowed tokenHolders

    using Address for address;

    mapping (address => mapping (address => uint256)) private _tokenBalances;

    function balanceOf(address holder, address tokenAddress) public view returns(uint256) {
        return _tokenBalances[holder][tokenAddress];
    }

    function deposit(address tokenAddress, uint256 amount) public {
        IERC20 token = IERC20(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= amount, "insufficient allowance");

        // Move tokens from the sender's address to the wallet's address and update balance mapping
        token.transferFrom(msg.sender, address(this), amount);
        _tokenBalances[msg.sender][tokenAddress] = amount;
    }

    // TODO: add a modifier for allowed tokenHolders
    /**
     * @dev Invokes function on the contract at `contractAddress. Function name and arguments are encoded in the `data` field. `msg.sender` is the wallet.
     */
    function invokeContractFunction(address contractAddress, bytes memory data) public {
        contractAddress.functionCall(data);
    }
}
