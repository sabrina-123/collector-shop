import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    is_seller: false,
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    try {
      await api.post(
        "auth/register/",
        form
      );

      navigate("/login");
    } catch (error) {
      const data = error.response?.data;

      setError(
        data
          ? JSON.stringify(data)
          : "Erreur lors de l'inscription."
      );
    }
  }

  return (
    <div className="form-page">
      <h1>Créer un compte</h1>

      <p className="form-intro">Rejoignez une communauté qui préfère les objets avec une histoire.</p>

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

        <label>Email</label>

        <input
          type="email"
          name="email"
          value={form.email}
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

        <label>
          Confirmation
        </label>

        <input
          type="password"
          name="password_confirm"
          value={form.password_confirm}
          onChange={handleChange}
          required
        />

        <label className="checkbox">
          <input
            type="checkbox"
            name="is_seller"
            checked={form.is_seller}
            onChange={handleChange}
          />

          Je souhaite également vendre
          des objets
        </label>

        <button type="submit">
          Créer mon compte
        </button>
      </form>
    </div>
  );
}

export default Register;