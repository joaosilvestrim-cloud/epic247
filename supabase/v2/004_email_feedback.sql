-- Retorno do provedor de e-mail (webhooks do Resend).
-- E-mail que voltou (bounce permanente) não recebe mais nada: insistir
-- derruba a reputação do domínio. Reclamação de spam equivale a descadastro.
alter table leads add column if not exists email_bounced_at timestamptz;

alter table messages add column if not exists delivered_at timestamptz;
alter table messages add column if not exists bounced_at timestamptz;
alter table messages add column if not exists complained_at timestamptz;

create index if not exists messages_provider_idx on messages (provider_message_id) where provider_message_id is not null;
