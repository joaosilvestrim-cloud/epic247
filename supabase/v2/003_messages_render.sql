-- Fila de mensagens: guarda o assunto efetivamente enviado (auditoria e
-- pré-visualização no /admin) e quantas vezes a mensagem foi adiada pelo
-- limite de frequência.
alter table messages add column if not exists subject text;
alter table messages add column if not exists postponed_count smallint not null default 0;
alter table messages add column if not exists delivery_mode text
  check (delivery_mode in ('live','simulated'));
