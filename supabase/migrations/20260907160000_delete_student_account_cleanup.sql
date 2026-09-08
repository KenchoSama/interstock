-- delete_student_account (pre-existing function, not previously in tracked
-- migrations) was missing cleanup for four tables that hold RESTRICT-type
-- foreign keys back to profiles.id: friend_requests, friends, messages, and
-- class_fund_transactions (the last from a feature built this session).
-- A student with friends, DMs, or class-fund trades would fail deletion with
-- a foreign key violation — this adds the missing cleanup, matching the
-- function's existing defensive to_regclass(...) guard style.
create or replace function public.delete_student_account(target_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- Only admins/school_admins may call this
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'school_admin')
  ) then
    raise exception 'Not authorized to delete student accounts';
  end if;

  if to_regclass('public.transactions') is not null then
    delete from public.transactions where portfolio_id in (select id from public.portfolios where user_id = target_id);
  end if;

  if to_regclass('public.holdings') is not null then
    delete from public.holdings where portfolio_id in (select id from public.portfolios where user_id = target_id);
  end if;

  if to_regclass('public.portfolio_snapshots') is not null then
    delete from public.portfolio_snapshots where portfolio_id in (select id from public.portfolios where user_id = target_id);
  end if;

  if to_regclass('public.assessments') is not null then
    delete from public.assessments where student_id = target_id;
  end if;

  if to_regclass('public.user_badges') is not null then
    delete from public.user_badges where user_id = target_id;
  end if;

  if to_regclass('public.field_trip_registrations') is not null then
    delete from public.field_trip_registrations where user_id = target_id;
  end if;

  if to_regclass('public.diplomas') is not null then
    delete from public.diplomas where user_id = target_id;
  end if;

  if to_regclass('public.mentor_assignments') is not null then
    delete from public.mentor_assignments where student_id = target_id;
  end if;

  if to_regclass('public.etf_submissions') is not null then
    delete from public.etf_submissions where user_id = target_id;
  end if;

  if to_regclass('public.support_tickets') is not null then
    delete from public.support_tickets where user_id = target_id;
  end if;

  if to_regclass('public.game_sessions') is not null then
    delete from public.game_sessions where user_id = target_id;
  end if;

  if to_regclass('public.lesson_progress') is not null then
    delete from public.lesson_progress where student_id = target_id;
  end if;

  if to_regclass('public.competition_registrations') is not null then
    delete from public.competition_registrations where user_id = target_id;
  end if;

  if to_regclass('public.friend_requests') is not null then
    delete from public.friend_requests where sender_id = target_id or receiver_id = target_id;
  end if;

  if to_regclass('public.friends') is not null then
    delete from public.friends where user_id = target_id or friend_id = target_id;
  end if;

  if to_regclass('public.messages') is not null then
    delete from public.messages where sender_id = target_id or receiver_id = target_id;
  end if;

  if to_regclass('public.class_fund_transactions') is not null then
    delete from public.class_fund_transactions where user_id = target_id;
  end if;

  if to_regclass('public.portfolios') is not null then
    delete from public.portfolios where user_id = target_id;
  end if;

  delete from public.profiles where id = target_id;

  delete from auth.users where id = target_id;
end;
$function$
