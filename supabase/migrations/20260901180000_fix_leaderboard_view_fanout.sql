-- The leaderboard view joined portfolios by user_id with no filter, so once
-- a student could have both a general portfolio and a tournament portfolio,
-- it returned one row per portfolio instead of one row per student, breaking
-- every .single()/.maybeSingle() consumer (Profile page, Dashboard mini
-- leaderboard, profile ranks). Scope it back to the general portfolio only —
-- tournament-specific standings are served separately by
-- useTournamentLeaderboard.
create or replace view public.leaderboard as
select
  p.id,
  p.full_name,
  p.xp,
  p.school_id,
  s.name as school_name,
  round((latest.total_value - 10000::numeric) / 10000::numeric * 100::numeric, 2) as return_pct,
  latest.total_value,
  rank() over (order by latest.total_value desc) as global_rank
from profiles p
  join portfolios po on po.user_id = p.id and po.competition_id is null
  left join schools s on s.id = p.school_id
  join lateral (
    select ps.total_value
    from portfolio_snapshots ps
    where ps.portfolio_id = po.id
    order by ps.recorded_at desc
    limit 1
  ) latest on true
where p.role = 'student'::user_role;
