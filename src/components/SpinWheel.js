import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const SpinWheel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get state from location or use default values
  const { username = 'username', balance: initialBalance = 100 } = location.state || {};
  
  // Initialize balance from localStorage
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('roulette_balance');
    return savedBalance ? parseInt(savedBalance) : initialBalance;
  });
  
  // Wheel spinning states
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  
  // Load history from localStorage
  const [betHistory, setBetHistory] = useState(() => {
    const savedHistory = localStorage.getItem('roulette_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  // Create a reference for the audio element
  const spinSoundRef = useRef(null);
  
  // Use refs to store the animation duration and selected segment
  const spinDurationRef = useRef(3000); // 3 seconds by default
  const selectedSegmentRef = useRef(null);
  
  // Save balance to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roulette_balance', balance);
  }, [balance]);
  
  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roulette_history', JSON.stringify(betHistory));
  }, [betHistory]);
  
  // Define segments in clockwise order starting from the top - using a more interesting set
  const segments = [
    { label: '0x', color: '#FF99C8', multiplier: 0 },
    { label: '10x', color: '#9B5DE5', multiplier: 10 },
    { label: '0x', color: '#D4A5A5', multiplier: 0 },
    { label: '5x', color: '#FFEEAD', multiplier: 5 },
    { label: '0x', color: '#96CEB4', multiplier: 0 },
    { label: '3x', color: '#45B7D1', multiplier: 3 },
    { label: '0x', color: '#4ECDC4', multiplier: 0 },
    { label: '2x', color: '#FF6B6B', multiplier: 2 },
  ];
  
  const segmentAngle = 360 / segments.length;
  
  // Updates bet history with new result
  const updateHistory = (gameType, betAmount, result, winAmount) => {
    const newHistoryEntry = {
      id: Date.now(),
      gameType,
      amount: betAmount,
      result,
      winAmount,
      timestamp: new Date().toISOString(),
    };
    
    setBetHistory(prevHistory => [newHistoryEntry, ...prevHistory]);
  };
  
  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };
  
  // This handles the transition end - only show results when wheel physically stops
  const handleTransitionEnd = () => {
    if (isSpinning && selectedSegmentRef.current) {
      // Calculate the final rotation angle after spinning
      const finalRotation = rotation % 360;
      
      // Determine which segment is under the pointer based on the final angle
      const segmentIndex = Math.floor((360 - finalRotation) / segmentAngle) % segments.length;
      
      const targetSegment = segments[segmentIndex];
      const exactWinAmount = Math.floor(betAmount * targetSegment.multiplier);
      
      // Update result ONLY after wheel has stopped spinning
      setResult({
        multiplier: targetSegment.multiplier,
        winAmount: exactWinAmount,
        segmentLabel: targetSegment.label
      });
      
      // Update balance
      setBalance(prevBalance => prevBalance - betAmount + exactWinAmount);
      
      // Add result to history
      updateHistory(
        'Spin Wheel', 
        betAmount, 
        `Landed on ${targetSegment.label}`, 
        exactWinAmount
      );
      
      // Reset spinning state
      setIsSpinning(false);
      
      // Clear the selected segment
      selectedSegmentRef.current = null;
      
      // Stop the spinning sound once the wheel stops
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0; // Reset the sound to the beginning
      }
    }
  };
  
  const handleSpin = () => {
    if (!isSpinning) {
      if (betAmount <= 0 || betAmount > balance) {
        setError('Invalid bet amount');
        return;
      }
      
      // Clear any previous results
      setResult(null);
      setError(null);
      setIsSpinning(true);
      
      // First decide which segment to land on
      const targetSegmentIndex = Math.floor(Math.random() * segments.length);
      const targetSegment = segments[targetSegmentIndex];
      
      // Store the selected segment in the ref for later use
      selectedSegmentRef.current = targetSegment;
      
      // Calculate rotation to ensure the pointer aligns with the center of the segment
      const extraSpins = 4 + Math.random(); // 4-5 full rotations
      
      // Important: For a wheel that rotates clockwise, to get segment N under the pointer,
      // we need to rotate by N * segmentAngle degrees in the opposite direction
      const totalRotation = (extraSpins * 360) + (targetSegmentIndex * segmentAngle);
      
      // Set the spin duration (animation time)
      spinDurationRef.current = 3000 + Math.floor(Math.random() * 500); // 3-3.5 seconds
      
      // Start the wheel spinning
      setRotation(totalRotation);
      
      // Play the spinning sound if available
      if (spinSoundRef.current) {
        spinSoundRef.current.play();
      }
    }
  };
  
  // Handler to go back to the main page
  const handleBackToMainPage = () => {
    navigate('/game-hub', { state: { username, balance } }); // Pass the current balance back to the main page
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <button 
          onClick={handleBackToMainPage}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full sm:w-auto"
        >
          Back to Games
        </button>
        <h1 className="text-2xl font-bold">Spin Wheel</h1>
        <div className="text-sm text-center sm:text-right w-full sm:w-auto">
          Welcome, {username}
        </div>
      </div>

      <div className="text-lg font-semibold mb-4 text-center">
        Balance: ${balance}
      </div>
      
      <div className="flex flex-col items-center gap-6">
        {/* Actual wheel visualization from the second component */}
        <div className="relative w-64 h-64 mb-6 flex justify-center items-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full rounded-full relative overflow-hidden border-4 border-gray-200 shadow-md"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? `transform ${spinDurationRef.current/1000}s cubic-bezier(0.2, 0.8, 0.2, 1)` : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {segments.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const start = polarToCartesian(50, 50, 50, startAngle);
              const end = polarToCartesian(50, 50, 50, endAngle);
              const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

              const textAngle = startAngle + segmentAngle / 2;
              const textPos = polarToCartesian(50, 50, 35, textAngle);

              return (
                <g key={index}>
                  <path
                    d={`M 50 50 L ${start.x} ${start.y} A 50 50 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`}
                    fill={segment.color}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="white"
                    fontSize="6"
                    textAnchor="middle"
                    transform={`rotate(${textAngle + 90}, ${textPos.x}, ${textPos.y})`}
                    className="font-bold"
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute top-0 left-1/2 -ml-2 z-10">
            <div className="w-4 h-4 bg-red-500 shadow-md transform rotate-180" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          </div>
        </div>

        <div className="w-full max-w-xs">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bet Amount</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              placeholder="Enter bet amount"
              className="w-full p-3 border border-gray-300 rounded-lg"
              min="100"
              max={balance}
              step="100"
              disabled={isSpinning}
            />
          </div>
          
          <button
            onClick={handleSpin}
            disabled={isSpinning || !betAmount || betAmount <= 0 || betAmount > balance}
            className={`w-full py-3 px-6 rounded-lg text-base font-semibold text-white ${isSpinning || !betAmount || betAmount <= 0 || betAmount > balance ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} transition-colors duration-200`}
          >
            {isSpinning ? 'Spinning...' : 'SPIN!'}
          </button>
        </div>

        {result && (
          <div className="text-center mt-4 p-4 border rounded-lg bg-gray-50 w-full max-w-xs">
            <div className="text-lg font-bold mb-2">
              Landed on {result.segmentLabel}
            </div>
            <div className="text-lg">
              {result.winAmount > 0 
                ? `You won: $${result.winAmount}!` 
                : 'Better luck next time!'}
            </div>
            <div className="text-sm text-gray-600">
              (Multiplier: {result.multiplier}x)
            </div>
          </div>
        )}
      </div>
      
      {/* Audio element for spin sound */}
      <audio ref={spinSoundRef} src="/spin.mp3" preload="auto" />
    </div>
  );
};

export default SpinWheel;