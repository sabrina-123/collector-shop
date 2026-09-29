# Frontend Collector.shop

Interface React + Vite de Collector.shop, marketplace d'objets de collection.

## Lancer le frontend

Installer les dépendances :

```powershell
npm install
```

Démarrer le serveur de développement :

```powershell
npm run dev
```

L'application sera disponible sur `http://localhost:5173/`.

Créer un build :

```powershell
npm run build
```

Vérifier le lint :

```powershell
npm run lint
```

## Connexion à l'API

Créer `frontend/.env` si l'API n'utilise pas l'adresse locale par défaut :

```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

Le client Axios ajoute automatiquement le token JWT et renouvelle le token d'accès lorsqu'il expire.

## Fonctionnalités

- Catalogue filtrable par catégorie et prix.
- Recherche et tri des objets.
- Fiches produits.
- Inscription acheteur ou vendeur.
- Publication d'une annonce avec upload photo.
- Commandes et paiements simulés.
- Notifications filtrables.
- Messagerie vendeur/acheteur.
- Fallback local pour les photos de démonstration.

## Photos du catalogue

Les photos fournies manuellement sont dans :

```text
public/catalog-images/
```

Chaque catégorie possède son propre dossier. Le catalogue utilise au maximum 25 articles par catégorie. Les photos `.jpg`, `.jpeg`, `.png` et `.webp` sont supportées, y compris avec espaces et accents dans les noms.

Voir le guide : [public/catalog-images/README.md](public/catalog-images/README.md).

## Organisation du code

```text
src/
├── api/              # Client Axios et gestion JWT
├── components/       # Navbar
├── context/          # AuthContext
├── data/             # Collection de démonstration
├── pages/            # Catalogue, auth, produits, commandes, messages
├── App.jsx           # Routes et protections d'accès
├── App.css           # Styles des pages
└── index.css         # Styles globaux et design system
```

Pour l'installation complète backend + frontend, consulter le [README principal](../README.md).
