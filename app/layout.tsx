"use client";

import "./globals.css";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
} from "../lib/dynamic";
import Script from "next/script";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sapphireTestnet, morphHolesky } from "viem/chains";
import { fhenix } from "@/lib/fhenix";

const dynamicEnvId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;

const queryClient = new QueryClient();

const fhenix1 = {
  blockExplorerUrls: ["https://explorer.helium.fhenix.zone"],
  chainId: 8008135,
  chainName: "Fhenix",
  iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
  name: "Fhenix",
  networkId: 8008135,
  nativeCurrency: {
    decimals: 18,
    name: "Fhenix",
    symbol: "tFHE",
  },
  rpcUrls: ["https://api.helium.fhenix.zone/"],
  vanityName: "Fhenix",
};

const airdao = {
  blockExplorerUrls: ["https://testnet.airdao.io/explorer/"],
  chainId: 22040,
  chainName: "AirDao",
  iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
  name: "AirDao",
  networkId: 22040,
  nativeCurrency: {
    decimals: 18,
    name: "AMB",
    symbol: "AMB",
  },
  rpcUrls: ["https://network.ambrosus-test.io"],
  vanityName: "AirDao",
};

const config = createConfig({
  chains: [sapphireTestnet, fhenix, morphHolesky],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sapphireTestnet.id]: http(),
    [fhenix.id]: http(),
    [morphHolesky.id]: http(),
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!dynamicEnvId) {
    const errMsg =
      "Please add your Dynamic Environment to this project's .env file";
    console.error(errMsg);
    throw new Error(errMsg);
  }

  return (
    <html lang="en">
      <head>
        <meta
          http-equiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
      </head>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
      />
      <DynamicContextProvider
        settings={{
          environmentId: dynamicEnvId,
          walletConnectors: [EthereumWalletConnectors],
          overrides: {
            evmNetworks: (networks) =>
              Array.from(new Set([fhenix1, airdao, ...networks])),
          },
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>
              <body>{children}</body>
            </DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </html>
  );
}
