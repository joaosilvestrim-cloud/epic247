-- Mentoria piloto congelada (RC1 §5 e §6, Blueprint §54.9, Requisitos RF-060,
-- Matriz §26). Fluxo: interesse → revisão e contato → vaga confirmada →
-- link Kiwify liberado → pagamento confirmado → ativa → concluída.
-- Lista de espera quando os 5 lugares estão ocupados.
--
-- Idempotente: pode rodar de novo e pode rodar sobre dados de produção.
-- Os status antigos (em inglês) são convertidos e a checagem é refeita.
-- "disqualified" vira "encerrado_sem_aderencia": estado interno, nunca
-- comunicado como reprovação.

alter table mentoring_applications
  add column if not exists whatsapp               text,
  add column if not exists context                text,
  add column if not exists kind                   text not null default 'interesse',
  add column if not exists marketing_opt_in       boolean not null default false,
  add column if not exists privacy_policy_version text,
  add column if not exists internal_note          text,
  add column if not exists payment_link_url       text,
  add column if not exists payment_link_sent_at   timestamptz,
  add column if not exists status_changed_at      timestamptz,
  add column if not exists updated_at             timestamptz not null default now();

-- De onde a pessoa entrou. Fica guardado mesmo se depois sair da lista.
alter table mentoring_applications drop constraint if exists mentoring_applications_kind_check;
update mentoring_applications set kind = 'lista_espera' where status in ('waitlist', 'lista_espera') and kind <> 'lista_espera';
alter table mentoring_applications add constraint mentoring_applications_kind_check
  check (kind in ('interesse', 'lista_espera'));

-- Status em português, com as etapas novas do fluxo.
alter table mentoring_applications drop constraint if exists mentoring_applications_status_check;
update mentoring_applications set status = case status
    when 'new' then 'novo'
    when 'in_conversation' then 'em_contato'
    when 'client' then 'ativo'
    when 'waitlist' then 'lista_espera'
    when 'disqualified' then 'encerrado_sem_aderencia'
  end
where status in ('new', 'in_conversation', 'client', 'waitlist', 'disqualified');
alter table mentoring_applications alter column status set default 'novo';
alter table mentoring_applications add constraint mentoring_applications_status_check
  check (status in ('novo', 'em_contato', 'vaga_confirmada', 'link_enviado', 'ativo', 'concluido',
                    'lista_espera', 'encerrado_sem_aderencia'));

create index if not exists mentoring_applications_status_idx on mentoring_applications (status, created_at desc);
create index if not exists mentoring_applications_lead_idx on mentoring_applications (lead_id);
