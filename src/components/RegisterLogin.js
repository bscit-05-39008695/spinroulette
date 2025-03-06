import React, { useState, createContext, useContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

const CLIENT_ID = "256951004983-1ch28n1u9rjog2mj25i2sc4nnh4nu0rm.apps.googleusercontent.com";
// Get the backend URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5001";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const isAuthenticated = () => {
    return localStorage.getItem("token") !== null;
  };

  const login = (token) => {
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
  };

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

export const useAuth = () => {
  return useContext(AuthContext);
};

const RegisterLogin = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const toggleForm = () => setIsRegistering(!isRegistering);

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
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    
    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    console.log("Login attempt with:", { email, password: "***" });

    try {
      const response = await axios.post(`${BACKEND_URL}/login`, {
        email: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Login response:", response.status);
      
      let username = response.data.username;
      localStorage.setItem("username", username);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem('total_balance', response.data.balance);
      if (response.data && response.data.token) {
        login(response.data.token);
        navigate("/game-hub");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login failed", error);
      if (error.response) {
        console.log("Error status:", error.response.status);
        console.log("Error data:", error.response.data);
        setError(error.response.data.message || "Login failed. Check your credentials.");
      } else if (error.request) {
        setError("No response from server. Check your connection.");
      } else {
        setError("Login error. Please try again.");
      }
    }
  };

  // Rest of your component remains the same
  return (
    <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl text-center h-4/5 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-6">Login to GameHub</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <form className="flex flex-col gap-4 mb-6" onSubmit={handleLoginSubmit}>
        <input type="email" name="email" placeholder="Email" required className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <input type="password" name="password" placeholder="Password" required className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <button type="submit" className="w-full p-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">Login</button>
      </form>
     
      <p className="text-gray-700">
        Don't have an account? <span onClick={toggleForm} className="text-blue-600 font-bold cursor-pointer hover:underline">Register</span>
      </p>
    </div>
  );
};
const RegisterForm = ({ toggleForm }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Debug logging to verify data
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username");
    
    console.log("Form data:", { email, password, username });
    
    // Validation check
    if (!password || password.trim() === "") {
      setError("Password cannot be empty");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/register`, {
        username: username,
        email: email,
        password: password,
      });
      login(response.data.token);
      navigate("/game-hub");
    } catch (error) {
      console.error("Registration failed", error);
      if (error.response) {
        setError(error.response.data.message || "Registration failed");
      } else {
        setError("Connection error. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl text-center h-4/5 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-6">Create GameHub Account</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <form className="flex flex-col gap-4 mb-6" onSubmit={handleRegisterSubmit}>
        <input type="text" name="username" placeholder="Username" required className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <input type="email" name="email" placeholder="Email" required className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <input type="password" name="password" placeholder="Password" required className="w-full p-3.5 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <button type="submit" className="w-full p-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">Register</button>
      </form>
      <p className="text-gray-700">
        Already have an account? <span onClick={toggleForm} className="text-blue-600 font-bold cursor-pointer hover:underline">Login</span>
      </p>
    </div>
  );
};

export default RegisterLogin;