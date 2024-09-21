import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import React, { useEffect, useState } from "react";
import { morphHolesky, sapphireTestnet } from "viem/chains";
import { useAccount } from "wagmi";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { BrowserProvider, ethers, JsonRpcProvider, keccak256 } from "ethers";
import Image from "next/image";
import { notifications } from "@mantine/notifications";
import AppBar from "./AppBar";
import { fhenix } from "@/app/layout";
import { EncryptionTypes, FhenixClient, SupportedProvider } from "fhenixjs";
import { toHex } from "viem";

const getTokenContractAddress = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return "0xf551eb1842350d05b35A8475A0dA8d4cE88FCF67";
    case morphHolesky.id:
      return "0xd15894fd344908c83ae39719fc551b1b5b0faddb";
    //AIRDAO
    case 22040:
      return "0xcc4a6407b36120f21ff21d0f7eef23dbead2a977";
    case fhenix.id:
      return "0x7ec256Ea16eF0A69f3F09D62c7bdf00B1FEA5221"; //TODO : Add FHENIX
    default:
      return "";
  }
};

const getTokenABI = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return require("../abi/oasis-token-abi.json");

    case fhenix.id:
      return require("../abi/fhenix-token-abi.json");

    default:
      return require("../abi/oasis-token-abi.json");
  }
};

const getMarketContractAddress = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return "0xB2f03BcF3433C91cD845E54f706C12041409D3C2";

    case morphHolesky.id:
      return "0x3915791b77cf27221334890e4f088e5a6c950054";

    //Airdao
    case 22040:
      return "0x7ba34df70a46bf83ddb29801a7ee9a2a3d312e4b";

    case fhenix.id:
      return "0x82C8EA036545e8B12D1F8647eee6BbA59943a010";

    default:
      return "";
  }
};

const getMarketABI = (chainId: number) => {
  switch (chainId) {
    case sapphireTestnet.id:
      return require("../abi/oasis-market-abi.json");

    case fhenix.id:
      return require("../abi/fhenix-market-abi.json");

    default:
      return require("../abi/oasis-market-abi.json");
  }
};

const Home = () => {
  const { connector, address, chainId } = useAccount();
  const [amount, setAmount] = useState<string>("");
  const [predict, setPredict] = useState<boolean | null>(null);
  const [tvl, setTvl] = useState<string>("0");
  const [returns, setReturns] = useState<string>("");

  const [predictLoading, setPredictLoading] = useState<boolean>(false);
  const [payoutLoading, setPayoutLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState(false);
  const optionId = ethers.encodeBytes32String("pqivxp");

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    getTVL();
  }, [chainId, connector]);

  const getTVL = async () => {
    if (chainId == fhenix.id) {
      //TODO : Add contract call

      // initialize your web3 provider
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      ) as SupportedProvider;

      // initialize Fhenix Client
      const client = new FhenixClient({ provider });

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await (provider as BrowserProvider).getSigner()
      );
      try {
        const totalBet = await market.getTotalBet(optionId);
        console.log("Total Bet:", BigInt(totalBet).toString());
        setTvl(BigInt(totalBet).toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    } else if (chainId === sapphireTestnet.id) {
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
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const totalBet = await market.getTotalBet(optionId);
        console.log("Total Bet:", BigInt(totalBet).toString());
        setTvl(BigInt(totalBet).toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    } else {
      //TODO : add normal call
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );
      const market = new ethers.Contract(
        getMarketContractAddress(chainId!),
        getMarketABI(chainId!),
        await provider.getSigner()
      );

      try {
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const totalBet = await market.getTotalBet(optionId);
        console.log("Total Bet:", BigInt(totalBet).toString());
        setTvl(BigInt(totalBet).toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const getOutcomeBet = async () => {
    if (chainId == fhenix.id) {
      //TODO : Add contract call

      // initialize your web3 provider
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      ) as SupportedProvider;

      // initialize Fhenix Client
      const client = new FhenixClient({ provider });

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await (provider as BrowserProvider).getSigner()
      );
      try {
        // const optionId = await client.encrypt_address(
        // ("0x" + "1".padStart(64, "0")) as `0x${string}`
        // );
        const secondParam = await client.encrypt_uint32(predict ? 1 : 0);
        const outcomeBet = await market.getOutcomeBet(optionId, secondParam);
        console.log("Outcome Bet:", outcomeBet.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }

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
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const outcomeBet = await market.getOutcomeBet(
          optionId,
          predict ? 1 : 0
        );
        console.log("Outcome Bet:", outcomeBet.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    } else {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );

      const market = new ethers.Contract(
        getMarketContractAddress(chainId!),
        getMarketABI(chainId!),
        provider
      );

      try {
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
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
    if (chainId == fhenix.id) {
      // const provider = new ethers.BrowserProvider(
      //   (await connector?.getProvider()) as any
      // ) as SupportedProvider;

      const provider = new ethers.BrowserProvider(window.ethereum);

      // initialize Fhenix Client
      const client = new FhenixClient({ provider });

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await (provider as BrowserProvider).getSigner()
      );

      const token = new ethers.Contract(
        getTokenContractAddress(chainId) as string,
        getTokenABI(chainId),
        await (provider as BrowserProvider).getSigner()
      );

      try {
        setPredictLoading(true);
        // const tokenRes = await token.wrap(BigInt(amount));
        // await tokenRes.wait();
        // console.log("Token res", tokenRes.hash);

        // const optionId = ethers.encodeBytes32String("804kb");
        const param2 = await client.encrypt_uint32(predict ? 0 : 1);
        const param3 = await client.encrypt_uint32(Number(amount));
        const placeBetRes = await market.predict(optionId, param2, param3);

        console.log("Place Bet Successful : ", placeBetRes.hash);
        setPredictLoading(false);
      } catch (error) {
        setPredictLoading(false);
        console.error("Error predicting:", error);
      }
    } else if (chainId === sapphireTestnet.id) {
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
        getTokenContractAddress(chainId) as string,
        getTokenABI(chainId),
        await sapphireProvider.getSigner()
      );

      try {
        setPredictLoading(true);
        const tokenRes = await token.approve(
          getMarketContractAddress(chainId),
          BigInt(amount)
        );

        console.log("Token res", tokenRes.hash);

        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const placeBetRes = await market.predict(
          optionId,
          predict ? 1 : 0,
          BigInt(amount)
        );

        console.log("Place Bet Successful : ", placeBetRes.hash);
        setPredictLoading(false);
      } catch (error) {
        setPredictLoading(false);
        console.error("Error fetching Total Bet:", error);
      }
    } else {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );

      const market = new ethers.Contract(
        getMarketContractAddress(chainId!),
        getMarketABI(chainId!),
        await provider.getSigner()
      );

      const token = new ethers.Contract(
        getTokenContractAddress(chainId!) as string,
        getTokenABI(chainId!),
        await provider.getSigner()
      );

      try {
        setPredictLoading(true);
        const tokenRes = await token.approve(
          getMarketContractAddress(chainId!),
          BigInt(amount)
        );

        console.log("Token res", tokenRes.hash);

        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const placeBetRes = await market.predict(
          optionId,
          predict ? 1 : 0,
          BigInt(amount)
        );

        console.log("Place Bet Successful : ", placeBetRes.hash);
        setPredictLoading(false);
      } catch (error) {
        setPredictLoading(false);
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const payOut = async () => {
    if (chainId == fhenix.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      ) as SupportedProvider;

      // initialize Fhenix Client
      const client = new FhenixClient({ provider });

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await (provider as BrowserProvider).getSigner()
      );

      try {
        setPayoutLoading(true);
        // const optionId = await client.encrypt_address(
        // ("0x" + "1".padStart(64, "0")) as `0x${string}`
        // );
        const payOutRes = await market.payout(optionId);

        setPayoutLoading(false);

        console.log("Place Bet Successful : ", payOutRes.toString());
      } catch (error) {
        setPayoutLoading(false);
        console.error("Error fetching Total Bet:", error);
      }
    }
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
        setPayoutLoading(true);
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const payOutRes = await market.payout(optionId);

        setPayoutLoading(false);

        console.log("Place Bet Successful : ", payOutRes.toString());
      } catch (error) {
        setPayoutLoading(false);
        console.error("Error fetching Total Bet:", error);
      }
    } else {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );

      const market = new ethers.Contract(
        getMarketContractAddress(chainId!),
        getMarketABI(chainId!),
        await provider.getSigner()
      );

      try {
        setPayoutLoading(true);
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const payOutRes = await market.payout(optionId);

        setPayoutLoading(false);

        console.log("Place Bet Successful : ", payOutRes.toString());
      } catch (error) {
        setPayoutLoading(false);
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
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const placeBetRes = await market.getCurrentExpectedReturn(optionId);

        console.log("Place Bet Successful : ", placeBetRes.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    }
  };

  const getFutureExpectedReturn = async () => {
    if (chainId === fhenix.id) {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      ) as SupportedProvider;

      // initialize Fhenix Client
      const client = new FhenixClient({ provider });

      const market = new ethers.Contract(
        getMarketContractAddress(chainId),
        getMarketABI(chainId),
        await (provider as BrowserProvider).getSigner()
      );

      try {
        // const optionId = ethers.encodeBytes32String("f1");
        const param2 = predict ? 1 : 0;
        const param3 = Number(amount);
        const returnsVal = await market.getFutureExpectedReturn(
          optionId,
          param2,
          param3
        );

        console.log("Future expected returns: ", returnsVal.toString());
        setReturns(returnsVal.toString());
      } catch (error) {
        console.error("Error fetching future returns:", error);
      }
    } else if (chainId === sapphireTestnet.id) {
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
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const returnsVal = await market.getFutureExpectedReturn(
          optionId,
          predict ? 1 : 0,
          Number(amount)
        );

        console.log("Future expected returns: ", returnsVal.toString());
        setReturns(returnsVal.toString());
      } catch (error) {
        console.error("Error fetching Total Bet:", error);
      }
    } else {
      const provider = new ethers.BrowserProvider(
        (await connector?.getProvider()) as any
      );

      const market = new ethers.Contract(
        getMarketContractAddress(chainId!),
        getMarketABI(chainId!),
        await provider.getSigner()
      );

      try {
        // const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`;
        const returnsVal = await market.getFutureExpectedReturn(
          optionId,
          predict ? 1 : 0,
          Number(amount)
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
    <div>
      <div
        className="w-full h-full px-6flex flex-col items-start justify-start"
        onClick={() => {
          if (showModal) {
            setShowModal(false);
          }
        }}
      >
        {[1].map((cardNumber) => (
          <div
            className=" ml-10 mr-10 my-10 bg-white shadow-lg rounded-lg overflow-hidden"
            key={cardNumber}
          >
            <div className="p-6 space-y-6">
              <Image
                src="/f1.jpeg"
                alt="Description of the image"
                width={500}
                height={300}
                priority
              />
              <h1 className="text-3xl font-bold text-gray-800">
                Will Lewis Hamilton win the upcoming race
              </h1>

              <div className="flex flex-col justify-between gap-2">
                <div>
                  <label
                    htmlFor={`amount-${cardNumber}`}
                    className="block mb-2 font-medium text-gray-700"
                  >
                    Place a bet by entering a amount
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
                    {Number(tvl)} MTK
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
                {!predictLoading ? "Predict" : "Loading"}
              </button>

              <button
                onClick={payOut}
                className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
              >
                {!payoutLoading ? "Payout" : "Loading"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pl-10">
        Feel the results are off?{" "}
        <span
          className="text-blue-600 cursor-pointer"
          onClick={handleOpenModal}
        >
          raise a dispute
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-end">
          <div className="bg-white w-full p-8 rounded-t-lg shadow-lg">
            <h1 className="text-black mb-10 font-bold">
              Dispute Resolution Notice
            </h1>
            <p className="text-black font-semibold">
              If you believe the market outcome is incorrect, you may raise a
              formal dispute. The case will be reviewed by the DAO. Please
              provide sufficient evidence when submitting a dispute. The DAO’s
              decision is final and binding.
            </p>
            <h2 className="text-black mb-6 mt-4 font-light">
              Describe your concern with appropriate proof (if applicable)
            </h2>
            <input
              type="text"
              id={`dispute`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-20 flex p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={handleCloseModal}
            >
              Raise Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
