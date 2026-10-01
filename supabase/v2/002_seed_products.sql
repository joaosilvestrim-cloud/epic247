-- Catálogo inicial (Produtos e Pricing v1.0). Depois da carga, preço,
-- checkout e ativação são editados pelo /admin: este seed não sobrescreve.
-- O checkout do Kit Energia é o mesmo do "Módulo Energia" que já vende hoje.

insert into products (product_id, product_type, product_dimension, product_name, price_list, checkout_url, active)
select 'plan_' || d, 'plan', d, 'Plano EPIC ' || n || ' 7 Dias', 29, null, false
from (values ('energia','Energia'),('mentalidade','Mentalidade'),('autoconhecimento','Autoconhecimento'),
             ('felicidade','Felicidade'),('planejamento','Planejamento'),('coragem','Coragem'),
             ('acao','Ação'),('inteligencia','Inteligência'),('excelencia','Excelência'),('amor','Amor')) v(d, n)
on conflict (product_id) do nothing;

insert into products (product_id, product_type, product_dimension, product_name, price_list, checkout_url, active)
select 'kit_' || d, 'kit', d, 'Kit EPIC ' || n, 97,
       case when d = 'energia' then 'https://pay.kiwify.com.br/vJBeZ8S' end,
       d = 'energia'
from (values ('energia','Energia'),('mentalidade','Mentalidade'),('autoconhecimento','Autoconhecimento'),
             ('felicidade','Felicidade'),('planejamento','Planejamento'),('coragem','Coragem'),
             ('acao','Ação'),('inteligencia','Inteligência'),('excelencia','Excelência'),('amor','Amor')) v(d, n)
on conflict (product_id) do nothing;

insert into products (product_id, product_type, product_dimension, product_name, price_list, checkout_url, active) values
  ('protocol',  'protocol',  null, 'Protocolo EPIC247',        497,  null, false),
  ('mentoring', 'mentoring', null, 'Mentoria EPIC Individual', 1997, null, false)
on conflict (product_id) do nothing;

-- Configuração operacional editável pelo admin (capacidade da mentoria etc.).
create table if not exists app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table app_settings enable row level security;

insert into app_settings (key, value) values
  ('mentoring_capacity', '5'::jsonb),
  ('privacy_policy_version', '"2026-10-01"'::jsonb)
on conflict (key) do nothing;
