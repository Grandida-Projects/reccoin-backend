// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the interface for the ERC20 token standard.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Import the interface for ERC20 token metadata (name, symbol, decimals).
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// Import the SafeMath library for performing arithmetic operations with safety checks.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Import the Address utility library for working with Ethereum addresses.
import "@openzeppelin/contracts/utils/Address.sol";

// Import the Ownable contract, which provides basic authorization control.
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecCoin
 * @dev Implementation of the RecCoin ERC20 token contract.
 * It extends the ERC20 standard token contract from the OpenZeppelin library.
 */

contract RecCoin is IERC20, IERC20Metadata, Ownable {
    using SafeMath for uint256;
    using Address for address;

    string public name;  // The name of the token
    string public symbol;  // The symbol of the token
    uint8 public decimals;  // The number of decimals for token display
    uint256 public totalSupply;  // The total supply of the token
     
     
     /**
     * @dev Constructor function.
     * It initializes the token contract with the provided initial supply of tokens.
     * The initial supply is assigned to the contract deployer.
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 initialSupply) {
        require(initialSupply > 0, "RecCoin: initial supply cannot be zero");

        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = initialSupply.mul(10 ** _decimals);
        balanceOf[msg.sender] = totalSupply;

        emit Transfer(address(0), msg.sender, totalSupply);
    }

      /**
     * @dev Internal function to approve the spender to spend tokens on behalf of the owner.
     * @param owner The address of the token owner.
     * @param spender The address of the spender.
     * @param amount The amount of tokens to allow.
     * 
     */
     
    function _approve(address owner, address spender, uint256 amount) internal  {
        /* prevent a zero address from being passed as a parameter to this function 
        for both the owner and the spender of the allowance
        */
        require(owner != address(0), "RecCoin: approve from the zero address");
        require(spender != address(0), "RecCoin: approve to the zero address");
         // update the allowance mapping variable to register spender to spend a specified amount of the owner's token
        allowance[owner][spender] = amount;
        // log out the corresponding information related to the current transaction
        emit Approval(owner, spender, amount);
        
      }


    /**
     * @dev Internal function to transfer tokens from one account to another.
     * @param sender The address of the sender.
     * @param recipient The address of the recipient.
     * @param amount The amount of tokens to transfer.
     */

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "RecCoin: transfer from the zero address");
        require(recipient != address(0), "RecCoin: transfer to the zero address");
        require(balanceOf[sender] >= amount, "RecCoin: transfer amount exceeds balance");

        balanceOf[sender] = balanceOf[sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }