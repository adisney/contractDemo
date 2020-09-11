pragma solidity ^0.6.2;

import "./Permissioned.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@nomiclabs/buidler/console.sol";

/**
 * @title Wallet
 * @dev Hold your funds on chain instead of in your pocket (or browser or phone or hardware wallet).
 */
contract Wallet is Permissioned {
    using Address for address;

    mapping (address => mapping (address => uint256)) private _tokenBalances;

    /// @dev Add `root` to the admin role as a member.
    constructor (address[] memory permittedAddresses) Permissioned(permittedAddresses) public {}

    /// @dev Return `holder`'s balance of `tokenAddress` tokens.
    function balanceOf(address holder, address tokenAddress)
        public
        view
        returns(uint256)
    {
        return _tokenBalances[holder][tokenAddress];
    }

    /// @dev Deposit `amount` `tokenAddress` tokens from `msg.sender` to the wallet.
    function deposit(address tokenAddress, uint256 amount) public onlyPermitted {
        IERC20 token = IERC20(tokenAddress);
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "insufficient allowance"
        );

        // Move tokens from the sender's address to the wallet's address and
        //   update balance mapping
        token.transferFrom(msg.sender, address(this), amount);
        _tokenBalances[msg.sender][tokenAddress] = amount;
    }

    /// @dev Transfer `amount` `tokenAddress` tokens from wallet to `msg.sender`.
    function withdraw(address tokenAddress, uint256 amount) public onlyPermitted {
        require(
            balanceOf(msg.sender, tokenAddress) >= amount,
            "insufficient balance in wallet"
        );

        IERC20 token = IERC20(tokenAddress);

        // Move tokens from the wallet's address to the sender's address and
        //   update balance mapping
        // TODO there is some possibility of rounding errors if DeFi contracts
        //   have shown me anything. Account for that!
        uint256 initialBalance = balanceOf(msg.sender, tokenAddress);
        token.transfer(msg.sender, amount);
        _tokenBalances[msg.sender][tokenAddress] = initialBalance - amount;
    }

    /// @dev Transfer `amount` `tokenAddress` tokens from wallet
    /// @dev   to `destinationAddress`.
    function transfer(
        address tokenAddress,
        uint256 amount,
        address destinationAddress
    ) public
      onlyPermitted
    {
        require(
            balanceOf(msg.sender, tokenAddress) >= amount,
            "insufficient balance in wallet"
        );

        IERC20 token = IERC20(tokenAddress);

        // Move tokens from the wallet's address to the sender's address
        //   and update balance mapping
        // TODO there is some possibility of rounding errors if DeFi contracts
        //   have shown me anything. Account for that!
        uint256 initialBalance = balanceOf(msg.sender, tokenAddress);
        token.transfer(destinationAddress, amount);
        _tokenBalances[msg.sender][tokenAddress] = initialBalance - amount;
    }

    /// @dev Invokes function on the contract at `contractAddress.
    /// @dev Function name and arguments are encoded in the `data` field.
    /// @dev `msg.sender` is the wallet.
    function invokeContractFunction(address contractAddress, bytes memory data) public {
        contractAddress.functionCall(data);
    }
}
