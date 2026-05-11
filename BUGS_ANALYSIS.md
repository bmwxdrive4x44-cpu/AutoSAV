# Analyse des Bugs - AutoSAV Marketplace

## 🔴 BUGS CRITIQUES (Sécurité & Logique Métier)

### 1. **Utilisateur bloqué peut toujours utiliser l'application**
**Fichier:** `src/lib/auth.ts` - fonction `getCurrentUser()`
**Problème:** Ne filtre pas `isBlocked`
```typescript
// BUGUÉ - Un admin bloque un user mais celui-ci reste connecté
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      // ... mais pas isBlocked!
    },
  });
}
```
**Impact:** Un utilisateur bloqué continue à faire des offres, des demandes, etc.
**Solution:** Ajouter `isBlocked: true` dans select et checker `if (user.isBlocked) throw new Error("Account blocked")`

---

### 2. **Client voit ses demandes supprimées**
**Fichier:** `src/app/actions/requests.ts` - fonction `getClientRequests()`
**Problème:** Ne filtre pas `deletedAt: null`
```typescript
// BUGUÉ - Les demandes supprimées par l'admin restent visibles au client
export async function getClientRequests() {
  const user = await requireRole([UserRole.CLIENT]);
  return prisma.productRequest.findMany({
    where: { clientId: user.id }, // ← Pas de deletedAt filter!
    include: { /* ... */ },
    orderBy: { createdAt: "desc" },
  });
}
```
**Impact:** Confusion pour l'utilisateur, incohérence avec admin dashboard
**Solution:** Ajouter `deletedAt: null` à where clause

---

### 3. **Agent bloqué peut toujours soumettre des offres**
**Fichier:** `src/app/actions/offers.ts` - fonction `createOffer()`
**Problème:** Pas de vérification `isBlocked` sur l'agent
```typescript
export async function createOffer(formData: FormData) {
  const user = await requireRole([UserRole.AGENT_BUYER]); // ← Pas de check isBlocked
  const request = await prisma.productRequest.findUnique({
    where: { id: data.requestId },
  });
  // Pas de vérification que request.client n'est pas bloqué
  // ...
  await prisma.$transaction(async (tx) => {
    await tx.offer.create({ /* ... */ });
  });
}
```
**Impact:** Blocage d'utilisateur ineffectif
**Solution:** Vérifier `user.isBlocked` avant de créer l'offre

---

### 4. **Transaction créée sans validation des utilisateurs**
**Fichier:** `src/app/actions/offers.ts` - fonction `acceptOffer()`
**Problème:** Pas de vérification que client/agent ne sont pas bloqués
```typescript
export async function acceptOffer(offerId: string, requestId: string) {
  const user = await requireRole([UserRole.CLIENT]); // ← Pas de check isBlocked
  // Pas de fetch de l'agent pour checker isBlocked
  // ...
  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        amount: offer.price,
        status: "PENDING",
        requestId,
        clientId: user.id, // ← Créé sans valider isBlocked
      },
    });
  });
}
```
**Impact:** Paiement bloqué en cours avec utilisateur non autorisé
**Solution:** Fetch l'agent et vérifier `isBlocked` sur les deux parties

---

### 5. **Agent voit les offres supprimées**
**Fichier:** `src/app/actions/offers.ts` - fonction `getAgentBuyerOffers()`
**Problème:** Ne filtre pas `deletedAt: null`
```typescript
export async function getAgentBuyerOffers() {
  const user = await requireRole([UserRole.AGENT_BUYER]);
  return prisma.offer.findMany({
    where: { agentBuyerId: user.id }, // ← Pas de deletedAt filter
    include: { /* ... */ },
    orderBy: { createdAt: "desc" },
  });
}
```
**Impact:** Offres supprimées restent visibles
**Solution:** Ajouter `deletedAt: null`

---

## 🟡 BUGS MAJEURS (UX & Stabilité)

### 6. **Port 3000 bloqué par processus zombie, impossible à tuer**
**Fichier:** `scripts/dev-reset.cjs`
**Problème:** PID 16356 occupe le port 3000, `kill-port` échoue (permission denied)
```
Error: listen EADDRINUSE: address already in use :::3000
failed:16356 (Cannot stop PID 16356)
```
**Impact:** Dev server ne démarre pas sur 3000, fallback à 3001
**Solution Actuelle:** Forcer le port 3001 dans le script
**Solution Permanente:** 
- Ajouter cleanup timeout dans le script
- Documenter le workaround Windows
- Envisager docker pour isolation

---

### 7. **Chunks CSS/JS retournent 404 pendant hot reload**
**Fichier:** Logs du serveur Next.js
**Problème:** Après recompilation, les assets statiques retournent 404
```
GET /_next/static/css/app/layout.css?v=1778370043207 404
GET /_next/static/chunks/app-pages-internals.js 404
```
**Impact:** UI cassée pendant développement, confusion sur bugs réels
**Solution:** 
- Clear browser cache pendant dev (déjà fait avec NEXT_DISABLE_WEBPACK_CACHE)
- Considérer NextJS version upgrade (14.2.35 → 15+)
- Vérifier .next folder cleanup

---

### 8. **APP_BASE_URL hardcodé à localhost:3000**
**Fichier:** `src/lib/notifications.ts`
**Problème:** Les emails contiennent des URLs vers localhost:3000 quand le serveur est sur 3001
```typescript
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
// ↓ Les emails auront des links vers un port inaccessible
```
**Impact:** Les liens dans les emails ne fonctionnent pas
**Solution:** Utiliser `process.env.APP_BASE_URL` ou `process.env.NEXT_PUBLIC_APP_URL`

---

## 🟠 ERREURS DE LOGIQUE MÉTIER

### 9. **Trust score peut être négatif avant normalisation**
**Fichier:** `src/app/actions/admin.ts` - fonction `computeAgentTrustScore()`
**Problème:** Score calcul avec Math.max() mais peut être confus dans les calculs intermédiaires
```typescript
function computeAgentTrustScore(user: {...}) {
  let score = 0;
  if (user.emailVerifiedAt) score += 25;
  if (user.phoneVerifiedAt) score += 25;
  if (user.agentValidationStatus === "VALIDATED") score += 30;
  if (user.agentValidationStatus === "PENDING") score += 10;
  if (user.agentValidationStatus === "REJECTED") score -= 20;
  if (user.isBlocked) score -= 35; // ← Peut donner -35
  return Math.max(0, Math.min(100, score)); // ← Normalisé ici
}
```
**Impact:** Logique confuse, difficile à maintenir
**Solution:** Refactoriser avec des cas exclusifs ou valider avant soustraction

---

### 10. **Pas de validation d'état pour créer une offre**
**Fichier:** `src/app/actions/offers.ts` - fonction `createOffer()`
**Problème:** Check que la demande accepte les offres, mais pas que les utilisateurs sont valides
```typescript
if (request.status !== "REQUEST_CREATED" && request.status !== "OFFERS_RECEIVED") {
  throw new Error("Request is no longer accepting offers");
}
// ✅ Bon check sur demande
// ❌ Mais pas de check sur:
// - if (user.isBlocked) throw
// - if (user.agentValidationStatus === "REJECTED") throw
// - if (request.client.isBlocked) throw
```
**Impact:** Offres de/vers utilisateurs invalides
**Solution:** Ajouter validations avant création

---

### 11. **Soft delete partout sans cascade logic**
**Fichier:** `src/app/actions/admin.ts`
**Problème:** `deletedAt` est utilisé mais pas de suppression de données associées
```typescript
await prisma.productRequest.update({
  where: { id: requestId },
  data: { deletedAt: new Date(), /* no cascade */ },
});
// Les offers, shipments, transactions restent orphelines
```
**Impact:** Données orphelines, possibles inconsistances
**Solution:** 
- Ajouter suppression cascade dans Prisma schema
- Ou implémenter cleanup manuel avec Promise.all

---

### 12. **Pas de validation de cohérence transaction-offer**
**Fichier:** `src/app/actions/offers.ts` - fonction `acceptOffer()`
**Problème:** On crée transaction avec le prix de l'offre sans vérifier que l'offre n'a pas changé
```typescript
const offer = request.offers.find((o) => o.id === offerId);
if (!offer) throw new Error("Offer not found");
// ↓ Race condition: l'offre pourrait être supprimée/modifiée avant création
await prisma.$transaction(async (tx) => {
  await tx.transaction.create({
    data: {
      amount: offer.price, // ← Crédit sans relire offer du DB
      status: "PENDING",
      requestId,
      clientId: user.id,
    },
  });
});
```
**Impact:** Montants incorrects en cas d'accès simultané
**Solution:** Re-fetch offer dans la transaction avant créer transaction

---

## 📋 RÉSUMÉ DES CORRECTIONS PRIORITAIRES

| Priorité | Bug | Fichier | Solution |
|----------|-----|---------|----------|
| 🔴 CRITIQUE | User bloqué utilise l'app | `auth.ts` | Ajouter check `isBlocked` dans `getCurrentUser()` |
| 🔴 CRITIQUE | Agent bloqué fait offres | `offers.ts` | Valider `isBlocked` dans `createOffer()` |
| 🔴 CRITIQUE | Transaction créée sans vérification | `offers.ts` | Check isBlocked des deux parties dans `acceptOffer()` |
| 🟡 MAJEUR | Client voit demandes supprimées | `requests.ts` | Ajouter `deletedAt: null` dans `getClientRequests()` |
| 🟡 MAJEUR | Agent voit offres supprimées | `offers.ts` | Ajouter `deletedAt: null` dans `getAgentBuyerOffers()` |
| 🟡 MAJEUR | URLs emails incorrectes | `notifications.ts` | Utiliser `process.env.APP_BASE_URL` |
| 🟠 MOYEN | Soft delete sans cascade | Prisma schema | Implémenter suppression cascade |
| 🟠 MOYEN | Trust score confus | `admin.ts` | Refactoriser `computeAgentTrustScore()` |

---

## ✅ CORRECTIONS DÉJÀ APPORTÉES

- ✅ `getPublicRequests()` filtre `deletedAt: null` (fixé)
- ✅ Dev server force port 3001 (workaround)
- ✅ Validations de statut REQUEST sur créations
