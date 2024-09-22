// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import "./eERC20.sol";

interface IeERC20 {
    function transferEncrypted(
        address to,
        euint32 encryptedAmount
    ) external returns (bool);

    function transferEncryptedFrom(
        address from,
        address to,
        euint32 encryptedAmount
    ) external returns (bool);
}

contract Market {
    address public owner;
    address public token;

    struct Option {
        string description;
        bool resolved;
        uint256 expireTimestamp;
        uint outcome;
        euint32 totalBet;
        euint32 yesBet;
        euint32 noBet;
        euint32 totalBetToShow;
        euint32 yesBetToShow;
        uint32 betCount;
    }

    struct Prediction {
        euint32 outcome;
        euint32 amount;
        bool paidOut;
        bool exists;
    }

    mapping(bytes32 => Option) private options;
    mapping(address => Prediction) private predictions;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _token) {
        owner = msg.sender;
        token = _token;
    }

    function addOption(
        bytes32 id,
        string memory description,
        uint256 expireTimestamp
    ) public onlyOwner {
        require(options[id].expireTimestamp == 0, "Option already exists");
        euint32 encryptedZero = FHE.asEuint32(0);
        options[id] = Option(
            description,
            false,
            expireTimestamp,
            2,
            encryptedZero,
            encryptedZero,
            encryptedZero,
            encryptedZero,
            encryptedZero,
            0
        );
    }

    function predict(
        bytes32 id,
        inEuint32 memory _outcome,
        inEuint32 memory _amount
    ) public {
        require(
            options[id].expireTimestamp >= block.timestamp,
            "Option expired"
        );
        require(!options[id].resolved, "Option already resolved");
        require(!predictions[msg.sender].exists, "Prediction already exists");

        Option storage option = options[id];
        euint32 outcome = FHE.asEuint32(_outcome);
        euint32 amount = FHE.asEuint32(_amount);
        require(
            IeERC20(token).transferEncryptedFrom(
                msg.sender,
                address(this),
                amount
            ),
            "transfer failed"
        );
        ebool isYes = FHE.eq(outcome, FHE.asEuint32(0));
        ebool isNo = FHE.eq(outcome, FHE.asEuint32(1));
        euint32 yesBet = FHE.select(isYes, amount, FHE.asEuint32(0));
        euint32 noBet = FHE.select(isNo, amount, FHE.asEuint32(0));
        option.totalBet = FHE.add(option.totalBet, amount);
        option.totalBetToShow = (option.betCount % 10 == 0 ||
            option.betCount < 10)
            ? option.totalBet
            : option.totalBetToShow;
        option.yesBet = FHE.add(option.yesBet, yesBet);
        option.yesBetToShow = (option.betCount % 10 == 0 ||
            option.betCount < 10)
            ? option.yesBet
            : option.yesBetToShow;
        option.noBet = FHE.add(option.noBet, noBet);
        option.betCount = option.betCount + 1;
        predictions[msg.sender] = Prediction(outcome, amount, false, true);
    }

    function endOption(bytes32 id, uint _outcome) public onlyOwner {
        Option storage option = options[id];
        option.resolved = true;
        option.outcome = _outcome;
    }

    function payout(bytes32 id) public {
        require(options[id].resolved, "Option not resolved yet");
        Option storage option = options[id];
        Prediction storage prediction = predictions[msg.sender];
        require(!prediction.paidOut, "Already paid out");
        ebool isWin = FHE.eq(prediction.outcome, FHE.asEuint32(option.outcome));
        euint32 totalBet = option.totalBet;
        euint32 outcomeBalance = getOutcomeBet(id, prediction.outcome);
        euint32 payoutAmount = FHE.div(
            FHE.mul(prediction.amount, totalBet),
            outcomeBalance
        );
        payoutAmount = FHE.select(isWin, payoutAmount, FHE.asEuint32(0));
        prediction.paidOut = true;
        option.totalBet = FHE.sub(option.totalBet, payoutAmount);
        require(
            IeERC20(token).transferEncrypted(msg.sender, payoutAmount),
            "transfer failed"
        );
    }

    function getOutcomeBet(
        bytes32 id,
        euint32 outcome
    ) public view returns (euint32) {
        ebool isYes = FHE.eq(outcome, FHE.asEuint32(0));
        euint32 outcomeBalance = FHE.select(
            isYes,
            options[id].yesBet,
            options[id].noBet
        );
        return outcomeBalance;
    }

    function getOption(bytes32 id) public view returns (Option memory) {
        return options[id];
    }

    function getTotalBet(bytes32 id) public view returns (uint32) {
        return FHE.decrypt(options[id].totalBetToShow);
    }

    function getFutureExpectedReturn(
        bytes32 id,
        uint32 outcome,
        uint32 amount
    ) public view returns (uint32) {
        require(!options[id].resolved, "Option already resolved");
        uint32 yesBets = FHE.decrypt(options[id].yesBet);
        uint32 totalBet = getTotalBet(id);
        uint32 bet = outcome == 0 ? yesBets : totalBet - yesBets;
        return (amount * (totalBet + amount)) / (bet + amount);
    }
}
