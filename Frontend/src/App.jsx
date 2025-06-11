import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreatePoll from "./pages/CreatePolls";
import PollingPage from "./pages/PollingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles

function App() {
  const [user, setUser] = useState(null); //Lifted state up for authentication

  const handleLogout = () => {
    setUser(null); // ✅ Clear user state on logout
  };
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>
        <Route
          path="/"
          element={<LandingPage user={user} handleLogout={handleLogout} />}
        />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-poll" element={<CreatePoll user={user} />} />
        <Route path="/polls/:pollId" element={<PollingPage user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
