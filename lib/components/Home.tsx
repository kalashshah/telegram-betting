import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import React, { useEffect, useState } from "react";
import { sapphireTestnet } from "viem/chains";
import { useAccount } from "wagmi";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { ethers } from "ethers";
import AppBar from "./AppBar";
import CardComponent from "./Card";

const getTokenContractAddress = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return "0xA984DBf2Bfa58Fe59B42730450338404B6702973";

    default:
      return "";
  }
};

const getTokenABI = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return require("../abi/oasis-token-abi.json");

    default:
      return require("../abi/oasis-token-abi.json");
  }
};

const getMarketContractAddress = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return "0x3915791b77Cf27221334890e4f088E5a6c950054";

    default:
      return "";
  }
};

const getMarketABI = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return require("../abi/oasis-market-abi.json");

    default:
      return require("../abi/oasis-market-abi.json");
  }
};

const Home = () => {
  const { connector, chainId } = useAccount();
  const [amount, setAmount] = useState<string>("");
  const [predict, setPredict] = useState<boolean | null>(null);
  const [tvl, setTvl] = useState<string>("0");
  const [returns, setReturns] = useState<string>("");

  useEffect(() => {
    getTVL();
  }, [chainId, connector]);

  const getTVL = async () => {
    if (chainId === sapphireTestnet.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const sapphireProvider = sapphire.wrap(provider);

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await sapphireProvider.getSigner()
      );

      try {
        const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const totalBet = await market.getTotalBet(optionId);
        console.log("Total Bet:", BigInt(totalBet).toString());
        setTvl(BigInt(totalBet).toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const getOutcomeBet = async () => {
    if (chainId === sapphireTestnet.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const sapphireProvider = sapphire.wrap(provider);

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        sapphireProvider
      );

      try {
        const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const outcomeBet = await market.getOutcomeBet(
          optionId,
          predict ? 1 : 0
        );
        console.log("Outcome Bet:", outcomeBet.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const predictAmount = async () => {
    if (chainId === sapphireTestnet.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const sapphireProvider = sapphire.wrap(provider);

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await sapphireProvider.getSigner()
      );

      const token = new ethers.Contract(
        getTokenContractAddress(chainId),
        getTokenABI(chainId),
        await sapphireProvider.getSigner()
      );

      try {
        const tokenRes = await token.approve(
          getMarketContractAddress(chainId),
          BigInt(amount)
        );

        console.log("Token res", tokenRes.hash);

        const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const placeBetRes = await market.predict(
          optionId,
          predict ? 1 : 0,
          BigInt(amount)
        );

        console.log("Place Bet Successful : ", placeBetRes.hash);
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const payOut = async () => {
    if (chainId === sapphireTestnet.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const sapphireProvider = sapphire.wrap(provider);

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        sapphireProvider
      );

      try {
        const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const payOutRes = await market.payout(optionId);

        console.log("Place Bet Successful : ", payOutRes.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const getCurrentExpectedReturn = async () => {
    if (chainId === sapphireTestnet.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const sapphireProvider = sapphire.wrap(provider);

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        sapphireProvider
      );

      try {
        const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const placeBetRes = await market.getCurrentExpectedReturn(optionId);

        console.log("Place Bet Successful : ", placeBetRes.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const getFutureExpectedReturn = async () => {
    if (chainId === sapphireTestnet.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const sapphireProvider = sapphire.wrap(provider);

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await sapphireProvider.getSigner()
      );

      try {
        const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const returnsVal = await market.getFutureExpectedReturn(
          optionId,
          predict ? 1 : 0,
          amount
        );

        console.log("Future expected returns: ", returnsVal.toString());
        setReturns(returnsVal.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getFutureExpectedReturn();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [amount]);

  return (
    <div className="w-full h-full px-6flex flex-col items-start justify-start">
      {[1].map((cardNumber) => (
        <div
          className=" ml-10 mr-10 my-10 bg-white shadow-lg rounded-lg overflow-hidden"
          key={cardNumber}
        >
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">
              We are going to win this hackathon?
            </h1>

            <div className="flex flex-col justify-between gap-2">
              <div>
                <label
                  htmlFor={`amount-${cardNumber}`}
                  className="block mb-2 font-medium text-gray-700"
                >
                  Amount:
                </label>
                <input
                  type="number"
                  id={`amount-${cardNumber}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full flex p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {returns && (
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Expected returns:
                  </label>
                  <p className="text-2xl font-semibold text-gray-800">
                    {returns} MTK
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  TVL:
                </label>
                <p className="text-2xl font-semibold text-gray-800">
                  {Number(tvl) + Number(amount)} MTK
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setPredict(true)}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-semibold text-lg"
              >
                {predict != null ? (predict ? "Selected Yes" : "Yes") : "Yes"}
              </button>
              <button
                onClick={() => setPredict(false)}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-200 font-semibold text-lg"
              >
                {predict != null ? (!predict ? "Selected No" : "No") : "No"}
              </button>
            </div>

            <button
              onClick={predictAmount}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
            >
              Predict
            </button>

            <button
              onClick={payOut}
              className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
            >
              Payout
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
