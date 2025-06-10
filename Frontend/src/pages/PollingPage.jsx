import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PollingPage = ({ user }) => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchPollDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/polls/${pollId}`);
        if (!res.ok) throw new Error("Failed to fetch poll details");

        const data = await res.json();
        console.log("Fetched poll details:", data); // Debugging
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
        console.log("Fetched poll results:", data); // Debugging

        // Ensure results is an array
        if (!Array.isArray(data.results)) {
          console.error(
            "Error: Expected results to be an array, received:",
            data.results
          );
          setResults([]); // Prevents UI crashes
          return;
        }

        setResults(Array.isArray(data.results) ? data.results : []); // store only results array
      } catch (err) {
        console.error("Results fetch error:", err.message);
        setResults([]); // Default empty array to prevent issues
      }
    };

    fetchPollDetails();
    fetchPollResults();
  }, [pollId]);

  useEffect(() => {
    console.log("PollingPage re-rendering with updated results:", results); // Debugging
  }, [results]);

  const handleVote = async () => {
    if (
      !user ||
      !["admin", "advanced_registered", "default_registered"].includes(
        user.role
      )
    ) {
      alert("Please create an account to vote.");
      return;
    }

    try {
      console.log("Submitting vote with token:", user.access); // Debugging
      const res = await fetch("http://localhost:5000/votes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access}`, // Required for authentication
        },
        body: JSON.stringify({
          poll_id: pollId,
          option_id: selectedOption,
        }),
      });

      if (!res.ok)
        throw new Error("Vote denied as you have voted in this poll before");

      // Fetch updated poll results immediately after voting
      const resultsRes = await fetch(`http://localhost:5000/votes/${pollId}`);
      const resultsData = await resultsRes.json();
      console.log("Updated poll results:", resultsData); // Debugging
      setResults([...resultsData.results]); // Update state
      //   setRefreshKey((prevKey) => prevKey + 1); // Triggers UI refresh
    } catch (err) {
      console.error("Voting error:", err.message);

      if (err.message.includes("Vote denied")) {
        // Checks for specific error message
        alert("Vote denied as you have voted in this poll before."); // Displays custom message
      } else {
        alert(err.message); // Shows other errors normally
      }
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/comments/${pollId}`);
        if (!res.ok) throw new Error("Failed to fetch comments");

        const data = await res.json();
        console.log("Fetched comments:", data); // Debugging response

        // Access `data.comments` directly
        if (!Array.isArray(data.comments)) {
          console.error(
            "Error: Expected an array but received:",
            data.comments
          );
          setComments([]); // Prevent UI crashes
          return;
        }

        setComments(
          data.comments.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        ); // Newest first
      } catch (err) {
        console.error("Error fetching comments:", err.message);
      }
    };

    fetchComments();
  }, [pollId]);

  const handlePostComment = async () => {
    if (
      !user ||
      !["admin", "advanced_registered", "default_registered"].includes(
        user.role
      )
    ) {
      alert("You must be logged in to post a comment.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/comments/${pollId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access}`,
        },
        body: JSON.stringify({ comment_text: newComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post comment");

      console.log("New comment added:", data); // Debugging
      setComments([{ ...data.comment, username: user.username }, ...comments]); // Adds username from user state
      setNewComment(""); // Clears input after posting
    } catch (err) {
      alert(err.message);
      console.error("Error posting comment:", err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const commentToDelete = comments.find((c) => c.comment_id === commentId);

    if (!commentToDelete) {
      alert("Comment not found.");
      return;
    }

    console.log(
      "Logged-in User ID:",
      user?.userId,
      "Comment Owner ID:",
      commentToDelete?.user_id
    ); // Debugging

    if (
      String(commentToDelete.user_id) !== String(user?.userId) &&
      user.role !== "admin"
    ) {
      alert("You can only delete your own comments unless you're an admin.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.access}` },
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      console.log("Comment deleted successfully:", commentId); // Debugging
      setComments(comments.filter((c) => c.comment_id !== commentId)); // Instantly updates UI
    } catch (err) {
      alert(err.message);
      console.error("Error deleting comment:", err.message);
    }
  };

  const handleEditComment = async (commentId) => {
    const commentToEdit = comments.find((c) => c.comment_id === commentId);

    if (!commentToEdit) {
      alert("Comment not found.");
      return;
    }

    console.log("Trying to edit comment:", commentId);
    console.log(
      "Logged-in User ID:",
      user?.userId,
      "Comment Owner ID:",
      commentToEdit?.user_id
    ); // Debugging

    if (String(commentToEdit.user_id) !== String(user?.userId)) {
      console.error("User does not have permission to edit this comment.");
      alert("Only the author can edit this comment.");
      return;
    }

    const editedText = prompt("Edit your comment:", commentToEdit.comment_text);
    if (!editedText) return;

    try {
      const res = await fetch(
        `http://localhost:5000/comments/comments/${commentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.access}`,
          },
          body: JSON.stringify({ comment_text: editedText }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to edit comment");

      setComments(
        comments.map((c) =>
          c.comment_id === commentId
            ? { ...data.comment, username: c.username }
            : c
        )
      );
    } catch (err) {
      console.error("Error editing comment:", err.message);
      alert(err.message);
    }
  };

  if (!poll) return <h2>Loading poll...</h2>;

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow-lg border-0"
        style={{ maxWidth: "1200px", width: "100%" }}
      >
        <h1 className="text-center text-warning fw-bold">{poll.title}</h1>
        <h2 className="text-center text-dark fw-bold">Cast your vote!</h2>

        {/* Voting Options */}
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
          {" "}
          {/* Added margin-bottom */}
          {options.map((opt) => (
            <div
              key={opt.option_id}
              className={`card p-3 shadow-lg text-center ${
                selectedOption === opt.option_id ? "border-warning" : "border-2"
              }`}
              style={{ width: "200px", cursor: "pointer" }}
              onClick={() => setSelectedOption(opt.option_id)}
            >
              <h5 className="fw-bold">{opt.option_text}</h5>
            </div>
          ))}
        </div>

        <button className="btn btn-warning w-70" onClick={handleVote}>
          Submit Vote
        </button>

        {/* Poll Results */}
        <h2 className="text-center text-dark fw-bold mt-4">Current Results:</h2>
        {Array.isArray(results) && results.length > 0 ? (
          options.map((opt) => {
            const match = results.find((r) => r.option_id === opt.option_id);
            return (
              <p key={opt.option_id} className="text-secondary fs-5">
                {opt.option_text}:{" "}
                <strong>{match ? match.vote_count : 0}</strong> votes
              </p>
            );
          })
        ) : (
          <p className="text-center text-muted">
            No votes yet or loading results...
          </p>
        )}

        {/* Comments Section */}
        <h2 className="text-center text-dark fw-bold mt-4">
          Time to be a Football Pundit!
        </h2>
        <h3 className="text-center text-secondary">Share your opinions</h3>

        {user &&
        ["admin", "advanced_registered", "default_registered"].includes(
          user.role
        ) ? (
          <div className="mb-3">
            <textarea
              className="form-control border-warning border-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              rows="3"
            ></textarea>
            <button
              className="btn btn-warning w-100 mt-2"
              onClick={handlePostComment}
            >
              Submit Comment
            </button>
          </div>
        ) : (
          <p className="text-center text-muted">Login to post a comment.</p>
        )}

        {/* Display Comments */}
        <div className="mt-3 fs-5">
          {comments.map((comment) => (
            <div
              key={comment.comment_id}
              className="border border-warning border-2 p-2 rounded mb-4"
            >
              <p>
                <strong>{comment.username || "Unknown User"}:</strong>{" "}
                {comment.comment_text}
              </p>

              {user && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => handleEditComment(comment.comment_id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteComment(comment.comment_id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-3">
          <button
            className="btn btn-link text-secondary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollingPage;
