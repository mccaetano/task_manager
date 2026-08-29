# Task Manager

Task Manager e uma aplicacao para organizar tarefas pessoais em um fluxo simples. Ela tem login, cadastro, quadro Kanban, visao de Agenda, detalhes da tarefa e mudanca rapida de status.

A ideia do projeto e ser facil de usar: depois de entrar na conta, a pessoa ve suas tarefas, acompanha prazos e muda o andamento com poucos cliques.

## O que a aplicacao faz

- Cria uma conta com nome, telefone, e-mail e senha.
- Faz login com e-mail e senha.
- Mostra tarefas em um quadro Kanban.
- Mostra tarefas em uma Agenda agrupada por prazo.
- Permite criar, editar, excluir e visualizar detalhes de uma tarefa.
- Permite mudar o status da tarefa com um clique.
- Permite buscar, filtrar e ordenar tarefas.
- Permite editar dados do perfil.

## Telas principais

### Login e cadastro

Sao as telas de entrada da aplicacao. O usuario pode criar uma conta nova ou acessar uma conta existente.

### Tarefas

E a tela principal depois do login. Ela mostra as tarefas em colunas:

- Criadas
- Em andamento
- Concluidas
- Canceladas

O usuario pode arrastar tarefas entre colunas ou usar os botoes pequenos de status para mudar rapidamente.

### Agenda

Mostra as mesmas tarefas, mas organizadas por data. A Agenda ajuda a entender o que esta atrasado, o que vence hoje, amanha, ainda nesta semana ou mais para frente.

### Detalhe da tarefa

Ao clicar em uma tarefa, abre uma janela com as principais informacoes:

- titulo;
- status;
- prazo;
- ultima atualizacao;
- acoes para editar, excluir ou mudar status.

### Perfil

Permite atualizar nome, telefone, e-mail e senha.

## Organizacao do projeto

O projeto esta dividido em duas partes:

```text
task_manager/
  backend/    API em Spring Boot
  frontend/   Aplicacao web em React
```

O backend guarda e entrega os dados. O frontend e a tela que o usuario acessa no navegador.

## Requisitos para rodar

Antes de iniciar, tenha instalado:

- Java 25 ou versao compativel com o backend;
- Node.js;
- npm;
- Git.

## Como rodar o backend

Entre na pasta do backend:

```bash
cd backend
```

Crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

O backend usa chaves RSA para gerar e validar o token de login. Para gerar chaves locais:

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys/private.pem
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
```

No `.env`, use:

```properties
JWT_PUBLIC_KEY_LOCATION=file:./keys/public.pem
JWT_PRIVATE_KEY_LOCATION=file:./keys/private.pem
JWT_ISSUER=task-manager
JWT_EXPIRATION=PT1H
```

Inicie o backend:

```bash
./mvnw spring-boot:run
```

Por padrao, a API fica disponivel em:

```text
http://localhost:8080
```

A documentacao Swagger fica em:

```text
http://localhost:8080/api/docs/swagger-ui.html
```

## Como rodar o frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependencias:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

Durante o desenvolvimento, o frontend envia as chamadas `/api` para o backend em `http://localhost:8080`.

## Como usar pela primeira vez

1. Inicie o backend.
2. Inicie o frontend.
3. Abra `http://localhost:5173`.
4. Clique em criar cadastro.
5. Preencha nome, telefone, e-mail e senha.
6. Depois do cadastro, a aplicacao entra automaticamente.
7. Crie sua primeira tarefa no quadro.

## Comandos uteis do frontend

Na pasta `frontend/`:

```bash
npm run dev
```

Roda o frontend para desenvolvimento.

```bash
npm run build
```

Gera a versao final da aplicacao.

```bash
npm run test
```

Roda os testes automatizados mais rapidos.

```bash
npm run e2e
```

Roda testes que simulam o uso no navegador.

## Comandos uteis do backend

Na pasta `backend/`:

```bash
./mvnw spring-boot:run
```

Roda a API localmente.

```bash
./mvnw test
```

Roda os testes do backend.

```bash
./mvnw package
```

Compila o backend e gera o arquivo final da aplicacao.

## Status das tarefas

A interface mostra os status com nomes amigaveis:

- `CREATED`: Criadas
- `OPEN`: Em andamento
- `FINISHIED`: Concluidas
- `CANCELED`: Canceladas

O nome `FINISHIED` esta escrito assim porque e o valor esperado pelo backend. Mesmo parecendo um erro de escrita, ele deve ser mantido para a aplicacao funcionar corretamente.

## Testes e validacao

Antes de entregar mudancas, rode:

```bash
cd frontend
npm run test
npm run build
npm run e2e
```

Para o backend:

```bash
cd backend
./mvnw test
```

## Problemas comuns

### A tela nao carrega tarefas

Confira se o backend esta rodando em `http://localhost:8080`.

### Login ou cadastro falha

Confira se as chaves JWT foram criadas e se o arquivo `.env` aponta para elas.

### O Swagger nao abre

Use o endereco completo:

```text
http://localhost:8080/api/docs/swagger-ui.html
```

### O frontend abre, mas a API nao responde

Confira se voce iniciou o frontend pela pasta `frontend/` e se o backend esta ativo. O proxy de desenvolvimento depende dos dois servidores rodando ao mesmo tempo.

## Documentos importantes

- PRD do frontend: `frontend/docs/PRD.md`
- Guia do backend: `backend/README.md`
- Regras do frontend: `frontend/AGENTS.md`

## Observacoes de seguranca

Nao envie arquivos com senhas, tokens ou chaves privadas para o Git. Use arquivos locais como `.env` para configuracoes sensiveis.
