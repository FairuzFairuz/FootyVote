import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const [user, setUser] = useState(null); //Lifted state up for authentication

  const handleLogout = () => {
    setUser(null); // ✅ Clear user state on logout
  };
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage user={user} handleLogout={handleLogout} />}
        />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
