"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Trophy, RotateCcw, Play } from "lucide-react";
import { CrossAppAccountWithMetadata, usePrivy } from "@privy-io/react-auth";

interface Card {
  id: number;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface LevelConfig {
  rows: number;
  cols: number;
  time: number;
}

type GameState = "menu" | "playing" | "gameOver";

export default function MemoryGame() {
  const [level, setLevel] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<{ transactionHash: string }>();
  const [error, setError] = useState<string | null>(null);
  const { user } = usePrivy();

  const walletAddress =
    user &&
    user.linkedAccounts.find(
      (account): account is CrossAppAccountWithMetadata =>
        account.type === "cross_app" &&
        account.providerApp.id === "cmd8euall0037le0my79qpz42"
    )?.embeddedWallets[0].address;

  // Game configuration - Mobile optimized
  const levelConfig: Record<number, LevelConfig> = {
    1: { rows: 3, cols: 4, time: 180 }, // 3x4
    2: { rows: 4, cols: 4, time: 210 }, // 4x4
    3: { rows: 4, cols: 5, time: 240 }, // 4x5
    4: { rows: 5, cols: 6, time: 300 }, // 5x6
    5: { rows: 8, cols: 8, time: 420 }, // 8x8
  };

  // Generate card images
  const generateImage = (pairCount: number): string[] => {
    const images: string[] = [
      "/cards/4ksalmonad.png",
      "/cards/benja.jpg",
      "/cards/berzan.jpg",
      "/cards/bill.jpg",
      "/cards/bug.jpg",
      "/cards/cassini.jpg",
      "/cards/chog.png",
      "/cards/cutlandak2.png",
      "/cards/harpa.jpg",
      "/cards/james.jpg",
      "/cards/john.jpg",
      "/cards/kadzu.jpg",
      "/cards/karma.jpg",
      "/cards/keone.jpg",
      "/cards/kshit.jpg",
      "/cards/kutsal.jpg",
      "/cards/mike.jpg",
      "/cards/nove.jpg",
      "/cards/piki.jpg",
      "/cards/port.png",
      "/cards/ravel.jpg",
      "/cards/sabo.jpg",
      "/cards/santj.jpg",
      "/cards/tunes.jpg",
      "/cards/uday.jpg",
      "/cards/velikan.jpg",
      "/cards/zack.jpg",
    ];

    const selectedImages: string[] = [];
    for (let i = 0; i < pairCount; i++) {
      const imageIndex = i % images.length;
      selectedImages.push(images[imageIndex], images[imageIndex]);
    }

    return selectedImages.sort(() => Math.random() - 0.5);
  };

  // Initialize game
  const initializeGame = useCallback((gameLevel: number = level): void => {
    const config = levelConfig[gameLevel];
    const totalCards = config.rows * config.cols;
    const pairCount = Math.floor(totalCards / 2);

    const cardImages = generateImage(pairCount);
    const gameCards: Card[] = Array(totalCards)
      .fill(null)
      .map((_, index) => ({
        id: index,
        color: cardImages[index % cardImages.length] || "#CCCCCC",
        isFlipped: false,
        isMatched: false,
      }));

    setCards(gameCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setTimeLeft(config.time);
    setIsChecking(false);
  }, []);

  // Start game
  const startGame = (): void => {
    setGameState("playing");
    setScore(0);
    setLevel(1); // Reset to level 1 when starting
    initializeGame(1);
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("gameOver");
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // Check for level completion
  useEffect(() => {
    if (gameState === "playing" && matchedCards.length > 0) {
      const totalCards = levelConfig[level].rows * levelConfig[level].cols;

      if (matchedCards.length >= totalCards) {
        // All cards matched!
        setTimeout(() => {
          if (level < 5) {
            // Advance to next level
            setScore(prev => prev + 100); // Bonus for completing level
            const nextLevel = level + 1;
            setLevel(nextLevel);

            // Initialize next level immediately
            const config = levelConfig[nextLevel];
            const totalCards = config.rows * config.cols;
            const pairCount = Math.floor(totalCards / 2);

            const cardImages = generateImage(pairCount);
            const gameCards: Card[] = Array(totalCards)
              .fill(null)
              .map((_, index) => ({
                id: index,
                color: cardImages[index % cardImages.length] || "#CCCCCC",
                isFlipped: false,
                isMatched: false,
              }));

            setCards(gameCards);
            setFlippedCards([]);
            setMatchedCards([]);
            setTimeLeft(config.time);
            setIsChecking(false);
          } else {
            // Completed all levels
            setGameState("gameOver");
          }
        }, 1000); // Give a bit more time to see the completion
      }
    }
  }, [matchedCards, level, gameState]);

  // Handle card click
  const handleCardClick = (cardId: number): void => {
    if (
      isChecking ||
      flippedCards.length >= 2 ||
      flippedCards.includes(cardId) ||
      matchedCards.includes(cardId)
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const [firstCard, secondCard] = newFlippedCards;
      const firstCardData = cards[firstCard];
      const secondCardData = cards[secondCard];

      setTimeout(() => {
        if (firstCardData.color === secondCardData.color) {
          // Cards match!
          setMatchedCards(prev => [...prev, firstCard, secondCard]);
          setScore(prev => prev + 10);
        }
        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  };

  // Reset game
  const resetGame = (): void => {
    setLevel(1);
    setScore(0);
    setGameState("menu");
    setError(null);
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const { cols, rows } = levelConfig[level];

  // Calculate card size based on screen size and grid dimensions
  const getCardSize = () => {
    if (typeof window === "undefined") return "w-12 h-12";

    const screenWidth = window.innerWidth;
    const padding = 32; // Total horizontal padding
    const gap = 8; // Gap between cards
    const availableWidth = screenWidth - padding - (cols - 1) * gap;
    const cardWidth = Math.floor(availableWidth / cols);

    if (cardWidth < 40) return "w-8 h-8";
    if (cardWidth < 60) return "w-12 h-12";
    if (cardWidth < 80) return "w-16 h-16";
    return "w-20 h-20";
  };

  async function handleSubmitScore() {
    setIsSubmitting(true);
    setError(null); // reset error before submitting

    try {
      const res = await fetch("/api/submit-score", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          player: walletAddress,
          scoreAmount: score,
          transactionAmount: 1,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // API returned an error
        setError(json.error || "Failed to submit score");
        return;
      }

      setData(json);
    } catch (err) {
      console.error("Error submitting score", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (gameState === "menu") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="text-center text-white mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Memory Game
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Test your memory across 5 challenging levels!
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 sm:p-8 text-white text-center w-full max-w-md border border-gray-700 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-cyan-400">
            Level Progression
          </h2>
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {Object.entries(levelConfig).map(([lvl, config]) => (
              <div
                key={lvl}
                className="flex justify-between items-center py-2 px-3 bg-gray-700/50 rounded-lg"
              >
                <span className="font-medium text-sm sm:text-base">
                  Level {lvl}:
                </span>
                <span className="text-xs sm:text-sm text-gray-300">
                  {config.rows}×{config.cols} • {formatTime(config.time)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto shadow-lg cursor-pointer "
          >
            <Play size={18} className="sm:w-5 sm:h-5" />
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 text-center w-full max-w-md border border-gray-700 shadow-2xl">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎮</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Game Over!
          </h2>
          <div className="text-gray-300 mb-4 sm:mb-6">
            <p className="text-base sm:text-lg">
              Level Reached:{" "}
              <span className="font-semibold text-cyan-400">{level}</span>
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center justify-center gap-2 mt-2">
              <Trophy size={20} className="sm:w-6 sm:h-6" />
              {score} points
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
              <p className="text-gray-300 mb-2 text-sm sm:text-base">
                Submit your score:
              </p>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-2 sm:mb-3">
                {score}
              </div>
              <button
                disabled={isSubmitting}
                onClick={handleSubmitScore}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                {isSubmitting ? "Submitting..." : "Submit Score"}
              </button>
            </div>

            {data && (
              <div className="mt-4 bg-gray-700 rounded-lg p-3 sm:p-4 text-left">
                <p className="text-sm text-gray-300">Transaction Successful!</p>
                <p className="text-xs text-cyan-400 break-words">
                  Hash: {data.transactionHash}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              <RotateCcw size={16} className="sm:w-5 sm:h-5" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4 pt-16 sm:pt-12">
      {/* Header */}
      <div className="flex sm:flex-row justify-center items-center mb-4 sm:mb-6 text-white max-w-6xl mx-auto gap-3 sm:gap-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <h1 className="text-xl sm:text-2xl font-bold text-cyan-400">
            Level {level}
          </h1>
          <div className="flex items-center gap-2 bg-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-lg border border-gray-700">
            <Trophy className="text-yellow-400" size={16} />
            <span className="font-semibold text-sm sm:text-base">{score}</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center px-2">
        <div
          className="grid gap-1 sm:gap-2 w-fit"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {cards.map(card => {
            const isFlipped =
              flippedCards.includes(card.id) || matchedCards.includes(card.id);
            const isMatched = matchedCards.includes(card.id);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square cursor-pointer rounded-md sm:rounded-lg transition-all duration-500 transform hover:scale-105 border border-purple-400
                  w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                  ${isFlipped ? "rotate-y-0" : "rotate-y-180 hover:rotate-12"}
                  ${
                    isMatched
                      ? "opacity-75 scale-95"
                      : "shadow-lg hover:shadow-xl"
                  }
                  preserve-3d
                `}
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Card Back */}
                <div
                  className={`
                    absolute inset-0 w-full h-full rounded-md sm:rounded-lg transition-all duration-500 transform
                    ${
                      isFlipped
                        ? "rotate-y-180 opacity-0"
                        : "rotate-y-0 opacity-100"
                    }
                  `}
                  style={{
                    backgroundColor: "#374151",
                    border: "2px solid #4B5563",
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                  }}
                />

                {/* Card Front */}
                <img
                  draggable={false}
                  src={card.color}
                  alt="Memory card"
                  className={`
                    absolute inset-0 w-full h-full object-cover rounded-md sm:rounded-lg transition-all duration-500 transform
                    ${
                      isFlipped
                        ? "rotate-y-0 opacity-100"
                        : "rotate-y-180 opacity-0"
                    }
                    ${isMatched ? "ring-2 ring-cyan-400" : ""}
                  `}
                  style={{
                    border: "2px solid #E5E7EB",
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                    boxShadow: isMatched
                      ? "0 0 10px rgba(34, 211, 238, 0.5)"
                      : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center gap-2 bg-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-lg border border-gray-700">
          <Clock className="text-red-400" size={16} />
          <span className="font-mono text-base sm:text-xl text-white">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress Info */}
      <div className="text-center mt-4 sm:mt-6 text-gray-300 max-w-6xl mx-auto">
        <p className="text-xs sm:text-sm">
          Matches: {matchedCards.length / 2} / {Math.floor(cards.length / 2)}
        </p>
      </div>
    </div>
  );
}
