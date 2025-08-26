"use client";

import { useState, useEffect } from "react";

interface UserData {
  hasUsername: boolean;
  user: {
    id: number;
    username: string;
    walletAddress: string;
  };
}

export function useFetchUsername(walletAddress: string | null | undefined) {
  const [username, setUsername] = useState<string | null>(null);
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false);

  const fetchUsername = async () => {
    setLoadingUsername(true);
    try {
      const response = await fetch(
        `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${walletAddress}`
      );

      if (response.ok) {
        const data: UserData = await response.json();
        setUsername(
          data.hasUsername && data.user?.username ? data.user.username : null
        );
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
    if (!walletAddress) {
      setUsername(null);
      return;
    }

    fetchUsername();
  }, [walletAddress]);

  function refetch() {
    if (!walletAddress) {
      setUsername(null);
      return;
    }

    fetchUsername();
  }

  return { username, loadingUsername, setUsername, refetch };
}
