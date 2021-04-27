// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.3;


// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Certificator.sol";
import "./CloneFactory.sol";

contract CertificatorManager is CloneFactory, Ownable {
    event UserRegistered(address indexed _user, address indexed _certificator);

    address private certificatorParent;

    struct User {
        Certificator certificator;
        string kycHash;
    }

    mapping(address => Certificator) public certificators;
    mapping(address => User) public users;

    constructor(address _certificatorParent) {
        certificatorParent = _certificatorParent;
    }

    function registerUser(address _user) onlyOwner external {
        require(address(certificators[_user]) == address(0), "user already registered");
        Certificator certificator = Certificator(createClone(certificatorParent));
        certificator.init(_user, owner());
        certificators[_user] = certificator;

        emit UserRegistered(_user, address(certificator));
    }

    function registerUserKyc(address _user, string memory _kycHash) onlyOwner external {
        require(address(users[_user].certificator) == address(0), "user already registered");

        Certificator certificator = Certificator(createClone(certificatorParent));
        certificator.init(_user, owner());

        users[_user] = User(certificator, _kycHash);

        emit UserRegistered(_user, address(certificator));
    }
}