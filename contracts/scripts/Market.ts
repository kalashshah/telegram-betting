import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";
import { bigint } from "hardhat/internal/core/params/argumentTypes";

// SAPHIRE TESTNET

const TOKEN_ADDRESS = "0xA984DBf2Bfa58Fe59B42730450338404B6702973";
const DEPLOYED_ADDRESS = "0xc97cCA64bfbd71c521539C34EA2A746c1E5377d7";
const DisputeResolutionAddress = "0x3C15f3b76861b270c07E70f45F4675A63a8019C3";

// MORPH TESTNET
const MORPH_TOKEN_ADDRESS = "0x887eca7008180b6e7c0f8904e1ed0c529aa6a84c";
const MORPH_MARKET_ADDRESS = "0x142031f4491d108024351144e487a5645482756c";
const MorphDisputeResolutionAddress = "0xf29c5df16f32ee404d20c8e1a7ac1ecfcfcbd9be";


async function deployTokenContract() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const mytoken = await hre.viem.deployContract("MyToken");
  console.log("MyToken deployed at address", mytoken.address);

  return { mytoken, owner, otherAccount };
}

async function deployMarketContract() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const market = await hre.viem.deployContract("Market", [MORPH_TOKEN_ADDRESS, MorphDisputeResolutionAddress]);
  console.log("Market deployed at address", market.address);

  return { market, owner, otherAccount };
}

async function deployDisputeResolution() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const disputeResolution = await hre.viem.deployContract("DisputeResolution",[]);
  console.log("DisputeResolution deployed at address : ", disputeResolution.address);
}

async function buy() {
  const [owner] = await hre.viem.getWalletClients();
  const market = await hre.viem.getContractAt("Market", DEPLOYED_ADDRESS);

  const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`; // Example option ID
  const description = "Will it rain tomorrow?";
  const expireTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

  await market.write.addOption(
    [optionId, description, BigInt(expireTimestamp)],
    {
      account: owner.account,
    }
  );

  console.log(`Option added with ID: ${optionId}`);
}

async function getOption() {
  const [owner] = await hre.viem.getWalletClients();
  const market = await hre.viem.getContractAt("Market", DEPLOYED_ADDRESS);

  const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`; // Example option ID
  const res = await market.read.getOption([optionId], {
    account: owner.account,
  });

  console.log("got option", res);
}

async function approve() {
  const [owner] = await hre.viem.getWalletClients();
  const token = await hre.viem.getContractAt("MyToken", TOKEN_ADDRESS);
  const market = await hre.viem.getContractAt("Market", DEPLOYED_ADDRESS);

  const tx = await token.write.approve([DEPLOYED_ADDRESS, BigInt(1000)]);

  console.log("Approved successfully!", tx);
}

async function transfer() {
  const token = await hre.viem.getContractAt("MyToken", TOKEN_ADDRESS);
  const tx = await token.write.transfer([
    "0x86534362695deebf62069192B903d02fFE6FbAA0",
    BigInt(1000),
  ]);
  console.log("Approved successfully!", tx);
}

async function predict() {
  const [owner] = await hre.viem.getWalletClients();
  const market = await hre.viem.getContractAt("Market", DEPLOYED_ADDRESS);

  const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`; // Example option ID
  const predicted = 0;
  const amount = 5;

  const tx = await market.write.predict([optionId, predicted, amount], {
    account: owner.account,
  });

  console.log("Predicted successfully, hash:", tx);
}

async function getPrediction() {
  const [owner] = await hre.viem.getWalletClients();
  const market = await hre.viem.getContractAt("Market", DEPLOYED_ADDRESS);

  const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`; // Example option ID

  const totalBet = await market.read.getTotalBet([optionId], {
    account: owner.account,
  });

  console.log("Total bet", totalBet);
}

async function getFutureExpectedReturn() {
  const [owner] = await hre.viem.getWalletClients();
  const market = await hre.viem.getContractAt("Market", DEPLOYED_ADDRESS);

  const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`; // Example option ID

  const expectedReturn = await market.read.getFutureExpectedReturn(
    [optionId, 0, 10],
    { account: owner.account }
  );

  console.log("Expected return", expectedReturn);
}

const doThis = async () => {
  // await deployDisputeResolution();
  // await deployTokenContract();
  await deployMarketContract();
  // await buy();
  // await getOption();
  // await approve();
  // await predict();
  // await getPrediction();
  // await getFutureExpectedReturn();
  // await transfer();
};

doThis();
