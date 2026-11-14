# Decisões de implementação

## Escopo

A versão 2 do escopo consolidado prevalece sobre o planejamento inicial. O núcleo é descoberta, favoritos e reserva multiloja com atendimento do lojista. WhatsApp, mapa, provador, fidelidade e pagamentos não foram apresentados como entregues.

## Stack

O projeto utiliza TanStack Start, React e TypeScript por ser a arquitetura já configurada. A persistência e autenticação usam Lovable Cloud. As operações compostas de reserva e decisão do lojista são funções PostgreSQL transacionais chamadas por server functions autenticadas. O frontend não é tratado como barreira de segurança.

## Perfis e demonstração

O cadastro público cria somente clientes. Papéis ficam em `user_roles`, separados do perfil. Lojistas são vinculados por `merchant_memberships`. As três contas seed usam e-mails reservados `.test`, senha fictícia documentada e dados exclusivamente demonstrativos.

## Reservas

Uma operação cria um grupo e uma reserva por loja. O servidor calcula `expires_at = now() + 2 horas`. O preço é copiado para snapshot. Uma chave de idempotência evita duplicação por repetição de envio. A expiração é derivada pela data em leituras e verificada em cada mutação, sem depender de um timer do navegador.

## Estoque

O modo implementado é `MANUAL_CONFIRMATION`. Não há dedução ou promessa de estoque físico. Ao marcar uma oferta indisponível, pendências com a oferta são recusadas com motivo `UNAVAILABLE`; reservas confirmadas permanecem inalteradas.

## Busca e recomendações

A busca por linguagem natural é um parser determinístico local com categorias, cores, marcas, lojas e limites de preço conhecidos. Não usa modelo externo e nunca gera produtos. A transcrição por voz só ocorre quando o navegador oferece Web Speech API e precisa ser confirmada pelo usuário. Recomendações usam pontuação por categoria, marca e promoção.

## Easter eggs

A aranha usa o botão secundário de ajuda após 13 cliques, evitando 13 navegações no CTA principal. O gato aparece uma vez por reserva expirada observada. Ambos respeitam `prefers-reduced-motion` e não bloqueiam controles.

## Imagens e marca

As oito fotografias de produto foram geradas especificamente para o protótipo, sem logotipos. A identidade é textual e baseada nas cores aproximadas propostas no escopo; não pressupõe autorização de marca oficial.
