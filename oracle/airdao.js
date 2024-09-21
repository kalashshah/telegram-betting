
/* eslint-disable @typescript-eslint/no-require-imports */
const ethers = require("ethers");
const OpenAI = require("openai");

const PRIVATE_KEY =
    "409c54bed0f17d8a9913e5df2c61ff2fb39d8b3883ee8b9314f52b46c0413c80";
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const contractABI =  [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_disputeResolver",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "PullRequest",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "expireTimestamp",
          "type": "uint256"
        }
      ],
      "name": "addOption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "disputeResolver",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_outcome",
          "type": "uint256"
        }
      ],
      "name": "endOption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_outcome",
          "type": "uint256"
        }
      ],
      "name": "fulfillRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "getCurrentExpectedReturn",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "uint32",
          "name": "outcome",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "amount",
          "type": "uint32"
        }
      ],
      "name": "getFutureExpectedReturn",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "getOption",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "resolved",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "expireTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "outcome",
              "type": "uint256"
            },
            {
              "internalType": "uint32",
              "name": "totalBet",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "yesBet",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "noBet",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "betCount",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "totalBetToShow",
              "type": "uint32"
            }
          ],
          "internalType": "struct MarketAirDao.Option",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOptions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "resolved",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "expireTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "outcome",
              "type": "uint256"
            },
            {
              "internalType": "uint32",
              "name": "totalBet",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "yesBet",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "noBet",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "betCount",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "totalBetToShow",
              "type": "uint32"
            }
          ],
          "internalType": "struct MarketAirDao.Option[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "uint32",
          "name": "outcome",
          "type": "uint32"
        }
      ],
      "name": "getOutcomeBet",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "getTotalBet",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "payout",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "uint32",
          "name": "outcome",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "amount",
          "type": "uint32"
        }
      ],
      "name": "predict",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_outcome",
          "type": "uint256"
        }
      ],
      "name": "resolveDispute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

const providerUrl = "https://network.ambrosus-test.io";

const provider = new ethers.JsonRpcProvider(providerUrl);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

async function eventHandler(messageId, description) {
    try {
        const client = new OpenAI({
            baseURL: "https://llama.us.gaianet.network/v1",
            apiKey: "",
        });

        const response = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "Analyze the description of a given event. This event has been concluded, you have to give the outcome of it. Return 0 if you think the event occured as described, and 1 if you think it did not occur as described.",
                },
                { role: "user", content: description },
            ],
            model: "Meta-Llama-3-8B-Instruct-Q5_K_M",
            temperature: 0.7,
            max_tokens: 500,
        });

        const jsonData = response?.choices[0]?.message?.content;
        if (!jsonData) return;
        const parsedResponse = JSON.parse(jsonData);
        if (parsedResponse?.outcome) {
            const privateKey = PRIVATE_KEY;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = contract.connect(wallet);
            const tx = await contractWithSigner.fulfillRequest(
                messageId,
                parsedResponse.outcome,
                {
                    gasLimit: 500000,
                }
            );
            await tx.wait();
            console.log(
                `Request fulfilled for messageId: ${messageId} with score: ${parsedResponse.score}`
            );
        }
    } catch (error) {
        console.log("error", error);
    }
}

contract.on("PullRequest", eventHandler);

console.log("Event listener started for contract at address:", contractAddress);
