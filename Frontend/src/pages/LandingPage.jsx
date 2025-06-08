import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div>
      <h1>FootyVote Polls</h1>

      {!user ? (
        <div>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.username}</h2>
          <button onClick={handleLogout}>Logout</button>{" "}
          {/* Create Poll button (Only for admins & advanced_registered users) */}
          {(user.role === "admin" || user.role === "advanced_registered") && (
            <button onClick={() => navigate("/create-poll")}>
              Create Poll
            </button>
          )}
        </div>
      )}

      <h3>Latest Polls</h3>
      {loading ? (
        <p>Loading polls...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        polls.map((poll) => (
          <div key={poll.poll_id}>
            <h4>
              {poll.title} - {poll.votes} votes
            </h4>
            <button onClick={() => navigate(`/polls/${poll.poll_id}`)}>
              Vote
            </button>{" "}
            {/* ✅ Navigate to PollingPage */}
          </div>
        ))
      )}
    </div>
  );
};

export default LandingPage;
