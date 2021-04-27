
const Certificator = artifacts.require("Certificator");
const CertificatorManager = artifacts.require("CertificatorManager");

module.exports = async function (deployer) {
  deployer.deploy(Certificator).then(function() {
    return deployer.deploy(CertificatorManager, Certificator.address);
  });
};
