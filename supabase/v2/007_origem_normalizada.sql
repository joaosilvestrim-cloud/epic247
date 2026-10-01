-- Fonte e meio padronizados (Modelo de Dados §3). O valor bruto da utm
-- continua gravado; estas funções só agrupam para relatório.

create or replace function fonte_normalizada(v text) returns text
language sql immutable as $$
  select case
    when v is null or btrim(v) = '' or lower(btrim(v)) in ('direct', 'direto', '(direct)') then 'direct'
    when lower(v) ~ '^(instagram|ig|insta)' or lower(v) like '%instagram%' then 'instagram'
    when lower(v) ~ '^(facebook|fb|meta|messenger|an|audience_network)' or lower(v) like '%facebook%' then 'meta'
    when lower(v) ~ '^(linkedin|lnkd|li)$' or lower(v) like '%linkedin%' then 'linkedin'
    when lower(v) ~ '^(email|e-mail|mail|newsletter|resend)' then 'email'
    when lower(v) ~ '^(google|gads|adwords|youtube)' or lower(v) like '%google%' then 'google'
    when lower(v) ~ '^(partner|parceiro|parceria|afiliado)' then 'partner'
    else 'other'
  end
$$;

create or replace function meio_normalizado(v text) returns text
language sql immutable as $$
  select case
    when v is null or btrim(v) = '' then 'direct'
    when lower(v) in ('organic', 'organico', 'orgânico', 'bio', 'social', 'post', 'reel', 'stories') then 'organic'
    when lower(v) in ('paid_social', 'paid', 'cpc', 'ppc', 'ads', 'pago', 'paidsocial') then 'paid_social'
    when lower(v) in ('email', 'e-mail', 'newsletter') then 'email'
    when lower(v) in ('referral', 'indicacao', 'indicação') then 'referral'
    when lower(v) in ('search', 'busca', 'seo') then 'search'
    else 'other'
  end
$$;
