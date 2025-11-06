-- Create property documents table (PDFs, brochures, etc.)
create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  document_url text not null,
  document_type text check (document_type in ('brochure', 'floorplan', 'certificate', 'other')),
  title_en text,
  title_gr text,
  file_size_kb int,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.property_documents enable row level security;

-- Anyone can view documents of published properties
create policy "property_documents_select_all"
  on public.property_documents for select
  using (
    exists (
      select 1 from public.properties
      where id = property_id and (published = true or auth.uid() is not null)
    )
  );

-- Only authenticated users can manage documents
create policy "property_documents_insert_auth"
  on public.property_documents for insert
  with check (auth.uid() is not null);

create policy "property_documents_update_auth"
  on public.property_documents for update
  using (auth.uid() is not null);

create policy "property_documents_delete_auth"
  on public.property_documents for delete
  using (auth.uid() is not null);

create index if not exists idx_property_documents_property on public.property_documents(property_id);
