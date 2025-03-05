// GameHistory.js
import React from 'react';

export const GameHistory = ({ betHistory, clearHistory }) => {
  // Make sure we're showing from most recent to oldest
  // This creates a copy of the array and reverses it
  const reversedHistory = [...betHistory].reverse();

  // Function to render content based on game type
  const renderGameSpecificInfo = (bet) => {
    if (bet.gameType === 'Spin Wheel' || bet.gameType === 'Spin and Win') {
      return (
        <>
          <div className="flex justify-between items-center">
            <span className="font-medium">Spin and Win</span>
            <span className="text-sm text-gray-500">{bet.timestamp}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">
              Bet: ${bet.betAmount || bet.amount}
            </span>
            <span className={
              (bet.winAmount > (bet.betAmount || bet.amount))
                ? "text-green-500 font-medium" 
                : bet.winAmount === 0 
                  ? "text-red-500 font-medium"
                  : "text-yellow-600 font-medium"
            }>
              {(bet.winAmount > (bet.betAmount || bet.amount))
                ? `Won $${bet.winAmount - (bet.betAmount || bet.amount)}` 
                : bet.winAmount === 0 
                  ? `Lost $${bet.betAmount || bet.amount}`
                  : `Won $${bet.winAmount}`}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Result: {bet.result}
          </div>
        </>
      );
    } else {
      // Default for Russian Roulette
      return (
        <>
          <div className="flex justify-between items-center">
            <span className="font-medium">Russian Roulette</span>
            <span className="text-sm text-gray-500">{bet.timestamp}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">
              Bet: ${bet.betAmount || bet.amount}
            </span>
            <span className={bet.outcome === "won" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {bet.outcome === "won" ? `Won $${bet.winAmount}` : `Lost $${bet.betAmount || bet.amount}`}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Mode: {bet.mode} | Players: {bet.players}
          </div>
        </>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Game History</h3>
        {betHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm text-red-500 hover:text-red-600"
          >
            Clear History
          </button>
        )}
      </div>
      {betHistory.length === 0 ? (
        <p>No games played yet.</p>
      ) : (
        <ul className="divide-y">
          {reversedHistory.map((bet, index) => (
            <li key={index} className="py-3">
              {renderGameSpecificInfo(bet)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GameHistory;