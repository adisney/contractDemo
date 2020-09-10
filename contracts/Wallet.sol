pragma solidity ^0.6.2;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@nomiclabs/buidler/console.sol";

/**
 * @title Wallet
 * @dev Hold your funds on chain instead of in your pocket (or browser or phone or hardware wallet).
 */
contract Wallet is AccessControl {
    using Address for address;

    mapping (address => mapping (address => uint256)) private _tokenBalances;
    bytes32 public constant PERMITTED_ROLE = keccak256("PERMITTED");

    /// @dev Add `root` to the admin role as a member.
    constructor (address[] memory permittedAddresses) public
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(PERMITTED_ROLE, DEFAULT_ADMIN_ROLE);

        for (uint i = 0; i < permittedAddresses.length; i++) {
            grantRole(PERMITTED_ROLE, permittedAddresses[i]);
        }
    }

    /// @dev Restricted to members of the admin role.
    modifier onlyAdmin()
    {
        require(isAdmin(msg.sender), "not an admin address");
        _;
    }

    /// @dev Restricted to members of the user role.
    modifier onlyPermitted()
    {
        require(isPermitted(msg.sender), "not a permitted address");
        _;
    }

    /// @dev Return `true` if the account belongs to the admin role.
    function isAdmin(address account) public virtual view returns (bool)
    {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Return `true` if the account belongs to the user role.
    function isPermitted(address account) public virtual view returns (bool)
    {
        return hasRole(PERMITTED_ROLE, account);
    }

    /// @dev Return `holder`'s balance of `tokenAddress` tokens.
    function balanceOf(address holder, address tokenAddress) public view returns(uint256) {
        return _tokenBalances[holder][tokenAddress];
    }

    /// @dev Deposit `amount` `tokenAddress` tokens from `msg.sender` to the wallet.
    function deposit(address tokenAddress, uint256 amount) public onlyPermitted {
        IERC20 token = IERC20(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= amount, "insufficient allowance");

        // Move tokens from the sender's address to the wallet's address and update balance mapping
        token.transferFrom(msg.sender, address(this), amount);
        _tokenBalances[msg.sender][tokenAddress] = amount;
    }

    /// @dev Transfer `amount` `tokenAddress` tokens from wallet to `msg.sender`.
    function withdraw(address tokenAddress, uint256 amount) public onlyPermitted {
        require(balanceOf(msg.sender, tokenAddress) >= amount, "insufficient balance in wallet");

        IERC20 token = IERC20(tokenAddress);

        // Move tokens from the wallet's address to the sender's address and update balance mapping
        // TODO there is some possibility of rounding errors if DeFi contracts have shown me anything. Account for that!
        uint256 initialBalance = balanceOf(msg.sender, tokenAddress);
        token.transfer(msg.sender, amount);
        _tokenBalances[msg.sender][tokenAddress] = initialBalance - amount;
    }

    /// @dev Transfer `amount` `tokenAddress` tokens from wallet to `destinationAddress`.
    function transfer(address tokenAddress, uint256 amount, address destinationAddress) public onlyPermitted {
        require(balanceOf(msg.sender, tokenAddress) >= amount, "insufficient balance in wallet");

        IERC20 token = IERC20(tokenAddress);

        // Move tokens from the wallet's address to the sender's address and update balance mapping
        // TODO there is some possibility of rounding errors if DeFi contracts have shown me anything. Account for that!
        uint256 initialBalance = balanceOf(msg.sender, tokenAddress);
        token.transfer(destinationAddress, amount);
        _tokenBalances[msg.sender][tokenAddress] = initialBalance - amount;
    }

    /// @dev Invokes function on the contract at `contractAddress. Function name and arguments are encoded in the `data` field. `msg.sender` is the wallet.
    function invokeContractFunction( address contractAddress, bytes memory data) public onlyPermitted {
        contractAddress.functionCall(data);
    }
}
