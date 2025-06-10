import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const LandingPage = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await fetch("http://localhost:5000/polls/active");
        if (!res.ok) throw new Error("Failed to fetch polls");

        const data = await res.json();
        console.log("Fetched Polls:", data);
        setPolls(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handleDeletePoll = async (pollId) => {
    if (!user || user.role !== "admin") {
      alert("Only admins can delete polls.");
      return;
    }

    console.log("Admin deleting poll:", pollId); // Debugging

    try {
      const res = await fetch(`http://localhost:5000/polls/delete/${pollId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.access}` },
      });

      if (!res.ok) throw new Error("Failed to delete poll");

      console.log("Poll deleted successfully:", pollId); // Debugging
      setPolls(polls.filter((poll) => poll.poll_id !== pollId)); // Instantly updates UI
    } catch (err) {
      console.error("Error deleting poll:", err.message);
      alert(err.message);
    }
  };

  return (
    <div className="container-fluid  text-light min-vh-100 py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <img
          src="/images/FootyVote_v3.png"
          alt="FootyVote Logo"
          className="logo"
        />
      </div>

      {/* User Welcome Section */}
      {user && (
        <div className="text-center mt-4 p-4 bg-dark text-light rounded shadow-lg">
          <h3 className="fw-bold text-warning">
            {user.username} is back on the field again!
          </h3>
        </div>
      )}

      {/* Logout & Create Poll Buttons (Same Line) */}
      {user && (
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button
            className="btn btn-outline-warning btn-lg"
            onClick={handleLogout}
          >
            Logout
          </button>
          {(user.role === "admin" || user.role === "advanced_registered") && (
            <button
              className="btn btn-outline-warning btn-lg"
              onClick={() => navigate("/create-poll")}
            >
              Create Poll
            </button>
          )}
        </div>
      )}

      {/* Authentication Buttons */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        {!user && (
          <>
            <button
              className="btn btn-outline-warning btn-lg"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="btn btn-outline-warning btn-lg"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>

      {/* Polls Section */}
      <h2 className="text-center text-warning mb-4">Latest Polls</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <div className="row g-4">
          {polls.map((poll) => (
            <div className="col-md-6" key={poll.poll_id}>
              <div className="card bg-dark text-light shadow-lg text-center border border-light">
                {" "}
                {/* Centered text */}
                <div className="card-body">
                  <h4 className="card-title text-warning">{poll.title}</h4>
                  <p className="card-text">{poll.votes} votes</p>
                  <button
                    className="btn btn-outline-warning btn-lg w-100 mt-2"
                    onClick={() => navigate(`/polls/${poll.poll_id}`)}
                  >
                    {" "}
                    {/* Wider button */}
                    Vote
                  </button>
                  {user?.role === "admin" && (
                    <button
                      className="btn btn-outline-danger w-100 mt-2"
                      onClick={() => handleDeletePoll(poll.poll_id)}
                    >
                      Delete Poll
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
