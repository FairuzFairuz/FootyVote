import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PollingPage = ({ user }) => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPollDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/polls/${pollId}`);
        if (!res.ok) throw new Error("Failed to fetch poll details");

        const data = await res.json();
        console.log("Fetched poll details:", data); // ✅ Debugging
        setPoll(data);
        setOptions(data.options);
      } catch (err) {
        console.error("Poll fetch error:", err.message);
      }
    };

    const fetchPollResults = async () => {
      try {
        const res = await fetch(`http://localhost:5000/votes/${pollId}`);
        if (!res.ok) throw new Error("Failed to fetch results");

        const data = await res.json();
        console.log("Fetched poll results:", data); // ✅ Debugging entire response

        // ✅ Ensure results is an array
        if (!Array.isArray(data.results)) {
          console.error(
            "Error: Expected results to be an array, received:",
            data.results
          );
          setResults([]); // ✅ Prevents UI crashes
          return;
        }

        setResults(Array.isArray(data.results) ? data.results : []); // ✅ Store only results array
      } catch (err) {
        console.error("Results fetch error:", err.message);
        setResults([]); // ✅ Default empty array to prevent issues
      }
    };

    fetchPollDetails();
    fetchPollResults();
  }, [pollId]);

  useEffect(() => {
    console.log("PollingPage re-rendering with updated results:", results); // ✅ Debugging
  }, [results]);

  const handleVote = async () => {
    if (
      !user ||
      !["admin", "advanced_registered", "default_registered"].includes(
        user.role
      )
    ) {
      alert("You don't have permission to vote.");
      return;
    }

    try {
      console.log("Submitting vote with token:", user.access); // Debugging
      const res = await fetch("http://localhost:5000/votes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access}`, // ✅ Required for authentication
        },
        body: JSON.stringify({
          poll_id: pollId,
          option_id: selectedOption,
        }),
      });

      if (!res.ok)
        throw new Error("Vote denied as you have voted in this poll before");

      // ✅ Fetch updated poll results immediately after voting
      const resultsRes = await fetch(`http://localhost:5000/votes/${pollId}`);
      const resultsData = await resultsRes.json();
      console.log("Updated poll results:", resultsData); // ✅ Debugging
      setResults([...resultsData.results]); // ✅ Update state
      setRefreshKey((prevKey) => prevKey + 1); // ✅ Triggers UI refresh
    } catch (err) {
      console.error("Voting error:", err.message);

      if (err.message.includes("Vote denied")) {
        // ✅ Checks for specific error message
        alert("Vote denied as you have voted in this poll before."); // ✅ Displays custom message
      } else {
        alert(err.message); // ✅ Shows other errors normally
      }
    }
  };

  if (!poll) return <h2>Loading poll...</h2>;

  return (
    <div key={JSON.stringify(results)}>
      {" "}
      {/* ✅ Forces UI refresh when results change */}
      <h2>{poll.title}</h2>
      <h3>Vote for an option:</h3>
      {options.map((opt) => (
        <div key={opt.option_id}>
          <label>
            <input
              type="radio"
              name="vote"
              value={opt.option_id}
              onChange={() => setSelectedOption(opt.option_id)}
            />
            {opt.option_text}
          </label>
        </div>
      ))}
      <button onClick={handleVote}>Submit Vote</button>
      <h3>Current Results:</h3>
      {console.log("Results inside return:", results)}
      {Array.isArray(results) && results.length > 0 ? (
        options.map((opt) => {
          const match = results.find((r) => r.option_id === opt.option_id);
          return (
            <p key={opt.option_id}>
              {opt.option_text}: {match ? match.vote_count : 0} votes
            </p>
          );
        })
      ) : (
        <p>No votes yet or loading results...</p>
      )}
      <button onClick={() => navigate("/")}>Back</button>
    </div>
  );
};

export default PollingPage;
