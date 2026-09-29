import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api, { getMediaUrl } from "../api/api";
import { useAuth } from "../context/AuthContext";

const statusLabels = {
  APPROVED: "En ligne",
  PENDING: "En validation",
  REJECTED: "À corriger",
};

function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    api.get("products/")
      .then((response) => setProducts(response.data.filter((product) => product.seller_username === user.username)))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => ({
    total: products.length,
    online: products.filter((product) => product.moderation_status === "APPROVED").length,
    pending: products.filter((product) => product.moderation_status === "PENDING").length,
    value: products.reduce((total, product) => total + Number(product.price || 0), 0),
  }), [products]);

  if (loading) return <p className="page-loading">Ouverture de votre vitrine...</p>;

  return (
    <section className="seller-shop">
      <header className="seller-shop-header">
        <div className="seller-identity"><div className="seller-avatar">{user?.username?.slice(0, 2).toUpperCase()}</div><div><p className="eyebrow">Votre espace vendeur</p><h1>La vitrine de @{user?.username}</h1><p>Présentez vos pièces et suivez leur mise en ligne.</p></div></div>
        <Link className="seller-create-button" to="/create-product">+ Publier un objet</Link>
      </header>

      <div className="seller-stats"><div><span>Articles</span><strong>{stats.total}</strong></div><div><span>En ligne</span><strong>{stats.online}</strong></div><div><span>En validation</span><strong>{stats.pending}</strong></div><div><span>Valeur affichée</span><strong>{stats.value.toFixed(2)} €</strong></div></div>

      <div className="seller-list-heading"><div><p className="eyebrow">Inventaire</p><h2>Vos pièces</h2></div><span>{products.length} article{products.length > 1 ? "s" : ""}</span></div>

      {products.length ? <div className="seller-product-grid">{products.map((product) => <article className="seller-product-card" key={product.id}>
        <Link className="seller-product-image" to={`/products/${product.id}`}>
          {product.image ? <img src={getMediaUrl(product.image)} alt={product.title} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>✦</span>}
          <span className={`seller-status seller-status-${product.moderation_status?.toLowerCase()}`}>{statusLabels[product.moderation_status] || product.moderation_status}</span>
        </Link>
        <div className="seller-product-content"><p className="product-category">{product.category_name}</p><h3>{product.title}</h3><div className="seller-product-footer"><strong>{product.price} €</strong><span className={product.is_available ? "availability available" : "availability"}>{product.is_available ? "Disponible" : "Vendu"}</span></div></div>
      </article>)}</div> : <div className="seller-empty"><span>✦</span><h2>Votre vitrine est encore vide</h2><p>Publiez votre première pièce pour commencer votre collection.</p><Link to="/create-product">Ajouter un objet</Link></div>}
    </section>
  );
}

export default MyProducts;
