- [x] Inspect existing seed script (`scripts/seed-members.ts`).
- [x] Fix seed script: stop logging sensitive env vars.
- [x] Re-run seed script with `bun scripts/seed-members.ts` to confirm it completes.
- [ ] Add/ensure membership plans: Monthly 1000, 3months 2800, 6months 4500, 12months 8000 in `membership_plans`.
- [x] Created SQL seed snippet: `supabase/snippets/seed-membership-plans.sql` (run in Supabase SQL editor; requires unique constraint on `name` for ON CONFLICT).


