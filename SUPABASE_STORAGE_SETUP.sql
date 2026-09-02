-- 1. Create a new public bucket named 'wed-assets'
insert into storage.buckets (id, name, public)
values ('wed-assets', 'wed-assets', true);

-- 2. Allow public access to read files
create policy "Allow public read access"
on storage.objects for select
using ( bucket_id = 'wed-assets' );

-- 3. Allow anonymous or authenticated to upload files
create policy "Allow public upload access"
on storage.objects for insert
with check ( bucket_id = 'wed-assets' );

-- 4. Allow public update access (for overriding the same file)
create policy "Allow public update access"
on storage.objects for update
using ( bucket_id = 'wed-assets' );

-- 5. Allow public delete access
create policy "Allow public delete access"
on storage.objects for delete
using ( bucket_id = 'wed-assets' );
