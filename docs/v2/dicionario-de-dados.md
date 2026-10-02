# Dicionário de dados do EPIC247 2.0

Resposta ao Modelo de Dados v1.0 §36 e §37. Banco Postgres (Supabase), schema
`v2` em produção e `v2_staging` em homologação. Todos os horários têm fuso
(`timestamptz`). Enums são minúsculos.

**Dono**: DEV, CRM, ANALYTICS, CHECKOUT, CONTENT ou LEGAL (§35).
**Pessoal**: PII é dado que identifica a pessoa; Pseudônimo é identificador sem
nome; Comportamental é o que a pessoa fez. Resultado de Mapa não é dado de saúde
(§37).

## Lead (`leads`)

| Campo | Tipo | Pessoal | Dono | Fonte | Regra de atualização |
|---|---|---|---|---|---|
| lead_id | uuid | Pseudônimo | DEV | criado no primeiro toque relevante | nunca muda; une visitantes pelo e-mail (`merged_into`) |
| email | texto | **PII** | CRM | captura, newsletter, contato, checkout | sobrescreve só se vazio; único entre leads ativos |
| first_name | texto | **PII** | CRM | captura | mantém o primeiro informado |
| lifecycle_stage | enum (9 estágios) | Comportamental | CRM | eventos | só sobe (`promote_lifecycle`); histórico não se apaga |
| inactive_flag, inactive_since | booleano, data | Comportamental | CRM | agendador | liga aos 30 dias sem atividade; zera na próxima atividade |
| first_touch_* (source, medium, campaign, content, term, landing_page, at) | texto | Comportamental | ANALYTICS | utm ou referrer | **imutável** (gatilho no banco recusa alteração) |
| last_touch_* | texto | Comportamental | ANALYTICS | utm ou referrer | atualiza a cada nova interação atribuível |
| first_map, last_map | enum map_type | Comportamental | DEV | conclusão de Mapa | first não muda; last acompanha |
| maps_completed_count | inteiro | Comportamental | DEV | conclusão de Mapa | só cresce |
| first_primary_dimension | enum dimensão | Comportamental | DEV | conclusão | não muda depois de preenchido |
| latest_primary_dimension, latest_secondary_dimension, last_primary_pattern, last_secondary_pattern | texto | Comportamental | DEV | conclusão | acompanha o último Mapa |
| email_consent, email_consent_at, email_consent_source | booleano, data, texto | Comportamental | LEGAL | formulário | registra fonte (`map_result`, `newsletter_form`, `checkout`, `mentoring_form`, `contact_form`) |
| marketing_email_allowed | booleano | Comportamental | LEGAL | caixa de aceite separada | só por ação da pessoa; compra não liga (§10) |
| privacy_policy_version | texto | não | LEGAL | configuração | versão aceita no momento do consentimento |
| unsubscribed_at | data | Comportamental | LEGAL | descadastro ou spam | uma vez preenchido, marketing para |
| email_bounced_at | data | Comportamental | CRM | webhook do Resend | bloqueia envios; zera se o e-mail mudar |
| mentoring_interest, mentoring_waitlist, mentoring_waitlist_at | booleano, data | Comportamental | CRM | formulário da Mentoria | |
| created_at, last_activity_at | data | não | DEV | sistema | |

## Campos derivados (`lead_profile`, calculados na hora)

Não são gravados, para nunca divergirem das transações e da fila (§11, §24, §27).

| Campo | Cálculo |
|---|---|
| plan_purchased, kit_purchased, protocol_purchased, mentoring_purchased | existe compra aprovada do tipo |
| kits_owned, products_owned | dimensões dos Kits e produtos com compra aprovada |
| first_product, last_product | primeiro e último produto comprado (reembolsado continua no histórico) |
| lifetime_revenue_gross, lifetime_revenue_net, lifetime_cash_received | soma das compras aprovadas |
| customer_since, last_purchase_at | primeira e última aprovação |
| current_automation_id | próxima mensagem agendada |
| last_email_sent_at, last_email_opened_at, last_email_clicked_at | da fila de mensagens |
| email_send_count_7d, non_transactional_messages_24h | contagens para o limite de frequência (§25) |
| suppress_plan_offer, suppress_protocol_offer | comprou Protocolo |
| suppress_promotional_email | cliente da Mentoria, descadastro, sem aceite ou e-mail inválido |
| suppress_paid_remarketing_product | produtos já comprados (para exclusão em anúncios) |

## Sessão (`sessions`)

session_id (Pseudônimo), lead_id, session_started_at, landing_page, referrer,
utm_source/medium/campaign/content/term, device, os, in_app, country, region,
city. Dono: ANALYTICS. Local é por cidade, nunca endereço. Sem IP gravado.

## Resultado de Mapa (`map_results`)

| Campo | Pessoal | Observação |
|---|---|---|
| map_result_id | Pseudônimo | uma linha por tentativa; repetir o Mapa cria outra (histórico, §31) |
| map_type, map_version, scoring_version, result_copy_version | não | versão com que o resultado foi calculado e escrito (§34) |
| status, current_step, started_at, completed_at | Comportamental | |
| answers_json | Comportamental | respostas; nunca saem para CRM, analytics ou URL; apagadas na anonimização |
| primary/secondary_dimension, primary/secondary_pattern, result_kind, result_band_primary, scores | Comportamental | `scores` guarda os eixos (score_axis_01 a 05) com os nomes do documento de cada Mapa |
| result_token | Pseudônimo | aleatório de 24 bytes; revisita o resultado sem expor respostas (§32) |
| utm_* | Comportamental | atribuição no momento do Mapa |
| feedback, feedback_comment, feedback_at | Comportamental | "Este resultado faz sentido?" (sim, em_parte, nao) e comentário opcional (seção 17 dos Mapas) |
| chosen_pattern | Comportamental | no empate, a área que a pessoa escolheu para começar; o Plano parte dela (Mapa de Energia §8) |

## Produto (`products`)

product_id (`plan_energia`, `kit_acao`, `protocol`, `mentoring`...),
product_type, product_dimension, product_name, price_list, checkout_url,
provider_product_id (ID na Kiwify), active. Dono: CHECKOUT. Editável em
/admin/epic/produtos. Produto sem checkout nunca aparece como comprável.

## Transação (`transactions`) e histórico de compras (`purchase_history`)

| Campo | Pessoal | Observação |
|---|---|---|
| provider + transaction_id | não | chave única: webhook repetido não duplica (§47) |
| lead_id, product_id | Pseudônimo | |
| transaction_status | não | pending, approved, refunded, chargeback, cancelled |
| payment_method, installments | não | |
| amount_gross, amount_fee, amount_net, amount_received | não | recebido = líquido na data prevista de depósito; zera em reembolso |
| buyer_email | **PII** | apagado na anonimização; transação fica (obrigação fiscal) |
| purchased_at, approved_at, received_at, refunded_at | não | |
| utm_* | Comportamental | da Kiwify (sck/src e utm do link) |

## Checkout (`checkouts`, visão)

checkout_id (= event_id do StartCheckout), lead_id, checkout_product_id,
checkout_started_at, checkout_status (`started`, `completed`, `abandoned`
após 1 h, `expired` após 72 h), checkout_abandoned_at, transaction_id (§23).

## Evento (`events`)

Estrutura padrão do §14: event_id (chave de deduplicação), event_name,
lead_id, session_id, occurred_at, page_url (sem domínio e sem parâmetros
pessoais), referrer, utm_*, map_type, dimension, primary/secondary_pattern,
product_id, product_type, product_price, transaction_id, question_index,
props. Campos não aplicáveis ficam nulos.

Eventos core: ViewHome, ViewDimensionPage, ViewMapEntry, StartMap,
MapQuestionProgress, CompleteMap, ViewMapResult, SubmitMapEmail,
ViewPlanOffer, PurchasePlan, ViewKitOffer, PurchaseKit, ViewProtocolOffer,
PurchaseProtocol, ViewMentoring, MentoringInterest, StartCheckout, Purchase,
Refund, Unsubscribe. Eventos de automação: ResultEmailSent,
ResultEmailOpened, ResultEmailClicked, MapNurtureStarted,
MapNurtureConversion, PlanDelivered, PlanDay7Completed, KitDelivered,
ProtocolActivated, MentoringBooked, RecoveredCheckout,
CrossDimensionMapStarted, ResumeMap, NewsletterSignup, ContactSubmitted,
ResultFeedback e LifecycleChanged (gravado pelo banco a cada mudança de
estágio, com o anterior e o novo em `props`).
O navegador só consegue registrar eventos de visualização; compra e e-mail
vêm sempre do servidor.

## Plano gerado (`plan_generations`)

plan_generation_id, lead_id, map_result_id, product_id, provider,
transaction_id, generated_at, input_version, output_version
(plan_template_version), content, access_token (revogado no reembolso),
processing_status, processing_error, retry_count, last_retry_at (§33, §48).

## Mensagem (`messages`)

message_id, lead_id, automation_id, automation_version, step, template_key,
priority (1 transacional a 6 promocional, §26), scheduled_for, status
(scheduled, sent, skipped, cancelled, failed), skip_reason, context,
subject, sent_at, delivery_mode (live ou simulated), provider_message_id,
delivered_at, opened_at, clicked_at, bounced_at, complained_at,
postponed_count, error, dedupe_key (garante uma mensagem por etapa e escopo).

## Integrações e operação

| Tabela | Uso |
|---|---|
| webhook_events | payload cru de cada webhook da Kiwify, com processing_status, erro e tentativas (§48) |
| crm_outbox | fila de saída para CRM externo (map_started, map_completed, lead_identified, mentoring_interest, checkout_started, purchase_approved, refund, unsubscribed) |
| mentoring_applications | candidaturas: nome e e-mail (**PII**), desafio, mudança desejada, disponibilidade, status |
| contact_messages | mensagens do contato (**PII**) |
| content_items | Ideias publicadas no site e edições de newsletter |
| editorial_ideas, editorial_derivations | banco de ideias e peças, com código de utm_content |
| media_spend | investimento em mídia por período, fase, campanha e criativo |
| rate_limits | contagem por IP em hash, apagada após 1 dia |
| app_settings | capacidade da Mentoria, versão da política, última rodada do agendador |

## Retenção e direitos (§38)

- Localizar: /admin/epic/leads (busca por e-mail, nome ou id).
- Exportar: botão "Baixar JSON" na ficha do lead (tudo o que o banco guarda).
- Anonimizar: apaga nome, e-mail, respostas, contato, candidatura, conteúdo
  do Plano e o contexto das mensagens. Mantém transações sem o e-mail e os
  números agregados sem ligação com a pessoa.
- Prazo de retenção: decisão jurídica pendente.
