"use client";

import axios from "axios";
import { useEffect, useState } from "react";

interface LeaderBoardData {
  userId: number;
  rank: number;
  walletAddress: string;
  username: string;
  score: number;
}

interface LeaderboardResponse {
  data: {
    data: LeaderBoardData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderBoardData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await axios.get<LeaderboardResponse>(`/api/leaderboard`, {
          params: { page },
        });

        setLeaderboard(res.data.data.data);
        setTotalPages(res.data.data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [page]);

  console.log(leaderboard);

  return (
    <div
      style={{
        backgroundColor: "#111827",
        color: "white",
        padding: "1.5rem",
        borderRadius: "1rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Leaderboard
      </h2>
      <div
        style={{
          overflowX: "auto",
          backgroundColor: "#1f2937",
          borderRadius: "0.5rem",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#374151",
                color: "#d1d5db",
                fontSize: "0.875rem",
              }}
            >
              <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                Rank
              </th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                Username
              </th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                Wallet
              </th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: "#9ca3af",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : (
              leaderboard.map(item => (
                <tr
                  key={item.userId}
                  style={{
                    borderTop: "1px solid #374151",
                    backgroundColor: "#1f2937",
                  }}
                >
                  <td style={{ padding: "0.5rem 1rem" }}>{item.rank}</td>
                  <td style={{ padding: "0.5rem 1rem" }}>
                    {item.username || "-"}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem 1rem",
                      color: "#9ca3af",
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.walletAddress}
                  </td>
                  <td style={{ padding: "0.5rem 1rem", fontWeight: "600" }}>
                    {item.score}
                  </td>
                </tr>
              ))
            )}
            {!leaderboard.length && (
              <div className="p-2 w-full text-slate-200 text-sm">
                <p>No Leaderboard data...</p>
              </div>
            )}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1 || !leaderboard.length}
          style={{
            backgroundColor: page === 1 ? "#4b5563" : "#374151",
            opacity: page === 1 ? 0.5 : 1,
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: page === 1 ? "not-allowed" : "pointer",
            transition: "background-color 0.2s, opacity 0.2s",
          }}
        >
          Previous
        </button>

        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || !leaderboard.length}
          style={{
            backgroundColor: page === totalPages ? "#4b5563" : "#374151",
            opacity: page === totalPages ? 0.5 : 1,
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            transition: "background-color 0.2s, opacity 0.2s",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
