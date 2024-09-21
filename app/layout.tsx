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
import { sapphireTestnet } from "viem/chains";
import { defineChain } from "viem";

const dynamicEnvId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;

const queryClient = new QueryClient();

const fhenix = defineChain({
  blockExplorers: {
    default: {
      name: "Fhenix Explorer",
      url: "https://explorer.helium.fhenix.zone",
    },
  },
  id: 8008135,
  name: "Fhenix Helium",
  nativeCurrency: {
    decimals: 18,
    name: "Fhenix",
    symbol: "tFHE",
  },
  rpcUrls: {
    default: {
      http: ["https://api.helium.fhenix.zone/"],
    },
  },
});

const config = createConfig({
  chains: [sapphireTestnet, fhenix],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sapphireTestnet.id]: http(),
    [fhenix.id]: http(),
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
          // overrides: { evmNetworks },
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
