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
    { id: "sab1", slot: "09:00", duration: 3, title: "Estudo Livre Dirigido", category: "Backend" },
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
    phase: "Fundação",
    technical: [
      "TypeScript do zero — Total TypeScript (Matt Pocock), Partes I-III: setup, tipos essenciais, uniões, narrowing, objetos e classes",
      "Understanding TypeScript (Schwarzmüller) — secções de generics e utility types em paralelo",
      "Git a sério: branches, rebase, PRs, commits atómicos",
      "Linux/terminal: navegação, permissões, processos"
    ],
    product: [
      "Wireframes low-fi (papel ou Figma) — define o que o MVP NÃO vai ter ainda",
      "Desenho do schema inicial: users, courses, lessons, exercises, progress"
    ],
    languages: [
      "Inglês ativo diário (Imersão e Consumo).",
      "INÍCIO: Francês via Language Laddering (a partir do Inglês) - 30m/dia."
    ],
    successCriteria: [
      "TypeScript Handbook lido de fio a pavio",
      "10+ exercícios de Total TypeScript resolvidos sem copiar",
      "Reunião com contabilista marcada/realizada",
      "Constituir empresa esta semana"
    ]
  },
  {
    id: "mes-2",
    month: "MÊS 2",
    date: "SETEMBRO 2026",
    phase: "Fundação",
    technical: [
      "Node.js + Express puro — entender middleware/routing antes do NestJS abstrair isso",
      "PostgreSQL local + Docker: primeira imagem, primeiras migrations",
      "The Art of PostgreSQL (Fontaine) — capítulos de fundações SQL"
    ],
    product: [
      "API esqueleto: rotas básicas definidas, sem lógica de negócio ainda",
      "Proof of Concept navegável para usar no pitch deck"
    ],
    languages: [
      "1ª sessão de conversação real (tutor ou language exchange)"
    ],
    successCriteria: [
      "CRUD funcional em Express puro",
      "Schema PostgreSQL com migrations versionadas",
      "Pitch deck v1 completo (10 slides)"
    ]
  },
  {
    id: "mes-3",
    month: "MÊS 3",
    date: "OUTUBRO 2026",
    phase: "Fundação — LeetCode Arranca",
    technical: [
      "Intro to NestJS (Scrimba, grátis) — arranque interativo",
      "NestJS: The Complete Developer's Guide (Stephen Grider) — módulos, controllers, DI",
      "LeetCode arranca hoje. Lista Blind 75 — Arrays, Strings, HashMaps. 1 fácil/dia, solução em papel antes de escreveres código"
    ],
    product: [
      "Migração de Express -> NestJS",
      "Primeiro CRUD funcional em NestJS (users + courses)"
    ],
    languages: [
      "INÍCIO: Espanhol via Language Laddering - intercalar com Francês."
    ],
    successCriteria: [
      "20+ LeetCode fáceis resolvidos sem ajuda de IA",
      "1 módulo NestJS completo e testado manualmente",
      "Candidatura FITEC submetida"
    ]
  },
  {
    id: "mes-4",
    month: "MÊS 4",
    date: "NOVEMBRO 2026",
    phase: "Core Backend Mastery",
    technical: [
      "NestJS avançado — Guards, Interceptors, Pipes, Decorators customizados, exception filters",
      "Auth: JWT + refresh tokens; OAuth2 (Google login)",
      "Docker Mastery (Bret Fisher) — secções 1 a 4: imagens, containers, compose",
      "LeetCode — Two Pointers, Sliding Window, Linked Lists. 1-2/dia"
    ],
    product: [
      "Sistema de autenticação completo + estrutura de cursos/lições"
    ],
    languages: [],
    successCriteria: [
      "Docker Compose com Node+Postgres a correr localmente sem erros",
      "Sistema de auth completo, testado manualmente com Postman/Insomnia"
    ]
  },
  {
    id: "mes-5",
    month: "MÊS 5",
    date: "DEZEMBRO 2026",
    phase: "Core Backend Mastery",
    technical: [
      "Testing: Jest unitário, integração, e2e com supertest",
      "Mastering PostgreSQL 17 (Schönig) — índices GIN/GiST/BRIN, EXPLAIN ANALYZE, transações",
      "LeetCode — Trees, Recursion. Continuar diário"
    ],
    product: [
      "Sistema de exercícios + primeira versão de XP/streaks"
    ],
    languages: [],
    successCriteria: [
      "Cobertura de testes >= 60% no backend da Faro",
      "1 query lenta identificada e otimizada com EXPLAIN ANALYZE, documentada num commit",
      "Decisão esperada do FITEC (planeamento com contabilista)"
    ]
  },
  {
    id: "mes-6",
    month: "MÊS 6",
    date: "JANEIRO 2027",
    phase: "Consolidação",
    technical: [
      "Self-code-review — relê o teu próprio código como um Staff Engineer o faria",
      "Designing Data-Intensive Applications (Kleppmann) — Parte I completa",
      "LeetCode — consolidar padrões de Set-Nov com revisão espaçada"
    ],
    product: [
      "Cobertura de testes completa",
      "Documentação técnica do backend atualizada"
    ],
    languages: [
      "Meta C1 atingida",
      "1ª mock interview técnica em inglês, gravada"
    ],
    successCriteria: [
      "60-80 problemas LeetCode acumulados",
      "DDIA Parte I lida com notas próprias por capítulo",
      "Mock interview #1 realizada e revista"
    ]
  },
  {
    id: "mes-7",
    month: "MÊS 7",
    date: "FEVEREIRO 2027",
    phase: "Escala & IA",
    technical: [
      "FastAPI — The Complete Course 2026 (Roby & Darby) — estrutura do microserviço, JWT, SQLAlchemy",
      "Prompt engineering para geração de conteúdo pedagógico via LLM API",
      "LeetCode — Graphs (BFS/DFS). 2/dia"
    ],
    product: [
      "Microserviço Python/FastAPI funcional, comunicação REST com o NestJS",
      "Primeira feature de IA: geração automática de exercícios"
    ],
    languages: [
      "Francês entra, baixa intensidade (laddering, 15-20min/dia)"
    ],
    successCriteria: [
      "Microserviço FastAPI a responder a pedidos reais do backend NestJS",
      "1 endpoint de geração de exercícios funcional end-to-end"
    ]
  },
  {
    id: "mes-8",
    month: "MÊS 8",
    date: "MARÇO 2027",
    phase: "Escala & IA",
    technical: [
      "Redis — caching e pub/sub para tarefas assíncronas",
      "GitHub Actions — CI/CD, build/test/lint automático em cada PR",
      "DDIA — Parte II: replicação, particionamento, transações",
      "LeetCode — introdução a Dynamic Programming"
    ],
    product: [
      "Deploy em produção (beta fechado) — Railway/Render/Fly.io ou VPS",
      "Spaced repetition algorithm (tipo SM-2) implementado no microserviço Python"
    ],
    languages: [],
    successCriteria: [
      "Faro live com URL partilhável",
      "Pipeline CI verde no GitHub, badge no README"
    ]
  },
  {
    id: "mes-9",
    month: "MÊS 9",
    date: "ABRIL 2027",
    phase: "System Design a Sério",
    technical: [
      "System Design Interview Vol. 1 (Alex Xu) — leitura ativa, 1 capítulo/semana com notas",
      "LeetCode — 100+ acumulados",
      "Início de Mock Interviews — 1/semana (Pramp.com ou interviewing.io)"
    ],
    product: [
      "Primeiros testers reais (10-20 pessoas)",
      "Recolha de métricas de uso básicas"
    ],
    languages: [
      "Push para C2 — 2ª mock interview técnica, feedback aplicado",
      "Espanhol entra (laddering, aproveitando proximidade ao português)"
    ],
    successCriteria: [
      "100+ LeetCode resolvidos",
      "1 mock interview de System Design completada",
      "10+ utilizadores reais a testar a Faro"
    ]
  },
  {
    id: "mes-10",
    month: "MÊS 10",
    date: "MAIO 2027",
    phase: "Profissionalização",
    technical: [
      "System Design Interview Vol. 2 (Alex Xu)",
      "Manutenção de LeetCode + System Design — 2-3 mocks/semana a partir daqui"
    ],
    product: [
      "GitHub polido — READMEs case-study (problema -> decisão técnica -> resultado)",
      "3-5 posts técnicos publicados em inglês sobre a jornada da Faro"
    ],
    languages: [
      "LinkedIn otimizado, publicação regular de conteúdo técnico"
    ],
    successCriteria: [
      "GitHub com 3+ repositórios pinned, todos com README profissional",
      "3+ posts técnicos publicados",
      "Candidaturas a vagas remotas iniciadas"
    ]
  },
  {
    id: "mes-11",
    month: "MÊS 11",
    date: "JUNHO 2027",
    phase: "Job Hunt a Sério",
    technical: [
      "Mock interviews 2-3x/semana, incluindo comportamentais (método STAR) em inglês"
    ],
    product: [
      "Refinamento contínuo da Faro com base em feedback de utilizadores reais"
    ],
    languages: [
      "Entender o modelo de contrato (Recibos verdes / contrato B2B) - consulta contabilista"
    ],
    successCriteria: [
      "8-10 entrevistas técnicas realizadas",
      "Currículo e carta de apresentação refinados com base em feedback real"
    ]
  },
  {
    id: "mes-12",
    month: "MÊS 12",
    date: "JULHO 2027",
    phase: "Fecho do Ciclo",
    technical: [
      "Consolidação total — revisão de tudo o que foi construído nos 12 meses"
    ],
    product: [
      "Decisão consciente: dedicação parcial ou total à Faro pós-verão, com base em tração real"
    ],
    languages: [],
    successCriteria: [
      "Primeira proposta de contrato B2B remoto na mesa",
      "Retrospetiva completa dos 12 meses escrita"
    ]
  }
];

export const resources = [
  {
    category: "TypeScript",
    items: [
      { id: "r1", title: "Total TypeScript", author: "Matt Pocock", source: "No Starch Press, 2026" },
      { id: "r2", title: "Understanding TypeScript", author: "Maximilian Schwarzmüller", source: "Udemy" },
      { id: "r3", title: "TypeScript Handbook", author: "Equipa TypeScript, Microsoft", source: "Oficial" }
    ]
  },
  {
    category: "Node.js + NestJS",
    items: [
      { id: "r4", title: "Intro to NestJS", author: "Scrimba", source: "grátis, 83 min" },
      { id: "r5", title: "NestJS: The Complete Developer's Guide", author: "Stephen Grider", source: "Udemy" },
      { id: "r6", title: "NestJS Zero to Hero", author: "Ariel Weinberger", source: "Udemy" },
      { id: "r7", title: "freeCodeCamp — NestJS Course", author: "freeCodeCamp", source: "YouTube, grátis" }
    ]
  },
  {
    category: "PostgreSQL & Databases",
    items: [
      { id: "r8", title: "The Art of PostgreSQL", author: "Dimitri Fontaine", source: "Livro" },
      { id: "r9", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", source: "Livro" },
      { id: "r10", title: "Mastering PostgreSQL 17", author: "Hans-Jürgen Schönig", source: "Livro" }
    ]
  },
  {
    category: "Docker & Infra",
    items: [
      { id: "r11", title: "Docker Mastery", author: "Bret Fisher", source: "Udemy" },
      { id: "r12", title: "Docker & Kubernetes: The Practical Guide", author: "Maximilian Schwarzmüller", source: "Udemy" },
      { id: "r13", title: "Docker and Kubernetes: The Complete Guide", author: "Stephen Grider", source: "Udemy" }
    ]
  },
  {
    category: "Python + FastAPI (IA)",
    items: [
      { id: "r14", title: "FastAPI — The Complete Course 2026", author: "Eric Roby & Chad Darby", source: "Udemy" },
      { id: "r15", title: "Documentação oficial FastAPI", author: "Sebastián Ramírez", source: "Oficial" },
      { id: "r16", title: "Deploying AI into Production with FastAPI", author: "DataCamp", source: "Curso" }
    ]
  },
  {
    category: "System Design",
    items: [
      { id: "r17", title: "System Design Interview, Vol. 1", author: "Alex Xu", source: "Livro" },
      { id: "r18", title: "System Design Interview, Vol. 2", author: "Alex Xu", source: "Livro" }
    ]
  }
];

export const playbooks = [
  {
    id: "deep-work",
    title: "Protocolo de Deep Work",
    content: `A Regra do Separador Único. Quando estudas backend, só um separador está aberto: a documentação oficial.
Pomodoro Adaptado — 52+17. 52 minutos de trabalho, 17 de pausa real.
Bloqueio de Calendário — Não Negociável. 90 minutos de manhã, 90 à tarde/noite.
Regra dos 30 Dias — Imersão em Inglês. Todo o código, comentários e READMEs em inglês.
Mock Interviews em Inglês — a partir do Mês 9. Pratica em voz alta, gravando-te.`
  },
  {
    id: "ia-usage",
    title: "Como Usar IA",
    content: `Aprender Conceitos: Pede para explicar um conceito. Não peças a implementação completa.
Depurar Erros: Descreve o erro e pede explicação das causas. Não coles só o erro.
Code Review: Pede para apontar problemas de performance ou legibilidade.
Estares Bloqueado: Pede pistas após 30 minutos bloqueado. Não vejas a solução completa.
Arquitetura: Debate trade-offs. Não aceites a primeira sugestão cegamente.`
  },
  {
    id: "stack",
    title: "O Stack Obrigatório",
    content: `NÍVEL 1 (Core): TypeScript, Node.js, NestJS, PostgreSQL, Git/GitHub, Docker, Testing (Jest)
NÍVEL 2 (Fase 3): Python + FastAPI (IA), Redis, System Design, CI/CD (GitHub Actions), OAuth2 / JWT
NÍVEL 3 (Polimento): GraphQL, Kubernetes, gRPC, Kafka`
  },
  {
    id: "faro-spec",
    title: "Faro — Especificação Técnica",
    content: `Funcionalidades Core:
- Cursos e lições em árvore de progressão.
- Repetição espaçada (SM-2).
- XP, streaks e ligas.
- Geração de exercícios via IA (microserviço Python).

Arquitetura:
- NestJS monolítico bem modularizado.
- PostgreSQL (principal), Redis (cache/pubsub).
- FastAPI isolado para IA via REST interna.
- Docker Compose, GitHub Actions para CI/CD, deploy inicial simples (Railway/Render/Fly.io).`
  },
  {
    id: "leetcode",
    title: "Estratégia LeetCode",
    content: `Lista: Blind 75 -> NeetCode 150.
Cadência:
- T1: Arrays, Strings, HashMaps (1 fácil/dia)
- T2: Two Pointers, Sliding Window, Linked Lists, Trees (1-2 médios/dia)
- T3: Graphs, Dynamic Programming (2/dia + mocks semanais)
- T4: Manutenção + Mocks intensivos

Repetição Espaçada: Revisita a 1 dia, 3 dias, 1 semana e 1 mês.`
  },
  {
    id: "system-design",
    title: "System Design",
    content: `Livros: Designing Data-Intensive Applications (DDIA) e System Design Interview (Alex Xu).
Conceitos a dominar (Trimestre 3): Scalability, CAP theorem, Caching (Redis), Load balancing, Replicação, Sharding, Message queues, CDNs, Rate limiting.
Prática: Usa a Faro como caso de estudo (ex: "Como escalar streaks para 100 mil utilizadores?").`
  },
  {
    id: "idiomas",
    title: "Protocolo de Idiomas",
    content: `Certificação: Cambridge C1 Advanced (CAE) -> C2 Proficiency (CPE).
Jul-Set 2026: Imersão total + 1ª sessão de conversação.
Out-Dez 2026: Documentar Faro em inglês + 1ª mock interview técnica.
Jan-Mar 2027: Inscrição no exame C1 + 2ª mock interview.
Francês/Espanhol (Laddering): 15-20 min/dia usando português e inglês como base (Francês em Jan 2027, Espanhol em Mar 2027).`
  },
  {
    id: "portfolio",
    title: "Portfólio & Candidatura",
    content: `GitHub: 3 a 6 repositórios pinned (Faro no topo, 1-2 exercícios System Design, 1 contribuição open-source). READMEs com: Problema -> Decisão -> Resultado.
Escrever em Público: 3-5 posts técnicos no Mês 10.
Estratégia: Referral primeiro. CV de uma página (ATS friendly). Carta de apresentação de 2 parágrafos. Regista todas as candidaturas e faz follow-up após 7 dias.`
  }
];

export const goals = [
  { id: "g1", title: "Duração: 12 meses ininterruptos" },
  { id: "g2", title: "Papel-Alvo: Founder & Lead Backend Engineer -> Mid-Level Remoto B2B" },
  { id: "g3", title: "Meta LeetCode: 150+ resolvidos, padrão a padrão" },
  { id: "g4", title: "Projeto Flagship: Faro — Duolingo + IA" },
  { id: "g5", title: "Grant em Jogo: FITEC-2026-01 · 30.000€ a fundo perdido" }
];

export const commandments = [
  "Não seguirás um tutorial sem depois o reconstruíres de memória.",
  "Não confundirás saber o nome de uma tecnologia com saber usá-la em produção.",
  "Lerás o código-fonte da tua dependência antes de perguntares a alguém.",
  "Não escreverás uma função sem saberes a sua complexidade — tempo e memória.",
  "Testarás o teu código antes de confiares nele, e confiarás nele antes de o implantares.",
  "Não deixarás em produção nada que não consigas explicar em 2 minutos, em inglês.",
  "Documentarás como se o teu 'eu' de daqui a 6 meses fosse um estranho completo.",
  "Não otimizarás o que não mediste primeiro.",
  "Descansarás sete a oito horas, pois um cérebro exausto não fixa padrões.",
  "Falarás, lerás e escreverás em inglês todos os dias — mesmo sozinho, mesmo mal."
];
