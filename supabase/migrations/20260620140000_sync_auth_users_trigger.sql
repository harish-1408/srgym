-- Auto-create/update auth.users entries when public.auth is modified
-- so that editing the auth table directly in the dashboard works for login.
CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_user_id uuid;
BEGIN
  v_email := lower(NEW.user_id) || '@srgym.local';

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_sso_user, is_anonymous,
      confirmation_token, recovery_token,
      email_change_token_current, email_change_token_new,
      email_change, email_change_confirm_status
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id,
      'authenticated', 'authenticated', v_email,
      extensions.crypt(NEW.password, extensions.gen_salt('bf', 10)),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false, false,
      '', '', '', '',
      '', 0
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id::text, v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', false,
        'phone_verified', false
      ),
      'email', now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(NEW.password, extensions.gen_salt('bf', 10)),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_auth_user
  AFTER INSERT OR UPDATE ON public.auth
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user();
