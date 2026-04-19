<div align="center">
  <h1>✨ OrganizaS</h1>
  <p><strong>A sua central definitiva de produtividade, organização e foco.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
  [![Google AI Genkit](https://img.shields.io/badge/AI-Google_Genkit-blue?style=for-the-badge&logo=google)](https://firebase.google.com/docs/genkit)
</div>

---

## 🚀 Sobre o Projeto

Conheça o **OrganizaS**, muito mais que uma simples lista de tarefas. É um ecossistema completo pensado para elevar o seu foco, simplificar a sua rotina e transformar os seus objetivos diários em realidade. 

Combinando **Interface Moderna** (UI intuitiva) com **Inteligência Artificial**, o aplicativo ajuda não apenas a gerir o que precisa de ser feito, mas também *como* o fazer de forma mais eficiente.

---

## 🌟 Principais Funcionalidades

- **✅ Gestão de Tarefas (Todo) & Inbox:** Organize suas ideias, projetos e tarefas diárias de forma inteligente.
- **📅 Calendário & Agendamento:** Controle absoluto do seu tempo. Agende eventos, reuniões e defina blocos de foco.
- **🎯 Metas & Hábitos:** Acompanhe o seu progresso semanal e crie bons hábitos com nosso Tracker dedicado.
- **📚 Smart Study & Canvas:** Ecrã dedicado a sessões de foco (com integração Excalidraw e editor de texto avançado Tiptap).
- **🤖 IA Integrada (Genkit):** Sugestões de hábitos, otimização de metas diárias e fluxos de produtividade gerados com inteligência artificial.
- **🔔 Notificações Ativas:** Não perca nenhum compromisso graças à integração do sistema de push Notifications (OneSignal).
- **📊 Dashboard Visual:** Gráficos interativos diários/semanais construídos nativamente.

---

## 🛠️ Stack Tecnológico

O projeto foi construído usando o estado de arte no desenvolvimento web moderno:

* **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI (Radix)](https://ui.shadcn.com/)
* **Backend & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Admin)
* **Inteligência Artificial:** [Google Genkit](https://firebase.google.com/docs/genkit) com fluxos personalizados
* **Media & Serviços:** [Cloudinary](https://cloudinary.com/) (Uploads), [OneSignal](https://onesignal.com/) (Push Notifs)
* **Rich Text / Drawing:** [Tiptap](https://tiptap.dev/) / [Excalidraw](https://excalidraw.com/)

---

## ⚙️ Como Começar (Setup Local)

### 1. Pré-requisitos
- Node.js (versão 18.17 ou superior)
- npm, yarn ou pnpm
- Uma conta no [Firebase](https://console.firebase.google.com/)
- Conta Cloudinary e OneSignal (para features avançadas)

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-login/organizaS.git
cd organizaS
npm install
```

### 3. Configuração de Variáveis de Ambiente

Configure as suas variáveis de ambiente no ficheiro `.env.local` (leia a documentação interna em `docs/ENV_VARIABLES.md` e `docs/blueprint.md` para as opções disponíveis).

### 4. Iniciando os Servidores

O sistema utiliza arquitetura mista para UI e IA. Poderá rodar os comandos separadamente:

**Rodar Aplicação Web (porta 9002):**
```bash
npm run dev
```

**Rodar IA (Genkit Flows):**
```bash
npm run genkit:dev
# ou em modo watch
npm run genkit:watch
```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador e comece a ser produtivo! 🔥

---

## 🎨 Arquitetura Limpa & Escalável

O código está altamente organizado e componentizado dentro da estrutura `src/`:
- `src/app/` - App Router e APIs e rotas do Next.js.
- `src/components/` - Blocos visuais independentes (`habits`, `goals`, `schedule`, `todo` e sistema de Design baseado em `ui/`).
- `src/ai/` - Fluxos generativos e prompts do Google Genkit.
- `src/lib/` & `src/hooks/` - Lógica de negócio, ligações Firebase e Custom Hooks dinâmicos.

---

<p align="center">Feito com ☕ e foco. Desenvolvido para maximizar o seu tempo.</p>
