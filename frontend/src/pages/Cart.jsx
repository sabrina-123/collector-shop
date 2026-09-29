import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import api, { getMediaUrl } from "../api/api";
import { useShop } from "../context/ShopContext";

function Cart() {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart } = useShop();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function checkout() {
    const realItems = cart.filter((item) => !item.is_demo);
    if (!realItems.length) {
      setMessage("Les pièces éditoriales sont consultables, mais seules les annonces réelles peuvent être commandées.");
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all(realItems.map((item) => api.post("orders/", { product: item.id })));
      navigate("/orders");
    } catch (error) {
      setMessage(error.response?.data?.product || "Impossible de créer la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="cart-page">
    <header className="page-header"><div><p className="eyebrow">Votre sélection</p><h1>Mon panier</h1><p>Les pièces que vous souhaitez garder près de vous.</p></div><span>{cart.length} article{cart.length > 1 ? "s" : ""}</span></header>
    {message && <p className="message-error">{message}</p>}
    {cart.length ? <div className="cart-layout"><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><div className="cart-item-image">{item.image && <img src={getMediaUrl(item.image)} alt={item.title} />}</div><div className="cart-item-copy"><p className="product-category">{item.category_name}</p><h2>{item.title}</h2><p>@{item.seller_username}</p><strong>{item.price} €</strong></div><button className="cart-remove" onClick={() => removeFromCart(item.id)}>Retirer</button></article>)}</div><aside className="cart-summary"><p className="eyebrow">Résumé</p><div><span>Sous-total</span><strong>{cartTotal.toFixed(2)} €</strong></div><div><span>Livraison</span><span>À définir</span></div><hr /><div className="cart-total"><span>Total</span><strong>{cartTotal.toFixed(2)} €</strong></div><button onClick={checkout} disabled={submitting}>{submitting ? "Création..." : "Passer la commande"}</button><small>Le paiement réel sera ajouté avant la mise en production.</small></aside></div> : <div className="empty-state"><span className="empty-notification-mark">✦</span><h2>Votre panier est vide</h2><p>Ajoutez une pièce qui vous plaît depuis le catalogue.</p><Link to="/">Explorer les objets</Link></div>}
  </section>;
}

export default Cart;
