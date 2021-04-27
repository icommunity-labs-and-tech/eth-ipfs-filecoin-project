// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;

//import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Certificator is AccessControl { // TODO updatable

    event CertificationCreated(address _userAddr, string _user, string _userHash,  string _id, string _title, string _dataHash, uint _version);

    mapping(string => uint) public certifications;

    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    modifier onlyUser() {
        require(hasRole(USER_ROLE, msg.sender), "unauthorized: you need to be an user");
        _;
    }

    function init(address _user, address _parent) external {
        _setupRole(DEFAULT_ADMIN_ROLE, _user);
        _setupRole(USER_ROLE, _user);
        _setupRole(USER_ROLE, _parent);
    }

    function certificate(
        string memory _user,
        string memory _userHash,
        string memory _id,
        string memory _title,
        string memory _dataHash
    ) external onlyUser {
        certifications[_id] = certifications[_id] + 1;

        emit CertificationCreated(getRoleMember(DEFAULT_ADMIN_ROLE, 0), _user, _userHash, _id, _title, _dataHash, certifications[_id]);
    }
}