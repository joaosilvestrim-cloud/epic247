-- Derivação editorial com campanha própria (utm_campaign), para peças pagas
-- seguirem o padrão objetivo_onda_dimensao (Funis §27).
alter table editorial_derivations add column if not exists campanha text;
