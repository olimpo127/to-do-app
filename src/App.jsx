import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./views/Home";
import Auth from "./views/Auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Sets to true if user exists, else false
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [auth]);

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
