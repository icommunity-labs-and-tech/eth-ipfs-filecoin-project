
const CloneFactory = artifacts.require("CloneFactory");

module.exports = async function (deployer) {
  deployer.deploy(CloneFactory);
};
