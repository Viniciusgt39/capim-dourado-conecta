# Capim Dourado Connect — guia para manutenção e refatoração

## 1. Leia antes de alterar

Este guia é o ponto de entrada para outra ferramenta entender o aplicativo. Não modifique os documentos originais de `docs/scizor38/`: regulamento, escopo Capim Dourado, planejamento técnico e README da equipe. Conflitos obedecem: regulamento → requisitos Scizor → planejamento inicial para requisitos complementares → V2 compatível com essas fontes → imagens. Registre qualquer mudança funcional em `DECISOES.md`; requisitos adiados não estão descartados.

O aplicativo é um protótipo não oficial com produtos, lojas, preços e benefícios demonstrativos. Seu objetivo é conectar pesquisa digital e visita presencial, sem pagamento online. A experiência prioritária é o navegador mobile.

## 2. O que já funciona

- Cadastro público de cliente; lojistas previamente vinculados a suas lojas.
- Catálogo compartilhado, ofertas por loja, comparação, favoritos privados e carrinho multiloja.
- Uma transação cria um grupo e uma reserva por loja. Prazo de duas horas calculado no banco, preço congelado, envio idempotente e decisões independentes.
- Disponibilidade manual: não existe promessa de estoque físico nem dedução automática. Indisponibilidade recusa pendentes afetadas, preservando confirmadas.
- Cupons ilustrativos de boas-vindas/confirmação e notificações internas.
- Busca local e recomendações por regras; a integração Gemini e os novos módulos estão em implementação, não verificados nesta versão inicial do guia.

## 3. Mapa de arquivos e responsabilidades

| Local | Responsabilidade |
|---|---|
| `src/router.tsx` | Cria o roteador e o contexto de cache de consultas. |
| `src/start.ts` | Inicializa o servidor, proteção de requisições e envio do token de sessão às funções. |
| `src/routes/__root.tsx` | Documento HTML, fontes, provedores globais, notificações e tratamento de erros. |
| `src/routes/index.tsx` | Entrada pública/landing e identificação do protótipo. |
| `src/routes/auth.tsx` | Login/cadastro e provedores sociais. |
| `src/routes/_authenticated/route.tsx` | Proteção gerenciada do conjunto de páginas autenticadas. |
| `src/routes/_authenticated/app.tsx` | Navegação do cliente, cabeçalho e carrinho. |
| `src/routes/_authenticated/app.index.tsx` | Vitrine, busca e filtros. |
| `src/routes/_authenticated/app.produto.$id.tsx` | Produto e comparação das ofertas. |
| `src/routes/_authenticated/app.reservas.tsx` | Entrada da página de reservas. |
| `src/routes/_authenticated/app.conta.tsx` | Entrada da conta. |
| `src/routes/_authenticated/lojista.tsx` | Pedidos e disponibilidade da própria loja. |
| `src/features/auth/functions.ts` | Resolve identidade, papel e vínculo com loja no servidor. |
| `src/features/catalog/functions.ts` | Consulta pública do catálogo e configuração de cache. |
| `src/features/account/functions.ts` | Favoritos, preferências, cupons e notificações da conta. |
| `src/features/account/account-page.tsx` | Interface da conta. |
| `src/features/reservations/functions.ts` | Consultas autenticadas e chamadas das transações de reserva. |
| `src/features/reservations/reservations-page.tsx` | Selecionados, revisão, reservas, cancelamento e expiração. |
| `src/lib/catalog.ts` | Tipos, imagens, filtros, parser local e pontuação base. |
| `src/lib/reservations.ts` | Tipos e regras puras de status/tempo. |
| `src/components/app/` | Marca, cartões de produto, carrinho e notificações compartilhadas. |
| `src/components/ui/` | Componentes acessíveis de interface; reutilize-os. |
| `src/styles.css` | Tokens de cores, tipografia, efeitos e movimento reduzido. |
| `src/integrations/` | Clientes e autenticação gerados pela plataforma; não editar arquivos gerados. |
| `src/test/` | Testes de regras e navegação. |
| `drizzle/migrations/` | Histórico das mudanças do banco gerenciado pela plataforma. |
| `docs/evidencias/` | Capturas das verificações anteriores; não representam automaticamente as funcionalidades novas. |

## 4. Dados e segurança

`profiles` contém perfil, não privilégios. `user_roles` contém papéis; `merchant_memberships` contém vínculo com loja. `products`, `stores` e `offers` são o catálogo. `favorites` pertence ao cliente. `reservation_groups`, `reservations` e `reservation_items` modelam o pedido dividido. `coupons`, `user_coupons` e `notifications` completam o engajamento.

Políticas PostgreSQL RLS são a barreira de acesso. Funções autenticadas recebem o cliente do banco limitado à sessão; funções transacionais verificam proprietário/papel/loja. Não use privilégio administrativo para consultas normais. Nunca exponha favoritos individuais ao lojista nem confie em IDs ou papéis enviados pelo navegador.

## 5. Por que esta stack

- **TanStack Start + React + TypeScript:** mantém a stack existente, oferece páginas e funções tipadas no mesmo projeto e evita migrar para Express/React Router sem benefício demonstrado. TypeScript explicita contratos entre módulos.
- **TanStack Query:** cache, atualização e invalidação após mutações sem duplicar estado remoto nos componentes.
- **Lovable Cloud / PostgreSQL:** autenticação gerenciada, transações, chaves estrangeiras, índices e RLS atendem ao isolamento de clientes/lojistas e à reserva multiloja. SQLite isolado não atenderia a essa concorrência/distribuição sem outro servidor.
- **Tailwind v4 + componentes Radix/shadcn existentes + Lucide:** reaproveitamento da interface e controles acessíveis, sem um segundo sistema visual.
- **Gemini via Lovable AI Gateway + Vercel AI SDK (incremento planejado):** modelo real solicitado, chave exclusivamente no servidor, estrutura validada e correlação das chamadas. Extração leve não exige agente autônomo nem treinamento de modelo próprio. A chave colada no chat não será incorporada ao código.
- **Vitest + Playwright:** regras puras e percursos reais, respectivamente; testes de UI não substituem verificação de autorização no banco.

## 6. Preparação para escala, não infraestrutura nova

Organize por domínio, mantenha funções pequenas e contratos serializáveis. Regras puras ficam fora das telas; segredos e prompts em arquivos server-only. Futuramente: paginação, agregações periódicas, retenção auditada, filas limitadas/idempotentes, observabilidade, avaliação de extração, testes de carga e mapa oficial. Não introduzir agora microserviços, Redis, filas ou pipelines de treinamento.

## 7. Como validar e documentar

`bun run test` executa a suíte. O ambiente Lovable verifica compilação automaticamente. Verifique no navegador sessões de cliente e lojista, favoritos, reserva em duas lojas, recusa/confirmação independente, indisponibilidade, expiração e mobile. Nunca registrar credenciais em capturas ou logs.

`README.md`: entrada e execução. `DECISOES.md`: mudanças e justificativas. `USO_DE_IA.md`: técnica, dados enviados e limites. `TESTES_E_EVIDENCIAS.md`: verificações efetivamente executadas. `roadmap.md`: tarefas abertas. `AGENTS.md`: regras técnicas para ferramentas futuras.

## 8. Incremento solicitado

1. Gemini extrai filtros de linguagem natural, com autorização específica, validação e consulta apenas ao catálogo.
2. Recomendações explicáveis usam favoritos/reservas; Gemini interpreta sinais minimizados somente por ação explícita. Não chamar pontuação de probabilidade treinada.
3. Lojista vê pesquisas agregadas recentes, comparação entre períodos e oportunidades fundamentadas, não identidade dos pesquisadores.
4. Aranha desce após 13 cliques no botão Buscar, sem gerar chamadas repetidas de IA.
5. Guia de visita por entrada informada no QR, com planta/rota fictícia claramente identificada.
6. Missões e recompensas demonstrativas, sem prometer estacionamento grátis real ou comprovar uma visita inexistente.

WhatsApp automático, ERP, estoque físico, pagamento, provador inteligente e fidelidade oficial permanecem fora desta implementação; os requisitos continuam registrados nas fontes.