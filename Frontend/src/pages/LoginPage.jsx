import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Invalid login credentials");

      const data = await res.json();
      console.log("Logged-in user data:", data); // Debugging

      setUser({ ...data.user, access: data.access });
      navigate("/");
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
        <h2 className="text-center text-warning fw-bold">Login</h2>

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

        <button
          className="btn btn-warning w-100"
          onClick={() => handleLogin(formData)}
        >
          Login
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

export default LoginPage;
