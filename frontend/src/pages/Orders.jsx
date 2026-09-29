import {
  useEffect,
  useState,
} from "react";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Orders() {
  const { user } = useAuth();

  const [orders, setOrders] =
    useState([]);

  async function loadOrders() {
    const response = await api.get(
      "orders/"
    );

    setOrders(response.data);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function pay(orderId) {
    try {
      await api.post(
        "payments/simulate/",
        {
          order: orderId,
          result: "success",
        }
      );

      await loadOrders();
    } catch {
      alert(
        "Le paiement n'a pas pu être effectué."
      );
    }
  }

  return (
    <div>
      <h1>Mes commandes et ventes</h1>

      {orders.map((order) => {
        const isBuyer =
          order.buyer_username ===
          user?.username;

        return (
          <div
            className="list-card"
            key={order.id}
          >
            <h3>
              {order.product_title}
            </h3>

            <p>
              {isBuyer
                ? "Achat"
                : "Vente"}
            </p>

            <p>
              Prix :
              {" "}
              {order.unit_price} €
            </p>

            <p>
              Statut :
              {" "}
              {order.status}
            </p>

            {isBuyer &&
              order.status ===
                "PENDING" && (
                <button
                  onClick={() =>
                    pay(order.id)
                  }
                >
                  Simuler le paiement
                </button>
              )}
          </div>
        );
      })}
    </div>
  );
}

export default Orders;