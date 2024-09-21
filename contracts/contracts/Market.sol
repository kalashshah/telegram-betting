// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Market {
    address public owner;
    address public token;

    struct Option {
        string description;
        bool resolved;
        uint256 expireTimestamp;
        uint outcome;
        uint32 totalBet;
        uint32 yesBet;
        uint32 noBet;
        uint32 betCount;
        uint32 totalBetToShow;
    }

    struct Prediction {
        uint32 outcome;
        uint32 amount;
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
        options[id] = Option(
            description,
            false,
            expireTimestamp,
            2,
            0,
            0,
            0,
            0,
            0
        );
    }

    function predict(bytes32 id, uint32 outcome, uint32 amount) public {
        require(
            options[id].expireTimestamp >= block.timestamp,
            "Option expired"
        );
        require(!options[id].resolved, "Option already resolved");
        require(!predictions[msg.sender].exists, "Prediction already exists");

        Option storage option = options[id];

        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        bool isYes = outcome == 0;
        bool isNo = outcome == 1;
        uint32 yesBet = isYes ? amount : 0;
        uint32 noBet = isNo ? amount : 0;
        option.totalBet = option.totalBet + amount;
        option.totalBetToShow = (option.betCount % 10 == 0 ||
            option.betCount < 10)
            ? option.totalBet
            : option.totalBetToShow;
        option.yesBet = option.yesBet + yesBet;
        option.noBet = option.noBet + noBet;
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
        bool isWin = prediction.outcome == option.outcome;
        uint32 totalBet = option.totalBet;
        uint32 outcomeBalance = getOutcomeBet(id, prediction.outcome);
        uint32 payoutAmount = (prediction.amount * totalBet) / outcomeBalance;
        payoutAmount = isWin ? payoutAmount : 0;
        prediction.paidOut = true;
        option.totalBet = option.totalBet - payoutAmount;
        require(
            IERC20(token).transfer(msg.sender, payoutAmount),
            "Transfer failed"
        );
    }

    function getOutcomeBet(
        bytes32 id,
        uint32 outcome
    ) public view returns (uint32) {
        bool isYes = outcome == 0;
        uint32 outcomeBalance = isYes ? options[id].yesBet : options[id].noBet;
        return outcomeBalance;
    }

    function getOption(bytes32 id) public view returns (Option memory) {
        return options[id];
    }

    function getOptions() public view returns (Option[] memory) {}

    function getTotalBet(bytes32 id) public view returns (uint32) {
        return options[id].totalBetToShow;
    }

    function getCurrentExpectedReturn(bytes32 id) public view returns (uint32) {
        Option storage option = options[id];
        require(!options[id].resolved, "Option already resolved");
        Prediction storage prediction = predictions[msg.sender];
        uint32 totalValue = prediction.outcome == 0
            ? option.yesBet
            : option.noBet;
        uint32 expectedReturn = (prediction.amount * option.totalBetToShow) /
            totalValue;
        return expectedReturn;
    }

    function getFutureExpectedReturn(
        bytes32 id,
        uint32 outcome,
        uint32 amount
    ) public view returns (uint32) {
        Option storage option = options[id];
        require(!options[id].resolved, "Option already resolved");
        uint32 totalValue = outcome == 0 ? option.yesBet : option.noBet;
        uint32 expectedReturn = (amount * (option.totalBetToShow + amount)) /
            (totalValue + amount);
        return expectedReturn;
    }
}
