// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the Ownable contract, which provides basic authorization control.
import "@openzeppelin/contracts/access/Ownable.sol";

// Import the SafeMath library for performing arithmetic operations with safety checks.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Import the Address utility library for working with Ethereum addresses.
import "@openzeppelin/contracts/utils/Address.sol";

// Import token smart contract from same directory.
import "./RecCoin.sol";

/**
 * @title Recycle
 * @dev Implementation of the Recycle contract.
 * It facilites the exchange between recycling companies and plastic pickers.
 */

contract Recycle is Ownable {
    using SafeMath for uint256;
    using Address for address;

    address private addressRec;
    address[] public companyAddresses;
    address[] public pickerAddresses;
    mapping(address => Company) public companies;
    mapping(address => Picker) public pickers;
    uint256 public totalTransactions;
    mapping(uint256 => Transaction) public transactions;

    constructor() {
        totalTransactions = 0;
    }

    enum PlasticType {
        PET,
        HDPE,
        PVC,
        LDPE,
        PP,
        PS,
        Other
    }

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
        uint256[] transactions;
    }

    struct Transaction {
        uint256 id;
        address companyAddress;
        address pickerAddress;
        uint256 weight;
        uint256 price;
        bool isApproved;
    }

    // ================================================== MODIFIERS ================================================== //

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
     * @dev Modifier that allows only active companies to perform an action.
     */
    modifier onlyActiveCompany() {
        require(
            companies[msg.sender].active,
            "Only active companies can perform this action"
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

    // ================================================== EVENTS ================================================== //

    /**
     * @dev Emitted when a company's information is successfully registered on the RecCoin platform.
     */
    event CompanyRegistered(
        address indexed companyAddress,
        string name,
        uint256 minWeightRequirement,
        uint256 maxPricePerKg,
        bool active
    );

    /**
     * @dev Emitted when a company's information is successfully edited on the RecCoin platform.
     */
    event CompanyEdited(
        address indexed companyAddress,
        string name,
        uint256 minWeightRequirement,
        uint256 maxPricePerKg,
        bool active
    );

    /**
     * @dev Emitted when a company's name is successfully updated on the RecCoin platform.
     */
    event CompanyNameUpdated(address indexed companyAddress, string newName);

    /**
     * @dev Emitted when a company's minimum weight requirement is successfully updated on the RecCoin platform.
     */
    event CompanyMinWeightRequirementUpdated(
        address indexed companyAddress,
        uint256 newMinWeightRequirement
    );

    /**
     * @dev Emitted when a company's maximum price per kilogram is successfully updated on the RecCoin platform.
     */
    event CompanyMaxPricePerKgUpdated(
        address indexed companyAddress,
        uint256 newMaxPricePerKg
    );

    /**
     * @dev Emitted when a company's active status is successfully updated on the RecCoin platform.
     */
    event CompanyActiveStatusUpdated(
        address indexed companyAddress,
        bool newActiveStatus
    );

    /**
     * @dev Emitted when a picker is successfully registered on the RecCoin platform.
     */
    event PickerRegistered(
        address indexed pickerAddress,
        string name,
        string email
    );

    /**
     * @dev Emitted when a picker's information is successfully edited on the RecCoin platform.
     */
    event PickerEdited(
        address indexed pickerAddress,
        string name,
        string email
    );

    /**
     * @dev Emitted when a picker's name is successfully updated on the RecCoin platform.
     */
    event PickerNameUpdated(address indexed pickerAddress, string newName);

    /**
     * @dev Emitted when a picker's email is successfully updated on the RecCoin platform.
     */
    event PickerEmailUpdated(address indexed pickerAddress, string newEmail);

    /**
     * @dev Emitted when plastic is successfully deposited by a picker to a company on the RecCoin platform
     */
    event PlasticDeposited(
        address indexed pickerAddress,
        address indexed companyAddress,
        uint256 weight
    );

    /**
     * @dev Emitted when plastic is successfully validated by a company on the RecCoin platform.
     */
    event PlasticValidated(
        address indexed companyAddress,
        uint256 transactionId
    );

    /**
     * @dev Emitted when a payment is made to a picker on the RecCoin platform.
     */
    event PickerPaid(address sender, address recipient, uint256 amount);

    // ================================================== FUNCTIONS ================================================== //

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

    /**
     * @dev Edits an existing company.
     * @param _name The new name of the company.
     * @param _minWeightRequirement The new minimum weight requirement for the company.
     * @param _maxPricePerKg The new maximum price per kilogram set by the company.
     * @param _active The new activity status of the company.
     * @return success A boolean indicating if the edit was successful.
     */
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
     * @dev Updates the name of the company for the calling address.
     * @param _name The new name to be set for the company.
     */
    function updateCompanyName(string memory _name) public onlyCompany {
        require(bytes(_name).length != 0, "Please enter a company name");
        Company storage company = companies[msg.sender];
        company.name = _name;
        emit CompanyNameUpdated(msg.sender, _name);
    }

    /**
     * @dev Updates the minimum weight requirement of the company for the calling address.
     * @param _minWeightRequirement The new minimum weight requirement to be set for the company.
     */
    function updateCompanyMinWeightRequirement(
        uint256 _minWeightRequirement
    ) public onlyCompany {
        require(
            _minWeightRequirement > 0,
            "Invalid minimum weight requirement"
        );
        Company storage company = companies[msg.sender];
        company.minWeightRequirement = _minWeightRequirement;
        emit CompanyMinWeightRequirementUpdated(
            msg.sender,
            _minWeightRequirement
        );
    }

    /**
     * @dev Updates the maximum price per kilogram of the company for the calling address.
     * @param _maxPricePerKg The new maximum price per kilogram to be set for the company.
     */
    function updateCompanyMaxPricePerKg(
        uint256 _maxPricePerKg
    ) public onlyCompany {
        require(_maxPricePerKg > 0, "Set price must be greater than zero");
        Company storage company = companies[msg.sender];
        company.maxPricePerKg = _maxPricePerKg;
        emit CompanyMaxPricePerKgUpdated(msg.sender, _maxPricePerKg);
    }

    /**
     * @dev Updates the active status of the company for the calling address.
     * @param _active The new active status to be set for the company.
     */
    function updateCompanyActiveStatus(bool _active) public onlyCompany {
        Company storage company = companies[msg.sender];
        company.active = _active;
        emit CompanyActiveStatusUpdated(msg.sender, _active);
    }

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
        uint256[] memory empty;
        Picker memory newPicker = Picker(_name, _email, 0, empty);
        pickers[msg.sender] = newPicker;
        pickerAddresses.push(msg.sender);
        emit PickerRegistered(msg.sender, _name, _email);
        return true;
    }

    /**
     * @dev Gets content of the Picker struct since Solidity does not return arrays from structs inside mappings.
     * @return picker The struct containing the information about registered pickers.
     */
    function getPicker(address _address) public view returns (Picker memory) {
        return pickers[_address];
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
     * @dev Updates the name of a specific picker.
     * @param _name The new name to be set for the picker.
     */
    function updatePickerName(string memory _name) public onlyPicker {
        require(bytes(_name).length != 0, "Please enter a picker name");
        Picker storage picker = pickers[msg.sender];
        picker.name = _name;
        emit PickerNameUpdated(msg.sender, _name);
    }

    /**
     * @dev Updates the email of a specific picker.
     * @param _email The new email to be set for the picker.
     */
    function updatePickerEmail(string memory _email) public onlyPicker {
        require(bytes(_email).length != 0, "Please enter a picker email");
        Picker storage picker = pickers[msg.sender];
        picker.email = _email;
        emit PickerEmailUpdated(msg.sender, _email);
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
    ) public onlyPicker returns (uint256 transactionId) {
        require(
            companies[_companyAddress].active,
            "This company is no longer active"
        );
        Transaction memory newTransaction = Transaction(
            totalTransactions,
            _companyAddress,
            msg.sender,
            _weight,
            companies[_companyAddress].maxPricePerKg,
            false
        );
        transactions[totalTransactions] = newTransaction;
        Picker storage existingPicker = pickers[msg.sender];
        existingPicker.weightDeposited += _weight;
        existingPicker.transactions.push(totalTransactions);
        totalTransactions++;
        emit PlasticDeposited(msg.sender, _companyAddress, _weight);
        return newTransaction.id;
    }

    /**
     * @dev Validates a plastic transaction.
     * @param _transactionId The ID of the transaction to be validated.
     * @return success A boolean indicating if the validation was successful.
     */
    function validatePlastic(
        uint256 _transactionId
    ) public onlyActiveCompany returns (bool success) {
        require(
            transactions[_transactionId].companyAddress == msg.sender,
            "This transaction belongs to another company"
        );
        require(
            transactions[_transactionId].weight >=
                companies[msg.sender].minWeightRequirement,
            "Weight of plastic deposited is below the minimum accepted weight of the company"
        );
        transactions[_transactionId].isApproved = true;
        emit PlasticValidated(
            transactions[_transactionId].companyAddress,
            _transactionId
        );
        return true;
    }

    /**
     * @dev Function to set address of RecCoin contract
     * @param _addressRec The address of the RecCoin contract
     */
    function setRecCoinAddress(address _addressRec) external {
        require(_addressRec!= address(0x0));
        addressRec = _addressRec;
    }

    /**
     * @dev Pays a picker for a completed transaction.
     * @param _transactionId The ID of the completed transaction.
     * @return success A boolean indicating if the payment was successful.
     */
    function payPicker(
        uint256 _transactionId
    ) public transactionApproved(_transactionId) returns (bool success) {
        // Implement your code here
        require(transactions[_transactionId].isApproved, "Transaction does not exist");
        address _pickerAddress = transactions[_transactionId].pickerAddress;
       
        uint256 amount = transactions[_transactionId].weight *
        transactions[_transactionId].price;
        RecCoin recCoin = RecCoin(addressRec);
        recCoin.transfer(_pickerAddress, amount);
        emit PickerPaid(msg.sender, _pickerAddress, amount);
        return true;
    }
}
