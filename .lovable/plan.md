## Goal

Remove the "first signup = owner" auto-promotion and replace it with a deliberate, owner-controlled role assignment flow. As the builder, you'll get a temporary, revocable **`developer`** role that can manage staff but is clearly not the owner — and you'll hand the owner seat to the real owner with one click, then optionally remove your own access when you're done.

## How role assignment will work

Three roles exist: **`owner`**, **`chef`**, **`developer`**.

- **`owner`** — full control, including assigning/revoking any role (including other owners). Only one person should hold this normally.
- **`chef`** — manage menu items, ingredients, and settings (read).
- **`developer`** — manage staff accounts and roles (so you can bootstrap things), but **cannot** edit the menu or settings. Intended to be removed once the real owner is set up.

### The new bootstrap flow

1. The auto-promotion trigger is **removed**. New signups get **no role** by default and land on a "Pending approval" screen.
2. A **one-time setup token** is generated and shown to you (printed in the migration result, also viewable in the DB). The first user who signs up and submits this token at `/admin/setup` is granted the **`developer`** role. The token is then burned (single use).
3. As the developer, you sign in to `/admin`, go to a new **Staff** tab, and:
   - Invite the real owner: enter their email, they sign up, you click **"Promote to Owner"**.
   - Invite the chef the same way and click **"Assign Chef"**.
4. Once the real owner confirms they're in, you click **"Remove my developer access"** (or they revoke it from their Staff tab). Your account remains but has no staff privileges.

### Staff management UI (new "Staff" tab in /admin)

Visible to `owner` and `developer`:

- Table of all users who have any role: email, role badge, created date.
- Table of pending users (signed up but no role yet): email, "Assign role ▾" dropdown (owner/chef/developer/deny).
- Per-row actions: **Change role**, **Revoke access**.
- Guards:
  - Only `owner` can grant/revoke `owner` and can revoke `developer`.
  - `developer` can grant/revoke `chef` and `developer`, but **cannot** touch `owner` rows.
  - You can never revoke your own last `owner` role (prevents lockout).

## Technical changes

**Migration:**
- Add `'developer'` to the `app_role` enum.
- Drop the `bootstrap_first_owner` trigger and function (no more auto-owner).
- Create `setup_tokens (token text pk, used_at timestamptz)` with one row inserted (random token, returned in migration output). RLS: no public access; only used via a SECURITY DEFINER function.
- Add SECURITY DEFINER function `claim_developer_role(_token text)` — verifies token unused, assigns `developer` role to `auth.uid()`, marks token used. Grants execute to `authenticated`.
- Update `is_staff()` to include `'developer'` so the existing menu RLS keeps working… **actually no** — `developer` should NOT edit menu items. So instead: keep `is_staff()` as `owner|chef` for menu/ingredient writes, and add a separate `can_manage_staff()` returning `owner|developer` for the new Staff tab logic.
- New RLS on `user_roles`:
  - SELECT: user sees own row OR `can_manage_staff(auth.uid())` sees all.
  - INSERT/DELETE: `can_manage_staff(auth.uid())`, with a CHECK trigger preventing non-owners from inserting/deleting rows where `role = 'owner'`, and preventing anyone from removing the last owner.

**Frontend:**
- `useStaffAuth.ts`: add `isDeveloper`, `canManageStaff` flags.
- `RequireStaff.tsx`: allow `owner | chef | developer` through to `/admin`, but the Menu/Ingredients/Settings tabs hide write controls for `developer`.
- New `src/pages/AdminSetup.tsx` at `/admin/setup` — token entry form, calls `claim_developer_role` RPC.
- New `src/components/admin/StaffTable.tsx` — Staff tab, only rendered for `owner` or `developer`.
- `AdminLogin.tsx`: change copy from "Create the first owner account" to "Sign up — an admin will grant you access", and after a fresh signup with no role, redirect to a small "Pending approval" screen instead of looping back to login.
- `Admin.tsx`: add the Staff tab conditionally.

## What you'll do after I implement this

1. I'll print the one-time setup token at the end of the migration.
2. You sign up at `/admin/login`, then go to `/admin/setup`, paste the token → you're now `developer`.
3. Tell the real owner to sign up at `/admin/login`. In your Staff tab, click **Promote to Owner** on their row.
4. (Optional now or later) Click **Remove my access** on your own row.

## Out of scope

- Email invitations (owner still tells staff to sign up manually for now).
- Multi-owner workflows beyond "owner can add another owner".
- Audit log of role changes.
