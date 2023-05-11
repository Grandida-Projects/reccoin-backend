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
     * Burning tokens means permanently removing them from circulation in a cryptocurrency 
     * or blockchain ecosystem. This process is irreversible and reduces the total supply 
     * of tokens that exist. 
     * 
     * Token burning can be done for various reasons, including reducing inflation and 
     * increasing the value of remaining tokens by making them scarcer, eliminating lost 
     * or stolen tokens, or as part of a buyback program where tokens are purchased and 
     * then burned to increase the value of the remaining tokens. 
     * 
     * Token burning is typically achieved by sending the tokens to an unusable 
     * address that is not controlled by anyone, also known as a "burn address". 
     * Once the tokens are sent to the burn address, they cannot be retrieved, 
     * and they are effectively removed from circulation.
     * 
     * The "burn" function has the following specifications:

        1. Visibility: The function has a public visibility modifier, which means 
            it can be called from outside the contract.

        2. Input Parameters: The function takes one input parameter, "amount", 
            which is an unsigned integer of 256 bits. This parameter represents 
            the number of tokens to be burned.

        3. Modifiers: The function has one modifier, "onlyOwner", which 
            restricts the execution of the function to the contract owner. 
            This modifier ensures that only the contract owner can initiate 
            the burning of tokens.

        4. Function Call: The function calls the "_burn" function, 
            passing the contract owner's address (msg.sender) and the 
            specified amount as arguments. This initiates the burning 
            of tokens and permanently removes them from circulation.

        5. Return Type: The function does not have a return type, as it is 
            a void function and does not return any values.
     */
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

}
