# Commandes Diarraba

Pour initialiser shadcn/ui manuellement, exécutez la commande suivante dans votre terminal :

```bash
npx shadcn@latest init
```

Répondez aux questions comme suit :
- Style : New York
- Base color : Slate
- CSS Variables : Yes
- src/ directory : Yes
- components.json location : (appuyez sur Entrée)
- components alias : @/components
- utils alias : @/lib/utils
- rsc : Yes
- Write components.json : Yes

## État du Projet
- **Hydratation :** Corrigé via `suppressHydrationWarning` dans le layout global.
- **CRUD :** Entièrement opérationnel avec modales de confirmation avant chaque suppression.
- **Paiements :** Modale d'enregistrement fonctionnelle avec suivi des informations client/réservation.
- **Réservations :** Formulaire incluant désormais le prix unitaire et le calcul automatique du total.
- **Paramètres :** Interface épurée (onglets Sécurité et Base de données retirés).
