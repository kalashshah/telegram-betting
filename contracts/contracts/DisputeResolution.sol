// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarket {
    function resolveDispute(bytes32 id, uint _outcome) external;
}

contract DisputeResolution {
    struct VotingSettings {
        bool isResolved;
        uint resolvedOutcome;
        uint256 timestamp;
    }

    mapping(bytes32 => bool[]) public votes; // Option ID to votes
    mapping(bytes32 => uint256) public supportVote;
    mapping(bytes32 => VotingSettings) public votingSettings; // Option ID to vote config

    address public marketAddress;

    event Voted(uint256 proposalId, address indexed voter, string voteOption);
    event SettingsUpdated(
        uint256 proposalId,
        uint256 minParticipation,
        uint256 supportThreshold
    );

    function setAddress(address _marketAddress) public {
        require(marketAddress == address(0));
        marketAddress = _marketAddress;
    }

    function setVotingSettings(bytes32 id, uint outcome) external {
        votingSettings[id] = VotingSettings({
            isResolved: false,
            resolvedOutcome: outcome,
            timestamp: block.timestamp
        });
    }

    function getVoteCount(bytes32 id) public view returns (uint256) {
        return votes[id].length;
    }

    function vote(bytes32 id, bool support) external {
        votes[id].push(support);
        supportVote[id] += 1;
        VotingSettings storage settings = votingSettings[id];
        require(!settings.isResolved, "dispute resolved");
        if (block.timestamp >= settings.timestamp + 1 days) {
            settings.isResolved = true;
            uint256 againstVotes = votes[id].length - supportVote[id];
            if (supportVote[id] <= againstVotes) {
                uint oppositeOutcome = settings.resolvedOutcome == 0
                    ? uint(1)
                    : uint(0);
                IMarket(marketAddress).resolveDispute(id, oppositeOutcome);
            }
        }
    }
}
