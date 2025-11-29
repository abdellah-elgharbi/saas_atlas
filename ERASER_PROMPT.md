# Prompt pour générer des flowcharts sur Eraser.io - Projet ATLAS

## 📋 PROMPT PRINCIPAL POUR ERASER.IO

```
Crée des flowcharts professionnels pour une application web ATLAS (CRM SaaS) construite avec Next.js 16, Clerk Authentication, et Supabase. L'application gère des contacts et des agences éducatives avec un système de limite quotidienne.

## 1. FLOWCHART D'AUTHENTIFICATION

Créer un flowchart montrant:
- Point d'entrée: Utilisateur non authentifié accède à l'application
- Middleware Next.js vérifie l'authentification via Clerk
- Si non authentifié → Redirection vers /sign-in
- Page Sign-In avec composant Clerk SignIn
- Option de basculer vers Sign-Up
- Après authentification réussie → Redirection vers Dashboard (/)
- Si authentifié → Accès aux routes protégées (Dashboard, Contacts, Agencies)
- Gestion des erreurs d'authentification

## 2. FLOWCHART DE NAVIGATION PRINCIPALE

Créer un flowchart montrant:
- Dashboard (page principale) avec statistiques
- Sidebar avec navigation: Dashboard, Contacts, Agencies
- Navbar avec bouton toggle sidebar et theme toggle
- Navigation entre pages via Next.js App Router
- Layout wrapper qui conditionne l'affichage selon route publique/privée
- Gestion de l'état de la sidebar (ouvert/fermé)

## 3. FLOWCHART DE VISUALISATION DES CONTACTS AVEC LIMITE

Créer un flowchart détaillé montrant:
- Utilisateur accède à /contacts
- Hook useDailyLimit charge l'état depuis API /api/limits
- Vérification: viewsToday < 50?
  - Si OUI: Récupération des contacts depuis Supabase (pagination 10 par page)
  - Appel POST /api/limits pour incrémenter le compteur
  - Affichage des contacts avec données masquées
  - Utilisateur clique "Reveal" → Données démasquées
  - Mise à jour du compteur viewsToday
  - Si NON: Affichage des contacts en cache uniquement
  - Affichage du modal LimitModal avec option d'upgrade
  - Blocage de nouvelles révélations
- Gestion de la pagination
- Mode cache vs mode normal

## 4. FLOWCHART DE RÉINITIALISATION QUOTIDIENNE

Créer un flowchart montrant:
- Constante WINDOW_MS = 24 * 60 * 60 * 1000 (24 heures)
- Premier contact consulté → firstViewAt enregistré dans Clerk metadata
- À chaque requête GET /api/limits:
  - Calcul: elapsed = Date.now() - firstViewAt
  - Si elapsed >= WINDOW_MS:
    - Réinitialisation: viewedContactIds = []
    - Nouveau firstViewAt = maintenant
    - Sauvegarde dans Clerk private_metadata
- Polling côté client (toutes les 5 secondes) pour détecter la réinitialisation
- Mise à jour automatique de l'UI quand limite réinitialisée

## 5. FLOWCHART ARCHITECTURE GÉNÉRALE

Créer un flowchart montrant:
- Frontend: Next.js 16 App Router
  - Pages: / (Dashboard), /contacts, /agencies, /sign-in, /sign-up
  - Components: Layout, Sidebar, Navbar, ThemeToggle
  - Hooks: useDailyLimit, useUser (Clerk)
  - Context: ThemeContext, SidebarContext
- Middleware: Vérification Clerk, protection des routes
- API Routes: /api/limits (GET/POST)
- Services: supabaseService (Supabase client)
- Base de données: Supabase PostgreSQL
  - Tables: contacts, agencies
- Authentification: Clerk (metadata pour limites)
- Storage: Clerk private_metadata pour compteurs quotidiens

## 6. FLOWCHART D'UPGRADE MODAL

Créer un flowchart montrant:
- Déclenchement: viewsToday >= 50
- Affichage automatique de LimitModal
- Options utilisateur:
  - Fermer le modal (temporaire)
  - Cliquer "Upgrade to Unlimited"
  - Modal UpgradeModal s'affiche avec plans tarifaires
  - Sélection d'un plan
  - Redirection vers page de paiement (à implémenter)
- Gestion de l'état: showModal, hasShownModal

## STYLE ET CONVENTIONS

- Utiliser des formes rectangulaires pour les processus
- Utiliser des losanges pour les décisions (OUI/NON)
- Utiliser des ellipses pour les points d'entrée/sortie
- Utiliser des couleurs différentes pour:
  - Authentification (bleu)
  - Limites/Compteurs (orange/rouge)
  - Navigation (vert)
  - Base de données (violet)
- Inclure des annotations pour les constantes importantes (LIMIT=50, WINDOW_MS=24h)
- Montrer les interactions API avec des flèches pointillées
- Inclure les états d'erreur et leurs gestions
```

## 📊 FLOWCHARTS SPÉCIFIQUES À CRÉER

### Flowchart 1: Authentification Complète
```
[Utilisateur] → [Middleware] → {Authentifié?}
  ├─ NON → [Page Sign-In] → [Clerk SignIn] → {Succès?}
  │   ├─ OUI → [Redirection /] → [Dashboard]
  │   └─ NON → [Erreur] → [Retry]
  └─ OUI → [Route Protégée] → [Layout] → [Page Demandée]
```

### Flowchart 2: Système de Limite Quotidienne
```
[Chargement /contacts] → [useDailyLimit] → [GET /api/limits]
  → [Vérification WINDOW_MS] → {Expiré?}
    ├─ OUI → [Reset: viewedContactIds=[]] → [firstViewAt=now]
    └─ NON → [Récupération viewedContactIds]
  → [viewsToday = viewedContactIds.length]
  → {viewsToday < 50?}
    ├─ OUI → [Fetch Supabase] → [POST /api/limits] → [Incrémenter]
    └─ NON → [Mode Cache] → [LimitModal]
```

### Flowchart 3: Réinitialisation Automatique
```
[Polling toutes les 5s] → [GET /api/limits]
  → [Calcul: elapsed = now - firstViewAt]
  → {elapsed >= 86400000ms?}
    ├─ OUI → [Reset metadata] → [Update UI] → [limitReached=false]
    └─ NON → [Continuer]
```

## 🎨 ÉLÉMENTS VISUELS À INCLURE

- **Couleurs suggérées:**
  - Bleu: Authentification (Clerk)
  - Vert: Navigation/Sidebar
  - Orange: Système de limites
  - Rouge: Limite atteinte/Erreurs
  - Violet: Base de données (Supabase)
  - Gris: États neutres/Chargement

- **Icônes à représenter:**
  - 🔐 Authentification
  - 📊 Dashboard
  - 👥 Contacts
  - 🏢 Agencies
  - ⏱️ Limite temporelle
  - 🔄 Réinitialisation
  - ⚠️ Modal d'avertissement

## 📝 NOTES IMPORTANTES

- Le système utilise une fenêtre glissante de 24h (pas une réinitialisation à minuit)
- Les limites sont stockées dans Clerk private_metadata, pas en base de données
- Le polling côté client vérifie la réinitialisation toutes les 5 secondes
- La limite est de 50 contacts par fenêtre de 24h
- Les contacts en cache sont affichés même après atteinte de la limite

