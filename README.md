# Collector.shop

Marketplace de seconde main dédié aux objets de collection : pièces de monnaie, poupées anciennes, photographie vintage, vinyles, objets anciens, arts décoratifs, céramique, mobilier et publicité vintage.

Le projet est composé de deux applications :

- `backend/` : API Django REST Framework, authentification JWT, modération, commandes, paiements simulés, notifications et messagerie.
- `frontend/` : interface React + Vite, catalogue filtrable, comptes acheteur/vendeur, publication d'objets et messagerie.

## Prérequis

- Windows PowerShell
- Python 3.10 ou supérieur
- Node.js et npm
- Un navigateur récent

Sur cette machine, Python 3.10 est installé ici :

```powershell
C:\Program Files\Python310\python.exe
```

Le lanceur `py` fonctionne pour `pip`, mais `python manage.py` peut utiliser un autre interpréteur selon la configuration Windows. Les commandes ci-dessous utilisent donc l'exécutable Python explicite quand c'est nécessaire.

## Installation du backend

Depuis la racine du projet :

```powershell
cd backend
py -m pip install -r requirements.txt
```

Vérifier la configuration :

```powershell
& "C:\Program Files\Python310\python.exe" manage.py check
```

Appliquer les migrations :

```powershell
& "C:\Program Files\Python310\python.exe" manage.py migrate
```

Créer un compte administrateur :

```powershell
& "C:\Program Files\Python310\python.exe" manage.py createsuperuser
```

Démarrer l'API :

```powershell
& "C:\Program Files\Python310\python.exe" manage.py runserver
```

L'API est disponible sur `http://127.0.0.1:8000/`.

## Installation du frontend

Dans un autre terminal :

```powershell
cd frontend
npm install
npm run dev
```

L'interface est disponible sur `http://localhost:5173/`.

Pour créer un build de production :

```powershell
npm run build
```

Pour contrôler le code frontend :

```powershell
npm run lint
```

L'URL de l'API peut être personnalisée avec un fichier `frontend/.env` :

```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

Sans variable d'environnement, le frontend utilise cette même URL locale par défaut.

## Parcours principal

### Visiteur

- Consulter le catalogue public.
- Rechercher un objet.
- Filtrer par catégorie.
- Filtrer par prix minimum et maximum.
- Trier par prix.
- Ouvrir la fiche détaillée d'un objet.
- Se connecter ou créer un compte.

### Acheteur

Après connexion, un acheteur peut :

- Commander un produit disponible.
- Simuler le paiement depuis la page commandes.
- Suivre un objet dans ses intérêts.
- Contacter le vendeur.
- Consulter ses notifications.
- Échanger dans la messagerie.

### Vendeur

Lors de l'inscription, cocher l'option vendeur. Un vendeur peut ensuite :

- Publier un objet.
- Choisir une catégorie.
- Ajouter titre, description, prix et photo.
- Consulter ses produits.
- Modifier le prix d'un produit.
- Recevoir des notifications de modération et de changement de prix.

Les nouvelles annonces sont créées avec le statut `PENDING` et ne sont pas visibles dans le catalogue public avant validation.

## Validation des annonces

La validation se fait dans l'administration Django :

1. Démarrer le backend.
2. Ouvrir `http://127.0.0.1:8000/admin/`.
3. Se connecter avec un compte `superuser`.
4. Ouvrir `Catalog` puis `Products`.
5. Les annonces `PENDING` apparaissent en premier.
6. Sélectionner une annonce.
7. Choisir `Approuver les produits sélectionnés` ou `Refuser les produits sélectionnés`.

Une annonce approuvée devient visible dans le catalogue. Le vendeur reçoit une notification.

## Images des produits

Les vendeurs peuvent envoyer une photo depuis leur ordinateur dans le formulaire `Publier un objet`.

Formats acceptés :

- JPG / JPEG
- PNG
- WebP

Taille maximale : 5 Mo.

En développement, les images sont stockées dans :

```text
backend/media/products/
```

Les fichiers de configuration média sont définis dans `backend/config/settings.py` et les URLs média sont servies automatiquement quand `DEBUG=True`.

## Photos du catalogue de démonstration

Les photos fournies manuellement pour les catégories sont dans :

```text
frontend/public/catalog-images/
```

Dossiers disponibles :

- `pieces-de-monnaie/`
- `poupees-anciennes/`
- `photographie-vintage/`
- `vinyles-musique/`
- `objets-anciens/`
- `arts-decoratifs/`
- `ceramique/`
- `design-mobilier/`
- `publicite-vintage/`

Le catalogue de démonstration utilise au maximum 25 articles par catégorie. Les images d'une catégorie sont associées aux articles de cette catégorie et les noms de fichiers avec espaces ou accents sont supportés.

Le détail du nommage est documenté dans [frontend/public/catalog-images/README.md](frontend/public/catalog-images/README.md).

## API principale

Base locale : `http://127.0.0.1:8000/api/`

### Authentification

- `POST /auth/register/` : créer un compte.
- `POST /auth/login/` : obtenir les tokens JWT.
- `POST /auth/refresh/` : renouveler le token d'accès.
- `GET /auth/me/` : récupérer le profil courant.

### Catalogue

- `GET /categories/` : liste des catégories.
- `GET /products/` : catalogue public et produits du vendeur connecté.
- `POST /products/` : publier un produit vendeur.
- `GET /products/{id}/` : détail d'un produit.
- `PATCH /products/{id}/` : modifier son produit.
- `DELETE /products/{id}/` : supprimer son produit.
- `GET /products/{id}/price-history/` : historique des prix.
- `GET /interests/` : objets suivis.
- `POST /interests/` : suivre un objet.
- `DELETE /interests/{id}/` : arrêter de suivre un objet.

### Commandes et paiements

- `GET /orders/` : commandes et ventes de l'utilisateur.
- `POST /orders/` : créer une commande.
- `GET /payments/` : paiements de l'acheteur.
- `POST /payments/simulate/` : simulation de paiement en développement.

Le paiement actuel est volontairement simulé. Il doit être remplacé par Stripe ou un autre prestataire avant une mise en production.

### Notifications et messages

- `GET /notifications/` : notifications personnelles.
- `PATCH /notifications/{id}/` : marquer une notification comme lue.
- `GET /conversations/` : conversations de l'utilisateur.
- `POST /conversations/` : ouvrir une conversation liée à un produit.
- `GET /messages/` : messages accessibles à l'utilisateur.
- `POST /messages/` : envoyer un message.

## Tests

Backend :

```powershell
cd backend
& "C:\Program Files\Python310\python.exe" manage.py test
```

Les tests couvrent notamment :

- Visibilité publique des produits approuvés uniquement.
- Création d'une annonce vendeur avec image.

Frontend :

```powershell
cd frontend
npm run build
npm run lint
```

## Structure du projet

```text
collector-shop/
├── backend/
│   ├── accounts/        # Inscription, connexion, profil
│   ├── catalog/         # Catégories, produits, intérêts, modération
│   ├── messaging/       # Conversations et messages
│   ├── notifications/   # Notifications utilisateur
│   ├── orders/          # Commandes et ventes
│   ├── payments/        # Paiements simulés
│   ├── config/          # Réglages et URLs Django
│   ├── media/           # Images uploadées en développement
│   ├── db.sqlite3       # Base locale de développement
│   └── manage.py
├── frontend/
│   ├── public/           # Logo et photos du catalogue
│   ├── src/api/          # Client Axios
│   ├── src/components/   # Navbar et composants partagés
│   ├── src/context/      # AuthContext
│   ├── src/data/         # Données de démonstration
│   ├── src/pages/        # Pages React
│   └── package.json
└── README.md
```

## Dépannage rapide

### Le menu des catégories est vide

Vérifier que le backend est démarré et appliquer les migrations :

```powershell
cd backend
& "C:\Program Files\Python310\python.exe" manage.py migrate
```

### `pip` n'est pas reconnu

Utiliser :

```powershell
py -m pip install -r requirements.txt
```

### Le frontend ne joint pas l'API

Vérifier que Django écoute sur le port `8000` et que `frontend/.env` contient :

```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

### Une annonce n'apparaît pas dans le catalogue

Une annonce nouvellement publiée est `PENDING`. Elle doit être approuvée depuis l'administration Django.

### Le compte vendeur ne peut pas publier

Le profil doit avoir `is_seller=True`. Cette option est activée en cochant la case vendeur lors de l'inscription.

## Limites actuelles avant production

- Paiement encore simulé.
- Pas encore de gestion de livraison, adresse ou suivi.
- SQLite utilisé en développement.
- Clé secrète et `DEBUG` à externaliser avant déploiement.
- Stockage média local à remplacer par un stockage cloud en production.
- Pas encore d'avis, retours, remboursements ou signalements avancés.
- Pas de WebSocket pour les messages en temps réel.

## Sécurité avant déploiement

Avant toute mise en ligne :

- Mettre `DEBUG=False`.
- Définir `SECRET_KEY` via une variable d'environnement.
- Restreindre `ALLOWED_HOSTS`.
- Configurer HTTPS et les cookies sécurisés.
- Utiliser PostgreSQL.
- Utiliser un stockage cloud pour les images.
- Remplacer le paiement simulé par un paiement signé côté serveur.
- Configurer les emails et la réinitialisation de mot de passe.
- Ajouter sauvegardes, logs et monitoring.
#   c o l l e c t o r - s h o p  
 