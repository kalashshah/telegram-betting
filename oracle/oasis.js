
/* eslint-disable @typescript-eslint/no-require-imports */
const ethers = require("ethers");
const OpenAI = require("openai");

const PRIVATE_KEY =
    "409c54bed0f17d8a9913e5df2c61ff2fb39d8b3883ee8b9314f52b46c0413c80";
const contractAddress = "";
const contractABI = []

const providerUrl = "";

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
