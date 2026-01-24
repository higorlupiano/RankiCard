# 🎮 RankiCard - RPG Life Gamification

Um aplicativo mobile que gamifica sua vida diária, convertendo atividades reais (exercícios, estudos) em XP e níveis de RPG.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🚀 Funcionalidades

- **Sistema de XP e Níveis**: Ganhe experiência através de atividades do dia a dia
- **Integração Strava**: Sincronize atividades físicas e ganhe XP automaticamente
- **Timer de Estudos**: Complete sessões de estudo e ganhe XP
- **Sistema de Missões**: Complete missões diárias para ganhar XP e ouro
- **Ranking por Nível**: Suba de rank (F → E → D → C → B → A → S) conforme progride
- **Perfil Personalizado**: Avatar, estatísticas e progresso visual

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Strava (opcional, para integração)
- Android Studio (para build mobile)

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd adventurer-profile-rpg
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` e adicione suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   VITE_STRAVA_CLIENT_ID=seu_strava_client_id
   ```

4. **Configure o Supabase**
   
   - Crie as tabelas necessárias (`profiles`, `missions`, `user_missions`)
   - Configure as Edge Functions (`strava-auth`)
   - Adicione as variáveis de ambiente nas Edge Functions:
     - `STRAVA_CLIENT_ID`
     - `STRAVA_CLIENT_SECRET`
   - Configure as Redirect URLs no Supabase Auth

## 🏃 Executando Localmente

### Desenvolvimento Web
```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## 📱 Build Mobile (Android)

1. **Build do projeto web**
   ```bash
   npm run build
   ```

2. **Sincronize com Capacitor**
   ```bash
   npm run cap:sync
   ```

3. **Abra no Android Studio**
   ```bash
   npm run cap:open:android
   ```

4. **Ou faça build direto**
   ```bash
   npm run android:build
   ```

## 🏗️ Estrutura do Projeto

```
adventurer-profile-rpg/
├── src/
│   ├── components/      # Componentes React
│   │   ├── auth/       # Autenticação
│   │   ├── game/       # Componentes do jogo
│   │   ├── layout/     # Layout e navegação
│   │   ├── player/     # Perfil do jogador
│   │   └── ui/         # Componentes UI reutilizáveis
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Configurações (Supabase)
│   ├── types/          # Tipos TypeScript
│   └── utils/          # Funções utilitárias
├── android/            # Projeto Android (Capacitor)
├── App.tsx            # Componente principal
└── package.json
```

## 🔧 Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Supabase** - Backend (Auth + Database)
- **Capacitor** - Bridge para mobile
- **Tailwind CSS** - Estilização (via CDN)

## 📝 Variáveis de Ambiente

Veja [VERCEL_ENV.md](./VERCEL_ENV.md) para detalhes sobre variáveis de ambiente na Vercel.

## 🐛 Troubleshooting

### Erro "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe e contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Erro ao sincronizar Strava
- Verifique se as Edge Functions estão configuradas no Supabase
- Confirme que `STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET` estão nas variáveis de ambiente das Edge Functions

### Build Android falha
- Certifique-se de ter o Android Studio instalado
- Execute `npm run cap:sync` antes de fazer o build

## 📄 Licença

Este projeto é privado.

## 🤝 Contribuindo

Este é um projeto privado. Para sugestões ou problemas, abra uma issue.
