# reccoin-backend
Backend folder for the reccoin platform
Recycle Smart Contract Documentation

## Contract Overview<a name="contract-overview"></a>

The Recycle smart contract facilitates the exchange between recycling companies and plastic pickers. It provides functions to manage company and picker registrations, track transactions, handle plastic deposits, validation, and payment. This documentation provides an overview of the contract's structure, functionality, and usage.

## Contract Structure<a name="contract-structure"></a>

The Recycle smart contract consists of the following components:

### State Variables<a name="state-variables"></a>

- `reccoinAddress`: Immutable address representing the token smart contract address.
- `companyAddresses`: Array of addresses representing registered company addresses.
- `pickerAddresses`: Array of addresses representing registered picker addresses.
- `companies`: Mapping storing information about registered companies.
- `pickers`: Mapping storing information about registered pickers.
- `totalTransactions`: Counter variable to track the total number of transactions.
- `transactions`: Mapping storing information about individual transactions.
- `locked`: Boolean variable used to track the reentrancy status of the contract.

### Structs<a name="structs"></a>

- `Company`: Represents information about a registered company, including name, minimum weight requirement, maximum price per kilogram, and active status.
- `Picker`: Represents information about a registered picker, including name, email, weight deposited, and transaction history.
- `Transaction`: Represents a transaction between a company and a picker, including the transaction ID, company and picker addresses, weight, price, and approval status.

### Modifiers<a name="modifiers"></a>

- `onlyCompany`: Allows only registered companies to perform certain actions.
- `onlyActiveCompany`: Allows only active companies to perform certain actions.
- `onlyPicker`: Allows only registered pickers to perform certain actions.
- `transactionExists`: Checks if a transaction with the given ID exists.
- `transactionApproved`: Checks if a transaction with the given ID is approved.
- `noReentrancy`: Prevents reentrancy attacks by allowing a function to be called only when not already in progress.

### Events<a name="events"></a>

The contract emits various events to provide information about important contract actions and state changes. These events can be subscribed to by external applications to track the contract's activities.

## Public Functions<a name="public-functions"></a>

The Recycle smart contract exposes

 the following public functions for external interaction:

### `balanceOf()`<a name="balanceof"></a>

```solidity
function balanceOf() public view returns (uint256)
```

Retrieves the balance of tokens for the caller (company or picker).

### `registerCompany()`<a name="registercompany"></a>

```solidity
function registerCompany(string memory name, uint256 minWeightRequirement, uint256 maxPricePerKg) public
```

Registers a new company with the provided information. The caller's address is used as the company address.

### `getRegisteredCompanyCount()`<a name="getregisteredcompanycount"></a>

```solidity
function getRegisteredCompanyCount() public view returns (uint256)
```

Retrieves the count of registered companies.

### `editCompany()`<a name="editcompany"></a>

```solidity
function editCompany(uint256 index, uint256 minWeightRequirement, uint256 maxPricePerKg) public onlyCompany
```

Edits an existing company's information. The caller must be the owner of the company.

### `updateCompanyName()`<a name="updatecompanyname"></a>

```solidity
function updateCompanyName(string memory newName) public onlyCompany
```

Updates the name of the company for the calling address. The caller must be the owner of the company.

### `updateCompanyMinWeightRequirement()`<a name="updatecompanyminweightrequirement"></a>

```solidity
function updateCompanyMinWeightRequirement(uint256 newRequirement) public onlyCompany
```

Updates the minimum weight requirement of the company for the calling address. The caller must be the owner of the company.

### `updateCompanyMaxPricePerKg()`<a name="updatecompanymaxpriceperkg"></a>

```solidity
function updateCompanyMaxPricePerKg(uint256 newPrice) public onlyCompany
```

Updates the maximum price per kilogram of the company for the calling address. The caller must be the owner of the company.

### `updateCompanyActiveStatus()`<a name="updatecompanyactivestatus"></a>

```solidity
function updateCompanyActiveStatus(bool isActive) public onlyCompany
```

Updates the active status of the company for the calling address. The caller must be the owner of the company.

### `registerPicker()`<a name="registerpicker"></a>

```solidity
function registerPicker(string memory name, string memory email) public
```

Registers a new picker with the provided information. The caller's address is used as the picker address.

### `getPicker()`<a name="getpicker"></a>

```solidity
function getPicker(address pickerAddress) public view returns (string memory, string memory, uint256, uint256[])
```

Retrieves the information about a registered picker, including name, email, weight deposited, and transaction history.

### `getRegisteredPickerCount()`<a name="getregisteredpickercount"></a>

```solidity
function getRegisteredPickerCount() public view returns (uint256)
```

Retrieves the count of registered pickers.

### `editPicker()`<a name="editpicker"></a>

```solidity
function editPicker(uint256 index, string memory newName, string memory newEmail) public onlyPicker
```

Edits an existing picker's information. The caller must be the owner of the picker.

## Internal Functions<a name="internal-functions"></a>

The Recycle smart contract also includes several internal functions that are used for plastic deposit, validation, and payment processes. These functions handle the core logic of the contract and are not meant to be directly called by external users.

## Usage<a name="usage"></a>

To use the Recycle smart contract,

 the following steps can be followed:

1. Deploy the smart contract on a compatible blockchain network.
2. Companies and pickers can register using the `registerCompany()` and `registerPicker()` functions, respectively.
3. Registered companies can manage their information using functions like `editCompany()`, `updateCompanyName()`, `updateCompanyMinWeightRequirement()`, `updateCompanyMaxPricePerKg()`, and `updateCompanyActiveStatus()`.
4. Registered pickers can manage their information using the `editPicker()` function.
5. Companies can deposit plastic and initiate transactions using appropriate functions.
6. Pickers can validate and confirm transactions using appropriate functions.
7. Companies can approve or reject transactions using the `approveTransaction()` and `rejectTransaction()` functions.
8. Once a transaction is approved, the picker can withdraw their payment using the `withdrawPayment()` function.
9. The `balanceOf()` function can be used by companies and pickers to check their token balances.

It's important to ensure that only authorized entities interact with the contract and that appropriate security measures are implemented.

## Security Considerations<a name="security-considerations"></a>

When using the Recycle smart contract, it's essential to consider the following security aspects:

1. Carefully review and audit the contract code to identify and address potential vulnerabilities.
2. Protect private keys associated with company and picker addresses to prevent unauthorized access.
3. Implement proper access control mechanisms to ensure that only authorized entities can perform specific actions.
4. Use secure communication channels and protocols when interacting with the contract.
5. Be cautious of potential reentrancy attacks and ensure the `noReentrancy` modifier is correctly applied to susceptible functions.
6. Regularly update and patch the smart contract as needed to address any identified security issues or improvements.

By following these security considerations, you can enhance the overall security and reliability of the Recycle smart contract in your application.
