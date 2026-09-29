import { Link } from "react-router-dom";
import { Bell, Heart, LogOut, MessageCircle, Package, ShoppingBag, WalletCards } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

function NavItem({ to, label, icon: Icon, count }) {
  return <Link className="nav-item" to={to} title={label} aria-label={label}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count > 0 && <b className="nav-count">{count}</b>}</Link>;
}

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, favorites } = useShop();

  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        <img src="/collector-mark.svg" alt="" />
        <span className="logo-name">Collector<span>.shop</span></span>
      </Link>

      <div className="nav-links">
        <Link to="/">Catalogue</Link>
        <NavItem to="/cart" label="Panier" icon={ShoppingBag} count={cartCount} />

        {user && (
          <>
            <NavItem to="/favorites" label="Favoris" icon={Heart} count={favorites.length} />
            <NavItem to="/orders" label="Commandes" icon={Package} />
            <NavItem to="/notifications" label="Alertes" icon={Bell} />
            <NavItem to="/messages" label="Messages" icon={MessageCircle} />
            <NavItem to="/wallet" label="Cagnotte" icon={WalletCards} />
          </>
        )}

        {user?.is_seller && (
          <>
            <Link to="/my-products">
              Ma vitrine
            </Link>

            <Link to="/create-product">
              Vendre
            </Link>
          </>
        )}

        {!user ? (
          <>
            <Link to="/login">
              Connexion
            </Link>

            <Link to="/register">
              Rejoindre
            </Link>
          </>
        ) : (
          <button className="logout-button" onClick={logout} title="Déconnexion" aria-label="Déconnexion"><LogOut size={16} /><span>Déconnexion</span></button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;