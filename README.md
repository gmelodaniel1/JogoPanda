# Jogo do Panda - Engine Base para Visual Novel

Motor completo e desacoplado de Visual Novel em **React 18 + TypeScript + Vite + Tailwind CSS**, desenvolvido com arquitetura modular para que você possa criar histórias originais com facilidade.

Toda a lógica específica de personagens, episódios, cenários e identidade visual foi centralizada em arquivos de configuração limpos, permitindo que você adicione seus próprios personagens, roteiros e sprites sem precisar alterar o código do motor.

---

## 🚀 Como Executar o Projeto

1. **Instalar dependências** (caso esteja em outra máquina ou clone novo):
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra a URL indicada no terminal (por padrão `http://localhost:5173`).

3. **Validar integridade dos roteiros e nós:**
   ```bash
   npm test
   ```
   Valida todo o grafo de diálogo, detecta pontas soltas, nós inalcançáveis, erros de digitação em IDs de personagens e checa a existência dos assets.

4. **Gerar build de produção otimizado:**
   ```bash
   npm run build
   ```

---

## 📂 Onde Customizar Seu Jogo

A arquitetura foi estruturada em 4 pontos principais:

```
src/
├── config/
│   └── game.config.ts        <- Título do jogo, subtítulo, badges, sons automáticos e textos de conclusão
├── constants/
│   ├── characters.ts         <- Cadastro de personagens (nomes, cores, poses cadastradas)
│   └── backgrounds.ts        <- Cadastro de cenários (IDs e nomes exibidos)
├── data/
│   └── episodes/
│       ├── episode1.json     <- Roteiro do episódio 1 (nós, falas, escolhas, afinidade)
│       └── index.ts          <- Registro dos episódios disponíveis na campanha
└── public/
    └── assets/
        ├── sprites/          <- Pastas de cada personagem com suas imagens PNG
        ├── backgrounds/      <- Imagens de fundo (.webp ou .jpg)
        └── audio/            <- Áudios opcionais (.mp3)
```

---

### 1. Identidade do Jogo (`src/config/game.config.ts`)
Configure o nome do jogo, subtítulo, créditos, prefixo de salvamento no navegador e a regra de avaliação de fim de episódio:
- `title`: Nome do jogo (exibido no topo, menu e aba do navegador).
- `tagline`: Frase descritiva do menu.
- `affinity.name`: Nome do sistema de afinidade (ex.: "Afinidade", "Amizade", "Respeito").
- `affinity.shortLabel`: Sigla curta (ex.: "AF", "PTS", "LOM").
- `completion`: Personagem que avalia o jogador ao fim de cada episódio e os textos para cada desempenho.

---

### 2. Adicionar ou Alterar Personagens (`src/constants/characters.ts`)
Para cadastrar seus próprios personagens:
```typescript
panda: {
  id: 'panda',
  name: 'Panda',
  title: 'Guardião do Bambuzal',
  hasRomanceRoute: true,
  themeColor: '#10b981',       // Cor do nome e destaques visuais
  badgeColor: '#059669',       // Cor da tag de cargo/título
  defaultExpression: 'neutral',
  knownExpressions: ['neutral', 'happy', 'surprised', 'angry'],
},
```
- Adicione o id em `AFFINITY_ROSTER_IDS` se quiser que ele apareça no medidor de afinidade do HUD e no balanço final do episódio.
- `protagonist` e `narrator` já vêm configurados por padrão.

---

### 3. Adicionar ou Alterar Cenários (`src/constants/backgrounds.ts`)
Cadastre os cenários aceitos nos roteiros:
```typescript
bambuzal: {
  label: 'Floresta de Bambu',
  aliases: ['floresta', 'bamboo-forest'],
},
```

---

### 4. Escrever o Roteiro (`src/data/episodes/`)
Cada episódio é um arquivo JSON composto por nós interligados:
```json
{
  "episode": 1,
  "title": "O Despertar",
  "startingNodeId": "inicio",
  "nodes": {
    "inicio": {
      "id": "inicio",
      "speaker": "Panda",
      "characterId": "panda",
      "expression": "happy",
      "background": "bambuzal",
      "text": "Olá! Seja muito bem-vindo ao meu recanto.",
      "choices": [
        {
          "text": "Muito obrigado! O lugar é lindo.",
          "lomChange": { "panda": 5 },
          "next": "resposta_gentil"
        },
        {
          "text": "O que é este lugar estranho?",
          "lomChange": { "panda": -5 },
          "next": "resposta_rude"
        }
      ]
    },
    "resposta_gentil": {
      "id": "resposta_gentil",
      "speaker": "Panda",
      "characterId": "panda",
      "expression": "happy",
      "background": "bambuzal",
      "text": "Fico feliz que tenha gostado!",
      "next": "desfecho"
    },
    "resposta_rude": {
      "id": "resposta_rude",
      "speaker": "Panda",
      "characterId": "panda",
      "expression": "angry",
      "animation": "sprite-shake",
      "background": "bambuzal",
      "text": "Estranho?! Mais respeito com a minha floresta!",
      "next": "desfecho"
    },
    "desfecho": {
      "id": "desfecho",
      "speaker": "Narrador",
      "characterId": null,
      "expression": null,
      "background": "bambuzal",
      "text": "E assim começa a sua jornada."
    }
  }
}
```
> **Dica:** O último nó de cada caminho (sem o campo `next` nem `choices`) é reconhecido automaticamente pelo motor como um desfecho, disparando a tela de conclusão de episódio com a soma da afinidade conquistada!

---

## 🎨 Sprites e Placeholders Automáticos

**Você não precisa esperar ter os desenhos prontos para testar seu jogo!**
- O motor possui renderizadores vetoriais integrados (`CharacterAvatarSvg` e `BackgroundSvg`).
- Se uma imagem PNG ou WebP ainda não estiver na pasta `public/assets/`, o motor desenha automaticamente um avatar estilizado com o nome, cargo, cor temática e a pose solicitada.
- Quando você tiver a arte final, basta soltar o arquivo `.png` transparente em `public/assets/sprites/<characterId>/<expressao>.png` que o jogo carrega a imagem real instantaneamente.

Para especificações detalhadas de resolução, corte e proporção, consulte o guia [`ASSETS_GUIDE.md`](./ASSETS_GUIDE.md).

---

## 🕹️ Funcionalidades Nativas Inclusas

- **Caixa de Diálogo Estilo Typewriter:** Efeito de digitação suave com controle de velocidade (1x, 2x, 3x) e clique para concluir imediatamente.
- **Sistema de Afinidade Dinâmico:** Notificações flutuantes (`+5`, `-10`), barra de progresso individual e dropdown completo com todos os personagens.
- **Histórico Completo (Backlog/Log):** Histórico de todas as falas da sessão com indicação das escolhas feitas pelo jogador.
- **Auto-Play & Auto-Save:** Modo leitura automática e salvamento contínuo em LocalStorage, além de 4 slots de salvamento manual com preview de cena e texto.
- **Estúdio de Sprites Embutido:** Galeria visual acessível pelo menu e pelo HUD para inspecionar poses, testar transparência e pré-visualizar animações (`fade`, `shake`, `bob`).
- **Design 100% Responsivo & Mobile-First:** Roda perfeitamente em computadores e em qualquer celular (tanto em modo paisagem quanto retrato), com suporte nativo a entalhes/câmeras (safe-area), altura dinâmica (`100dvh`) e prevenção de quebras por barras de navegação do browser.

---

## 🌐 Como Subir para o GitHub Pages

O projeto já inclui uma automação completa do GitHub Actions em `.github/workflows/deploy.yml`.

Para publicar o seu jogo online:

1. **Crie um repositório no seu GitHub** (por exemplo, `jogo-do-panda`).
2. **Conecte e envie o código:**
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git branch -M master
   git push -u origin master
   ```
3. **Ative o GitHub Pages:**
   - Acesse o repositório no GitHub.
   - Vá em **Settings** > **Pages**.
   - Em **Build and deployment** > **Source**, escolha **GitHub Actions**.
4. Pronto! O GitHub irá compilar automaticamente os scripts, rodar os testes de integridade e publicar seu jogo no endereço:
   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

