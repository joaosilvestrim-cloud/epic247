-- Feedback qualitativo do resultado (seção 17 de cada Mapa, Fricção §10):
-- a pessoa diz se o resultado faz sentido e, se quiser, comenta.
alter table map_results add column if not exists feedback text check (feedback in ('sim','em_parte','nao'));
alter table map_results add column if not exists feedback_comment text;
alter table map_results add column if not exists feedback_at timestamptz;
