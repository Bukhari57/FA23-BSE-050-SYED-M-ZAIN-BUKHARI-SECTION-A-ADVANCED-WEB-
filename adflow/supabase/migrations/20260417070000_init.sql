-- AdFlow Pro initial schema
create extension if not exists "pgcrypto";

create type public.user_role as enum ('client', 'moderator', 'admin', 'super_admin');
create type public.ad_status as enum (
  'draft',
  'submitted',
  'under_review',
  'payment_pending',
  'payment_submitted',
  'payment_verified',
  'scheduled',
  'published',
  'expired',
  'rejected'
);

create type public.payment_status as enum ('submitted', 'verified', 'rejected');
create type public.notification_type as enum ('info', 'warning', 'success', 'action');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'client',
  city_id uuid,
  is_seller_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users add constraint users_city_fk foreign key (city_id) references public.cities(id) on delete set null;

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  price_pkr numeric(12,2) not null check (price_pkr > 0),
  weight integer not null default 1 check (weight >= 1),
  duration_days integer not null check (duration_days between 1 and 365),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  title varchar(120) not null,
  slug text not null unique,
  description text not null,
  category_id uuid not null references public.categories(id),
  city_id uuid not null references public.cities(id),
  package_id uuid not null references public.packages(id),
  status public.ad_status not null default 'draft',
  featured boolean not null default false,
  boost_score integer not null default 0 check (boost_score between 0 and 100),
  moderation_notes text,
  published_at timestamptz,
  scheduled_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_media (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'youtube')),
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (ad_id, media_url)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  submitted_by uuid not null references public.users(id) on delete cascade,
  amount_pkr numeric(12,2) not null check (amount_pkr > 0),
  transaction_ref varchar(120) not null unique,
  screenshot_url text not null,
  notes text,
  admin_notes text,
  status public.payment_status not null default 'submitted',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ad_id, transaction_ref)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type public.notification_type not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_status_history (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  old_status public.ad_status,
  new_status public.ad_status not null,
  changed_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  ad_id uuid not null references public.ads(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, ad_id)
);

create table if not exists public.abuse_reports (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  reporter_id uuid references public.users(id) on delete set null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.system_health_logs (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ads_status_published_at on public.ads(status, published_at desc);
create index if not exists idx_ads_category_city on public.ads(category_id, city_id);
create index if not exists idx_ads_client on public.ads(client_id);
create index if not exists idx_ads_expires_at on public.ads(expires_at);
create index if not exists idx_payments_status on public.payments(status, created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_status_history_ad on public.ad_status_history(ad_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.log_ad_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into public.ad_status_history (ad_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, null);
  end if;

  if new.status = 'published' and new.expires_at is null then
    new.expires_at = now() + interval '30 days';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users for each row execute procedure public.set_updated_at();

drop trigger if exists trg_packages_updated_at on public.packages;
create trigger trg_packages_updated_at before update on public.packages for each row execute procedure public.set_updated_at();

drop trigger if exists trg_ads_updated_at on public.ads;
create trigger trg_ads_updated_at before update on public.ads for each row execute procedure public.set_updated_at();

drop trigger if exists trg_ads_status_history on public.ads;
create trigger trg_ads_status_history before update on public.ads for each row execute procedure public.log_ad_status_change();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments for each row execute procedure public.set_updated_at();

alter table public.users enable row level security;
alter table public.ads enable row level security;
alter table public.ad_media enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.bookmarks enable row level security;

create policy if not exists "Users read self" on public.users for select using (auth.uid() = id);
create policy if not exists "Users update self" on public.users for update using (auth.uid() = id);
create policy if not exists "Clients manage own ads" on public.ads for all using (auth.uid() = client_id) with check (auth.uid() = client_id);
create policy if not exists "Public read published ads" on public.ads for select using (status = 'published' and (expires_at is null or expires_at > now()));
create policy if not exists "Clients manage ad media" on public.ad_media for all using (
  exists (select 1 from public.ads a where a.id = ad_id and a.client_id = auth.uid())
) with check (
  exists (select 1 from public.ads a where a.id = ad_id and a.client_id = auth.uid())
);
create policy if not exists "Clients create payments" on public.payments for insert with check (auth.uid() = submitted_by);
create policy if not exists "Clients read own payments" on public.payments for select using (
  exists (select 1 from public.ads a where a.id = ad_id and a.client_id = auth.uid())
);
create policy if not exists "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy if not exists "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
