import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Market", function () {
  async function deployContract() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const market = await hre.viem.deployContract("Market");
    console.log("Market", market);
    console.log("Market deployed at address", market.address);

    return { market, owner, otherAccount };
  }

  it("should deploy the contract", () => {
    deployContract();
  });
});
