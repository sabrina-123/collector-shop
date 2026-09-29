import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    try {
      await login(
        form.username,
        form.password
      );

      navigate("/");
    } catch {
      setError(
        "Nom d'utilisateur ou mot de passe incorrect."
      );
    }
  }

  return (
    <div className="form-page">
      <h1>Connexion</h1>

      <p className="form-intro">Retrouvez votre collection et les pièces que vous gardez à l'œil.</p>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Nom d'utilisateur
        </label>

        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label>
          Mot de passe
        </label>

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;