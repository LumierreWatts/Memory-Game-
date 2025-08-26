"use client";

import MonadAuth from "./components/MonadAuth";
import MemoryGame from "./components/MemoryGame";
import { usePrivy } from "@privy-io/react-auth";
import ConnectWallet from "./components/ConnectWallet";
import Link from "next/link";

export default function Home() {
  const { authenticated } = usePrivy();

  return (
    <div className="relative min-h-screen">
      {authenticated ? (
        <>
          <MonadAuth />
          <MemoryGame />
        </>
      ) : (
        <ConnectWallet />
      )}
      <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-300 ease-in-out transition-all duration-500 text-xs">
        Made by{" "}
        <Link
          href="https://x.com/LumiereWatts"
          referrerPolicy="no-referrer"
          target="_blank"
        >
          zzx💜
        </Link>
      </div>
    </div>
  );
}
