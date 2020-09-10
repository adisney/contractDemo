pragma solidity ^0.6.2;

import "@openzeppelin/contracts/access/AccessControl.sol";

abstract contract Permissioned is AccessControl {
    bytes32 public constant PERMITTED_ROLE = keccak256("PERMITTED");

    /// @dev Add `root` to the admin role as a member.
    constructor (address[] memory permittedAddresses) internal {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(PERMITTED_ROLE, DEFAULT_ADMIN_ROLE);

        for (uint i = 0; i < permittedAddresses.length; i++) {
            grantRole(PERMITTED_ROLE, permittedAddresses[i]);
        }
    }

    /// @dev Restricted to members of the admin role.
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "not an admin address");
        _;
    }

    /// @dev Restricted to members of the user role.
    modifier onlyPermitted() {
        require(isPermitted(msg.sender), "not a permitted address");
        _;
    }

    /// @dev Return `true` if the account belongs to the admin role.
    function isAdmin(address account) public virtual view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Return `true` if the account belongs to the user role.
    function isPermitted(address account) public virtual view returns (bool) {
        return hasRole(PERMITTED_ROLE, account);
    }
}
