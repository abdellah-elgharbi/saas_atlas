# Configuration Clerk

Pour que l'application fonctionne, vous devez configurer Clerk.

## Étapes de configuration

1. Créez un compte sur [Clerk Dashboard](https://dashboard.clerk.com)

2. Créez une nouvelle application

3. Copiez vos clés API depuis le dashboard Clerk

4. Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

5. Redémarrez le serveur de développement :

```bash
npm run dev
```

## Routes publiques

Les routes suivantes sont publiques (pas d'authentification requise) :
- `/sign-in` - Page de connexion
- `/sign-up` - Page d'inscription
- `/api/webhooks/*` - Webhooks Clerk

Toutes les autres routes nécessitent une authentification.

## Note

Si vous n'avez pas encore configuré Clerk, l'application ne fonctionnera pas correctement. Assurez-vous de suivre les étapes ci-dessus.

