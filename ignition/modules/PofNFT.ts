import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const { vars } = require("hardhat/config");

//Sepolia
const SUBSCRIPTION_ID = vars.get("SUBSCRIPTION_ID");
const VRFCOORDINATOR = '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625';
const KEYHASH = '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c';

const PofNFTModule = buildModule("PofNFTModule", (m) => {

    const subscriptionId = m.getParameter("subscriptionId",SUBSCRIPTION_ID);
    const vrfcoordinator = m.getParameter("vrfCoordinator",VRFCOORDINATOR);
    const keyHash = m.getParameter("keyHash",KEYHASH);
    
    const PofNFT = m.contract("PofNFT",[subscriptionId, vrfcoordinator, keyHash]);

  return { PofNFT };
});

module.exports = PofNFTModule;

//Sepolia 0x3bE000E15d4758a56D912780B34967dA05568b17
