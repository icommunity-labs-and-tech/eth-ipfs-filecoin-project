pragma solidity ^0.7.3;


contract GenericNotaryV4 {
    address public owner;

    mapping(string => mapping(uint256 => Notarization)) public notarizationsV2;

    struct Notarization {
        string id;
        string tittle;
        string user; // TODO use address type
        string dataHash;
        uint256 version;
    }

    constructor() public {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    function transferOwnership(address newOwner) public isOwner {
        owner = newOwner;
    }

    function saveNewVersion(
        string memory _id,
        string memory _tittle,
        string memory _user,
        string memory _dataHash,
        uint256 _newVersion
    ) private {
        notarizationsV2[_id][_newVersion] = Notarization(
            _id,
            _tittle,
            _user,
            _dataHash,
            _newVersion
        );
        notarizationsV2[_id][0] = Notarization(
            _id,
            _tittle,
            _user,
            _dataHash,
            _newVersion
        );
    }

    function notarize(
        string memory _id,
        string memory _tittle,
        string memory _user,
        string memory _dataHash
    ) public isOwner {
        if (
            keccak256(bytes(notarizationsV2[_id][0].id)) == keccak256(bytes(""))
        ) {
            saveNewVersion(_id, _tittle, _user, _dataHash, 1);
            emit NotarizationSaved(_id, _tittle, _user, _dataHash, 1, true);
        } else {
            uint256 previousVersion = notarizationsV2[_id][0].version;
            uint256 newVersion = previousVersion + 1;
            saveNewVersion(_id, _tittle, _user, _dataHash, newVersion);
            emit NotarizationSaved(
                _id,
                _tittle,
                _user,
                _dataHash,
                newVersion,
                true
            );
        }
    }

    event NotarizationSaved(
        string _id,
        string _tittle,
        string _user,
        string _dataHash,
        uint256 _version,
        bool latest
    ); // TODO indexed

    function getNotarizationById(string memory _id)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        Notarization memory notarization = notarizationsV2[_id][0];
        require(
            keccak256(bytes(notarization.id)) == keccak256(bytes(_id)),
            "Notarization does not exists"
        );
        return (
            notarization.id,
            notarization.tittle,
            notarization.user,
            notarization.dataHash,
            notarization.version
        );
    }
}
