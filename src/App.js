import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/RegisterLogin'; // Import from RegisterLogin
import RegisterLogin from './components/RegisterLogin';
import HomePage from './components/HomePage';
import RussianRouletteGame from './components/RussianRouletteGame';
import RouletteGameplay from './components/RouletteGameplay';
import SpinWheel from './components/SpinWheel';
import './index.css';
import { useAuth } from './components/RegisterLogin';


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

// Separate component for routes to access AuthContext
const AppRoutes = () => {
  // Import ProtectedRoute from the AuthContext
  const { ProtectedRoute } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<RegisterLogin />} />
      
      {/* Protected game routes */}
      <Route 
        path="/game-hub" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/russian-roulette-game" 
        element={
          <ProtectedRoute>
            <RussianRouletteGame />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/roulette-gameplay" 
        element={
          <ProtectedRoute>
            <RouletteGameplay />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/spin-and-win-game" 
        element={
          <ProtectedRoute>
            <SpinWheel />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
export default App;