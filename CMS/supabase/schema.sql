create extension if not exists "pgcrypto";

create type committee_status as enum ('open', 'active', 'completed');
create type member_status as enum ('pending', 'approved', 'removed');
create type payment_status as enum ('pending', 'paid', 'confirmed', 'rejected');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  bank_account text,
  iban text,
  trust_score integer not null default 60 check (trust_score between 0 and 100),
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.committees (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text not null,
  duration_months integer not null check (duration_months > 1),
  monthly_amount numeric(12, 2) not null check (monthly_amount > 0),
  max_members integer not null check (max_members > 1),
  start_date date not null,
  current_month integer not null default 1,
  status committee_status not null default 'open',
  created_at timestamptz not null default now()
);

create table public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  turn_order integer not null check (turn_order > 0),
  transaction_id text,
  iban text,
  bank_details text,
  payment_method text,
  status member_status not null default 'pending',
  joined_at timestamptz not null default now(),
  unique (committee_id, user_id),
  unique (committee_id, turn_order)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  member_id uuid not null references public.committee_members(id) on delete cascade,
  month_number integer not null check (month_number > 0),
  amount numeric(12, 2) not null check (amount > 0),
  status payment_status not null default 'pending',
  proof_url text,
  confirmed_by uuid references public.users(id),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (member_id, month_number)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reputation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  committee_id uuid references public.committees(id) on delete set null,
  delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create or replace view public.committee_listings as
select
  c.*,
  coalesce(count(cm.id) filter (where cm.status = 'approved'), 0)::integer as member_count
from public.committees c
left join public.committee_members cm on cm.committee_id = c.id
where c.status = 'open'
group by c.id;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Member'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce((select is_admin from public.users where id = auth.uid()), false);
$$;

create or replace function public.is_committee_creator(committee uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.committees
    where id = committee and creator_id = auth.uid()
  );
$$;

create or replace function public.is_committee_member(committee uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.committee_members
    where committee_id = committee and user_id = auth.uid()
  );
$$;

create or replace function public.is_committee_open(committee uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.committees
    where id = committee and status = 'open'
  );
$$;

alter table public.users enable row level security;
alter table public.committees enable row level security;
alter table public.committee_members enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.reputation_logs enable row level security;

create policy "Users can view active profiles"
on public.users for select
to authenticated
using (not is_banned or id = auth.uid() or public.is_admin());

create policy "Users can create own profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and is_admin = false);

create policy "Admins manage users"
on public.users for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Members can view open and joined committees"
on public.committees for select
to authenticated
using (
  status = 'open'
  or creator_id = auth.uid()
  or public.is_admin()
  or public.is_committee_member(id)
);

create policy "Users create committees"
on public.committees for insert
to authenticated
with check (creator_id = auth.uid());

create policy "Creators update committees"
on public.committees for update
to authenticated
using (creator_id = auth.uid() or public.is_admin())
with check (creator_id = auth.uid() or public.is_admin());

create policy "View relevant members"
on public.committee_members for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_committee_creator(committee_id)
  or public.is_admin()
  or public.is_committee_open(committee_id)
);

create policy "Users request membership"
on public.committee_members for insert
to authenticated
with check (user_id = auth.uid());

create policy "Creators manage membership"
on public.committee_members for update
to authenticated
using (public.is_committee_creator(committee_id) or public.is_admin())
with check (public.is_committee_creator(committee_id) or public.is_admin());

create policy "View relevant payments"
on public.payments for select
to authenticated
using (
  public.is_admin()
  or public.is_committee_creator(committee_id)
  or exists (
    select 1 from public.committee_members
    where id = payments.member_id and user_id = auth.uid()
  )
);

create policy "Members record payments"
on public.payments for insert
to authenticated
with check (
  exists (
    select 1 from public.committee_members
    where id = payments.member_id and user_id = auth.uid() and status = 'approved'
  )
  or public.is_committee_creator(committee_id)
);

create policy "Creators confirm payments"
on public.payments for update
to authenticated
using (public.is_committee_creator(committee_id) or public.is_admin())
with check (public.is_committee_creator(committee_id) or public.is_admin());

create policy "Users view own notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users update own notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "System inserts notifications"
on public.notifications for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "View own reputation logs"
on public.reputation_logs for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Admins manage reputation logs"
on public.reputation_logs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Payment proof uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'payment-proofs');

create policy "Payment proof read"
on storage.objects for select
to authenticated
using (bucket_id = 'payment-proofs');
