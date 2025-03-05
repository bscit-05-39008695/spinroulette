import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Sample avatar options
const avatarOptions = [
  { id: 1, src: "./assets/avatar1.png", name: "Cool Guy" },
  { id: 2, src: "./assets/avatar2.png", name: "Tough Lady" },
  { id: 3, src: "./assets/avatar3.png", name: "Mystery Person" },
  { id: 4, src: "./assets/avatar4.png", name: "Lucky Charm" },
  { id: 5, src: "./assets/avatar5.png", name: "Risk Taker" },
  { id: 6, src: "./assets/avatar6.png", name: "Fortune Seeker" },
];

// Sample active users without avatars initially
const sampleActiveUsers = [
  { id: 1, username: "Player123", wins: 23, losses: 12 },
  { id: 2, username: "LuckyGamer", wins: 45, losses: 20 },
  { id: 3, username: "RiskMaster", wins: 67, losses: 34 },
  { id: 4, username: "GameKing", wins: 32, losses: 15 },
];

const RussianRouletteGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, balance, profileImage } = location.state || { 
    username: "Player", 
    balance: 100, 
    profileImage: null 
  };

  // Game state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [playerPosition, setPlayerPosition] = useState("left"); // "left" or "right"
  const [remainingAvatars, setRemainingAvatars] = useState([...avatarOptions]);
  
  // Prepare active users with random avatars from the remaining ones
  useEffect(() => {
    if (selectedAvatar) {
      // Filter out the selected avatar
      const filteredAvatars = avatarOptions.filter(avatar => avatar.id !== selectedAvatar.id);
      setRemainingAvatars(filteredAvatars);
      
      // Assign random avatars to opponents
      const usersWithAvatars = sampleActiveUsers.map((user, index) => {
        // Use modulo to cycle through available avatars if there are more users than avatars
        const avatarIndex = index % filteredAvatars.length;
        return {
          ...user,
          avatar: filteredAvatars[avatarIndex].src,
          avatarName: filteredAvatars[avatarIndex].name
        };
      });
      
      setActiveUsers(usersWithAvatars);
      
      // Reset selected opponent if it was previously selected
      setSelectedOpponent(null);
    } else {
      // If no avatar selected, reset the opponents list without avatars
      setActiveUsers(sampleActiveUsers);
      setRemainingAvatars([...avatarOptions]);
    }
  }, [selectedAvatar]);
  
  // Select an avatar
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };
  
  // Select an opponent
  const handleOpponentSelect = (opponent) => {
    setSelectedOpponent(opponent);
  };
  
  // Toggle player position
  const togglePlayerPosition = () => {
    setPlayerPosition(prevPosition => prevPosition === "left" ? "right" : "left");
  };
  
  // Start the game - Navigate to GamePlay component
  const startGame = () => {
    if (!selectedAvatar) {
      alert("Please select an avatar first!");
      return;
    }
    
    if (!selectedOpponent) {
      alert("Please select an opponent!");
      return;
    }
    
    if (betAmount > balance) {
      alert("Bet amount cannot exceed your balance!");
      return;
    }
    
    // Navigate to the gameplay component with all necessary data
    navigate('/roulette-gameplay', {
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
  
  // Return to homepage
  const returnToHome = () => {
    navigate('/game-hub', { state: { username, balance, profileImage } });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={returnToHome}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Games
          </button>
          <div className="text-xl font-bold">Balance: ${balance}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Russian Roulette</h1>
          
          <div>
            {/* Avatar Selection Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Choose Your Avatar</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {avatarOptions.map((avatar) => (
                  <div 
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`cursor-pointer border-2 rounded-lg p-2 text-center transition-all ${
                      selectedAvatar?.id === avatar.id 
                        ? 'border-blue-500 bg-blue-50 transform scale-105' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img 
                      src={avatar.src} 
                      alt={avatar.name}
                      className="w-full h-24 object-contain mb-2"
                    />
                    <p className="text-sm font-medium">{avatar.name}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Player Position Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Select Your Position</h2>
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => setPlayerPosition("left")}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    playerPosition === "left" 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Left Side
                </button>
                <button
                  onClick={() => setPlayerPosition("right")}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    playerPosition === "right" 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Right Side
                </button>
              </div>
            </div>
            
            {/* Bet Amount */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Select Bet Amount</h2>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-24 px-4 py-2 text-center border rounded-lg"
                  min="10"
                  max={balance}
                />
                <button 
                  onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Active Users / Opponents Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Select Opponent</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeUsers.map((user) => (
                  <div 
                    key={user.id}
                    onClick={() => handleOpponentSelect(user)}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      selectedOpponent?.id === user.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.avatarName || user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-gray-600">
                          Wins: {user.wins} | Losses: {user.losses}
                        </p>
                        {user.avatarName && (
                          <p className="text-xs text-gray-500">Avatar: {user.avatarName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Start Game Button */}
            <div className="flex justify-center">
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                disabled={!selectedAvatar || !selectedOpponent}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RussianRouletteGame;