-- Optional: a week of sample live classes (times in IST, stored as UTC).
insert into public.live_classes (title, description, instructor, level, starts_at, duration_minutes)
select
  c.title, c.description, 'Chandra Pratap', c.level,
  (date_trunc('day', now() at time zone 'Asia/Kolkata') + (d || ' days')::interval + c.at) at time zone 'Asia/Kolkata',
  c.duration
from generate_series(0, 6) as d
cross join (values
  ('Sunrise Hatha Flow',       'Gentle awakening sequence with pranayama.',   'all',          interval '06:30', 60),
  ('Core & Balance Vinyasa',   'Dynamic flow building strength and focus.',   'intermediate', interval '08:00', 45),
  ('Evening Yin & Meditation', 'Slow holds, deep release and guided nidra.',  'beginner',     interval '19:00', 60)
) as c(title, description, level, at, duration);
