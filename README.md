# Pof NFT

PofNFT is an innovative project that combines the power of non-fungible tokens (NFTs) with verifiable random generation via Chainlink VRF (Verifiable Random Function).
This project allows users to create and own unique NFTs, each with distinctive randomly generated attributes, and also exchange NFTs with each other

***Sepolia contract address: 0x3bE000E15d4758a56D912780B34967dA05568b17***

## Technologies

This project is built using :

+ Hardhat
+ Solidity
+ TypeScript
+ Chainlink VRF

## NFT Attributes

The ERC721 smart contract allows users to create unique NFT ‘plants’. 
Each plant has four distinctive attributes:

+ **Nutrients**: Measures the amount of nutrients in the plant.
  
+ **Freshness**: Indicates how fresh the plant is.
  
+ **EcoFriendliness**: Evaluates the environmental impact of the plant.
  
+ **Taste**: Represents the taste quality of the plant.

## Main Features

+ **Creation of Unique NFTs**: Users can create NFTs of plants with unique, randomly generated attributes.

+ **Withdrawal of Funds**: The contract owner can withdraw collected funds.

+ **Transfer of NFTs**: Users can transfer their NFTs to other users.


## Installation, Configuration and Deploy

To initialize the project, you need to have NodeJS installed on your computer. After downloading the project, 
navigate to the project directory in your terminal and run the following command:
```
npm install
```
This will download all the dependencies.

If you want to deploy the smart contract, you must first configure the hardhat variables.
If you do not already have an account go to https://www.infura.io/ and create one. Click on 'CREATE NEW API KEY', type in a name and then copy the api key at the top.
Navigate to the project directory in your terminal and run the following command and paste your infura api key:

```
npx hardhat vars set INFURA_API_KEY
```

Now follow the same procedure by copying your private key from Sepolia Account(e.g. Metamask), pasting it onto the following command:

```
npx hardhat vars set SEPOLIA_PRIVATE_KEY
```

In order to complete the configuration of the variables to be set and to be able to deploy,
you must follow the following guide to create your subscription id: [Link](https://docs.chain.link/vrf/v2-5/subscription/create-manage).
once you have created the subscription id, run the following command copying the subscription id:

```
npx hardhat vars set SUBSCRIPTION_ID
```

You can now deploy with:

```
npx hardhat ignition deploy ./ignition/modules/PofNFT.ts --network sepolia
```

and add the contract address on chainlink by going to ‘add consumer’.

## Hardhat commands

### Compile
```
npx hardhat compile
```

### Test
```
npx hardhat test
```


