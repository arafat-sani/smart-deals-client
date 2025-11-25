import React, { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Register = () => {
  const { signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      // Sign in with Google
      const result = await signInWithGoogle();

      const newUser = {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      };

      // Save user in DB
      await fetch("https://smart-deals-serversite.vercel.app/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      // Navigate to home page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="card bg-base-100 mx-auto w-full max-w-sm shadow-2xl mt-10">
      <h1 className="text-5xl font-bold text-center pt-4">Log In!</h1>
      <div className="card-body">
        {/* Email & Password placeholder (no form submit) */}
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="Email" />
          <label className="label">Password</label>
          <input type="password" className="input" placeholder="Password" />
          <div>
            <a className="link link-hover">Forgot password?</a>
          </div>
          <button type="button" className="btn btn-neutral mt-4">
            Login
          </button>
        </div>

        <div className="divider">OR</div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn bg-white text-black border-[#e5e5e5] mt-4 flex items-center justify-center"
        >
          <svg
            aria-label="Google logo"
            width="16"
            height="16"
            viewBox="0 0 512 512"
            className="mr-2"
          >
            <g>
              <path d="M0 0H512V512H0" fill="#fff" />
              <path
                fill="#34a853"
                d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
              />
              <path
                fill="#4285f4"
                d="M386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
              />
              <path
                fill="#fbbc02"
                d="M90 341a208 200 0 010-171l63 49q-12 37 0 73"
              />
              <path
                fill="#ea4335"
                d="M153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
              />
            </g>
          </svg>
          Login with Google
        </button>
      </div>
    </div>
  );
};
