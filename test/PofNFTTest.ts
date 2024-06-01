import { ethers } from "hardhat";

const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("PofNFT Test", function () {

  async function setupFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ChVRFMock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    const chVRFMock = await ChVRFMock.deploy(1000000000000000000n,10000000000);
    const VRFCoordinatorAddress = await chVRFMock.getAddress();
    console.log(VRFCoordinatorAddress);

    const subscriptionTransaction= await chVRFMock.createSubscription();
    const tx = await subscriptionTransaction.wait();
    const log = tx?.logs[0];
    const topic2 = log?.topics[1];
    const subscriptionId = topic2 != undefined ? parseInt(topic2, 16): 1;  
    console.log("Subscription: "+ subscriptionId);

    await chVRFMock.fundSubscription(subscriptionId, 100000000000000000000000n);

    const Pof = await ethers.getContractFactory("PofNFT");
    const pof = await Pof.deploy(subscriptionId, VRFCoordinatorAddress, '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc');
    const pofAddressConsumer = await pof.getAddress();
    await chVRFMock.addConsumer(subscriptionId, pofAddressConsumer);
    console.log("Consumer: "+pofAddressConsumer);

    const MINT_COST = ethers.parseUnits('20000000000000000',"wei"); 
    return {pof, chVRFMock, MINT_COST, pofAddressConsumer, addr1, addr2};
  }

  it("Get name and symbol NFT correctly", async function() {
    const {pof} = await loadFixture(setupFixture);

    expect(await pof.symbol()).to.equal("POF");
    expect(await pof.name()).to.equal("PofNFT");
    
  });

  it("Create a new NFT and get name", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST} = await loadFixture(setupFixture);
    
    await pof.CreateNFT("Plant1", { value: MINT_COST });
    const requestId = await pof.requestIdTemp();
    await chVRFMock.fulfillRandomWords(requestId, pofAddressConsumer);  
    const plant = await pof.getNFT(0);
    expect(plant.name).to.equal("Plant1");
  });

  it("Create a new NFT with invalid amount", async function() {
    const { pof } = await loadFixture(setupFixture);
    
    await expect(pof.CreateNFT("Plant1", { value: 20000 })).to.be.revertedWith("Invalid amount.");
  });

  it("Not create more than the maximum supply of NFTs and get All NFT", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1} = await loadFixture(setupFixture);

    for (let i = 0; i < 10; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }

    await expect(pof.connect(addr1).CreateNFT("ExtraPlant", { value: MINT_COST })).to.be.revertedWith("Max NFT reached.");
    
  });


  it("Create NFT from different accounts", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1, addr2} = await loadFixture(setupFixture);

    for (let i = 0; i < 2; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }

    for (let i = 0; i < 2; i++) {
      await pof.connect(addr2).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr2).requestIdTemp();
      await chVRFMock.connect(addr2).fulfillRandomWords(requestId, pofAddressConsumer);

    }
    const totalNFT = await pof.connect(addr1).getAllNFT();
    await expect(totalNFT.length).to.equal(4);
    
  });

  it("Correct generation of random data", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1 } = await loadFixture(setupFixture);
  
    await pof.connect(addr1).CreateNFT("Plant1", { value: MINT_COST });
    const requestId = await pof.connect(addr1).requestIdTemp();
    await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);
  
    const plant = await pof.connect(addr1).getNFT(0);
    
    expect(plant.nutrient).to.be.within(0, 99);
    expect(plant.freshness).to.be.within(0, 99);
    expect(plant.ecoFriendliness).to.be.within(0, 99);
    expect(plant.taste).to.be.within(0, 99);
  });

  it("Owner new NFT", async function() {
    const { pof, chVRFMock, pofAddressConsumer, addr1, MINT_COST} = await loadFixture(setupFixture);
    
    await pof.connect(addr1).CreateNFT("Plant1", { value: MINT_COST });
    const requestId = await pof.connect(addr1).requestIdTemp();
    await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer); 
    const addr1Address = await addr1.getAddress(); 
    expect(await pof.connect(addr1).ownerOf(0)).to.equal(addr1Address);
  });

  it("Get All NFT", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1} = await loadFixture(setupFixture);

    for (let i = 0; i < 10; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }

    const plants = await pof.connect(addr1).getAllNFT();
    expect(plants.length).to.equal(10);
    
  });

  it("Withdraw owner", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1} = await loadFixture(setupFixture);

    for (let i = 0; i < 10; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }

    const ownerAddress = pof.owner();
    const ownerBalanceBefore = await ethers.provider.getBalance(ownerAddress);
    await pof.withdraw();
    const ownerBalanceAfter = await ethers.provider.getBalance(ownerAddress);
    expect(ownerBalanceAfter).to.be.above(ownerBalanceBefore);
    
    
  });

  it("Withdraw if not owner", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1} = await loadFixture(setupFixture);

    for (let i = 0; i < 10; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }
 
    await expect(pof.connect(addr1).withdraw()).to.be.reverted;
    
    
  });

  it("Transfer NFT", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1, addr2} = await loadFixture(setupFixture);

    for (let i = 0; i < 3; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }
 
    const addr1Address = await addr1.getAddress(); 
    const addr2Address = await addr2.getAddress(); 
    expect(await pof.connect(addr1).ownerOf(0)).to.equal(addr1Address);
    await pof.connect(addr1).transferFrom(addr1, addr2, 0);
    expect(await pof.connect(addr1).ownerOf(0)).to.equal(addr2Address);
    
  });

  it("Transfer NFT not Owner", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1, addr2} = await loadFixture(setupFixture);

    for (let i = 0; i < 3; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }

    await expect(pof.connect(addr2).transferFrom(addr1, addr2, 0)).to.be.reverted;

    
  });

  it("Transfer NFT not exists", async function() {
    const { pof, chVRFMock, pofAddressConsumer, MINT_COST, addr1, addr2} = await loadFixture(setupFixture);

    for (let i = 0; i < 3; i++) {
      await pof.connect(addr1).CreateNFT(`Plant${i}`, { value: MINT_COST });
      const requestId = await pof.connect(addr1).requestIdTemp();
      await chVRFMock.connect(addr1).fulfillRandomWords(requestId, pofAddressConsumer);

    }

    await expect(pof.connect(addr1).transferFrom(addr1, addr2, 7)).to.be.reverted;

    
  });
  


});
