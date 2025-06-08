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
    <div>
      <h2>Create a New Poll</h2>
      <input
        type="text"
        placeholder="Poll Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <h3>Category</h3>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Players">Players</option>
        <option value="Stadiums">Stadiums</option>
        <option value="Managers">Managers</option>
        <option value="Teams">Teams</option>
        <option value="Others">Others</option>
      </select>

      <h3>Poll Options</h3>
      {options.map((option, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => {
              const updatedOptions = [...options];
              updatedOptions[index] = e.target.value;
              setOptions(updatedOptions);
            }}
          />
          {options.length > 2 && (
            <button onClick={() => handleRemoveOption(index)}>Remove</button>
          )}
        </div>
      ))}
      {options.length < 3 && (
        <button onClick={handleAddOption}>Add Option</button>
      )}

      <button onClick={handleCreatePoll}>Submit Poll</button>
      <button onClick={() => navigate("/")}>Home</button>
    </div>
  );
};

export default CreatePoll;
