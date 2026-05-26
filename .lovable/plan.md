# Owner-approved staff access

Two parts: (1) get you back in right now, (2) build a sustainable approval flow so nobody ever needs a one-time token again.

## Part 1 — Immediate recovery

You already have an account (the Google-signed-in one sitting at `/admin/pending`). I'll grant the `developer` role to that user directly via a one-off data insert. Faster than minting another token, and once Part 2 ships nobody will need tokens anymore.

I'll need to confirm your user from `auth.users` (by email) before inserting, so I'll show you the match first.

## Part 2 — Access request flow

### New table: `access_requests`
- `user_id` (FK to auth.users), `email`, `note` (optional reason from requester), `status` (`pending` / `approved` / `denied`), `requested_role` (defaults to `chef`), `reviewed_by`, `reviewed_at`, timestamps
- One pending request per user (unique partial index)
- RLS: a user can insert/view their own request; owners + developers can view all and update status

### UI changes

**`/admin/pending` (existing page)** — when a signed-in user has no role:
- Add a "Request staff access" form: role dropdown (chef / owner — never developer from this flow) + optional note
- Show status if a request already exists ("Pending review", "Denied")

**Admin dashboard** — new "Access requests" card visible to owners/developers:
- List pending requests with email, requested role, note, timestamp
- Approve button → inserts into `user_roles`, marks request approved
- Deny button → marks denied (user can re-request later)

**`/admin/login`** — replace the "Builder? Use a setup token →" link with "New here? Sign in and request access" so the token flow is de-emphasized (kept available as a fallback, not advertised).

### Why this is safe
- Self-identifying as a builder gives you **nothing** — only an existing owner/developer can actually grant a role
- No email infrastructure needed, no token leakage risk
- `developer` role still only obtainable via the setup token (preserves the bootstrap guarantee)
- Approvals are auditable (`reviewed_by`, `reviewed_at`)

### Out of scope
- Email notifications to admins when a request comes in (can add later with Lovable's transactional email if you want)
- Bulk approve / role editing UI beyond what `StaffTable` already does

## Technical details
- Migration: `access_requests` table + GRANTs + RLS + unique index on `(user_id) WHERE status = 'pending'`
- New component: `src/components/admin/AccessRequests.tsx` (rendered inside `Admin.tsx` for owners/developers)
- Update `PendingApproval.tsx` to include the request form
- Minor copy change in `AdminLogin.tsx`
