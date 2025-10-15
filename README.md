# Archivage Factures SCI

Application web interne pour l'archivage et la gestion des factures d'une SCI (Société Civile Immobilière).

## Architecture

Ce projet suit les principes de **Clean Architecture** avec une séparation claire des responsabilités :

```
src/
├── domain/           # Entités et interfaces métier
│   ├── entities/     # Modèles de domaine
│   └── interfaces/   # Contrats des repositories
├── usecases/         # Logique métier (testée avec Vitest)
├── infrastructure/   # Implémentations techniques
│   ├── database/     # Repositories Prisma
│   └── auth/         # Authentification et sessions
└── ui/               # Composants React
    └── components/   # Composants UI réutilisables

app/                  # Routes Next.js 15 (App Router)
├── api/              # API routes
├── connexion/        # Page de connexion
└── factures/         # Pages de gestion des factures

tests/                # Tests unitaires (Vitest)
└── usecases/         # Tests TDD des use cases
```

## Stack technique

- **Next.js 15** avec TypeScript
- **Tailwind CSS** pour le styling
- **Prisma** avec SQLite pour la base de données
- **Vitest** pour les tests unitaires (TDD)
- **bcryptjs** pour le hashing des mots de passe

## Fonctionnalités

- ✅ Authentification utilisateur unique
- ✅ Upload de factures PDF
- ✅ Prévisualisation PDF en temps réel
- ✅ Saisie manuelle des métadonnées
- ✅ Gestion des fournisseurs et catégories
- ✅ Génération automatique du nom de fichier selon le format : `AAMMJJ.FOURNISSEUR.N°FACTURE_description.montantE00`
- ✅ Liste complète des factures avec filtres
- ✅ Statuts de paiement (non payée, partiellement payée, payée)

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn

### Étapes

1. **Cloner le projet et installer les dépendances**

```bash
npm install
```

2. **Configurer les variables d'environnement**

Copier le fichier `.env.example` vers `.env` et modifier les valeurs :

```bash
cp .env.example .env
```

Contenu du fichier `.env` :

```env
DATABASE_URL="file:./dev.db"
USER_EMAIL="lydstyl@gmail.com"
USER_PASSWORD="votre-mot-de-passe-securise"
NEXTAUTH_SECRET="generer-un-secret-aleatoire-ici"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Initialiser la base de données**

```bash
npm run setup
```

Cette commande va :
- Générer le client Prisma
- Créer la base de données et exécuter les migrations
- Seed la base avec l'utilisateur et les catégories par défaut

## Développement

### Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Lancer les tests

```bash
# Mode watch
npm test

# Interface UI
npm run test:ui
```

### Commandes Prisma utiles

```bash
# Créer une nouvelle migration
npm run prisma:migrate

# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio (interface visuelle)
npm run prisma:studio

# Re-seed la base de données
npm run prisma:seed
```

## Utilisation

### Connexion

1. Accéder à l'application sur `http://localhost:3000`
2. Se connecter avec l'email configuré dans `.env` (par défaut : `lydstyl@gmail.com`)
3. Utiliser le mot de passe configuré dans `.env`

### Ajouter une facture

1. Cliquer sur "**+ Nouvelle facture**"
2. Sélectionner un fichier PDF
3. Remplir les champs :
   - Date de la facture
   - Fournisseur (sélectionner existant ou créer nouveau)
   - Numéro de facture
   - Description
   - Montant
   - Statut de paiement
   - Catégorie (optionnel)
4. Un nom de fichier est généré automatiquement en temps réel
5. Cliquer sur "**Copier**" pour copier le nom généré
6. Enregistrer la facture

### Gérer les factures

- Liste complète des factures avec toutes les informations
- Voir le PDF en cliquant sur "Voir PDF"
- Filtrage par fournisseur, statut, etc. (à venir)

## Structure de la base de données

### Modèles Prisma

- **User** : Utilisateur unique de l'application
- **Supplier** : Fournisseurs des factures
- **Category** : Catégories de dépenses
- **Invoice** : Factures avec toutes les métadonnées

### Format du nom de fichier généré

```
AAMMJJ.FOURNISSEUR.N°FACTURE_description.montantE00
```

Exemple : `250929.DOM'ELEC.F.202509145_interphone.90E00`

## Tests

Le projet utilise **Vitest** pour les tests unitaires avec une approche **TDD** pour la logique métier.

### Use cases testés

- `GenerateInvoiceFilename` : Génération du nom de fichier selon le format spécifié
- `CreateInvoice` : Création d'une facture avec validation

### Lancer les tests

```bash
npm test
```

## Extensions futures

### Prévues dans l'architecture

- **Serveur MCP** : Accès à la base de données via LLM
- **Extraction automatique** : Lecture des données de facture via LLM à partir du PDF
- **Multi-utilisateurs** : Gestion de plusieurs utilisateurs avec rôles
- **Recherche avancée** : Filtres et recherche full-text
- **Statistiques** : Tableaux de bord avec graphiques
- **Export** : Export CSV/Excel des factures

## Licence

Projet interne privé.
