-- =====================================================================
-- Darte permiso de administrador (una sola vez, después de schema.sql).
-- 1. Supabase > Authentication > Users > Add user > Create new user:
--    tu correo y una contraseña (marca "Auto Confirm User").
-- 2. Cambia el correo de abajo por el tuyo y ejecuta esto en SQL Editor.
-- 3. Authentication > Sign In / Providers > desactiva "Allow new users to sign up".
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'tu-correo@ejemplo.com'
on conflict do nothing;

-- Debe mostrar tu correo. Si sale vacío, revisa que el correo esté igual que en Authentication.
select u.email from public.admins a join auth.users u on u.id = a.user_id;
