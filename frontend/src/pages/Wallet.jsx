import { useState } from "react";

const WALLET_KEY = "collector-wallet-balance";

function readBalance() {
  const value = Number(localStorage.getItem(WALLET_KEY));
  return Number.isFinite(value) ? value : 0;
}

function Wallet() {
  const [balance, setBalance] = useState(readBalance);
  const [message, setMessage] = useState("");

  function addFunds(amount) {
    const nextBalance = balance + amount;
    localStorage.setItem(WALLET_KEY, String(nextBalance));
    setBalance(nextBalance);
    setMessage(`Cagnotte créditée de ${amount} € en mode démonstration.`);
  }

  return <section className="wallet-page"><header className="page-header"><div><p className="eyebrow">Mon espace financier</p><h1>Ma cagnotte</h1><p>Un aperçu de votre solde disponible pour vos futures trouvailles.</p></div></header><div className="wallet-card"><div><p>Solde disponible</p><strong>{balance.toFixed(2)} €</strong></div><span className="wallet-mark">✦</span></div><div className="wallet-actions"><h2>Ajouter des fonds</h2><p>Simulation locale pour préparer votre parcours d'achat.</p><div><button onClick={() => addFunds(10)}>+ 10 €</button><button onClick={() => addFunds(25)}>+ 25 €</button><button onClick={() => addFunds(50)}>+ 50 €</button></div></div>{message && <p className="success-message">{message}</p>}<p className="wallet-note">La cagnotte réelle et les paiements sécurisés seront connectés à un prestataire de paiement avant la mise en production.</p></section>;
}

export default Wallet;
