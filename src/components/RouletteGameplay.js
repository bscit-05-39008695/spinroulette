import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RouletteGameplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    username, 
    balance: initialBalance, 
    profileImage, 
    selectedAvatar, 
    selectedOpponent, 
    betAmount, 
    playerPosition 
  } = location.state || {};

  // Game state
  const [balance, setBalance] = useState(initialBalance || 0);
  const [chamber, setChamber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null); // "win" or "lose"
  const [gunImage] = useState("./assets/gun1.png"); // Gun image
  const [barrelImage] = useState("./assets/barrel.png"); // Barrel image
  const [gameRoomId] = useState(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [potAmount] = useState(betAmount * 2); // Total pot (player bet + opponent bet)
  
  // Animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [barrelRotation, setBarrelRotation] = useState(0); // Barrel rotation angle
  const [spinDuration, setSpinDuration] = useState(0);
  const [currentTurn, setCurrentTurn] = useState("player"); // "player" or "opponent"
  const [gunRotation, setGunRotation] = useState(0); // For gun rotation angle
  
  // Get existing bet history from localStorage
  const [betHistory, setBetHistory] = useState(() => {
    const savedHistory = localStorage.getItem('roulette_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // If required data is missing, redirect back to setup
  useEffect(() => {
    if (!selectedAvatar || !selectedOpponent) {
      navigate('/roulette');
    }
  }, [selectedAvatar, selectedOpponent, navigate]);

  // Deduct bet amount from balance immediately when component loads
  useEffect(() => {
    if (initialBalance && betAmount) {
      // Deduct bet amount from initial balance
      setBalance(initialBalance - betAmount);
    }
  }, [initialBalance, betAmount]);

  // Save updated bet history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roulette_history', JSON.stringify(betHistory));
  }, [betHistory]);

  // Save updated balance to localStorage whenever it changes
  useEffect(() => {
    if (balance !== initialBalance) {
      localStorage.setItem('roulette_balance', balance);
    }
  }, [balance, initialBalance]);
  
  // Update gun rotation based on whose turn it is
  useEffect(() => {
    // Point gun at opponent if it's player's turn
    if (currentTurn === "player") {
      setGunRotation(playerPosition === "left" ? 0 : 180);
    } else {
      // Point gun at player if it's opponent's turn
      setGunRotation(playerPosition === "left" ? 180 : 0);
    }
  }, [currentTurn, playerPosition]);

  const spinBarrel = () => {
    // Only allow spinning if not already spinning
    if (!isSpinning) {
      setIsSpinning(true);
      
      // Random number of rotations between 3 and 5
      const rotations = 3 + Math.random() * 2;
      
      // Random spin duration between 2-4 seconds
      const duration = 2 + Math.random() * 2;
      setSpinDuration(duration);
      
      // Calculate the target rotation (current + number of full rotations)
      const targetRotation = barrelRotation + rotations * 360;
      
      // Animate the barrel rotation
      let startTime = null;
      
      const animateBarrel = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);
        
        if (progress < 1) {
          // Easing function for slowing down towards the end
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentRotation = barrelRotation + (targetRotation - barrelRotation) * easeOut;
          setBarrelRotation(currentRotation);
          requestAnimationFrame(animateBarrel);
        } else {
          // Animation completed
          setBarrelRotation(targetRotation);
          setIsSpinning(false);
          
          // Determine whose turn it is after spin
          // Alternate turns based on chamber number
          setCurrentTurn(chamber % 2 === 1 ? "player" : "opponent");
        }
      };
      
      requestAnimationFrame(animateBarrel);
    }
  };

  const pullTrigger = () => {
    // Only allow pull trigger if not spinning
    if (isSpinning) return;
    
    // Random chance (1 in 6) of firing
    const chamberFired = Math.floor(Math.random() * 6) === 0;
    
    if (chamberFired) {
      // Game over - outcome depends on who pulled the trigger
      setGameOver(true);
      
      if (currentTurn === "player") {
        // Player's turn and gun fired - player wins (shot the opponent)
        setGameResult("win");
        
        // Add the entire pot to player's balance
        const newBalance = balance + potAmount;
        setBalance(newBalance);
        
        // Add to history
        const newBetRecord = {
          timestamp: new Date().toLocaleString(),
          mode: "Russian Roulette",
          players: `${username} vs ${selectedOpponent?.username}`,
          betAmount: betAmount,
          winAmount: potAmount,
          outcome: "won",
          balanceAfter: newBalance
        };
        
        setBetHistory(prevHistory => [...prevHistory, newBetRecord]);
      } else {
        // Opponent's turn and gun fired - player loses (got shot)
        setGameResult("lose");
        
        // Balance was already deducted when bet was placed
        const newBalance = balance;
        
        // Add to history
        const newBetRecord = {
          timestamp: new Date().toLocaleString(),
          mode: "Russian Roulette",
          players: `${username} vs ${selectedOpponent?.username}`,
          betAmount: betAmount,
          outcome: "lost",
          balanceAfter: newBalance
        };
        
        setBetHistory(prevHistory => [...prevHistory, newBetRecord]);
      }
    } else {
      // Move to next chamber
      setChamber(prev => prev + 1);
      
      // Change turn
      setCurrentTurn(prevTurn => prevTurn === "player" ? "opponent" : "player");
      
      // If it was the last chamber, the last player automatically wins
      if (chamber === 5) {
        setGameOver(true);
        
        if (currentTurn === "player") {
          // It was player's turn for the last chamber, player wins
          setGameResult("win");
          
          // Add the entire pot to player's balance
          const newBalance = balance + potAmount;
          setBalance(newBalance);
          
          // Add to history
          const newBetRecord = {
            timestamp: new Date().toLocaleString(),
            mode: "Russian Roulette",
            players: `${username} vs ${selectedOpponent?.username}`,
            betAmount: betAmount,
            winAmount: potAmount,
            outcome: "won",
            balanceAfter: newBalance
          };
          
          setBetHistory(prevHistory => [...prevHistory, newBetRecord]);
        } else {
          // It was opponent's turn for the last chamber, player loses
          setGameResult("lose");
          
          // Balance was already deducted when bet was placed
          const newBalance = balance;
          
          // Add to history
          const newBetRecord = {
            timestamp: new Date().toLocaleString(),
            mode: "Russian Roulette",
            players: `${username} vs ${selectedOpponent?.username}`,
            betAmount: betAmount,
            outcome: "lost",
            balanceAfter: newBalance
          };
          
          setBetHistory(prevHistory => [...prevHistory, newBetRecord]);
        }
      }
    }
  };
  
  // Return to setup
  const quitGame = () => {
    navigate('/game-hub', { state: { username, balance, profileImage } });
  };
  
  // Play again
  const playAgain = () => {
    navigate('/russian-roulette-game', { 
      state: { 
        username, 
        balance, 
        profileImage, 
        selectedAvatar, 
        selectedOpponent, 
        betAmount, 
        playerPosition 
      } 
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={quitGame}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Quit Game
          </button>
          <div className="text-xl font-bold">Balance: ${balance}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Russian Roulette</h1>
          
          {/* Game Play Area */}
          <div className="w-full aspect-video bg-gray-200 rounded-lg mb-6 relative">
            {/* SVG Game Display */}
            <svg 
              viewBox="0 0 800 400" 
              className="w-full h-full"
            >
              {/* Table */}
              <rect x="100" y="150" width="600" height="200" rx="20" fill="#8B4513" />
              <ellipse cx="400" cy="150" rx="300" ry="80" fill="#A0522D" />
              
              {/* Rotating barrel in the middle */}
              <g transform={`rotate(${barrelRotation}, 400, 200)`}>
                <image 
                  href={barrelImage} 
                  x="350" 
                  y="150" 
                  width="100" 
                  height="100" 
                />
              </g>
              
              {/* Gun pointing at players */}
              <g transform={`rotate(${gunRotation}, 400, 200)`}>
                <image 
                  href={gunImage} 
                  x="375" 
                  y="200" 
                  width="50" 
                  height="100" 
                />
              </g>
              
              {/* Player */}
              {playerPosition === "left" ? (
                <g>
                  {/* Player on left */}
                  <image 
                    href={selectedAvatar?.src || profileImage || "./assets/default.png"} 
                    x="50" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="110" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {username}
                  </text>
                  
                  {/* Opponent on right */}
                  <image 
                    href={selectedOpponent?.avatar || "./assets/opponent.png"}
                    x="630" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="690" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {selectedOpponent?.username}
                  </text>
                </g>
              ) : (
                <g>
                  {/* Player on right */}
                  <image 
                    href={selectedAvatar?.src || profileImage || "./assets/default.png"} 
                    x="630" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="690" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {username}
                  </text>
                  
                  {/* Opponent on left */}
                  <image 
                    href={selectedOpponent?.avatar || "./assets/opponent.png"}
                    x="50" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="110" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {selectedOpponent?.username}
                  </text>
                </g>
              )}
              
              {/* Game result overlay if game is over */}
              {gameOver && (
                <g>
                  <rect x="0" y="0" width="800" height="400" fill="rgba(0,0,0,0.7)" />
                  <text x="400" y="200" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">
                    {gameResult === "win" ? "YOU WON!" : "YOU LOST!"}
                  </text>
                  <text x="400" y="240" textAnchor="middle" fill="white" fontSize="24">
                    {gameResult === "win" 
                      ? `+$${potAmount} added to your balance!` 
                      : `$${betAmount} deducted from your balance!`}
                  </text>
                </g>
              )}
            </svg>
            
            {/* Game controls */}
            {!gameOver ? (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button 
                  onClick={spinBarrel}
                  disabled={isSpinning}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-full ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isSpinning ? "Spinning..." : "Spin Barrel"}
                </button>
                <button 
                  onClick={pullTrigger}
                  disabled={isSpinning}
                  className={`px-6 py-2 bg-red-600 text-white rounded-full ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                >
                  Pull Trigger
                </button>
              </div>
            ) : (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button 
                  onClick={playAgain}
                  className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                  Play Again
                </button>
                <button 
                  onClick={quitGame}
                  className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                >
                  Quit
                </button>
              </div>
            )}
          </div>
          
          {/* Game Info */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="font-bold text-lg">Game Room: #{gameRoomId}</h3>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentTurn === "player" ? `${username}'s Turn` : `${selectedOpponent?.username}'s Turn`}
              </div>
            </div>
            
            <div className="flex justify-between mt-3">
              <div>
                <p className="font-semibold">Your Bet: ${betAmount}</p>
                <p className="font-semibold">Total Pot: ${potAmount}</p>
                <p>Potential Win: ${potAmount}</p>
              </div>
              <div>
                <p className="font-semibold">Chamber: {chamber}/6</p>
                <p>Odds: {(1 / (7 - chamber) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouletteGameplay;