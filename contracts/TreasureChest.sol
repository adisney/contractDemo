pragma solidity ^0.6.2;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@nomiclabs/buidler/console.sol";

/**
 * @title TreasureChest
 * @dev Funds are locked until the chest is opened, then it's free real estate.
 */
contract TreasureChest is Ownable {
    using Address for address;

    bool _buried = true;
    IERC20 _tokenContained;

    constructor(address tokenContained) public {
        _tokenContained = IERC20(tokenContained);
    }

    function tokenContained() public view returns(IERC20) {
        return _tokenContained;
    }

    // TODO allow anyone with the secret map to unbury
    function unbury() public onlyOwner {
        _buried = false;
    }

    function buried() public view returns(bool) {
        return _buried;
    }

    function open() public {
        require(buried() == false, "treasure chest has not been found yet");
        require(_tokenContained.balanceOf(address(this)) > 0, "treasure chest is empty");

        _tokenContained.transfer(msg.sender, _tokenContained.balanceOf(address(this)));
    }
}
