// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract PofNFT is ERC721, Ownable, VRFConsumerBaseV2{

    uint256 private constant MAX_SUPPLY = 10; 
    uint256 private constant MINT_COST = 20000000000000000 wei; 

    uint256 public requestIdTemp;

    uint64 s_subscriptionId;
    VRFCoordinatorV2Interface COORDINATOR;
    bytes32 s_keyHash;

    struct Plant {
        string name;
        uint256 nutrient; // Contenuto di nutrienti del prodotto
        uint256 freshness; // Livello di freschezza del prodotto
        uint256 ecoFriendliness; // Livello di sostenibilità ecologica del prodotto
        uint256 taste; // Livello gusto del prodotto
    }

    Plant [] public plants;

    mapping(uint256 => string) private requestToPlantName;
    mapping(uint256 => address) private requestToSender;

    constructor(uint64 _subscriptionId, address vrfCoordinator, bytes32 _keyHash) 
        VRFConsumerBaseV2(vrfCoordinator) 
        Ownable(msg.sender) 
        ERC721("PofNFT", "POF") {
            COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
            s_subscriptionId = _subscriptionId;
            s_keyHash = _keyHash;


    }

    modifier NFTExist(uint256 _idToken){
        require(_idToken < plants.length, "NFT not found.");
        _;
    }

    event RequestIdCreated(uint256 indexed requestId, string name);
    event NFTCreated(uint256 indexed tokenId, address indexed owner, Plant plant);


    function CreateNFT(string memory name) public payable {
        require(plants.length+1 <= MAX_SUPPLY, "Max NFT reached.");
        require(msg.value == MINT_COST, "Invalid amount.");

        requestIdTemp = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            3,
            1000000,
            1
       );

       requestToPlantName[requestIdTemp] = name;
       requestToSender[requestIdTemp] = msg.sender;

        emit RequestIdCreated(requestIdTemp, name);
    }

     function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override{
        //Creation NFT
        uint256 randomResult = randomWords[0];
        
        uint256 tokenID = plants.length;
        uint256 nutrient = randomResult % 100;
        uint256 freshness = ((randomResult % 10000) / 100);
        uint256 ecoFriendliness = ((randomResult % 10000) / 1000);
        uint256 taste = ((randomResult % 100000) / 10000);

        Plant memory newPlant =  Plant(
                requestToPlantName[requestId],
                nutrient,
                freshness,
                ecoFriendliness,
                taste
            );

        plants.push(newPlant);

        _safeMint(requestToSender[requestId], tokenID);

        delete requestToPlantName[requestId];
        delete requestToSender[requestId];

         emit NFTCreated(tokenID, requestToSender[requestId], newPlant);
     }

     function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract balance is zero.");
        payable(owner()).transfer(balance);
    }

     function getNFT(uint256 _idToken) public view NFTExist(_idToken) returns(Plant memory){
        return plants[_idToken];
    }

    function getAllNFT() public view returns(Plant [] memory){
        return plants;
    }

}