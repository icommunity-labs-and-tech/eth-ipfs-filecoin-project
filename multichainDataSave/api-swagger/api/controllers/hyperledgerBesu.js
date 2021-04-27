'use strict';

var util = require('util');
var Contract = require("@truffle/contract");
const Web3 = require('web3');
const fs = require('fs');
const ipfsClient = require('ipfs-http-client');
const Cryptr = require('cryptr');

var CertificatorManagerBuild = require('../../build/contracts/CertificatorManager.json');
var CertificatorManager = Contract(CertificatorManagerBuild);

var web3;
var ipfs;
var certificator_manager_instance;

//Sender
let sender = "0x88d8fa1d8c013c74a35b929c3d73fbf3de933c10";

module.exports = {
    notarize: notarize,
    getNotarizationById: getNotarizationById,
    registerUser: registerUser,
    getKyc:getKyc
};

async function connect() {
    try {
        web3 = await new Web3(new Web3.providers.HttpProvider("http://cyberseclab.eurecat.org:8545")); //Alastria node

        await CertificatorManager.setProvider(web3.currentProvider);

        certificator_manager_instance = await CertificatorManager.deployed();

        ipfs = await ipfsClient({
            host: '127.0.0.1',
            port: '5001',
            protocol: 'http'
        });

        const version = await ipfs.version()
        console.log(`Successful connection to the IPFS node: (${version.version})`);

    } catch (error) {
        console.log(error);
    }
}

async function notarize(req, res) {
    console.log("**** POST /notarize ****");
    req.setTimeout(900000);

    try {
        await connect();

        const contract = new web3.eth.Contract(Certificator.abi, "0x7C2Ee5526811F3065389b803Ce18AF8eb09b681e");

        const nextNonce = await web3.eth.getTransactionCount(sender, "pending");

        const gas = await contract.methods.notarize.apply(null, [req.body.id, req.body.tittle, req.body.user, req.body.dataHash]).estimateGas({
                from: sender
            })
            .catch((e) => {
                throw Error(`Error calculating gas: ${e.message}`)
            })

        const tx = {
            from: sender,
            to: contract._address,
            data: contract.methods.notarize.apply(null, [req.body.id, req.body.tittle, req.body.user, req.body.dataHash]).encodeABI(),
            gas,
            gasPrice: 0,
            nonce: nextNonce,
            gasLimit: 0,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, fs.readFileSync(".secret").toString());
        await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
        res.json({
            "notarization": {
                "tx": signedTx.transactionHash
            }
        })
    } catch (error) {
        res.status(400).send(`${error.message}`)
        console.log(error.message);
    }
}

async function getNotarizationById(req, res) {
    console.log("**** GET /getNotarizationById ****");
    try {
        await connect();
        let result = await instance.getNotarizationById.call(req.swagger.params.id.value);
        let jsonObj = {};
        jsonObj = {
            ["id"]: result[0],
            ["tittle"]: result[1],
            ["user"]: result[2],
            ["dataHash"]: result[3],
            ["version"]: result[4],
        }
        res.status(200).send(jsonObj);
    } catch (error) {
        res.status(400).send(`${error.message}`)
        console.log(error.message);
    }
}

async function registerUser(req, res) {
    console.log("**** POST /registerUser ****");
    req.setTimeout(900000);

    try {
        await connect();

        const cryptr = new Cryptr(req.body.secret);

        const encryptedKYC = await cryptr.encrypt(JSON.stringify(req.files.kycFile));

        const ipfsResult = await ipfs.add(encryptedKYC, {pin: true})

        console.log(ipfsResult)

        const contract = new web3.eth.Contract(CertificatorManager.abi, "0x7C2Ee5526811F3065389b803Ce18AF8eb09b681e");
        const nextNonce = await web3.eth.getTransactionCount(sender, "pending");
        const gas = await contract.methods.registerUserKyc.apply(null, [req.body.user, ipfsResult.path]).estimateGas({
                from: sender
            })
            .catch((e) => {
                throw Error(`Error calculating gas: ${e}`)
            })
        const tx = {
            from: sender,
            to: contract._address,
            data: contract.methods.registerUserKyc.apply(null, [req.body.user, ipfsResult.path]).encodeABI(),
            gas,
            gasPrice: 0,
            nonce: nextNonce,
            gasLimit: 0,
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, fs.readFileSync(".secret").toString());
        await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);

        res.json({
            "newUser": {
                "tx": signedTx.transactionHash,
                "kycIPFS": ipfsResult.path
            }
        })

    } catch (error) {
        res.status(400).send(`${error.message}`)
        console.log(error);
    }
}

async function getKyc(req, res) {
    console.log("**** GET /getKycHash ****");
    try {
        await connect();

        const cryptr = new Cryptr(req.swagger.params.secret.value);

        let result = await certificator_manager_instance.users.call(req.swagger.params.user.value);

        const chunks = []
        for await (const chunk of ipfs.cat(result.kycHash)) {
            chunks.push(chunk)
        }
        const decryptedFile = cryptr.decrypt(Buffer.concat(chunks).toString());

        const file = JSON.parse(decryptedFile)

        fs.writeFile(`./kyc/${file.originalname}`, Buffer.from(file.buffer.data), function (err) {
            console.log("ok")
        });

        let jsonObj = {};
        jsonObj = {
            ["status"]: "ok"
        }
        res.status(200).send(jsonObj);
    } catch (error) {
        res.status(400).send(`${error.message}`)
        console.log(error.message);
    }
}


//registerUser("0x8db7a575fd2c9e28770e3c5a830a7abeb2ff49bb", "holatest", "hola que tal soy manolo");
//getKycHash("0xd4678167643677aacd3d4a0707489869c157096e")