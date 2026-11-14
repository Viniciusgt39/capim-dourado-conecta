# Testes e evidências

Data da verificação: 14/11/2026 (UTC).

## Incremento Gemini/mobile — 14/11/2026

`bun run test`: **4 arquivos / 18 testes aprovados**. Novos casos verificam filtro de 250 reais, rejeição de facetas inventadas, mesma oferta respeitando mínimo/máximo, aranha no clique 13, base mínima de tendência, peso de reservas no ranking, entrada por QR e exclusão de paradas expiradas.

Chromium contra a aplicação real, com login pelas contas demonstrativas existentes:

- Pesquisa “Quero um tênis branco até 250 reais” chamou Gemini e exibiu somente o tênis do catálogo, com cor/categoria/teto aplicados.
- Uma primeira resposta HTTP 200 falhou na validação local; instruções explícitas do objeto foram corrigidas e a pesquisa foi repetida com sucesso. Não houve substituição de modelo.
- Analisar interesses retornou sugestões de produtos existentes; seleção restringida a candidatos permitidos. São sinais, não previsão treinada.
- Mais 12 cliques na mesma pesquisa exibiram a aranha (13 no total), sem repetir chamada Gemini.
- Duas missões simuladas persistiram após recarregar e seus dois cupons apareceram na aba Cupons. Consulta ao banco confirmou 2 conclusões / 2 cupons de missão.
- Banco confirmou 2 eventos de pesquisa. Movida mostrou 2 pesquisas relacionadas ao tênis, sem identidade/frase, e amostra insuficiente para tendência.
- Analisar oportunidades no lojista chamou Gemini real e retornou análise conservadora de amostra pequena.
- Foram criadas reservas reais na demo para Movida e Essenza. `/app/visita?entrada=sul` reconheceu a entrada e exibiu Essenza → Movida no mapa fictício; reservas expiradas não apareceram. As duas reservas foram canceladas pela interface depois do teste.
- Vitrine, visita e missões: 390 × 844, largura de documento 390, sem rolagem horizontal. Nenhum erro de página capturado nos fluxos concluídos.
- Registros do AI Gateway confirmaram chamadas Gemini `google/gemini-3.1-flash-lite` HTTP 200 de busca/interesses/oportunidades. Compilação automática terminou sem erros.

Capturas foram inspecionadas durante a execução; estão em diretórios temporários de verificação, não nos anexos antigos. Dados novos de demo (pesquisas, duas missões/cupons e reservas canceladas) foram preservados para demonstrar persistência. Nenhum dado real de cliente foi utilizado.

Limites: scanner físico/câmera, QR instalado no shopping, mapa oficial, tempo real de caminhada, confirmação real de visita, estacionamento, descontos comerciais, treino/calibração de predição, infraestrutura de escala, voz e login social externo não foram verificados/implementados neste incremento. O parâmetro do link QR, não localização física, identifica a entrada.

## Testes automatizados executados

Comando: `bun run test`.

Resultado: **3 arquivos e 10 testes aprovados**.

- `app-routing.test.tsx`: a rota `/` não cai em not-found.
- `catalog-rules.test.ts`: interpretação de “tênis branco até 250 reais”, filtros combinados, estado vazio honesto e recomendação por categoria.
- `reservation-rules.test.ts`: expiração no horário limite, expiração de confirmada, preservação de recusada, formato de duas horas e bloqueio de reserva expirada como ativa.

Durante a escrita dos testes, a massa inicial do filtro não continha uma oferta com preço. O caso falhou corretamente; a massa foi corrigida com preço de R$ 239,90 e a suíte completa foi executada novamente com sucesso.

## Fluxo ponta a ponta no navegador

Executado com Chromium/Playwright contra `http://localhost:8080`, com contas fictícias e interface real:

1. Landing → acesso do cliente demo → vitrine.
2. Busca “Quero um tênis branco até R$ 250” → apenas o tênis cadastrado no filtro principal.
3. Comparativo Movida/Essenza → seleção de uma oferta em cada loja.
4. Criação do grupo `f015224f`: Essenza `24D39E` e Movida `736262`, ambos com aproximadamente 2 horas restantes.
5. Movida confirmou `736262`; Essenza recusou `24D39E`.
6. Ao voltar ao cliente, Movida apareceu “Confirmada” e Essenza “Não confirmada”.
7. Nenhum erro de página foi capturado.

Os registros criados por essa automação foram removidos após a verificação para devolver a demonstração ao seed limpo.

## Permissões e disponibilidade

Com a sessão do lojista Movida:

- Tentativa de confirmar a reserva Essenza `DEMO04`: recusada com “Reserva não encontrada para esta loja”.
- Tentativa de alterar a oferta Essenza `tenis-essenza`: recusada com “Oferta não encontrada para esta loja”.
- A oferta Movida `fone-movida` foi marcada `UNAVAILABLE`; a consulta pública refletiu o valor.
- A reserva confirmada `DEMO03` permaneceu `CONFIRMED`.
- A oferta foi restaurada para `AVAILABLE` após o teste.

## Responsividade e evidências visuais

Viewport móvel verificado: 390 × 844 px. Landing e vitrine tiveram `scrollWidth = 390`, sem rolagem horizontal. Também foram capturados o fluxo desktop em 1280 × 1800 px.

Capturas em `docs/evidencias/`:

- `01-landing-mobile.png`
- `02-busca-catalogo.png`
- `03-reserva-multiloja.png`
- `04-painel-movida.png`
- `05-retorno-cliente.png`
- `06-vitrine-mobile.png`

## Limites da verificação

Não foram testados envio real de e-mail, provedores sociais em janela externa, reconhecimento de voz com microfone físico, publicação, ERP, WhatsApp ou pagamento. Não se afirma integração com sistemas reais do shopping.
