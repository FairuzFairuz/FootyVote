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
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow-lg border-0"
        style={{ maxWidth: "1000px", width: "100%" }}
      >
        <h2 className="text-center text-warning fw-bold">Register</h2>

        {success && <p className="text-success text-center">{success}</p>}
        {error && <p className="text-danger text-center">{error}</p>}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your username"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="default_registered">Default Registered</option>
            <option value="advanced_registered">Advanced Registered</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          className="btn btn-warning w-100"
          onClick={() => handleRegister(formData)}
        >
          Register
        </button>

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

export default RegisterPage;
