# Recylox Token Contract

The Recylox token contract is an implementation of the ERC20 token standard in the Solidity programming language. It is designed to be used as a token for various purposes within the Ethereum ecosystem. The contract includes functions for transferring tokens, approving token allowances, minting new tokens, and burning existing tokens.

The contract inherits from the `IERC20` interface, which defines the standard functions and events for an ERC20 token. It also extends the `Ownable` contract, which provides basic authorization control by allowing only the contract owner to perform certain actions.

The main features and components of the Recylox token contract are as follows:

## Token Information

- `name`: The name of the token.
- `symbol`: The symbol of the token.
- `decimals`: The number of decimal places for token display.
- `totalSupply`: The total supply of the token.

## Balances and Allowances

- `balanceOf`: A mapping that tracks the balance of tokens for each token holder.
- `allowance`: A mapping that tracks the allowances granted by token holders to other addresses.

## Constructor

- The constructor function initializes the token contract with the provided initial supply of tokens. The initial supply is assigned to the contract deployer.

## Transfer Functions

- `transfer`: Transfers tokens from the sender's account to the specified recipient.
- `transferFrom`: Transfers tokens from the sender's account to the specified recipient on behalf of the token owner.

## Approval Functions

- `approve`: Sets the allowance for the spender to spend tokens on behalf of the owner.

## Minting and Burning

- `mint`: Mints new tokens and adds them to the specified account. Only the contract owner can call this function.
- `burn`: Burns tokens from the specified account. Only the contract owner can call this function.

## Internal Functions

- `_transfer`: Internal function to transfer tokens from one account to another.
- `_approve`: Internal function to approve the spender to spend tokens on behalf of the owner.
- `_burn`: Internal function to burn tokens from the specified account.

For a more detailed explanation of the Solidity language and how to use contracts, you can refer to the official Solidity documentation [^1^]. The Solidity documentation provides an overview of the language, examples, and guides on writing and deploying smart contracts.

[1]: https://docs.soliditylang.org/
