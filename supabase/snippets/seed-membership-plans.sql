-- Seed SRGYM membership_plans
-- Run in Supabase SQL editor using service role (recommended).

-- Idempotent: upsert by a stable unique identifier.
-- If you don’t have a unique constraint, this will insert duplicates; in that case remove the ON CONFLICT part.

-- Recommended: add a unique constraint on (name) if you want true idempotency.

-- Monthly
INSERT INTO public.membership_plans (name, duration_months, price, features, is_active)
VALUES ('Monthly', 1, 1000, '[]'::jsonb, true)
ON CONFLICT (name) DO UPDATE
SET duration_months = EXCLUDED.duration_months,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- 3 Months
INSERT INTO public.membership_plans (name, duration_months, price, features, is_active)
VALUES ('3months', 3, 2800, '[]'::jsonb, true)
ON CONFLICT (name) DO UPDATE
SET duration_months = EXCLUDED.duration_months,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- 6 Months
INSERT INTO public.membership_plans (name, duration_months, price, features, is_active)
VALUES ('6months', 6, 4500, '[]'::jsonb, true)
ON CONFLICT (name) DO UPDATE
SET duration_months = EXCLUDED.duration_months,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- 12 Months
INSERT INTO public.membership_plans (name, duration_months, price, features, is_active)
VALUES ('12months', 12, 8000, '[]'::jsonb, true)
ON CONFLICT (name) DO UPDATE
SET duration_months = EXCLUDED.duration_months,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

