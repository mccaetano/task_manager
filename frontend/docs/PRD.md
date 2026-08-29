# PRD - Task Manager React

## Resumo

Frontend React autenticado para gerenciamento pessoal de tarefas, integrado ao backend Spring Boot em `localhost:8080`. A experiencia principal combina um quadro Kanban responsivo com uma visao de Agenda cronologica, navegacao direta, animacoes leves e paleta baseada no anexo: `#869BF6`, `#0E5BBD`, `#929684`, `#D27F36` e `#6B9AD5`.

## Decisoes tecnicas

- Stack: Vite, React, TypeScript, React Router, TanStack Query, dnd-kit, lucide-react, Vitest, Testing Library e Playwright.
- Arquitetura: dominios separados em `src/api`, `src/auth`, `src/tasks`, `src/profile` e `src/layout`.
- Estado remoto: TanStack Query para cache, loading, erro, refetch e paginacao incremental.
- Estado de sessao: JWT em `sessionStorage`, com limpeza em expiracao local ou resposta `401`.
- Rede: proxy Vite `/api -> http://localhost:8080` no desenvolvimento e `VITE_API_BASE_URL` para outros ambientes.
- Compartilhamento de dados: Kanban, Agenda e detalhe de tarefa devem reutilizar a mesma fonte de dados e invalidacao de cache para evitar divergencia visual.

## Requisitos funcionais

- Login com `POST /api/auth/login`.
- Cadastro com `POST /api/auth/register`, seguido de login automatico.
- Rotas protegidas para tarefas e perfil.
- Quadro Kanban com colunas `CREATED`, `OPEN`, `FINISHIED` e `CANCELED`, preservando `FINISHIED` no payload.
- Visao Agenda em rota protegida `/agenda`, exibindo tarefas agrupadas por prazo: atrasadas, hoje, amanha, esta semana e futuras.
- Visualizar detalhe da tarefa a partir do Kanban ou da Agenda, exibindo titulo, status, prazo, ultima atualizacao e acoes disponiveis.
- Criar, editar, excluir e mover tarefas entre colunas por drag-and-drop.
- Mudar o status da tarefa com apenas um clique no card, na Agenda e no detalhe da tarefa.
- Buscar tarefas por titulo, filtrar por status e ordenar por prazo ou atualizacao.
- Carregar tarefas de forma incremental a partir da resposta paginada do Spring.
- Editar perfil com `GET /api/users` e `PUT /api/users/{id}`.
- Consultar detalhe individual com `GET /api/tasks/{id}` quando a visualizacao de detalhe for aberta.
- Atualizar status com `PUT /api/tasks/{id}`, enviando o payload completo exigido pelo backend: `title`, `status` e `duedate`.

## Requisitos de UX

- Primeira tela autenticada: quadro de tarefas.
- Sem landing page.
- Desktop com Kanban horizontal, Agenda em timeline/lista densa e sidebar.
- Mobile com colunas empilhadas, Agenda em blocos por data, filtros compactos e navegacao adaptada.
- Cards com borda ate 8px, textos sem sobreposicao e animacoes CSS respeitando `prefers-reduced-motion`.
- Detalhe da tarefa em modal responsivo, sem criar URL publica individual nesta versao.
- Acoes rapidas de status devem usar botoes pequenos e claros para `CREATED`, `OPEN`, `FINISHIED` e `CANCELED`.
- Fluxos de erro com mensagens claras e possibilidade de tentar novamente.

## Testes e aceite

- `npm run test` deve validar sessao JWT, cliente HTTP, metadados de status, login e criacao de tarefas.
- Testes devem validar agrupamento da Agenda por prazo, abertura do detalhe da tarefa e troca de status em um clique.
- `npm run build` deve gerar build de producao sem erros TypeScript.
- `npm run e2e` deve cobrir login, listagem, criacao, navegacao para Agenda, abertura de detalhe, mudanca de status com um clique, movimentacao por status e logout com API mockada.
- O app deve funcionar com o backend local exposto em `http://localhost:8080` e Swagger em `/api/docs/swagger-ui.html`.

## Fora de escopo

- Recuperacao de senha.
- Colaboracao entre usuarios.
- Anexos, notificacoes, comentarios ou prioridade de tarefas.
- Alteracao do contrato da API backend.
