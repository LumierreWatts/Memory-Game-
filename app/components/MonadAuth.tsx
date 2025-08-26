"use client";

import { useEffect, useState } from "react";
import { usePrivy, CrossAppAccountWithMetadata } from "@privy-io/react-auth";
import { LogOut, Wallet } from "lucide-react";

interface MonadAuthProps {
  onAccountAddress?: (address: string | null) => void;
}

interface UserData {
  hasUsername: boolean;
  user: {
    id: number;
    username: string;
    walletAddress: string;
  };
}

export default function MonadAuth({ onAccountAddress }: MonadAuthProps) {
  const { authenticated, user, ready, logout } = usePrivy();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fetchUsername = async (walletAddress: string) => {
    setLoadingUsername(true);
    try {
      const response = await fetch(
        `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${walletAddress}`
      );

      if (response.ok) {
        const data: UserData = await response.json();
        if (data.hasUsername && data.user?.username) {
          setUsername(data.user.username);
        } else {
          setUsername(null);
        }
      } else {
        setUsername(null);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      setUsername(null);
    } finally {
      setLoadingUsername(false);
    }
  };

  useEffect(() => {
    // Check if privy is ready and user is authenticated
    if (authenticated && user && ready) {
      // Check if user has linkedAccounts
      if (user.linkedAccounts.length > 0) {
        // Get the cross app account created using Monad Games ID
        const crossAppAccount: CrossAppAccountWithMetadata =
          user.linkedAccounts.filter(
            account =>
              account.type === "cross_app" &&
              account.providerApp.id === "cmd8euall0037le0my79qpz42"
          )[0] as CrossAppAccountWithMetadata;

        if (crossAppAccount) {
          // The first embedded wallet created using Monad Games ID, is the wallet address
          if (crossAppAccount.embeddedWallets.length > 0) {
            const address = crossAppAccount.embeddedWallets[0].address;
            setAccountAddress(address);
            setMessage("");
            fetchUsername(address);
            if (onAccountAddress) {
              onAccountAddress(address);
            }
          } else {
            setMessage(
              "No embedded wallets found in your Monad Games ID account."
            );
            setAccountAddress(null);
            setUsername(null);
            if (onAccountAddress) {
              onAccountAddress(null);
            }
          }
        } else {
          setMessage("Monad Games ID account not found in linked accounts.");
          setAccountAddress(null);
          setUsername(null);
          if (onAccountAddress) {
            onAccountAddress(null);
          }
        }
      } else {
        setMessage("You need to link your Monad Games ID account to continue.");
        setAccountAddress(null);
        setUsername(null);
        if (onAccountAddress) {
          onAccountAddress(null);
        }
      }
    } else if (ready && !authenticated) {
      setMessage("Please connect your wallet to continue.");
      setAccountAddress(null);
      setUsername(null);
      if (onAccountAddress) {
        onAccountAddress(null);
      }
    }
  }, [authenticated, user, ready, onAccountAddress]);

  const formatAddress = (accountAddress: string | null) => {
    if (!accountAddress) return "No wallet connected";

    return `${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`;
  };

  return (
    <div className="min-w-[160px] sm:min-w-[200px] absolute bottom-2 left-2 sm:bottom-2 sm:left-4 bg-gray-800/95 backdrop-blur-lg rounded-lg p-2 sm:p-4 text-white shadow-lg z-10 border border-gray-700">
      {!ready && (
        <div className="text-center text-gray-400">
          <p className="animate-pulse">Loading...</p>
        </div>
      )}

      {ready && authenticated && (
        <div className="space-y-4 ">
          {accountAddress ? (
            <div className="text-center space-y-3">
              {loadingUsername ? (
                <p className="text-gray-400 text-sm animate-pulse">
                  Loading username...
                </p>
              ) : username ? (
                <div className="space-y-1">
                  <p className="text-base sm:text-lg font-semibold truncate">
                    @{username}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Wallet
                      size={14}
                      className="text-emerald-400 sm:w-4 sm:h-4"
                    />
                    <span className="text-xs sm:text-sm font-mono">
                      {formatAddress(accountAddress)}{" "}
                    </span>{" "}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
                  <p>No username found</p>
                </div>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-1 sm:gap-2 w-full bg-red-600/80 hover:bg-red-600 border border-red-500 rounded-md px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                <LogOut size={12} className="sm:w-3.5 sm:h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-yellow-400 text-sm">⚠ {message}</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Linked Accounts: {user?.linkedAccounts?.length || 0}</p>
                {user?.linkedAccounts && user.linkedAccounts.length > 0 && (
                  <div className="break-all">
                    <p>
                      Account Types:{" "}
                      {user.linkedAccounts.map(acc => acc.type).join(", ")}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="w-full bg-red-600/80 hover:bg-red-600 border border-red-500 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Disconnect & Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
