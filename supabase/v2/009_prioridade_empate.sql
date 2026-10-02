-- Empate em primeiro: a pessoa escolhe por onde começar (Mapa de Energia §8:
-- "prioridade operacional com base na resposta de urgência do usuário").
-- O Plano parte da área escolhida; o resultado em si não muda.
alter table map_results add column if not exists chosen_pattern text;
