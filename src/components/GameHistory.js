import React, { useState, useEffect } from 'react';

export const GameHistory = () => {
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        const response = await fetch('http://127.0.0.1:5001/history', { headers });
        const data = await response.json();

        if (Array.isArray(data.gameHistory)) {
          setBetHistory(data.gameHistory);
        } else {
          setError('Invalid game history data');
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchGameHistory();
  }, []);

  const renderGameSpecificInfo = (bet) => {
    // Return the game-specific information that you want to render
    return (
      <div>
        <p>Game Type: {bet.gameType}</p>
        <p>Bet Amount: {bet.amount}</p>
        <p>Result: {bet.result}</p>
        <p>Win Amount: {bet.winAmount}</p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold">Game History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : betHistory.length === 0 ? (
        <p>No games played yet.</p>
      ) : (
        <ul className="divide-y">
          {betHistory.map((bet, index) => (
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