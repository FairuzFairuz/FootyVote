import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "default_registered",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Registration failed");

      setSuccess("Registration successful! Please log in."); // Show message
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {success && <p style={{ color: "green" }}>{success}</p>}{" "}
      {/* Display success message */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={() => navigate("/")}>Home</button>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <select
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="default_registered">Default Registered</option>
        <option value="advanced_registered">Advanced Registered</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterPage;
