-- CMS leve (Blueprint v1.2 §58.1 e Copy Final §23): destaque editorial
-- escolhido à mão, universo editorial interno e imagem social própria.
-- O destaque da página Ideias não é "o último post": é curadoria.

alter table content_items add column if not exists universe text
  check (universe in ('eu_me_vi_aqui','ju_pensa','historias','cultura','ferramentas','movimento'));
alter table content_items add column if not exists featured boolean not null default false;
alter table content_items add column if not exists featured_order smallint;
alter table content_items add column if not exists og_image text;

create index if not exists content_items_destaque_idx on content_items (featured_order nulls last, published_at desc)
  where featured and status = 'published';

-- Contato (Copy Final §24): assunto roteado, WhatsApp opcional, página de
-- origem e versão da política aceita para responder à solicitação.
alter table contact_messages add column if not exists topic text
  check (topic in ('mentoria','produtos','parcerias','ju_imprensa','outro'));
alter table contact_messages add column if not exists whatsapp text;
alter table contact_messages add column if not exists origin_path text;
alter table contact_messages add column if not exists privacy_policy_version text;
