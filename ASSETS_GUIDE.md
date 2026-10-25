# Guia de Assets & Sprites - Visual Novel

Este guia explica como preparar e organizar os arquivos visuais (sprites de personagens e cenários) e sonoros para o seu jogo.

---

## 1. Estrutura de Diretórios de Assets

Todos os arquivos devem ser colocados dentro da pasta `public/assets/`:

```
public/assets/
├── sprites/
│   ├── [characterId]/           <- Pasta com o mesmo ID cadastrado em characters.ts
│   │   ├── neutral.png          <- Expressão padrão recomendada
│   │   ├── happy.png
│   │   ├── sad.png
│   │   └── surprised.png
│   └── protagonist/             <- Opcional (se você quiser exibir o avatar do protagonista)
├── backgrounds/
│   ├── [backgroundId].webp      <- Imagem de fundo no formato WebP (recomendado)
│   └── [backgroundId].jpg       <- Fallback automático caso não utilize WebP
└── audio/
    ├── sfx/                     <- Efeitos sonoros opcionais (.mp3)
    └── bgm/                     <- Músicas de fundo opcionais (.mp3)
```

---

## 2. Especificações dos Sprites de Personagens

| Parâmetro | Recomendação Ideal | Limite Mínimo |
| :--- | :--- | :--- |
| **Formato** | **PNG** ou **WebP** com transparência total (canal Alpha) | PNG 24-bit |
| **Dimensões** | **800 x 1200 px** ou **1000 x 1500 px** | 600 x 900 px |
| **Alinhamento** | Personagem ancorado pela base (pés tocando a linha inferior da imagem) | - |
| **Enquadramento** | Plano Americano (da cintura/coxas para cima) ou Corpo Inteiro | Da cintura para cima |
| **Fundo** | **100% Transparente** (sem halos brancos ou cinzas) | - |

> [!TIP]
> **Placeholders Automáticos:** Você não precisa esperar que todos os desenhos fiquem prontos! Se um arquivo `.png` ainda não existir, o motor exibe automaticamente um avatar vetorial (SVG) colorido com a silhueta, iniciais, cores temáticas do personagem e o nome da expressão requisitada.

---

## 3. Nomenclatura das Expressões

Os nomes dos arquivos `.png` devem ser exatamente iguais aos cadastrados em `knownExpressions` do arquivo `src/constants/characters.ts`.

Exemplo:
Se no cadastro do personagem você tiver:
```typescript
knownExpressions: ['neutral', 'happy', 'angry', 'surprised']
```
A pasta `public/assets/sprites/seu_personagem/` deverá conter:
- `neutral.png`
- `happy.png`
- `angry.png`
- `surprised.png`

### Poses e Animações Disponíveis no Roteiro
No JSON do episódio você pode configurar a reação do personagem:
- `animation: "slide-up-fade"`: entrada suave pela base (padrão)
- `animation: "sprite-shake"`: tremor lateral (choque, susto, raiva)
- `animation: "sprite-bob"`: pulinho vertical leve (fala animada ou risada)
- `position: "left" | "center" | "right"`: posicionamento na tela (padrão: `center`)

---

## 4. Especificações dos Cenários de Fundo (Backgrounds)

* **Resolução:** **1920 x 1080 px** (proporção 16:9 Full HD).
* **Formato:** `.webp` (preferencial por peso reduzido e alta qualidade) ou `.jpg`.
* **Nome do Arquivo:** Deve coincidir com o identificador cadastrado em `src/constants/backgrounds.ts`.
  - Exemplo: cenário `cenario_exemplo` procura primeiro `public/assets/backgrounds/cenario_exemplo.webp` e depois `.jpg`.
* **Transição:** A troca de cenários durante os diálogos conta com efeito suave de *cross-fade* automático.

---

## 5. Áudio e Efeitos Sonoros

O motor já possui um **Sintetizador Procedural Web Audio** integrado, permitindo tocar cliques, bipes de alerta, impactos graves, passos e acordes musicais mesmo sem arquivos de som externos!

Caso queira utilizar trilhas e gravações sonoras personalizadas:
- Coloque os arquivos `.mp3` nas pastas `public/assets/audio/sfx/` ou `bgm/`.
- As palavras-chave para disparo automático de sons contextuais podem ser configuradas em `src/config/game.config.ts`.
