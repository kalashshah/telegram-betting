"use client";
import { useEffect, useMemo, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";

import Spinner from "./Spinner";
import { useAsyncMemo } from "@/lib/hooks/useAsyncMemo";
import Home from "@/lib/components/Home";
import AppBar from "@/lib/components/AppBar";

export default function Main() {
  const { sdkHasLoaded, user, primaryWallet } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };

    signIn();
  }, [sdkHasLoaded]);

  useEffect(() => {
    (async () => {
      if (await primaryWallet?.isConnected()) {
        setIsLoggedIn(true);
      }
    })();
  }, [primaryWallet]);

  return (
    <>
      <AppBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-start w-full text-white">
        <div className="w-full my-10">
          {(isLoading || !isLoggedIn) && (
            <div className="flex flex-col items-center justify-center">
              <h1 className=" inline-flex items-center justify-center px-10 mb-10 text-4xl font-bold mb-4 w-full">
                Welcome to F1 Bets
              </h1>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center">
                  <img src="/logo.png" alt="logo" />
                </div>
              </div>
              <p className="text-lg mb-16">
                Web3 login for <span className="text-blue-400">everyone</span>.{" "}
              </p>{" "}
            </div>
          )}
          {isLoading ? (
            <Spinner />
          ) : !isLoggedIn ? (
            <div className="flex items-center justify-center">
              <DynamicWidget />
            </div>
          ) : (
            <>
              <h1 className="px-10 mb-10 text-4xl font-bold mb-4 w-full">
                Welcome to F1 Bets
              </h1>
              <Home />
            </>
          )}
          {/* <div className="w-full">
            <Home />
          </div> */}
        </div>
      </div>
    </>
  );
}
