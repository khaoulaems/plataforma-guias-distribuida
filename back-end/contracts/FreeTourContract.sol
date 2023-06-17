// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract FreeTourContract {
    struct Guide {
        address creator;
        string ipfsHash;
        uint256 score;
        uint256 reviews;
    }

    uint256 public guideCount = 0;
    mapping(uint256 => Guide) public guides;

    event GuideUploaded(uint256 indexed guideId, address indexed creator, string ipfsHash);
    event GuideEdited(uint256 indexed guideId, string newIpfsHash);
    event GuideEvaluated(uint256 indexed guideId, uint256 newScore);

    function uploadGuide(string calldata ipfsHash) public {
        require(bytes(ipfsHash).length != 0, "IPFS hash cannot be empty");
        guides[guideCount] = Guide(msg.sender, ipfsHash, 0, 0);
        emit GuideUploaded(guideCount, msg.sender, ipfsHash);
        guideCount++;
    }

    function editGuide(uint256 guideId, string calldata ipfsHash) public {
        require(guideId < guideCount, "Guide does not exist");
        require(bytes(ipfsHash).length != 0, "IPFS hash cannot be empty");

        Guide storage guide = guides[guideId];
        require(guide.creator == msg.sender, "Only the creator can edit this guide");

        guide.ipfsHash = ipfsHash;
        emit GuideEdited(guideId, ipfsHash);
    }

    function evaluateGuide(uint256 guideId, uint256 score) public {
        require(guideId < guideCount, "Guide does not exist");
        require(score >= 0 && score <= 5, "Invalid score");

        Guide storage guide = guides[guideId];

        require(guide.creator != msg.sender, "The creator cannot evaluate their own guide");

        uint256 newReviews = guide.reviews + 1;

        guide.score = ((guide.score * guide.reviews) + score) / newReviews;
        guide.reviews = newReviews;

        emit GuideEvaluated(guideId, guide.score);
    }
}
