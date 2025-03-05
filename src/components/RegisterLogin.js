import React, { useState, createContext, useContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, Navigate } from "react-router-dom";

const CLIENT_ID = "256951004983-1ch28n1u9rjog2mj25i2sc4nnh4nu0rm.apps.googleusercontent.com";

// Create an auth context
export const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };

  // Login function
  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
  };

  // Protected route component that redirects to login if not authenticated
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, ProtectedRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

const RegisterLogin = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 to-blue-900">
        {isRegistering ? <RegisterForm toggleForm={toggleForm} /> : <LoginForm toggleForm={toggleForm} />}
      </div>
    </GoogleOAuthProvider>
  );
};

const LoginForm = ({ toggleForm }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    
    // Set authentication status
    login();
    
    // Redirect to game hub
    navigate('/game-hub');
  };

  const handleSuccess = (response) => {
    console.log("Google Login Success:", response);
    
    // Set authentication status
    login();
    
    // Redirect to game hub
    navigate('/game-hub');
  };

  const handleError = () => {
    console.log("Google Login Failed");
  };

  return (
    <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl text-center h-4/5 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-6">Login to GameHub</h2>
      <form className="flex flex-col gap-4 mb-6" onSubmit={handleLoginSubmit}>
        <input 
          type="text" 
          placeholder="Email" 
          required 
          className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          required 
          className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          type="submit" 
          className="w-full p-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          Login
        </button>
      </form>
      <div className="mb-6">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
      <p className="text-gray-700">
        Don't have an account?{" "}
        <span onClick={toggleForm} className="text-blue-600 font-bold cursor-pointer hover:underline">
          Register
        </span>
      </p>
    </div>
  );
};

const RegisterForm = ({ toggleForm }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would create the account here
    
    // Set authentication status
    login();
    
    // Redirect to game hub
    navigate('/game-hub');
  };

  const handleSuccess = (response) => {
    console.log("Google Signup Success:", response);
    
    // Set authentication status
    login();
    
    // Redirect to game hub
    navigate('/game-hub');
  };

  const handleError = () => {
    console.log("Google Signup Failed");
  };

  return (
    <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl text-center h-4/5 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-6">Create New Account</h2>
      <form className="flex flex-col gap-4 mb-6" onSubmit={handleRegisterSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          required 
          className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input 
          type="email" 
          placeholder="Email" 
          required 
          className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          required 
          className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          required 
          className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          type="submit" 
          className="w-full p-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          Register
        </button>
      </form>
      <div className="mb-6">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
      <p className="text-gray-700">
        Already have an account?{" "}
        <span onClick={toggleForm} className="text-blue-600 font-bold cursor-pointer hover:underline">
          Login
        </span>
      </p>
    </div>
  );
};

export default RegisterLogin;