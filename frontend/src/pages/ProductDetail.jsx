import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api, { getMediaUrl } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { findCollectionItem } from "../data/collection";
import { useShop } from "../context/ShopContext";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addToCart, toggleFavorite, isFavorite } = useShop();

  const [product, setProduct] =
    useState(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    api
      .get(`products/${id}/`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch(() => {
        setProduct(findCollectionItem(id) || null);
      });
  }, [id]);

  async function buyProduct() {
    if (product.is_demo) {
      setMessage("Cette pièce est présentée dans la sélection éditoriale.");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await api.post(
        "orders/",
        {
          product: product.id,
        }
      );

      setMessage(
        `Commande #${response.data.id} créée.`
      );
    } catch (error) {
      setMessage(
        error.response?.data?.product ||
          "Impossible de commander."
      );
    }
  }

  async function followProduct() {
    if (product.is_demo) {
      setMessage("Connectez-vous pour suivre cette pièce dans vos envies.");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "interests/",
        {
          product: product.id,
        }
      );

      setMessage(
        "Produit ajouté à vos intérêts."
      );
    } catch {
      setMessage(
        "Impossible d'ajouter ce produit."
      );
    }
  }

  async function contactSeller() {
    if (product.is_demo) {
      setMessage("Cette sélection sera bientôt ouverte aux conversations.");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await api.post(
        "conversations/",
        {
          product: product.id,
        }
      );

      navigate(
        `/messages?conversation=${response.data.id}`
      );
    } catch {
      setMessage(
        "Impossible d'ouvrir la conversation."
      );
    }
  }

  if (!product) {
    return <p className="page-error">Cette pièce n'est plus disponible.</p>;
  }

  return (
    <div className="product-detail">
      {product.image && (
        <img
          className="detail-image"
          src={getMediaUrl(product.image)}
          alt={product.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = getMediaUrl(product.fallbackImage || "/collection/objects.jpg");
          }}
        />
      )}

      <div>
        <p className="eyebrow">Pièce de collection</p>
        <h1>{product.title}</h1>

        <div className="detail-meta">
          <span>{product.category_name}</span>
          <span>Par {product.seller_username}</span>
        </div>

        <p className="detail-description">
          {product.description}
        </p>

        <h2 className="detail-price">
          {product.price} €
        </h2>

        {message && (
          <p>{message}</p>
        )}

        <div className="detail-actions">
          {product.is_available && <button onClick={() => { addToCart(product); setMessage("Pièce ajoutée au panier."); }}>Ajouter au panier</button>}
          {product.is_available && <button onClick={buyProduct}>Acheter maintenant</button>}
          <button onClick={() => { toggleFavorite(product); setMessage(isFavorite(product.id) ? "Retiré de vos favoris." : "Ajouté à vos favoris."); }}>{isFavorite(product.id) ? "♥ Favori" : "♡ Favoris"}</button>
          <button onClick={followProduct}>Suivre</button>
          <button onClick={contactSeller}>Contacter</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;