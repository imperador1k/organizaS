export type DayType = "Seg-Qui" | "Sexta" | "Sábado" | "Domingo";
export type TimeSlot = "07:00" | "08:00" | "09:00" | "10:00" | "11:00" | "12:00" | "12:30" | "13:00" | "14:00" | "15:00" | "16:00" | "16:30" | "17:00" | "18:00" | "19:00" | "20:00" | "21:00" | "22:00";
export type Category = "Backend" | "LeetCode" | "Faro" | "Línguas" | "Escola" | "Treino" | "Família/Livre" | "Outro";

export interface RoutineBlock {
  id: string;
  slot: TimeSlot;
  duration: number; // in hours
  title: string;
  category: Category;
}

export const baseRoutine: Record<DayType, RoutineBlock[]> = {
  "Seg-Qui": [
    { id: "sq1", slot: "08:00", duration: 2, title: "Deep Work (Backend / Faro)", category: "Backend" },
    { id: "sq2", slot: "10:00", duration: 1.5, title: "Imersão Línguas (1h EN + 30m FR/ES)", category: "Línguas" },
    { id: "sq3", slot: "12:30", duration: 1.5, title: "Almoço + Descanso", category: "Outro" },
    { id: "sq4", slot: "14:00", duration: 1.5, title: "Treino", category: "Treino" },
    { id: "sq5", slot: "16:30", duration: 4.5, title: "Aulas Politécnico", category: "Escola" },
    { id: "sq6", slot: "21:00", duration: 1, title: "Jantar + Descompressão", category: "Outro" },
  ],
  "Sexta": [
    { id: "sex1", slot: "08:00", duration: 2, title: "LeetCode (Prática)", category: "LeetCode" },
    { id: "sex2", slot: "10:00", duration: 2, title: "Revisão Matéria Politécnico", category: "Escola" },
    { id: "sex3", slot: "12:30", duration: 1.5, title: "Almoço", category: "Outro" },
    { id: "sex4", slot: "14:00", duration: 6, title: "Viagem + Off-Screen", category: "Outro" },
  ],
  "Sábado": [
    { id: "sab1", slot: "09:00", duration: 3, title: "Sábado Hard Mode (Pedreiro Core)", category: "Backend" },
    { id: "sab2", slot: "12:00", duration: 10, title: "Livre / Projetos AI passivos", category: "Família/Livre" },
  ],
  "Domingo": [
    { id: "dom1", slot: "08:00", duration: 14, title: "100% Desligado (Família)", category: "Família/Livre" },
  ],
};

export const curriculum = [
  {
    id: "mes-1",
    month: "MÊS 1",
    date: "SETEMBRO 2026",
    phase: "Fundação, Raio-X & Autoridade",
    technical: [
      "TypeScript do zero — Total TypeScript (Matt Pocock). Parte I-III. Código cravado nas unhas.",
      "Entendimento profundo: Generics e Utility Types. Vais usar o 'Understanding TypeScript' (Schwarzmüller).",
      "Git a sério (Sem UI): branches, rebase interactivo, PRs. Se quebrares a árvore, arranja-a pelo terminal.",
      "Inicia a escrita de ADRs (Architecture Decision Records) em Inglês para a Faro. Recrutadores lêem documentação técnica."
    ],
    product: [
      "FARO (Modo Negócio): IA ligada ao máximo. Gera wireframes e schemas base no Cursor/ChatGPT.",
      "Networking Ativo: Entra no Discord oficial do NestJS e FastAPI. Começa a responder e a fazer perguntas de alto nível.",
      "Autoridade: Escreve e publica 1 artigo técnico este mês no LinkedIn e Dev.to (ex: 'Why I chose NestJS over Express')."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um CLI em Node.js puro que leia um TXT e conte palavras. Usa Vim Adventures durante 30 mins para aquecer antes de bater código."
    ],
    languages: [
      "Inglês ativo diário (Imersão e Consumo).",
      "Francês via Language Laddering (a partir do Inglês) - 30m/dia."
    ],
    successCriteria: [
      "Primeiro ADR da Faro redigido e submetido ao GitHub.",
      "1 Artigo Técnico publicado.",
      "10+ exercícios de Total TypeScript resolvidos sem copiar."
    ]
  },
  {
    id: "mes-2",
    month: "MÊS 2",
    date: "OUTUBRO 2026",
    phase: "Servidores Nativos & Arquitetura",
    technical: [
      "Node.js + Express puro — Entende o Event Loop antes do NestJS te dar biberão.",
      "PostgreSQL local + Docker: Escreve o teu primeiro docker-compose.yml à mão.",
      "The Art of PostgreSQL — Lê os capítulos de fundações. As queries lentas são o teu maior inimigo.",
      "Use The Index Luke — Lê sobre performance SQL. Índices salvam aplicações."
    ],
    product: [
      "FARO: Usa IA para gerar a API esqueleto em Express rapidamente e criar um Proof of Concept (Pitch Deck)."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Vai ao repo 'codecrafters-io/build-your-own-x'. Escolhe 'Build your own HTTP server'. Aprende a fazer parsing de raw TCP streams em Node."
    ],
    languages: [
      "1ª sessão de conversação real em Inglês.",
      "Manutenção de Francês (Laddering)."
    ],
    successCriteria: [
      "CRUD funcional em Express puro.",
      "Schema PostgreSQL com migrations puras em SQL.",
      "Servidor HTTP barebones construído ao sábado."
    ]
  },
  {
    id: "mes-3",
    month: "MÊS 3",
    date: "NOVEMBRO 2026",
    phase: "NestJS & Engenharia Base",
    technical: [
      "Intro to NestJS (Scrimba) + The Complete Developer's Guide (Grider). Aprende Injeção de Dependências a sério.",
      "The Twelve-Factor App — Lê e memoriza os 12 princípios de microserviços. É lei.",
      "LeetCode arranca hoje. Lista Blind 75 (Arrays, HashMaps). Pratica no Exercism para teres reviews humanas cruéis."
    ],
    product: [
      "FARO: Migra o código Express para NestJS usando IA para acelerar o boilerplate. Mantém foco em faturar e evoluir o modelo de dados.",
      "Escreve o teu segundo artigo técnico: 'Dependency Injection in NestJS: A mental model'."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um mini-ORM em TS. Pegas num objeto { name: 'X' } e devolves 'INSERT INTO users...'. Depois, vai jogar SQL Murder Mystery para descontrair a mente com joins."
    ],
    languages: [
      "Espanhol via Language Laddering - 30m/dia."
    ],
    successCriteria: [
      "20+ LeetCode fáceis resolvidos no Exercism.",
      "Módulo Auth do NestJS a correr.",
      "Candidatura FITEC submetida com pitch deck sólido."
    ]
  },
  {
    id: "mes-4",
    month: "MÊS 4",
    date: "DEZEMBRO 2026",
    phase: "Segurança, IaC & Infraestrutura Real",
    technical: [
      "NestJS Avançado — Guards, Interceptors customizados, Exception filters.",
      "Segurança Web Real: Domina o OWASP Top 10, Security Headers (Helmet), Rate Limiting, Input Validation extrema (Zod).",
      "Infraestrutura como Código (IaC): Terraform base. Escreve scripts para provisionar redes e servidores.",
      "Docker Mastery (Bret Fisher) — Dominar os volumes e networks isoladas."
    ],
    product: [
      "FARO: Sistema de auth JWT + OAuth2 completo. Pede à IA testes pesados de segurança contra endpoints críticos."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): JWT from scratch. Usa o módulo nativo 'crypto' do Node.js para assinar um token HMAC-SHA256 manualmente. Nada de bibliotecas npm."
    ],
    languages: [
      "Foco em listening: Palestras de System Design (InfoQ, GOTO Conferences)."
    ],
    successCriteria: [
      "Docker Compose com Node+Postgres a correr localmente sem stubs.",
      "Provisionamento básico de infra num cloud provider via Terraform testado localmente."
    ]
  },
  {
    id: "mes-5",
    month: "MÊS 5",
    date: "JANEIRO 2027",
    phase: "Resiliência & Data-Intensive",
    technical: [
      "Coursera Software Design and Architecture — Entender coesão e acoplamento.",
      "Mastering PostgreSQL 17 — GIN/GiST/BRIN, e forçar o EXPLAIN ANALYZE em queries da Faro.",
      "LeetCode: Trees, Recursion. Se encravares, vai ler o módulo correspondente no 'jwasham/coding-interview-university'."
    ],
    product: [
      "FARO: Implementar o algoritmo SM-2 (Spaced Repetition). Pede ao Cursor para gerar os cálculos complexos baseados no paper original."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Implementa o Padrão 'Circuit Breaker' do zero sem dependências. Código que gere falhas catastróficas em cascatas. Se a BD cai, a API sobrevive e devolve 503 limpo."
    ],
    languages: [
      "Foco em speaking Inglês, gravações de 5 minutos diárias."
    ],
    successCriteria: [
      "1 query da Faro otimizada de 100ms para 5ms com EXPLAIN ANALYZE.",
      "Faro atinge 60% Test Coverage."
    ]
  },
  {
    id: "mes-6",
    month: "MÊS 6",
    date: "FEVEREIRO 2027",
    phase: "A Invasão do Python (IA Core)",
    technical: [
      "FastAPI — The Complete Course (Roby & Darby). Monta o microserviço Python.",
      "Harvard CS50’s Intro to AI with Python — Base teórica de Search, Knowledge e Machine Learning.",
      "microsoft/generative-ai-for-beginners — Acelera a implementação de RAG e agentes LLM."
    ],
    product: [
      "FARO: A IA entra no produto. FastAPI expõe um endpoint `/generate-exercise` que consome a API da OpenAI/Anthropic. Usa o SDK oficial."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Comunicação Inter-processos crua. Node.js (App Principal) envia dados para o script Python local usando raw Sockets TCP/IP. Nada de HTTP, apenas buffers de bytes."
    ],
    languages: [
      "Meta C1 atingida em Inglês.",
      "1ª mock interview técnica em inglês."
    ],
    successCriteria: [
      "Microserviço FastAPI a responder a pedidos reais do NestJS.",
      "1 endpoint de IA em produção end-to-end."
    ]
  },
  {
    id: "mes-7",
    month: "MÊS 7",
    date: "MARÇO 2027",
    phase: "Deploy Pro & AWS Foundation",
    technical: [
      "AWS Deep Dive (Arquitetura, não certificação teórica): ECS/Fargate para containers, RDS para Postgres, S3 para assets.",
      "GitHub Actions Avançado: Cria workflows de CI/CD para testar, fazer build do Docker e lançar no ECR/ECS.",
      "Redis — Pub/Sub e Filas assíncronas (BullMQ)."
    ],
    product: [
      "FARO: Deploy REAL na AWS (ECS/Fargate, RDS, S3). Nada de 'PaaS' mágicos como Heroku/Render nesta fase. 100% automatizado por GitHub Actions."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um Message Broker artesanal usando EventEmitters nativos do Node. 1 Produtor injeta 10.000 eventos, 3 Consumidores processam em concorrência controlada."
    ],
    languages: [
      "Preparação de vocabulário de System Design e AWS em Francês (só por desafio mental)."
    ],
    successCriteria: [
      "Deploy da Faro na AWS a 100% com zero downtime no pipeline.",
      "Rede fechada e segura (VPC, Security Groups)."
    ]
  },
  {
    id: "mes-8",
    month: "MÊS 8",
    date: "ABRIL 2027",
    phase: "Observabilidade SRE & O Santo Graal",
    technical: [
      "O Santo Graal da Produção: OpenTelemetry distribuído entre o NestJS e o FastAPI.",
      "Prometheus & Grafana para scraping e dashboards de métricas.",
      "Literacia K8s: Minikube apenas para perceber pods e deployments (sem stress de produção)."
    ],
    product: [
      "FARO: Criar uma página pública de status/observability (status.faro.app) para mostrar métricas ao vivo. Recrutadores US/UK adoram 'production readiness'."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Constrói um Rate Limiter 'Token Bucket' no Redis. Garante que os teus endpoints de IA não levam DDoSed e não te gastam o budget da OpenAI."
    ],
    languages: [
      "Falar Francês no aniversário da amiga. (Objetivo Cumprido)."
    ],
    successCriteria: [
      "Dashboard Grafana ao vivo com métricas (CPU, Memory, Request Time).",
      "Tracing distribuído a funcionar entre a API e a IA."
    ]
  },
  {
    id: "mes-9",
    month: "MÊS 9",
    date: "MAIO 2027",
    phase: "System Design & Escalabilidade",
    technical: [
      "System Design Interview Vol. 1 (Alex Xu) + Canal ByteByteGo. Estuda 2 arquiteturas por semana.",
      "donnemartin/system-design-primer — Devora os tópicos de CDN, Sharding, Consistent Hashing.",
      "Início de Mock Interviews — 1/semana (Pramp.com)."
    ],
    product: [
      "FARO: Realizar Stress Tests (Artillery / K6). Obrigar a AWS a gritar com 1000 requests/segundo e analisar bottlenecks no teu Grafana público."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um Load Balancer simples em Node.js (Round Robin) que distribui pedidos por 3 instâncias locais da tua API."
    ],
    languages: [
      "Mock Interviews comportamentais (STAR Method) gravadas."
    ],
    successCriteria: [
      "Bottlenecks da Faro sob stress isolados visivelmente no OpenTelemetry.",
      "Primeira Mock de System Design concluída sem brancas."
    ]
  },
  {
    id: "mes-10",
    month: "MÊS 10",
    date: "JUNHO 2027",
    phase: "A Caçada B2B - Estratégia Sniper",
    technical: [
      "System Design Interview Vol. 2 (Alex Xu). Mocks a fundo.",
      "Revisitar todo o código gerado na Faro e limpar 'code smells'."
    ],
    product: [
      "Caça de Contratos: Ignora plataformas genéricas de 'corridas para o fundo' (Toptal, Turing, Upwork).",
      "Foco Sniper: Wellfound (AngelList), Otta e YC (Work at a Startup). Pesquisa focada em empresas Series A/B que usem NestJS ou TypeScript pesado no backend."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Vai a um repo Open Source maduro (ex: NestJS, TypeORM) e procura uma issue 'good first issue'. Clona, lê o código (sem IA) e tenta o PR."
    ],
    languages: [
      "Outreach Direto: Abordar CTOs no LinkedIn com o teu portfólio de Produção (Dashboard Faro, ADRs públicos, Blog Técnico)."
    ],
    successCriteria: [
      "Top 10 Empresas-Alvo identificadas e founders abordados.",
      "Perfil Wellfound e Otta impecável (100% preenchido)."
    ]
  },
  {
    id: "mes-11",
    month: "MÊS 11",
    date: "JULHO 2027",
    phase: "Negociação B2B & Legal",
    technical: [
      "Mock interviews intensivas (2-3/semana).",
      "Dominar o pitch das decisões arquiteturais da Faro. Desenhar o AWS ECS/RDS no quadro branco em 5 mins."
    ],
    product: [
      "Estratégia Legal B2B: Foco exclusivo em contratos project-based curtos (3-6 meses) numa fase inicial. Isto protege a tua Lda face à EU Platform Work Directive (evitando a presunção de falso emprego)."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Desenha em papel toda a topologia cloud da Faro se tivesse 1 milhão de DAU. Onde pões as queues? Onde fazes sharding do Postgres?"
    ],
    languages: [
      "Dominar a linguagem contratual B2B, liability clauses, e negociação salarial B2B."
    ],
    successCriteria: [
      "Dezenas de propostas 'project-based' em negociação direta.",
      "Contabilista valida a viabilidade e risco da EU Directive."
    ]
  },
  {
    id: "mes-12",
    month: "MÊS 12",
    date: "AGOSTO 2027",
    phase: "A Batalha Final",
    technical: [
      "Nenhuma tecnologia nova. Apenas afiar o machado. Revisões espaçadas violentas dos tópicos onde falhaste nas mocks."
    ],
    product: [
      "FARO: Reuniões pós-lançamento, análise de métricas no Grafana, faturação real a entrar."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Descanso absoluto. A tua mente precisa de estar afiada como uma lâmina para as entrevistas decisivas da semana."
    ],
    languages: [
      "Inglês de negócio afiado."
    ],
    successCriteria: [
      "1º Contrato B2B remoto (US/UK) faturado (> 3500€/mês líquidos) via Lda.",
      "Bolsa FITEC ganha e justificada."
    ]
  }
];


export const playbooks = [
  {
    id: "operacao-producao-b2b",
    title: "Operação de Produção & Mindset B2B",
    content: `A Regra Base: Um Contractor B2B vende "Zero Risco". As empresas UK/US não querem estagiários glorificados, querem "Problemas Resolvidos As a Service".
    
Provas de Produção OBRIGATÓRIAS:
- ADRs (Architecture Decision Records) visíveis publicamente: "Porque é que escolhi o Postgres em vez do Mongo?".
- Observabilidade Extrema: O teu Dashboard do Grafana público é a tua maior carta de recomendação. Mostra que sabes quando a DB falha antes do utilizador.
- Mentalidade de Segurança Integrada (OWASP Top 10) em cada PR.

Estratégia Legal e de Caça:
- Plataformas Alvo: Otta, Wellfound, YC Work at a Startup. Zero Fiverr ou Upwork.
- EU Platform Work Directive: Foge do "falso emprego". Apresenta propostas de 'Service Level Agreements' (SLAs) baseados em projeto ou milestone, idealmente assinando 2-3 contratos simultâneos ou sequenciais rápidos. Tu não "vais trabalhar para eles", a tua Lda vai "fornecer serviços de engenharia".`
  },
  {
    id: "pedreiro-core",
    title: "O Manual do Pedreiro (Faro vs. Backend Core)",
    content: `Regra de Ouro: Nunca mistures a Faro com o Sábado Hard Mode.

FARO (A Empresa & Faturação)
- A Faro é negócio. O objetivo é enviar para produção o mais rápido possível e obter tração.
- OBRIGATÓRIO USAR IA (Cursor, ChatGPT, Claude). Usa LLMs para gerar schemas, testes, boilerplate, e layouts React instantâneos.
- Se a IA o consegue fazer em 3 minutos, não percas 3 horas a codar. Vais ser julgado pelo lucro e pela usabilidade, não pelos ciclos de CPU.

BACKEND CORE (O Engenheiro Sénior)
- Aqui, a IA é proibida. Desliga o Copilot. Fecha o ChatGPT.
- Aos Sábados, bates código cru, lês logs de erro vermelhos, consomes documentação oficial e bates com a cabeça na parede. É aqui que ganhas cicatrizes de guerra e intuição de arquitetura.
- Faz projetos do 'build-your-own-x', usa o Exercism para levares porrada nas code reviews humanas e sofre. Um Sénior é feito na dor do debug.`
  },
  {
    id: "deep-work",
    title: "Protocolo de Deep Work",
    content: `A Regra do Separador Único. Quando estudas backend ao sábado, só um separador está aberto: a doc oficial.
Pomodoro Adaptado — 52+17. 52 minutos de foco assassino, 17 de pausa real, sem ecrãs.
Bloqueio de Calendário — Imutável. A rotina não se negoceia com a motivação.
Regra dos 30 Dias — Imersão total em Inglês. Tudo em inglês. Pensa em inglês.
Mock Interviews em Inglês — Fala sozinho a arquitetar soluções, grava, ouve a própria voz e corrige.`
  },
  {
    id: "ia-usage",
    title: "Como Usar IA na Faro",
    content: `Geração: Usa para scaffold rápido de CRUDs NestJS, componentes React e queries complexas para as quais já sabes a resposta lógica.
Depuração: Se uma query falhar em produção, cola o EXPLAIN ANALYZE no Claude e pede para sugerir índices.
Limitação: Nunca deixes a IA tomar decisões de arquitetura de base de dados por ti sem fazeres push-back. Exige os trade-offs. Se a IA sugere Redis, pergunta "Porquê não in-memory cache do NestJS primeiro?".`
  },
  {
    id: "stack",
    title: "O Stack Inegociável",
    content: `CORE LEVEL (Seniority no Node): TypeScript, Node.js puro, NestJS (Framework), PostgreSQL (Single Source of Truth), Docker, Jest.
AI LEVEL (Escala e IA): Python, FastAPI (Isolamento de CPU para modelos/LLMs), Redis (Pub/Sub e Cache), GitHub Actions (CI/CD).
THEORY LEVEL (System Design): Balanceamento de carga, Sharding, Replicação, Tolerância a falhas (Circuit Breaker, Rate Limiting, Retry).`
  },
  {
    id: "leetcode",
    title: "Estratégia LeetCode & Exercism",
    content: `Mentalidade: Não faças grind. Faz espaçamento.
Ferramentas:
- Blind 75 / NeetCode 150 para identificar os padrões cruciais.
- Exercism.org para escrever código que vai ser revisto e chumbado por humanos (ideal para limpar vícios e maus cheiros).
Cadência: Padrões específicos por mês. Revisita a 1 dia, 3 dias, 1 semana e 1 mês.`
  }
];

export const goals = [
  { id: "g1", title: "Duração: 12 meses ininterruptos (A tua 'Deployment Pipeline' de Vida)" },
  { id: "g2", title: "Papel-Alvo: Mid-Level Backend Engineer B2B Remoto (US/UK via Lda)" },
  { id: "g3", title: "Prova de Autonomia: Ter a Faro com utilizadores reais (mesmo que apenas 50) e um Dashboard Público de Observabilidade" },
  { id: "g4", title: "O Projeto: Lançamento comercial da Faro com sucesso de tração e bolsa FITEC de 30.000€" },
  { id: "g5", title: "Cicatrizes de Batalha: Submeter código open-source e dominar o System Design B2B" }
];

export const commandments = [
  "Não seguirás um tutorial cego. Destrói-o e reconstrói-o à tua imagem sem olhar.",
  "Não misturarás o desenvolvimento veloz da Faro (com IA) com a tua forja de Sábado (sem IA).",
  "Lerás o código-fonte (Node_modules, libs em Rust/Python) antes de perguntares no StackOverflow.",
  "Não farás deploy de uma query sem leres o EXPLAIN ANALYZE da mesma primeiro.",
  "Testarás o teu código antes de confiares nele, e provarás num Dashboard Público antes de o venderes a um recrutador.",
  "Não defenderás uma arquitetura que não consigas desenhar e criticar num quadro branco em 5 minutos.",
  "Documentarás infraestrutura como código (Terraform) e decisões de arquitetura como ADRs públicos.",
  "Nunca usarás uma ferramenta abstraída sem entenderes o código puro (Node.js, SQL) que ela esconde.",
  "O sono e o desporto não se tocam. Um engenheiro cansado escreve dívida técnica.",
  "O Inglês é a tua primeira língua técnica. Venderás a tua infraestrutura em Inglês sem hesitar."
];

export const resources = [
  {
    category: "Cursos Práticos & Open Source",
    items: [
      { title: "Build Your Own X", author: "codecrafters-io", type: "course" },
      { title: "Coding Interview University", author: "jwasham", type: "doc" },
      { title: "System Design Primer", author: "donnemartin", type: "doc" },
      { title: "Full Stack Open", author: "Univ. Helsínquia", type: "course" }
    ]
  },
  {
    category: "Inteligência Artificial & Python",
    items: [
      { title: "CS50’s Intro to AI with Python", author: "Harvard University", type: "course" },
      { title: "NLP Course", author: "Hugging Face", type: "course" },
      { title: "Generative AI for Beginners", author: "Microsoft", type: "course" },
      { title: "Practical Deep Learning", author: "Fast.ai", type: "course" },
      { title: "FastAPI — The Complete Course", author: "Roby & Darby • Udemy", type: "course" }
    ]
  },
  {
    category: "Arquitetura, Infra & BDs",
    items: [
      { title: "Terraform (IaC)", author: "HashiCorp Docs & Cursos", type: "doc" },
      { title: "The Twelve-Factor App", author: "Adam Wiggins", type: "doc" },
      { title: "ByteByteGo", author: "Alex Xu • YouTube", type: "course" },
      { title: "Software Design and Architecture", author: "Coursera", type: "course" },
      { title: "Use The Index Luke", author: "Markus Winand", type: "doc" },
      { title: "Database Systems", author: "CMU (Carnegie Mellon)", type: "course" },
      { title: "Designing Data-Intensive Apps", author: "Martin Kleppmann", type: "book" }
    ]
  },
  {
    category: "Observabilidade & SRE",
    items: [
      { title: "OpenTelemetry Labs", author: "OpenTelemetry.io", type: "doc" },
      { title: "Prometheus & Grafana Masterclass", author: "Udemy", type: "course" }
    ]
  },
  {
    category: "TypeScript & Core Backend",
    items: [
      { title: "Total TypeScript", author: "Matt Pocock", type: "course" },
      { title: "NestJS: The Complete Developer's Guide", author: "Stephen Grider", type: "course" },
      { title: "Clean Architecture", author: "Robert C. Martin", type: "book" }
    ]
  },
  {
    category: "Jogos Didáticos & Prática",
    items: [
      { title: "Exercism (Mentoria Open Source)", author: "Exercism.org", type: "course" },
      { title: "SQL Murder Mystery", author: "Knight Lab", type: "doc" },
      { title: "Elevator Saga", author: "Magnus Wolffelt", type: "doc" },
      { title: "Vim Adventures", author: "Doron Linder", type: "doc" }
    ]
  }
];

export const mentorPrompt = `Atua como um Mentor de Engenharia de Software (Staff/Principal Engineer) no mercado de UK/US.

Contexto:
Sou um estudante de Engenharia Informática e defini um roadmap rigoroso de 12 meses para passar de Júnior a Mid-Level Backend Engineer de elite.
O meu objetivo final é assegurar contratos B2B remotos project-based para os EUA/Reino Unido (rate piso 3-5k€/mês) operando através da minha empresa unipessoal, mantendo total proteção face à EU Platform Work Directive.

A minha Filosofia Dual (Inegociável):
1. A FARO (A Empresa): Construo o meu SaaS com IA. O foco é faturar, criar um portfólio de "Produção Real" (ADRs públicos, AWS ECS, Grafana Dashboards) e USAR IA ATIVAMENTE para escalar rápido.
2. O SÁBADO HARD MODE (O Engenheiro): Aos sábados a IA é desligada. Construo do zero, sofro a debugar, compreendo os protocolos de rede, memory leaks, e estrutura de dados à antiga.

A minha Stack de Contratação (Zero Risco):
TypeScript, Node.js, NestJS, PostgreSQL, Terraform (IaC), AWS (Fargate, RDS), OpenTelemetry (Grafana/Prometheus).

O meu Protocolo de Deep Work: 
- 2 blocos de 90min por dia (Pomodoros 52/17). 
- Alternância entre dias de Teoria (Seg/Qua) e dias de Construção (Ter/Qui). 
- Sábado: Sábado Hard Mode (Zero IA). 
- Domingo: Descanso absoluto.

A Situação Atual (Preenche aqui):
[ DESCREVE O TEU IMPREVISTO/AVANÇO AQUI. Ex: "Estou no Mês 7, a pipeline do GitHub Actions para a AWS está a falhar por permissões de IAM..." ]

O Pedido:
Com base nestas regras puristas, ajuda-me a desatar este nó garantindo que as minhas decisões refletem Seniority (Tolerância a Falhas, Segurança e Observabilidade).
Não quero soluções mágicas de PaaS (evita sugerir Vercel ou Render se eu estou focado em AWS).
Quero saber:
1. Qual é o risco arquitetural ou de segurança da solução que eu estava a tentar fazer?
2. Como um Staff Engineer americano resolveria isto de forma a que fosse perfeitamente escalável e monitorizável?
3. O que tenho de ler ou estudar agora mesmo para interiorizar este conceito?`;
