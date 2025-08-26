"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function ConnectWallet() {
  const { ready, authenticated, login } = usePrivy();
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {ready && !authenticated && (
        <div className="text-center space-y-4 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">
            Welcome to Monad Games
          </h1>
          <button
            onClick={login}
            className="w-full bg-blue-600/80 hover:bg-blue-600 border border-blue-500 rounded-md px-4 py-2 sm:px-6 sm:py-3 font-medium transition-colors duration-200 text-white"
          >
            Connect Monad Games ID
          </button>
        </div>
      )}
    </div>
  );
}
