import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
// You'll need to create these components separately
import Modal from './Modal';
import TransactionForm from "./TransactionForm";
import GameHistory from "./GameHistory";

const HomePage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  // State management
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('roulette_balance');
    return savedBalance ? parseInt(savedBalance) : 100;
  });
 
  const [loading, setLoading] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [betHistory, setBetHistory] = useState(() => {
    const savedHistory = localStorage.getItem('roulette_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [username] = useState(() => {
    const savedUsername = localStorage.getItem('username');
    return savedUsername || "username";
  });
  const [currentGame, setCurrentGame] = useState(null); // Fixed: Properly define the state
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || null;
  });

  // Helper functions
  const validatePhoneNumber = (number) => {
    const regex = /^(?:254|\+254|0)?(7[0-9]{8})$/;
    return regex.test(number);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = () => {
    
    // You can add any sign out logic here
    navigate('/login');
    // Optionally reset user data
    
    // setUsername("Guest");
    // setBalance(0);
    // setProfileImage(null);
    // localStorage.removeItem('username');
    // localStorage.removeItem('profileImage');
    // localStorage.removeItem('roulette_balance');
  };

  // Handler functions
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(phoneNumber)) {
      setTransactionStatus("Invalid phone number format");
      return;
    }
    if (amount < 10 || amount > 150000) {
      setTransactionStatus("Amount must be between KES 10 and KES 150,000");
      return;
    }

    setLoading(true);
    setTransactionStatus("Initiating deposit...");

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionStatus("STK push sent to your phone. Please complete the payment.");
      await new Promise(resolve => setTimeout(resolve, 5000));
      setBalance(prev => prev + Number(amount));
      setTransactionStatus("Deposit successful!");
      
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setTransactionStatus("");
        setPhoneNumber("");
        setAmount("");
      }, 2000);
    } catch (error) {
      setTransactionStatus("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(phoneNumber)) {
      setTransactionStatus("Invalid phone number format");
      return;
    }
    if (amount < 10 || amount > 150000) {
      setTransactionStatus("Amount must be between KES 10 and KES 150,000");
      return;
    }
    if (amount > balance) {
      setTransactionStatus("Insufficient balance");
      return;
    }

    setLoading(true);
    setTransactionStatus("Processing withdrawal...");

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBalance(prev => prev - Number(amount));
      setTransactionStatus("Withdrawal successful! Money sent to your M-Pesa.");
      
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setTransactionStatus("");
        setPhoneNumber("");
        setAmount("");
      }, 2000);
    } catch (error) {
      setTransactionStatus("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setBetHistory([]);
    localStorage.removeItem('roulette_history');
  };

  const handlePlayGame = (game) => {
    setCurrentGame(game); // Now this will work correctly
    
    if (game === 'russian-roulette') {
      // Navigate to the Russian Roulette gameplay page
      navigate('/russian-roulette-game', { 
        state: { 
          username, 
          balance, 
          profileImage 
        } 
      });
    } else if (game === 'spin-and-win') {
      // Navigate to the Spin and Win gameplay page
      navigate('/spin-and-win-game', { 
        state: { 
          username, 
          balance 
        } 
      });
    }
  };

  // Save balance and history to localStorage
  useEffect(() => {
    localStorage.setItem('roulette_balance', balance);
    localStorage.setItem('roulette_history', JSON.stringify(betHistory));
  }, [balance, betHistory]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col items-center mt-12 max-w-6xl mx-auto p-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">WELCOME TO GAME HUB!</h1>
        
        {/* Header with Balance, Profile and Transaction Buttons */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="text-xl">Balance: ${balance}</div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Deposit
            </button>
            <button 
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Withdraw
            </button>
          </div>
          
          {/* Updated Profile Avatar, Username and Sign Out button */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
                htmlFor="profile-upload"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
            <div className="text-lg font-semibold text-center">{username}</div>
            <button 
              onClick={handleSignOut}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Game Panels */}
        <div className="w-full grid grid-cols-1 gap-6 mb-8">
          {/* Spin and Win Panel */}
          <div className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-row items-start mb-4">
              <div className="w-40 h-40 bg-blue-100 square flex items-center justify-center mr-4" style={{backgroundImage: 'url(./assets/spinwin.png)'}}>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Spin and Win Game</h2>
                <p className="mb-4 text-gray-600">Spin the wheel and win big! Test your luck with our exciting spin game with multiple prize tiers and bonuses.</p>
                <div className="flex justify-start">
                  <button
                    onClick={() => handlePlayGame('spin-and-win')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Russian Roulette Panel */}
          <div className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-row items-start mb-4">
              <div className="w-40 h-40 bg-blue-100 square flex items-center justify-center mr-4" style={{backgroundImage: 'url(./assets/RussianRoulette.png)'}}>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Russian Roulette</h2>
                <p className="mb-4 text-gray-600">Take the risk for massive rewards! This high-stakes game offers the biggest potential payouts with a thrilling gameplay experience.</p>
                <div className="flex justify-start">
                  <button
                    onClick={() => handlePlayGame('russian-roulette')}
                    className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Transaction Modals */}
        <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)}>
          <TransactionForm
            type="deposit"
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            amount={amount}
            setAmount={setAmount}
            loading={loading}
            transactionStatus={transactionStatus}
            onSubmit={handleDeposit}
          />
        </Modal>

        <Modal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)}>
          <TransactionForm
            type="withdraw"
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            amount={amount}
            setAmount={setAmount}
            loading={loading}
            transactionStatus={transactionStatus}
            onSubmit={handleWithdraw}
          />
        </Modal>

        {/* Game History */}
        <GameHistory
          betHistory={betHistory}
          clearHistory={clearHistory}
        />
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">About Us</h3>
              <p className="text-gray-300">We provide exciting gaming experiences and instant payouts.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-gray-300">Email: scriptsquad@gameportal.com</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Legal</h3>
              <p className="text-gray-300">Terms of Service | Privacy Policy</p>
              <p className="text-gray-300">© 2025 Game Portal. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;