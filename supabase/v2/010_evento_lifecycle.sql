-- Modelo de Dados §46 (lifecycle_changed): toda mudança de estágio do lead
-- vira um evento LifecycleChanged, com o estágio anterior e o novo. Feito
-- no banco para valer qualquer que seja o caminho da mudança.

create or replace function leads_registra_lifecycle() returns trigger
language plpgsql as $$
begin
  if new.lifecycle_stage is distinct from old.lifecycle_stage then
    insert into events (event_id, event_name, lead_id, occurred_at, props)
    values (gen_random_uuid(), 'LifecycleChanged', new.lead_id, now(),
            jsonb_build_object('de', old.lifecycle_stage, 'para', new.lifecycle_stage));
  end if;
  return new;
end $$;

drop trigger if exists leads_lifecycle_evento on leads;
create trigger leads_lifecycle_evento after update of lifecycle_stage on leads
  for each row execute function leads_registra_lifecycle();
