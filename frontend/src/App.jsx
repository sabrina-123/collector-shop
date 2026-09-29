import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import CreateProduct from "./pages/CreateProduct";
import MyProducts from "./pages/MyProducts";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Wallet from "./pages/Wallet";
import { ShopProvider } from "./context/ShopContext";


function PrivateRoute({
  children,
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function SellerRoute({
  children,
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!user.is_seller) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}


function AppRoutes() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/products/:id"
            element={
              <ProductDetail />
            }
          />

          <Route path="/cart" element={<Cart />} />

          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-product"
            element={
              <SellerRoute>
                <CreateProduct />
              </SellerRoute>
            }
          />

          <Route
            path="/my-products"
            element={
              <SellerRoute>
                <MyProducts />
              </SellerRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <AppRoutes />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;