Para transformar o GitHub Copilot / Codex em um desenvolvedor fullstack sênior, você deve alimentá-lo com prompts de sistema, arquivos de contexto (como .github/copilot-instructions.md) ou prompts customizados que herdem maturidade técnica. Um sênior foca em manutenibilidade, segurança, performance de ponta a ponta e redução de complexidade.
Aqui estão as 5 melhores skills configuradas sob a ótica fullstack sênior:
## 1. Skill de Arquitetura Limpa e Decisão Técnica (ARCH_DECISION)
Evita o "código espaguete" e garante que a IA respeite os limites das camadas (frontend vs. backend).

* Foco no Backend: Garante separação de conceitos (Clean Architecture ou Hexagonal), desacoplamento de banco de dados e uso correto de injeção de dependência.
* Foco no Frontend: Mantém a lógica de negócios fora dos componentes de renderização (UI limpa) e centraliza o gerenciamento de estado de forma previsível.
* Comando Mental: "Antes de codificar, desenhe uma RFC (Request for Comments) resumida avaliando os prós/contras da abordagem e valide as fronteiras arquiteturais."

## 2. Skill de Otimização e Performance de Ponta a Ponta (PERF_OPTIMIZER)
Garante que a aplicação seja escalável e rápida, mitigando gargalos comuns de infraestrutura e rede.

* Foco no Backend: Identifica consultas pesadas, evita o problema de N+1 consultas no ORM, sugere estratégias de caching (Redis) e paginação obrigatória em APIs.
* Foco no Frontend: Implementa code-splitting (lazy loading), otimiza o tamanho do bundle, sugere memoização estratégica e gerencia o ciclo de vida para evitar memory leaks.
* Comando Mental: "Analise este código sob estresse de 10k requisições/min. Onde está o gargalo e como mitigá-lo?"

## 3. Skill de Resiliência, Tratamento de Erros e Segurança (SEC_RESILIENCE)
Um júnior foca no caminho feliz; o sênior foca no que acontece quando o sistema falha.

* Foco no Backend: Valida inputs rigorosamente (Zod, Joi), implementa Idempotência em mutações, aplica tratamento global de erros (sem expor stack traces internamente) e previne falhas de segurança OWASP (SQLi, XSS).
* Foco no Frontend: Cria Error Boundaries para isolar quebras de UI, trata estados de carregamento/erro de requisições de forma elegante e limpa tokens de forma segura (HttpOnly cookies).
* Comando Mental: "Escreva o tratamento de erros assumindo que a rede vai falhar no meio da operação. Proteja os dados."

## 4. Skill de Testabilidade Eficiente (TEST_STRATEGIST)
Foca em testes que geram valor real, em vez de apenas buscar 100% de cobertura de linhas inúteis.

* Foco no Backend: Cria testes de integração focados nos casos de borda (edge cases) e regras de negócio complexas, utilizando mocks apenas para serviços externos instáveis.
* Foco no Frontend: Prioriza testes de comportamento do usuário (usando Testing Library) e fluxos críticos de ponta a ponta (E2E com Playwright/Cypress), ignorando detalhes de implementação visual.
* Comando Mental: "Gere uma matriz de cenários de teste focando estritamente em falhas de validação, limites numéricos e concorrência."

## 5. Skill de Redução de Ruído e Código Enxuto (KISS_YAGNI)
O ápice da senioridade é resolver o problema escrevendo o mínimo de código possível.

* Foco no Backend: Evita abstrações prematuras e microsserviços desnecessários; prefere recursos nativos da linguagem e do framework atual antes de instalar pacotes de terceiros.
* Foco no Frontend: Elimina bibliotecas redundantes de estilização ou estado se o padrão nativo (CSS moderno, Context API) resolver o problema com menor custo de manutenção.
* Comando Mental: "Como posso resolver este requisito exato reduzindo o número de linhas atuais pela metade e sem adicionar dependências externas?"

Para que possamos implementar isso diretamente no seu fluxo de trabalho, me conte:

* Qual é a stack principal que você está usando no momento (ex: Next.js + Node/NestJS, React + Go, etc.)?
* Você gostaria de criar um arquivo de configuração estruturado (como um .cursorrules ou um prompt mestre para o Copilot) baseado em uma dessas 5 skills?


