// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the Ownable contract, which provides basic authorization control.
import "@openzeppelin/contracts/access/Ownable.sol";

// Import the SafeMath library for performing arithmetic operations with safety checks.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Import the Address utility library for working with Ethereum addresses.
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title Recycle
 * @dev Implementation of the Recycle contract.
 * It facilites the exchange between recycling companies and plastic pickers.
 */

contract Recycle is Ownable {
    using SafeMath for uint256;
    using Address for address;

    address[] public companyAddresses;
    address[] public pickerAddresses;
    mapping(address => Company) public companies;
    mapping(address => Picker) public pickers;
    uint256 public totalTransactions;
    mapping(uint256 => Transaction) public transactions;
    event CompanyRegistered(
        address indexed companyAddress,
        string name,
        uint256 minWeightRequirement,
        uint256 maxPricePerKg,
        bool active
    );
    event PlasticValidated(
        address indexed companyAddress,
        uint256 transactionId,
        bool isApproved
    );
    enum PlasticType {
        PET,
        HDPE,
        PVC,
        LDPE,
        PP,
        PS,
        Other
    }
    event PickerEdited(
        address indexed pickerAddress,
        string name,
        string email
    );

    struct Company {
        string name;
        uint256 minWeightRequirement;
        uint256 maxPricePerKg;
        bool active;
    }

    struct Picker {
        string name;
        string email;
        uint256 weightDeposited;
    }

    struct Transaction {
        uint256 id;
        address companyAddress;
        address pickerAddress;
        uint256 weight;
        uint256 price;
        bool isApproved;
    }

    event PlasticDeposited(
        address indexed pickerAddress,
        address indexed companyAddress,
        uint256 transactionId,
        uint256 weight,
        uint256 pricePerKg
    );


    /**
     * @dev Modifier that allows only registered companies to perform an action.
     */
    modifier onlyCompany() {
        // TODO: Improve function modularity and reduce dependencies for enhanced decoupling.
        require(
            companies[msg.sender].maxPricePerKg != 0,
            "Only a registered company can perform this action"
        );
        _;
    }

    /**
     * @dev Modifier that allows only registered pickers to perform an action.
     */
    modifier onlyPicker() {
        // TODO: Improve function modularity and reduce dependencies for enhanced decoupling.
        require(
            bytes(pickers[msg.sender].name).length > 0,
            "Only a registered pickers can perform this action"
        );
        _;
    }

    /**
     * @dev Modifier that checks if a transaction with the given ID exists.
     * @param _transactionId The ID of the transaction.
     */
    modifier transactionExists(uint256 _transactionId) {
        // TODO: Improve function modularity and reduce dependencies for enhanced decoupling.
        require(
            transactions[_transactionId].price != 0,
            "Transaction does not exist"
        );
        _;
    }

    /**
     * @dev Modifier that checks if a transaction with the given ID is approved.
     * @param _transactionId The ID of the transaction.
     */
    modifier transactionApproved(uint256 _transactionId) {
        // TODO: Improve function modularity and reduce dependencies for enhanced decoupling.
        require(
            transactions[_transactionId].isApproved == true,
            "Transaction does not exist"
        );
        _;
    }

    /**
     * @dev Registers a new company.
     * @param _name The name of the company.
     * @param _minWeightRequirement The minimum weight requirement for the company.
     * @param _maxPricePerKg The maximum price per kilogram set by the company.
     * @param _active The activity status of the company.
     * @return success A boolean indicating if the registration was successful.
     */
    function registerCompany(
        string memory _name,
        uint256 _minWeightRequirement,
        uint256 _maxPricePerKg,
        bool _active
    ) public returns (bool success) {
        bytes memory nameInBytes = bytes(_name);
        uint256 nameLength = nameInBytes.length;
        require(
            companies[msg.sender].minWeightRequirement == 0,
            "Sorry you can't register twice edit your info if you wish to"
        );
        require(nameLength != 0, "Please enter a company name");
        require(_maxPricePerKg > 0, "set price must be greater than zero");
        require(
            _minWeightRequirement > 0,
            "Invalid minimum weight requirement"
        );
        Company memory newCompany = Company(
            _name,
            _minWeightRequirement,
            _maxPricePerKg,
            _active
        );
        companies[msg.sender] = newCompany;
        companyAddresses.push(msg.sender);
        emit CompanyRegistered(
            msg.sender,
            _name,
            _minWeightRequirement,
            _maxPricePerKg,
            _active
        );
        return true;
    }

    /**
     * @dev Gets the count of registered companies.
     * @return count The count of registered companies.
     */
    function getRegisteredCompanyCount() public view returns (uint256 count) {
        return companyAddresses.length;
    }

    event CompanyEdited(
        address indexed companyAddress,
        string name,
        uint256 minWeightRequirement,
        uint256 maxPricePerKg,
        bool active
    );

    modifier onlyActiveCompany() {
        require(
            companies[msg.sender].active,
            "Only active companies can perform this action"
        );
        _;
    }

    /* @dev Edits an existing company.
     * @param _name The new name of the company.
     * @param _minWeightRequirement The new minimum weight requirement for the company.
     * @param _maxPricePerKg The new maximum price per kilogram set by the company.
     * @param _active The new activity status of the company.
     * @return success A boolean indicating if the edit was successful.
     */
    // TODO: Upgrade function to allow more granular edits
    function editCompany(
        string memory _name,
        uint256 _minWeightRequirement,
        uint256 _maxPricePerKg,
        bool _active
    ) public onlyCompany returns (bool success) {
        bytes memory nameInBytes = bytes(_name);
        uint256 nameLength = nameInBytes.length;
        require(nameLength != 0, "Please enter a company name");
        require(_maxPricePerKg > 0, "set price must be greater than zero");
        require(
            _minWeightRequirement > 0,
            "Invalid minimum weight requirement"
        );

        Company storage company = companies[msg.sender];
        company.name = _name;
        company.minWeightRequirement = _minWeightRequirement;
        company.maxPricePerKg = _maxPricePerKg;
        company.active = _active;

        emit CompanyEdited(
            msg.sender,
            _name,
            _minWeightRequirement,
            _maxPricePerKg,
            _active
        );

        return true;
    }

    /**
     * @dev This event is emitted when a picker is successfully registered on the RecCoin platform.
     */

    event PickerRegistered(
        address indexed pickerAddress,
        string name,
        string email
    );

    /**
     * @dev Registers a new picker.
     * @param _name The name of the picker.
     * @param _email The email address of the picker.
     * @return success A boolean indicating if the registration was successful.
     */

    function registerPicker(
        string memory _name,
        string memory _email
    ) public returns (bool success) {
        require(bytes(_name).length > 0, "Please provide a valid picker name.");
        require(
            bytes(_email).length > 0,
            "Please provide a valid email address."
        );
        require(
            bytes(pickers[msg.sender].name).length == 0,
            "Picker already registered"
        );
         Picker memory newPicker = Picker(
            _name,
            _email,
            0
        );
        pickers[msg.sender] = newPicker;
        pickerAddresses.push(msg.sender);

        emit PickerRegistered(msg.sender, _name, _email);

        return true;
    }

    /**
     * @dev Gets the count of registered pickers.
     * @return count The count of registered pickers.
     */
    function getRegisteredPickerCount() public view returns (uint256 count) {
        return pickerAddresses.length;
    }

    /**
     * @dev Edits an existing picker.
     * @param _name The new name of the picker.
     * @param _email The new email address of the picker.
     * @return success A boolean indicating if the edit was successful.
     */
    function editPicker(
        string memory _name,
        string memory _email
    ) public onlyPicker returns (bool success) {
        require(bytes(_name).length > 0, "Please provide a valid picker name.");
        require(
            bytes(_email).length > 0,
            "Please provide a valid email address."
        );

        Picker storage existingPicker = pickers[msg.sender];
        existingPicker.name = _name;
        existingPicker.email = _email;

        emit PickerEdited(msg.sender, _name, _email);
        return true;
    }

    /**
     * @dev Deposits plastic from a picker to the contract.
     * @param _companyAddress The address of the company receiving the plastic deposition.
     * @param _weight The weight of the deposited plastic.
     * @return transactionId The ID of the transaction.
     */
    function depositPlastic(
        address _companyAddress,
        uint256 _weight
    ) public returns (uint256 transactionId) {
        // Implement your code here
    }

    /**
     * @dev Validates a plastic transaction.
     * @param _transactionId The ID of the transaction to be validated.
     * @param _isApproved A boolean indicating if the transaction is approved.
     * @return success A boolean indicating if the validation was successful.
     */
    function validatePlastic(
        uint256 _transactionId,
        bool _isApproved
    ) public returns (bool success) {
        require(
            transactions[_transactionId].weight >=
                companies[msg.sender].minWeightRequirement,
            "Weight of plastic deposited is below the minimum accepted weight of the company"
        );
        if (_isApproved == true) {
            transactions[_transactionId].isApproved = true;
            transactions[_transactionId].id = _transactionId;
            return true;
        }
        emit PlasticValidated(
            transactions[_transactionId].companyAddress,
            _transactionId,
            _isApproved
        );
    }

    /**
     * @dev Pays a picker for a completed transaction.
     * @param _transactionId The ID of the completed transaction.
     * @return success A boolean indicating if the payment was successful.
     */
    function payPicker(uint256 _transactionId) public returns (bool success) {
        // Implement your code here
    }

    /**
 * @dev Deposits plastic from a picker to the contract.
 * @param _companyAddress The address of the company receiving the plastic deposition.
 * @param _weight The weight of the deposited plastic.
 * @return transactionId The ID of the transaction.
 */
function depositPlastic(
    address _companyAddress,
    uint256 _weight
    ) public returns (uint256 transactionId) {
    require(
        bytes(companies[_companyAddress].name).length != 0,
        "Invalid company address"
    );
    require(
        _weight > 0,
        "Invalid weight, must be greater than zero"
    );

    require(
        bytes(pickers[msg.sender].name).length != 0,
        "Only registered pickers can deposit plastic"
    );

    Company storage company = companies[_companyAddress];

    require(
        company.active,
        "Company is not active"
    );

    uint256 transactionId = totalTransactions;

    Transaction memory newTransaction = Transaction(
        transactionId,
        _companyAddress,
        msg.sender,
        _weight,
        company.maxPricePerKg,
        false
    );

    transactions[transactionId] = newTransaction;
    totalTransactions++;

    emit PlasticDeposited(
        msg.sender,
        _companyAddress,
        transactionId,
        _weight,
        company.maxPricePerKg
    );

    return transactionId;
    }
}