insert into public.categories (name, slug)
values
  ('Electronics', 'electronics'),
  ('Real Estate', 'real-estate'),
  ('Automotive', 'automotive'),
  ('Services', 'services')
on conflict (slug) do nothing;

insert into public.cities (name, slug)
values
  ('Karachi', 'karachi'),
  ('Lahore', 'lahore'),
  ('Islamabad', 'islamabad')
on conflict (slug) do nothing;

insert into public.packages (name, description, price_pkr, weight, duration_days, is_featured)
values
  ('Starter', 'Good for local visibility', 5000, 1, 15, false),
  ('Growth', 'Higher ranking and longer duration', 12000, 3, 30, false),
  ('Premium Featured', 'Maximum boost with featured highlight', 25000, 7, 45, true)
on conflict (name) do nothing;

