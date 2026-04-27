## Goal

Add a private admin area at `/admin` where only the **chef** and **owner** can sign in and manage the menu (add, edit, delete, toggle availability of items, and adjust custom-meal ingredients). The public menu page will read from the same database so changes go live instantly.

## What you (the user) will see

1. A new **Login** page at `/admin/login` (email + password).
2. A new **Admin Dashboard** at `/admin` with tabs:
   - **Menu Items** — table of all dishes with edit / delete / toggle "available" buttons, plus an "Add new dish" form (name, description, price, prep time, category).
   - **Custom Meal Ingredients** — manage the list used by the "Build Your Own Meal" feature (name, category, price).
   - **Settings** — change the custom-meal base price and base prep time.
3. A small **"Staff login"** link in the footer of the public site (subtle, not prominent).
4. Customers see no change in flow — the menu just now loads from the database.

## Access control

- Only users explicitly granted the **`chef`** or **`owner`** role can reach `/admin`. Everyone else (including signed-in customers) is redirected away.
- Sign-up is disabled on the admin login page. The first **owner** account is seeded by you (instructions provided after setup); the owner can then invite the chef from the dashboard by creating their account and assigning the `chef` role.

## Technical details

- **Lovable Cloud** is enabled to provide auth + database.
- **Auth**: email/password only (no Google for staff). Sessions handled via `onAuthStateChange`.
- **Tables**:
  - `app_role` enum: `owner`, `chef`.
  - `user_roles (id, user_id → auth.users, role)` with the standard `has_role()` SECURITY DEFINER function and RLS (per project security rules — roles never on profiles).
  - `menu_items (id, name, description, price, prep_time, category, available, sort_order, created_at)`.
  - `ingredients (id, name, category, price, available, created_at)`.
  - `app_settings (key, value)` for custom-meal base price / prep time.
- **RLS**:
  - `menu_items` and `ingredients`: public SELECT (so customers can read), INSERT/UPDATE/DELETE restricted to `has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'chef')`.
  - `user_roles`: SELECT for the row's owner; INSERT/DELETE restricted to `owner` only (so only owners can grant/revoke chef access).
  - `app_settings`: public SELECT, write restricted to `owner`.
- **Seed data**: existing hard-coded `menuData` and `availableIngredients` from `src/types/menu.ts` migrated into the DB on first run.
- **Frontend changes**:
  - New `useMenu()` hook fetching `menu_items` and `ingredients` from Supabase (with realtime so the public menu updates live when staff edit).
  - `MenuItems.tsx` and `CustomMealBuilder.tsx` updated to consume the hook instead of static data.
  - New routes in `App.tsx`: `/admin/login`, `/admin` (wrapped in a `RequireStaff` guard component).
  - New files: `src/pages/AdminLogin.tsx`, `src/pages/Admin.tsx`, `src/components/admin/MenuItemsTable.tsx`, `src/components/admin/IngredientsTable.tsx`, `src/components/admin/SettingsPanel.tsx`, `src/components/admin/RequireStaff.tsx`, `src/hooks/useMenu.ts`, `src/hooks/useStaffAuth.ts`.

## Out of scope (can come later)

- Inviting chef accounts via email link (for now, owner creates the account from the dashboard).
- Image uploads for dishes.
- Audit log of who changed what.
- Order management from the admin (kitchen view) — say the word and I'll add it next.

## After approval

I'll enable Lovable Cloud, run the migrations, seed the existing menu, build the screens, and give you the steps to claim the first owner account.