import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

function CreateProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    image: null,
  });

  const [error, setError] =
    useState("");

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  useEffect(() => {
    api
      .get("categories/")
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => {
        setError("Impossible de charger les catégories. Vérifiez que le backend est démarré.");
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  function handleChange(event) {
    const { name, files, value } = event.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([name, value]) => {
        if (value !== null && value !== "") payload.append(name, value);
      });
      await api.post("products/", payload);

      navigate("/my-products");
    } catch (error) {
      setError(
        JSON.stringify(
          error.response?.data ||
            "Erreur."
        )
      );
    }
  }

  return (
    <div className="form-page">
      <h1>Publier un objet</h1>

      <p>
        L'objet sera contrôlé avant
        sa publication.
      </p>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Catégorie</label>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          disabled={categoriesLoading || categories.length === 0}
        >
          <option value="">
            {categoriesLoading ? "Chargement des catégories..." : "Choisir une catégorie"}
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}
        </select>

        <label>Titre</label>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Prix (€)</label>

        <input
          type="number"
          step="0.01"
          min="0.01"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <label>Photo de l'objet</label>
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={handleChange} />

        <button type="submit">
          Envoyer pour validation
        </button>
      </form>
    </div>
  );
}

export default CreateProduct;