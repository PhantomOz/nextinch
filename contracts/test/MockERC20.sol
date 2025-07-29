// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 _decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint8 _decimal
    ) ERC20(_name, _symbol) {
        _totalSupply = _totalSupply;
        _decimals = _decimal;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address _user, uint256 _amount) public {
        _mint(_user, _amount);
    }
}
