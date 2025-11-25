import React, { useContext, useState } from 'react';

import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../Context/AuthContext';

export const MainRegister = () => {
  const { createUser, signInWithGoogle } = useContext(AuthContext);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Password Validation Function
  const validatePassword = (password) => {
    if (!/[A-Z]/.test(password)) return "Password must contain at least one Uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one Lowercase letter.";
    if (password.length < 6) return "Password must be at least 6 characters long.";
    return "";
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const photo = form.photo.value;
    const password = form.password.value;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    createUser(email, password)
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch((err) => setError(err.message));
  };

  // Google Login
  const handleGoogleLogin = () => {
    signInWithGoogle()
      .then(() => navigate(from, { replace: true }))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

      <form onSubmit={handleRegister}>

        {/* Name */}
        <div className="mb-3">
          <label className="font-semibold">Name</label>
          <input type="text" name="name" required className="w-full border px-3 py-2 rounded" />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="font-semibold">Email</label>
          <input type="email" name="email" required className="w-full border px-3 py-2 rounded" />
        </div>

        {/* Photo URL */}
        <div className="mb-3">
          <label className="font-semibold">Photo URL</label>
          <input type="text" name="photo" placeholder="https://example.com/photo.jpg" className="w-full border px-3 py-2 rounded" />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="font-semibold">Password</label>
          <input type="password" name="password" required className="w-full border px-3 py-2 rounded" />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Submit Button */}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register
        </button>
      </form>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-red-500 text-white py-2 mt-4 rounded hover:bg-red-600"
      >
        Continue with Google
      </button>

      <p className="mt-3 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 underline">Login</Link>
      </p>
    </div>
  );
};
