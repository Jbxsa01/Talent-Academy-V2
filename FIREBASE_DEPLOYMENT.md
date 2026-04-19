# 🔐 Firebase Firestore Security Rules Deployment Guide

## Latest Changes (April 19, 2026)

The `firestore.rules` file has been updated with better permission handling. You need to **deploy these rules to Firebase Console**.

### Key Fixes in New Rules:

1. **Fixed `isAdmin()` function** - Now properly checks if user has 'admin' role in array
2. **Better error handling** - AdminPanel now gracefully handles permission-denied errors
3. **Proper role-based access** - Only admins can read all collections

## How to Deploy Rules to Production

### Option 1: Using Firebase CLI (Recommended)

```bash
# Login to Firebase
firebase login

# Select your project
firebase use hestim-talent-academy

# Deploy only the Firestore rules
firebase deploy --only firestore:rules
```

### Option 2: Manual Deploy via Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **hestim-talent-academy**
3. Go to **Firestore Database** → **Rules** tab
4. Copy the content from `firestore.rules` file
5. Paste it into the console Rules editor
6. Click **Publish**

## Checking if Rules are Deployed

After deployment, you can verify:

```bash
# Get current deployed rules
firebase firestore:get-rules

# Or check in Console: Firestore → Rules tab
```

## Current Rules Structure

### Admin Access
- Admins can read/write most collections without restrictions
- `isAdmin()` checks `request.auth.uid in users/{uid}.data.roles` array

### User Rules
- All authenticated users can read `/users`
- Users can only create/update their own profile
- Admins can manage any user

### Talent & Offers Rules
- All signed-in users can read talents
- Users can only create/update their own talents
- Offers inherited from talent permissions

### Transaction Rules (Important!)
- Learners can only read their own transactions (`learnerId == uid`)
- Trainers can only read their own transactions (`trainerId == uid`)
- Admins can read all transactions

### Chat Rules
- Users can only read chats they're a participant in
- Admins can read all chats

### Review & Follow Rules
- All signed-in users can read
- Users can only create/update their own

## If You Still Get "Permission Denied" Errors

### Troubleshooting Steps:

1. **Verify rules are deployed**
   ```bash
   firebase firestore:get-rules
   ```
   Should show the latest rules with `in operator`

2. **Check user has admin role**
   - Go to Firestore → Collections → users
   - Find your user document
   - Verify `roles` field contains `'admin'` string

3. **Check browser console** for exact error code:
   - `permission-denied` → Rules issue
   - `not-found` → Collection doesn't exist
   - Other → Check Firebase console logs

4. **Check Firestore Rules Playground**
   - In Firebase Console → Firestore → Rules
   - There's a "Rules Playground" button at the top
   - Test your rules without deploying

## AdminPanel Permission Error Fix

If AdminPanel shows "Missing or insufficient permissions":

### The Issue:
- AdminPanel tries to read ALL documents from collections
- Firestore rules require per-document permission checks
- Non-admin users can't read all documents

### Solution:
Ensure the user accessing `/admin` has `'admin'` role:

```typescript
// In Firestore → users/{uid}
{
  uid: "...",
  email: "admin@hestim.ma",
  displayName: "Admin User",
  roles: ["admin", "trainer"]  // Must include 'admin'
}
```

## Database Structure Expected

Your Firestore should have:

```
/users/{uid}
  - roles: ["learner"] or ["trainer"] or ["admin"]
  - email, displayName, photoURL, etc.

/talents/{talentId}
  - trainerId: "{uid}"
  - /offers/{offerId}

/transactions/{transId}
  - learnerId: "{uid}"
  - trainerId: "{uid}"

/chats/{chatId}
  - participants: ["{uid1}", "{uid2}"]
  - /messages/{msgId}

/reviews/{reviewId}
  - learnerId: "{uid}"

/follows/{followId}
  - followerId: "{uid}"
  - followingId: "{uid}"
  - followingType: "user" or "talent"
```

## After Deploying Rules

1. ✅ Build your app: `npm run build`
2. ✅ Test locally: `npm run dev`
3. ✅ Commit changes: `git add . && git commit -m "Deploy Firebase security rules"`
4. ✅ Push to Netlify: `git push origin main`
5. ✅ Test on deployed app

## Firestore Rules Syntax Notes

### Key Operators:
- `in` - Check if value exists in array (e.g., `request.auth.uid in array`)
- `==` - Exact match
- `hasAny()` - ❌ DEPRECATED, use `in` instead

### Functions Available:
```typescript
isSignedIn()           // true if user is authenticated
isOwner(userId)        // true if current user == userId
isAdmin()              // true if user has 'admin' role
get(path)              // Read another document during permission check
```

## Questions? 

Check Firebase docs: https://firebase.google.com/docs/firestore/security/secure-data

