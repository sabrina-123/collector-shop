import { Link } from "react-router-dom";

import { getMediaUrl } from "../api/api";
import { useShop } from "../context/ShopContext";

function Favorites() {
  const { favorites, toggleFavorite } = useShop();

  return <section className="favorites-page"><header className="page-header"><div><p className="eyebrow">Votre sélection privée</p><h1>Mes favoris</h1><p>Les objets que vous gardez à l'œil.</p></div><span>{favorites.length} pièce{favorites.length > 1 ? "s" : ""}</span></header>{favorites.length ? <div className="product-grid">{favorites.map((product) => <article className="product-card" key={product.id}><div className="product-image"><Link to={`/products/${product.id}`}>{product.image ? <img src={getMediaUrl(product.image)} alt={product.title} /> : <span className="image-placeholder">✦</span>}</Link><button className="favorite-button active" onClick={() => toggleFavorite(product)} aria-label={`Retirer ${product.title} des favoris`}>♥</button></div><div className="product-card-body"><p className="product-category">{product.category_name}</p><h3>{product.title}</h3><p className="product-seller">@{product.seller_username}</p><div className="product-footer"><strong className="product-price">{product.price} €</strong><Link className="product-link" to={`/products/${product.id}`}>Voir</Link></div></div></article>)}</div> : <div className="empty-state"><span className="empty-notification-mark">♡</span><h2>Pas encore de favoris</h2><p>Appuyez sur le cœur d'un article pour le retrouver ici.</p><Link to="/">Parcourir le catalogue</Link></div>}</section>;
}

export default Favorites;
