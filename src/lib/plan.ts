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
    phase: "Fundação & Raio-X",
    technical: [
      "TypeScript do zero — Total TypeScript (Matt Pocock). Parte I-III. Código cravado nas unhas.",
      "Entendimento profundo: Generics e Utility Types. Vais usar o 'Understanding TypeScript' (Schwarzmüller).",
      "Git a sério (Sem UI): branches, rebase interactivo, PRs. Se quebrares a árvore, arranja-a pelo terminal.",
      "Linux/Terminal: Navegação, permissões chmod/chown, processos (kill, htop, grep)."
    ],
    product: [
      "FARO (Modo Negócio): IA ligada ao máximo. Gera wireframes e schemas base no Cursor/ChatGPT.",
      "Faro Schema inicial: users, courses, lessons, exercises, progress."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um CLI em Node.js puro que leia um TXT e conte palavras. Usa Vim Adventures durante 30 mins para aquecer antes de bater código."
    ],
    languages: [
      "Inglês ativo diário (Imersão e Consumo).",
      "Francês via Language Laddering (a partir do Inglês) - 30m/dia."
    ],
    successCriteria: [
      "TypeScript Handbook lido de fio a pavio.",
      "10+ exercícios de Total TypeScript resolvidos sem copiar.",
      "Constituir empresa e garantir contabilista."
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
      "FARO: Migra o código Express para NestJS usando IA para acelerar o boilerplate. Mantém foco em faturar e evoluir o modelo de dados."
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
    phase: "Segurança, Auth & Infraestrutura",
    technical: [
      "NestJS Avançado — Guards, Interceptors customizados, Exception filters.",
      "Auth Híbrida: JWT local + OAuth2 (Google).",
      "Full Stack Open (Univ. Helsínquia) — Usa como bíblia de referência para práticas CI/CD e testes de integração.",
      "Docker Mastery (Bret Fisher) — Dominar os volumes e networks isoladas."
    ],
    product: [
      "FARO: Sistema de auth completo + Gamificação base (XP, streaks). Pede à IA os melhores algoritmos de retenção."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): JWT from scratch. Usa o módulo nativo 'crypto' do Node.js para assinar um token HMAC-SHA256 manualmente. Nada de bibliotecas npm."
    ],
    languages: [
      "Foco em listening: Palestras de System Design (InfoQ, GOTO Conferences)."
    ],
    successCriteria: [
      "Docker Compose com Node+Postgres a correr localmente sem stubs.",
      "Auth exaustivamente testada manualmente."
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
    phase: "Concorrência, Filas & Modelos Locais",
    technical: [
      "Redis — Pub/Sub e Filas assíncronas (BullMQ).",
      "Hugging Face NLP Course + Fast.ai — Entender como carregar e usar modelos ML abertos (Llama, Mistral) caso queiramos cortar custos de API.",
      "GitHub Actions: CI/CD puro."
    ],
    product: [
      "FARO: Caching via Redis implementado. Deploy do MVP num VPS (Fly.io ou Render) com CI/CD. IA gera os testes e pipelines iniciais."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um Message Broker artesanal usando EventEmitters nativos do Node. 1 Produtor injeta 10.000 eventos, 3 Consumidores processam em concorrência controlada."
    ],
    languages: [
      "Preparação de vocabulário de System Design e ML em Francês (só por desafio mental)."
    ],
    successCriteria: [
      "Faro live. URL partilhado com testers.",
      "Modelos open-source testados num Jupyter Notebook (via Fast.ai)."
    ]
  },
  {
    id: "mes-8",
    month: "MÊS 8",
    date: "ABRIL 2027",
    phase: "SRE & System Design de Peso",
    technical: [
      "System Design Interview Vol. 1 (Alex Xu) + Canal ByteByteGo. Estuda 2 arquiteturas por semana.",
      "CMU Database Systems (Aulas Livres) — Entende como um motor de BD processa queries em disco vs memória.",
      "LeetCode: Graphs. Joga Elevator Saga para treinares lógica algorítmica de eventos."
    ],
    product: [
      "FARO: Integrar ferramentas de observabilidade (Prometheus/Grafana ou Datadog). Logs estruturados (Winston/Pino)."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Constrói um Rate Limiter 'Token Bucket' no Redis. Garante que os teus endpoints de IA não levam DDoSed e não te gastam o budget da OpenAI."
    ],
    languages: [
      "Falar Francês no aniversário da amiga. (Objetivo Cumprido)."
    ],
    successCriteria: [
      "Rate limiter ativo em produção.",
      "Métricas da Faro a correr num dashboard em tempo real."
    ]
  },
  {
    id: "mes-9",
    month: "MÊS 9",
    date: "MAIO 2027",
    phase: "Mock Interviews & Escalabilidade",
    technical: [
      "donnemartin/system-design-primer — Devora os tópicos de CDN, Sharding, Consistent Hashing.",
      "Início de Mock Interviews — 1/semana (Pramp.com)."
    ],
    product: [
      "FARO: Realizar Stress Tests (Artillery / K6). Obrigar o NestJS a gritar com 1000 requests/segundo e analisar os memory leaks."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Cria um Load Balancer simples em Node.js (Round Robin) que distribui pedidos por 3 instâncias locais da tua API."
    ],
    languages: [
      "Mock Interviews comportamentais (STAR Method) gravadas."
    ],
    successCriteria: [
      "Bottlenecks da Faro documentados e isolados.",
      "Primeira Mock de System Design concluída sem brancas."
    ]
  },
  {
    id: "mes-10",
    month: "MÊS 10",
    date: "JUNHO 2027",
    phase: "Autoridade Técnica",
    technical: [
      "System Design Interview Vol. 2 (Alex Xu). Mocks a fundo.",
      "Revisitar todo o código que a IA gerou na Faro e refatorar onde houver 'code smells'."
    ],
    product: [
      "FARO: Polimento extremo. A BD e o NestJS têm de aguentar os utilizadores da FITEC.",
      "Escrever 3 posts de blog técnicos sobre trade-offs (ex: FastAPI vs NestJS para microserviços)."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Vai a um repo Open Source maduro (ex: NestJS, TypeORM) e procura uma issue 'good first issue'. Clona, lê o código (sem IA) e tenta o PR."
    ],
    languages: [
      "Otimização do LinkedIn, CV ATS-friendly todo em Inglês técnico."
    ],
    successCriteria: [
      "3+ artigos técnicos de peso publicados.",
      "Perfil pronto para headhunters B2B da Europa."
    ]
  },
  {
    id: "mes-11",
    month: "MÊS 11",
    date: "JULHO 2027",
    phase: "Job Hunt B2B Europeia",
    technical: [
      "Mock interviews intensivas (2-3/semana).",
      "Dominar o pitch das decisões arquiteturais da Faro. Ser capaz de desenhar o sistema num quadro branco em 10 minutos."
    ],
    product: [
      "FARO: Correções de UI/UX e lock das features. Preparação para a entrevista da Bolsa FITEC (defesa técnica)."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Desenha em papel toda a topologia cloud da Faro se tivesse 1 milhão de DAU (Daily Active Users). Onde pões as queues? Onde fazes sharding do Postgres?"
    ],
    languages: [
      "Dominar a linguagem contratual e de negociação salarial."
    ],
    successCriteria: [
      "Dezenas de candidaturas a posições Mid-Level remotas.",
      "Entrevistas reais agendadas."
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
      "FARO: Reuniões pós-lançamento, análise de métricas, faturação em andamento."
    ],
    hardModeSaturday: [
      "PROJETO SÉNIOR (ZERO IA): Descanso absoluto. A tua mente precisa de estar afiada como uma lâmina para as entrevistas decisivas da semana."
    ],
    languages: [
      "Inglês de negócio afiado."
    ],
    successCriteria: [
      "Proposta contratual B2B remota na mão (> 3500€/mês líquidos).",
      "FITEC defendido."
    ]
  }
];


export const playbooks = [
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
  { id: "g2", title: "Papel-Alvo: Mid-Level Backend Engineer B2B Remoto (Europa)" },
  { id: "g3", title: "O Projeto: Lançamento da Faro com sucesso de tração e bolsa FITEC de 30.000€" },
  { id: "g4", title: "Cicatrizes de Batalha: Submeter código open-source e dominar o System Design" }
];

export const commandments = [
  "Não seguirás um tutorial cego. Destrói-o e reconstrói-o à tua imagem sem olhar.",
  "Não misturarás o desenvolvimento veloz da Faro (com IA) com a tua forja de Sábado (sem IA).",
  "Lerás o código-fonte (Node_modules, libs em Rust/Python) antes de perguntares no StackOverflow.",
  "Não farás deploy de uma query sem leres o EXPLAIN ANALYZE da mesma primeiro.",
  "Testarás o teu código antes de confiares nele, e confiarás nele antes de escalar.",
  "Não defenderás uma arquitetura que não consigas desenhar e criticar num quadro branco em 5 minutos.",
  "Documentarás infraestrutura como código e código como arte.",
  "Nunca usarás uma ferramenta abstraída (ex: NestJS, TypeORM) sem entenderes o código puro (Node.js, SQL) que ela esconde.",
  "O sono e o desporto não se tocam. Um engenheiro cansado escreve dívida técnica.",
  "O Inglês é a tua primeira língua técnica. Falarás e debaterás arquitetura em Inglês sem hesitar."
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
    category: "Arquitetura & Bases de Dados",
    items: [
      { title: "The Twelve-Factor App", author: "Adam Wiggins", type: "doc" },
      { title: "ByteByteGo", author: "Alex Xu • YouTube", type: "course" },
      { title: "Software Design and Architecture", author: "Coursera", type: "course" },
      { title: "Use The Index Luke", author: "Markus Winand", type: "doc" },
      { title: "Database Systems", author: "CMU (Carnegie Mellon)", type: "course" },
      { title: "Designing Data-Intensive Apps", author: "Martin Kleppmann", type: "book" }
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

export const mentorPrompt = `Atua como um Mentor de Engenharia de Software (Staff/Principal Engineer).

Contexto:
Sou um estudante de Engenharia Informática e defini um roadmap rigoroso de 12 meses para passar de Júnior a Mid-Level Backend Engineer.
O meu objetivo final é estar preparado para conseguir um contrato B2B remoto (Europa) e submeter uma candidatura à bolsa FITEC (30.000€).

A minha Filosofia Dual (Inegociável):
1. A FARO (A Empresa): Construo o meu SaaS de repetição espaçada com IA, o mais rápido possível, USANDO INTELIGÊNCIA ARTIFICIAL ATIVAMENTE para faturar e escalar.
2. O SÁBADO HARD MODE (O Engenheiro): Progressão hardcore e purista. NÃO USO IA. Bato código, leio RFCs e documentação oficial para solidificar os fundamentos puros da Engenharia Informática.

A minha Stack Base Inegociável: 
TypeScript, Node.js, NestJS, PostgreSQL, Git, Docker, Jest.

A minha Stack de Fase 3 (Escala & IA): 
Python + FastAPI (microserviço de IA), Redis, GitHub Actions (CI/CD), System Design.

O meu Protocolo de Deep Work: 
- 2 blocos de 90min por dia (Pomodoros 52/17). 
- Alternância entre dias de Teoria (Seg/Qua) e dias de Construção (Ter/Qui). 
- Sábado: Sábado Hard Mode (Zero IA). 
- Domingo: Descanso zero-tech.

A Situação Atual (Preenche aqui):
[ DESCREVE O TEU IMPREVISTO/AVANÇO AQUI. Ex: "Estou no Mês 4, atrasei-me no módulo de Docker porque tive época de exames e agora só tenho 5 horas por semana..." ]

O Pedido:
Com base nestas restrições e objetivos imutáveis, ajuda-me a reformular o meu plano de ataque para as próximas semanas mantendo a filosofia dual.
Não mudes a stack tecnológica nem o objetivo final (Mid-Level B2B).
Quero saber:
1. Como realoco o tempo que me resta?
2. O que corto temporariamente do "polimento" ou de prioridade secundária na Faro para salvar a empresa sem prejudicar o Sábado Hard Mode?
3. Como recupero o ritmo para não falhar os critérios de sucesso estruturais da minha fase atual?`;
