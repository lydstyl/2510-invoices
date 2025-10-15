# Guide de Déploiement et Lancement

## ✅ Build Réussi

Le build de l'application a été complété avec succès !

## 🚀 Comment lancer l'application buildée

### Option 1 : Mode Production (Recommandé)

```bash
# 1. S'assurer que la base de données est initialisée
npm run setup

# 2. Lancer l'application en mode production
npm start
```

L'application sera accessible sur **http://localhost:3000**

### Option 2 : Spécifier un port différent

```bash
# Lancer sur le port 3001
PORT=3001 npm start
```

### Option 3 : Mode Développement

Si vous préférez le mode développement (avec hot reload) :

```bash
npm run dev
```

## 📊 Informations du Build

### Routes générées :
- `/` - Page d'accueil (redirection)
- `/connexion` - Page de connexion
- `/factures` - Liste des factures
- `/factures/nouvelle` - Créer une nouvelle facture

### API Routes :
- `/api/auth/login` - Authentification
- `/api/auth/logout` - Déconnexion
- `/api/invoices` - CRUD des factures

### Taille du build :
- First Load JS : **~102 kB** (très optimisé!)
- Compilation : **1.5s**

## 🔧 Configuration Pré-Production

### 1. Variables d'environnement

Vérifiez votre fichier `.env` :

```env
DATABASE_URL="file:./dev.db"
USER_EMAIL="lydstyl@gmail.com"
USER_PASSWORD="votre-mot-de-passe-securise"
NEXTAUTH_SECRET="generer-un-secret-aleatoire"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Base de données

Si ce n'est pas déjà fait :

```bash
# Initialiser la base de données
npm run setup

# Ou manuellement :
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

### 3. Uploads

Assurez-vous que le dossier uploads existe :

```bash
mkdir -p public/uploads/invoices
```

## 🌐 Déploiement sur Serveur

### Étapes pour déployer sur un serveur Linux :

1. **Transférer les fichiers** :
```bash
# Sur votre machine locale
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ user@serveur:/path/to/app/
```

2. **Sur le serveur** :
```bash
# Installer les dépendances
npm install --production

# Générer le client Prisma
npx prisma generate

# Initialiser la base de données
npm run setup

# Build (si pas déjà fait)
npm run build

# Lancer avec PM2 (recommandé)
pm2 start npm --name "invoices-sci" -- start
pm2 save
pm2 startup
```

### Avec Docker (optionnel)

Créez un `Dockerfile` :

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Puis :

```bash
docker build -t invoices-sci .
docker run -p 3000:3000 -v $(pwd)/prisma:/app/prisma invoices-sci
```

## 🔒 Sécurité Production

Avant de mettre en production :

1. **Générer un secret fort** :
```bash
openssl rand -base64 32
```
Copier le résultat dans `NEXTAUTH_SECRET`

2. **Utiliser HTTPS** (avec nginx reverse proxy)

3. **Limiter les accès** (firewall, IP whitelist)

4. **Backups automatiques** :
```bash
# Backup de la base de données
cp prisma/dev.db backups/dev.db.$(date +%Y%m%d_%H%M%S)
```

## 📝 Commandes Utiles

```bash
# Vérifier les logs en production
pm2 logs invoices-sci

# Redémarrer l'application
pm2 restart invoices-sci

# Voir les stats
pm2 monit

# Ouvrir Prisma Studio (interface DB)
npm run prisma:studio

# Vérifier le build sans démarrer
npm run build
```

## 🐛 Résolution de Problèmes

### L'application ne démarre pas

```bash
# Vérifier que le port n'est pas utilisé
lsof -i :3000

# Vérifier les logs
npm start 2>&1 | tee app.log
```

### Erreur de base de données

```bash
# Régénérer la DB
rm prisma/*.db
npm run setup
```

### Erreur de permissions uploads

```bash
chmod 755 public/uploads/invoices
```

## 🎯 Performance

L'application est optimisée pour :
- **Génération statique** des pages quand possible
- **Server-side rendering** pour les données dynamiques
- **Code splitting** automatique par Next.js
- **Compression** automatique en production

## 📱 Accès

Une fois lancé :

1. Ouvrir **http://localhost:3000** (ou votre domaine)
2. Se connecter avec l'email configuré
3. Commencer à archiver vos factures !

---

**Bon déploiement ! 🚀**
