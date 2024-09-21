import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@oasisprotocol/sapphire-hardhat";

const PRIVATE_KEY =
  "409c54bed0f17d8a9913e5df2c61ff2fb39d8b3883ee8b9314f52b46c0413c80";

const config: HardhatUserConfig = {
  // solidity: "0.8.27",
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "istanbul"
    }
  },
  networks: {
    "sapphire-testnet": {
      url: "https://testnet.sapphire.oasis.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 0x5aff,
    },
    "airdao-testnet" : {
      url : "https://network.ambrosus-test.io",
      accounts : PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    "morph-testnet" : {
      url : "https://rpc-holesky.morphl2.io",
      accounts : PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId : 0xafa,
    }
  },
};

export default config;
