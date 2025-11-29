# Prompts Mermaid pour le projet ATLAS

## 📊 Diagrammes Mermaid prêts à utiliser

### 1. Flowchart d'Authentification

```mermaid
flowchart TD
    A[Utilisateur accède à l'app] --> B{Authentifié?}
    B -->|Non| C[Middleware Next.js]
    C --> D[Redirection /sign-in]
    D --> E[Page Sign-In Clerk]
    E --> F{Authentification réussie?}
    F -->|Oui| G[Redirection vers /]
    F -->|Non| H[Affichage erreur]
    H --> E
    G --> I[Dashboard]
    B -->|Oui| J[Route protégée]
    J --> K[Layout avec Sidebar]
    K --> L[Page demandée]
    
    style A fill:#e1f5ff
    style B fill:#fff4e6
    style I fill:#d4edda
    style H fill:#f8d7da
```

### 2. Flowchart de Navigation Principale

```mermaid
flowchart LR
    A[Dashboard /] --> B[Sidebar Navigation]
    B --> C[Contacts /contacts]
    B --> D[Agencies /agencies]
    B --> A
    E[Navbar] --> F[Toggle Sidebar]
    E --> G[Theme Toggle]
    E --> H[Page Title]
    
    I[Layout Component] --> J{Route publique?}
    J -->|Oui sign-in/sign-up| K[Pas de Sidebar]
    J -->|Non| L[Sidebar + Navbar]
    
    style A fill:#d4edda
    style C fill:#cfe2ff
    style D fill:#cfe2ff
```

### 3. Flowchart de Visualisation des Contacts avec Limite

```mermaid
flowchart TD
    A[Utilisateur accède /contacts] --> B[Hook useDailyLimit]
    B --> C[GET /api/limits]
    C --> D[Vérification WINDOW_MS]
    D --> E{Fenêtre expirée?}
    E -->|Oui| F[Reset: viewedContactIds = []]
    E -->|Non| G[Récupération viewedContactIds]
    F --> H[firstViewAt = maintenant]
    G --> I[viewsToday = viewedContactIds.length]
    H --> I
    I --> J{viewsToday < 50?}
    J -->|Oui| K[Fetch Supabase contacts]
    K --> L[POST /api/limits avec contactIds]
    L --> M[Incrémenter compteur]
    M --> N[Affichage contacts masqués]
    N --> O[Utilisateur clique Reveal]
    O --> P[Données démasquées]
    J -->|Non| Q[Mode Cache]
    Q --> R[Affichage cachedContacts]
    Q --> S[LimitModal affiché]
    S --> T[Blocage nouvelles révélations]
    
    style J fill:#fff4e6
    style S fill:#f8d7da
    style M fill:#d4edda
```

### 4. Flowchart de Réinitialisation Quotidienne

```mermaid
sequenceDiagram
    participant Client
    participant Hook
    participant API
    participant Clerk
    
    Client->>Hook: Chargement page
    Hook->>API: GET /api/limits?userId=xxx
    API->>Clerk: Récupérer metadata
    Clerk-->>API: metadata avec firstViewAt
    API->>API: Calculer elapsed = now - firstViewAt
    alt elapsed >= WINDOW_MS (24h)
        API->>API: Reset viewedContactIds = []
        API->>API: firstViewAt = maintenant
        API->>Clerk: PATCH metadata
    end
    API-->>Hook: Retourner meta
    Hook-->>Client: Mise à jour UI
    
    Note over Client,Clerk: Polling toutes les 5 secondes si limitReached
```

### 5. Diagramme d'Architecture Générale

```mermaid
graph TB
    subgraph Frontend["Frontend - Next.js 16"]
        A[App Router]
        B[Pages: /, /contacts, /agencies]
        C[Components: Layout, Sidebar, Navbar]
        D[Hooks: useDailyLimit, useUser]
        E[Context: Theme, Sidebar]
    end
    
    subgraph Middleware["Middleware"]
        F[Vérification Clerk]
        G[Protection Routes]
    end
    
    subgraph API["API Routes"]
        H[/api/limits GET/POST]
    end
    
    subgraph Services["Services"]
        I[supabaseService]
    end
    
    subgraph Database["Supabase PostgreSQL"]
        J[(Table: contacts)]
        K[(Table: agencies)]
    end
    
    subgraph Auth["Clerk Authentication"]
        L[Sign-In/Sign-Up]
        M[private_metadata: contactLimits]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    F --> G
    G --> A
    D --> H
    H --> I
    I --> J
    I --> K
    H --> M
    A --> L
    L --> M
    
    style Frontend fill:#e1f5ff
    style Database fill:#f3e5f5
    style Auth fill:#fff4e6
```

### 6. Flowchart d'Upgrade Modal

```mermaid
flowchart TD
    A[viewsToday >= 50] --> B[LimitReached = true]
    B --> C[Affichage LimitModal]
    C --> D{Action utilisateur}
    D -->|Fermer| E[Modal fermé temporairement]
    E --> C
    D -->|Upgrade| F[Affichage UpgradeModal]
    F --> G[Affichage plans tarifaires]
    G --> H{Plan sélectionné?}
    H -->|Oui| I[Redirection paiement]
    H -->|Non| F
    
    style A fill:#f8d7da
    style C fill:#fff4e6
    style I fill:#d4edda
```

### 7. Diagramme de Séquence - Consultation d'un Contact

```mermaid
sequenceDiagram
    participant User
    participant ContactsPage
    participant useDailyLimit
    participant API
    participant Supabase
    participant Clerk
    
    User->>ContactsPage: Clique sur contact
    ContactsPage->>useDailyLimit: Vérifier viewsToday
    useDailyLimit->>API: GET /api/limits
    API->>Clerk: Récupérer metadata
    Clerk-->>API: viewedContactIds, firstViewAt
    API-->>useDailyLimit: viewsToday, limitReached
    
    alt viewsToday < 50
        useDailyLimit->>Supabase: Fetch contact details
        Supabase-->>useDailyLimit: Contact data
        useDailyLimit->>API: POST /api/limits avec contactId
        API->>Clerk: Ajouter contactId à viewedContactIds
        API->>Clerk: Mettre à jour metadata
        Clerk-->>API: Confirmation
        API-->>useDailyLimit: Nouveau count
        useDailyLimit-->>ContactsPage: Afficher contact démasqué
    else viewsToday >= 50
        useDailyLimit-->>ContactsPage: LimitModal
        ContactsPage-->>User: Afficher modal upgrade
    end
```

### 8. Diagramme d'État - Système de Limite

```mermaid
stateDiagram-v2
    [*] --> Initialisation
    Initialisation --> Chargement: Charger état
    Chargement --> SousLimite: viewsToday < 50
    Chargement --> LimiteAtteinte: viewsToday >= 50
    
    SousLimite --> Consultation: Utilisateur consulte contact
    Consultation --> Incrémentation: POST /api/limits
    Incrémentation --> Vérification: Mise à jour compteur
    
    Vérification --> SousLimite: viewsToday < 50
    Vérification --> LimiteAtteinte: viewsToday >= 50
    
    LimiteAtteinte --> ModalAffiché: Afficher LimitModal
    ModalAffiché --> Polling: Démarrer polling 5s
    
    Polling --> VérificationReset: GET /api/limits
    VérificationReset --> Réinitialisé: elapsed >= 24h
    VérificationReset --> Polling: elapsed < 24h
    
    Réinitialisé --> SousLimite: Reset compteur
    
    note right of LimiteAtteinte
        Blocage nouvelles révélations
        Affichage cache uniquement
    end note
```

### 9. Diagramme de Classes Simplifié

```mermaid
classDiagram
    class ContactsPage {
        +displayContacts: Contact[]
        +page: number
        +showModal: boolean
        +fetchData()
        +handleReveal()
    }
    
    class useDailyLimit {
        +viewsToday: number
        +limitReached: boolean
        +cachedContacts: Contact[]
        +addViews()
        +loadState()
    }
    
    class supabaseService {
        +getContacts()
        +getAgencies()
        +getUser()
        +incrementViewCount()
    }
    
    class API_Limits {
        +GET()
        +POST()
        -checkWindow()
        -resetIfExpired()
    }
    
    class Clerk {
        +private_metadata
        +contactLimits
        +firstViewAt
        +viewedContactIds[]
    }
    
    ContactsPage --> useDailyLimit
    useDailyLimit --> API_Limits
    API_Limits --> Clerk
    ContactsPage --> supabaseService
    useDailyLimit --> supabaseService
```

### 10. Diagramme de Déploiement

```mermaid
graph LR
    A[Développeur] --> B[Git Repository]
    B --> C[Vercel/Next.js]
    C --> D[Production]
    
    D --> E[Clerk Auth Service]
    D --> F[Supabase Database]
    
    E --> G[User Metadata]
    F --> H[(PostgreSQL)]
    
    I[Utilisateur] --> D
    D --> I
    
    style D fill:#d4edda
    style E fill:#fff4e6
    style F fill:#f3e5f5
```

## 📝 Instructions d'utilisation

1. **Copier-coller** n'importe quel diagramme dans un éditeur Mermaid (comme [Mermaid Live Editor](https://mermaid.live))
2. **Modifier** selon vos besoins
3. **Exporter** en PNG, SVG ou intégrer dans votre documentation

## 🎨 Personnalisation

- Modifiez les couleurs avec `style` dans les flowcharts
- Ajoutez des notes avec `note right/left of`
- Personnalisez les formes avec différentes syntaxes Mermaid
- Ajoutez des liens interactifs si nécessaire

## 🔗 Ressources Mermaid

- [Documentation officielle](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live)
- [Syntaxe des diagrammes](https://mermaid.js.org/intro/syntax-reference.html)

