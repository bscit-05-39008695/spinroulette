import React, { useState, useEffect } from 'react';

export const GameHistory = () => {
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        
        const response = await fetch('https://gamehub-3suy.onrender.com/history', { headers });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data.gameHistory)) {
          setBetHistory(data.gameHistory);
        } else if (Array.isArray(data)) {
          // In case API returns array directly without wrapping in gameHistory object
          setBetHistory(data);
        } else {
          console.error('Unexpected API response format:', data);
          setError('Invalid game history data format. Check console for details.');
        }
      } catch (error) {
        console.error('Error fetching game history:', error);
        setError(`Failed to load game history: ${error.message}`);
      } finally {
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