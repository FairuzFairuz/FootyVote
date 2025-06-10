import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePoll = ({ user }) => {
  const navigate = useNavigate();

  // Ensure only authorized users access this page
  if (!user || (user.role !== "admin" && user.role !== "advanced_registered")) {
    useEffect(() => {
      navigate("/"); // Redirect unauthorized users
    }, []);
    return null;
  }

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Players");
  const [options, setOptions] = useState(["", ""]); // Min 2 options

  const handleAddOption = () => {
    if (options.length < 3) setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreatePoll = async () => {
    console.log("Creating poll with userId:", user?.userId); // Debugging

    if (!title.trim() || options.some((opt) => !opt.trim())) {
      alert("Poll title and options cannot be empty!");
      return;
    }

    try {
      const pollData = {
        created_by: user.userId,
        title,
        category, // Category selection remains
        options,
      };
      console.log("Poll creation payload:", pollData); // Debugging

      const res = await fetch("http://localhost:5000/polls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access}`,
        },
        body: JSON.stringify(pollData),
      });

      if (!res.ok) throw new Error("Failed to create poll");

      navigate("/"); // Redirect after success
    } catch (err) {
      console.error("Poll creation error:", err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow-lg border-0"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <h2 className="text-center text-warning fw-bold">Create a New Poll</h2>

        {/* Poll Title */}
        <div className="mb-3">
          <label className="form-label">Poll Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter poll title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Players">Players</option>
            <option value="Stadiums">Stadiums</option>
            <option value="Managers">Managers</option>
            <option value="Teams">Teams</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Poll Options */}
        <div className="mb-3">
          <label className="form-label">Poll Options</label>
          {options.map((option, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...options];
                  updatedOptions[index] = e.target.value;
                  setOptions(updatedOptions);
                }}
              />
              {options.length > 2 && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleRemoveOption(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {options.length < 5 && (
            <button
              className="btn btn-outline-warning w-100 mt-2"
              onClick={handleAddOption}
            >
              Add Option
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-warning w-100"
          onClick={() => handleCreatePoll({ title, category, options })}
        >
          Submit Poll
        </button>

        {/* Navigation */}
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

export default CreatePoll;
