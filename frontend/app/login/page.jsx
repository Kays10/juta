"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Invalid email or password");
      return;
    }
    router.push("/management");
  }

  return (
    <div className="page">
      <main className="main">
        <section className="section">
          <div className="container auth-container">
            <div className="auth-card">
              <h1>Management Login</h1>
              <p>Sign in to access the learner management portal.</p>
              <form onSubmit={handleSubmit}>
                <label>
                  Work email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                {error && <p className="form-error">{error}</p>}
                <button
                  type="submit"
                  className="button button-primary button-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
