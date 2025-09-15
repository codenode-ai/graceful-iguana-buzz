-- 03_storage.sql
-- Bucket para relatórios PDF
insert into storage.buckets (id, name, public) values ('reports','reports', false)
on conflict do nothing;

-- Policies para o bucket
drop policy if exists "reports read same company" on storage.objects;
create policy "reports read same company" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports' and
    (metadata->>'company_id')::uuid = (
      select company_id from sociometria.profiles where user_id = auth.uid()
    )
  );

drop policy if exists "reports admin insert" on storage.objects;
create policy "reports admin insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'reports' and
    exists(select 1 from sociometria.profiles p where p.user_id = auth.uid() and p.role = 'admin') and
    (metadata->>'company_id')::uuid = (
      select company_id from sociometria.profiles where user_id = auth.uid()
    )
  );
