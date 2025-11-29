# Documentation Projet - SaaS CRM

**Version:** 1.0  
**Statut:** En production  
**Dernière mise à jour:** Novembre 2024

---

## Vue d'ensemble du projet

Cette application est un système de gestion de la relation client (CRM) SaaS développé avec Next.js et Supabase. Elle permet de gérer des agences partenaires et leurs contacts associés avec un système de quotas quotidiens.

### Technologies utilisées

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Base de données:** Supabase PostgreSQL
- **Authentification:** Clerk / Supabase Auth
- **Styling:** Tailwind CSS
- **Déploiement:** Vercel

---

## Architecture de l'application

### Structure des données

L'application repose sur trois entités principales :

#### 1. Agences (`agencies`)

Représente les organisations partenaires (académies, lycées, institutions).

**Informations stockées :**
- Identité : nom, type, localisation
- Contact : téléphone, site web
- Statistiques : nombre d'étudiants, nombre d'écoles
- Statut : actif ou inactif

#### 2. Contacts (`contacts`)

Représente les personnes associées aux agences.

**Informations stockées :**
- Identité : prénom, nom
- Coordonnées : email, téléphone
- Position : titre, département
- Relation : rattachement à une agence

#### 3. Utilisateurs (`users`)

Gère les comptes utilisateurs et leurs limitations d'accès.

**Informations stockées :**
- Identité : email, nom
- Quotas : nombre de contacts vus par jour
- Cache : liste des contacts déjà consultés
- Horodatage : dernière réinitialisation

---

## Fonctionnalités principales

### 1. Dashboard

**Objectif :** Vue d'ensemble des données clés

**Éléments affichés :**
- Nombre total d'agences
- Nombre total de contacts

### 2. Consultation des agences

**Objectif :** Visualisation des organisations partenaires

**Fonctionnalités :**
- Liste complète des agences (lecture seule)
- Visualisation des détails complets

### 3. Consultation des contacts

**Objectif :** Visualisation des personnes de contact

**Fonctionnalités :**
- Liste paginée (50 contacts par page)
- Recherche multi-critères
- Affichage des informations détaillées
- Consultation limitée par quotas quotidiens

### 4. Système de quotas

**Objectif :** Limiter l'accès aux coordonnées sensibles

**Règles appliquées :**
- Maximum 50 contacts consultables par jour
- Réinitialisation automatique à minuit
- Affichage d'un avertissement à l'approche de la limite
- Blocage après dépassement de la limite
- Cache en base de données pour persistance

---

## Flux de données

### Récupération des agences

```
1. L'utilisateur accède à la page Agences
2. L'application appelle supabaseService.getAgencies()
3. Requête SQL vers la table 'agencies'
4. Les données sont retournées et affichées
```

### Consultation d'un contact

```
1. L'utilisateur clique sur un contact
2. Vérification du quota quotidien
3. Si quota disponible :
   - Affichage des coordonnées complètes
   - Incrémentation du compteur
   - Mise en cache du contact
4. Si quota dépassé :
   - Affichage d'un message d'erreur
   - Proposition d'upgrade
```

### Création d'un contact

```
1. L'utilisateur remplit le formulaire
2. Validation des données côté client
3. Appel à supabaseService.createContact()
4. Insertion en base de données
5. Confirmation et rafraîchissement de la liste
```

---

## Service Supabase

Le fichier `services/supabaseService.ts` centralise toutes les opérations sur la base de données.

### Méthodes disponibles

#### Agences
- `getAgencies()` - Récupère toutes les agences

#### Contacts
- `getContacts(page, limit)` - Liste paginée de contacts
- `searchContacts(query)` - Recherche par nom, email, titre

#### Utilisateurs
- `getUser()` - Récupère l'utilisateur connecté
- `incrementViewCount(amount)` - Incrémente le compteur de vues
- `canViewContacts()` - Vérifie si la limite est atteinte

**Note :** Les méthodes de création, modification et suppression (`createAgency`, `createContact`, `updateContact`, `deleteContact`) existent dans le code mais sont réservées aux administrateurs uniquement.

---

## Sécurité

### Row Level Security (RLS)

Supabase applique des politiques de sécurité au niveau des lignes :

**Agences et Contacts :**
- Lecture autorisée pour tous les utilisateurs authentifiés
- Aucune modification possible (lecture seule)
- Création, modification et suppression réservées aux administrateurs

**Utilisateurs :**
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Lecture et modification limitées à son propre compte

### Authentification

Toutes les requêtes nécessitent un utilisateur authentifié via Clerk ou Supabase Auth. Le token JWT est automatiquement inclus dans les en-têtes des requêtes.

---

**Préparé par :** Équipe Technique  
**Dernière révision :** Novembre 2024
