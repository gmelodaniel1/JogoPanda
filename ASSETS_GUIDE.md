# Guia de Assets & Sprites — Panda de Ferro: O Mistério do Engenho Jussaral

Este guia lista todos os arquivos visuais e sonoros necessários para o jogo, com base na Bíblia Oficial de Personagens e Cenários do **Panda de Ferro**.

---

## 1. Estrutura de Diretórios de Assets

Todos os arquivos devem ser colocados dentro da pasta `public/assets/`:

```
public/assets/
├── sprites/
│   ├── cipriano/                <- Gabriel Cipriano (O Presidente)
│   ├── pedro_ivo/               <- Pedro Ivo (O Climatologista)
│   ├── luis/                    <- Luís (A Polícia Moral)
│   ├── malu_maciel/             <- Malu Maciel (A Irmã Investigadora)
│   ├── sandro_vagner/           <- Sandro Vagner (O Repórter)
│   ├── conrado/                 <- Conrado (O Guardião do Bom Dia)
│   ├── joel_das_pimentas/       <- Joel das Pimentas
│   ├── itaberaba_noticias/      <- Robô Itaberaba Notícias
│   ├── conecta_professores/     <- Robô Conecta Professores
│   ├── artcomercial/            <- Robô ArtComercial
│   ├── and/                     <- And, o Louco da Moradia UFPE
│   ├── bilu/                    <- Bilu (Gilherto Sim , Ok ❤️)
│   └── gildro_iviano/           <- Gildro Iviano (O Faria Limer Paulista)
├── backgrounds/                 <- Cenários do jogo (.webp ou .jpg)
└── audio/
    ├── sfx/                     <- Efeitos sonoros opcionais (.mp3 / .wav)
    └── bgm/                     <- Músicas de fundo opcionais (.mp3)
```

---

## 2. Checklist Completa de Sprites

> [!TIP]
> **Formatos Híbridos Suportados:** Você pode salvar os sprites em **`.webp`** (recomendado para reduzir em até 75% o peso e carregar instantaneamente em redes móveis) ou em **`.png`** tradicional com fundo transparente. O motor testa automaticamente `.webp` -> `.png` -> fallback neutro -> avatar vetorial SVG.

> [!IMPORTANT]
> **Padrão de Bounding Box (Anti-Jitter & Estabilidade):**
> - **Dimensões recomendadas:** 1080×1440 px ou 1200×1600 px (proporção vertical ~3:4).
> - **Ancoragem Vertical:** Todas as poses de um mesmo personagem devem ser exportadas sobre o **mesmo tamanho de canvas transparente**, com a base do corpo tocando o rodapé inferior (`bottom: 0px`).
> - **Alinhamento de Olhos:** Mantenha a posição e altura da cabeça consistentes entre as expressões. O motor agora faz *cross-fade* automático de 300 ms entre expressões, resultando em uma troca de rosto 100% contínua e sem saltos.

### 🕵️‍♂️ Os Protagonistas (A Comitiva Presidencial)
* **`cipriano/` (Gabriel Cipriano)**
  - `cipriano_neutro.png`: Postura séria e presidencial.
  - `cipriano_limpando_celular.png`: Borrifando álcool isopropílico e lustrando com microfibra.
  - `cipriano_sorriso_mentolado.png`: Sorriso confiante com cigarro mentolado aceso.
  - `cipriano_irritado_alcool.png`: Irritado borrifando álcool seguidamente.
  - `cipriano_serio_mentolado.png`: Expressão séria e compenetrada.
  - `cipriano_calmo_mentolado.png`: Calmo e institucional.
  - `cipriano_chocado_ponto_final.png`: Mente em curto (Bad End 03).
  - `cipriano_triste.png`: Derrotado entregando a presidência (Bad End 04).
  - `cipriano_epico_mentolado.png`: Contra-ofensiva épica com celular reluzente.

* **`pedro_ivo/` (Pedro Ivo)**
  - `pedro_ivo_neutro.png`: Olhar neutro de quem acabou de dizer *"Sim"*.
  - `pedro_ivo_serio.png`: Postura de boletim meteorológico.
  - `pedro_ivo_analisando.png`: Analisando a queda de temperatura da moenda.
  - `pedro_ivo_surpreso.png`: Chocado com a conspiração da Faria Lima.
  - `pedro_ivo_sorriso_discreto.png`: Sorriso sutil e discreto no final.

* **`luis/` (Luís)**
  - `luis_neutro.png`: Postura padrão de servidor do Paço do Frevo.
  - `luis_julgando.png`: Notificando advertência da Polícia Moral.
  - `luis_rindo.png`: Rindo da situação do Santa Cruz.
  - `luis_emocionado.png`: Comovido pelo bom dia de Conrado.
  - `luis_desconfiado.png`: Desconfiado da arapuca na Carne de Sol.
  - `luis_alerta.png`: Em alerta com a recepção de pimenta ácida.
  - `luis_assustado.png`: Em pânico com a grade caindo ou com And e Bilu.
  - `luis_surpreso.png`: Surpreso ao receber a videochamada de Malu.
  - `luis_cerveja.png`: Segurando uma cerveja no Belém Bar.
  - `luis_indignado.png`: Indignado autuando Gildro Iviano por uso de sapatênis.
  - `luis_vitorioso.png`: Triunfante aplicando a pena de serpentina em Gildro.

### 📱 Apoio Externo
* **`malu_maciel/`:**
  - `malu_maciel_videochamada.png`: Emoldurada como interface de chamada de vídeo do WhatsApp.
* **`sandro_vagner/`:**
  - `sandro_reporter.png`: Ícone/avatar de plantão jornalístico de emergência.
* **`conrado/`:**
  - `conrado_bom_dia.png`: Xícara de café com purpurina e panda sorridente.

### 🤖 Os Vilões (A Liga dos Banidos & Golpistas)
* **`joel_das_pimentas/`:**
  - `joel_das_pimentas_furioso.png`: Arremessando vidros de conserva de malagueta.
  - `joel_desesperado.png`: Em pânico fugindo da Receita Federal pelo canavial.
* **`itaberaba_noticias/`:**
  - `robo_itaberaba.png`: Carcaça robótica sucateada com LED vermelho.
  - `robo_itaberaba_curto.png`: Soltando faíscas e desabando com o bom dia de Conrado.
* **`conecta_professores/`:**
  - `robo_conecta.png`: Robô burocrático com teclado holográfico de editais MEC.
  - `robo_conecta_curto.png`: Entrando em curto-circuito com fumaça.
* **`artcomercial/`:**
  - `robo_artcomercial.png`: Impressora industrial com guilhotina e rolos de plastificação.
  - `robo_artcomercial_curto.png`: Explodindo em chuva de papel picado colorido.
* **`and/`:**
  - `and_louco_ufpe.png`: And cercado pelos emojis ❤️🫁🧠 gritando *Papaloc Muncks*.
* **`bilu/`:**
  - `bilu_coracao.png`: Bilu com balãozinho de ❤️ (*"Oi, Sim, Vem / Gilherto Sim , Ok ❤️"*).
* **`gildro_iviano/`:**
  - `gildro_iviano_vilao_paulista.png`: De bermuda cáqui, sapatênis de couro bege e suéter jogado nos ombros.
  - `gildro_derrotado.png`: De joelhos, suéter desamarrado e chocado com a várzea.

---

## 3. Checklist de Cenários (`public/assets/backgrounds/`)

| Arquivo Recomendado | Arquivo Fallback | Descrição da Cena |
| :--- | :--- | :--- |
| `estrada_canavial_pe.webp` | `.jpg` | Rodovia BR-101 Sul cercada por canaviais |
| `carne_de_sol_paraibana_sepia.webp` | `.jpg` | Flashback 01: Carne de Sol Paraibana em tom sépia |
| `portao_engenho_jussaral.webp` | `.jpg` | Guarita do Engenho com mesa da degustação de pimenta |
| `tela_preta_vermelha.webp` | `.jpg` | Bad End 01: Combustão interna por Carolina Reaper |
| `patio_engenho_abandonado.webp` | `.jpg` | Pátio interno com a grade de ferro despencada |
| `oficina_grafica_escura.webp` | `.jpg` | Bad End 02: Oficina da ArtComercial com rolos térmicos |
| `interior_moenda_labirinto.webp` | `.jpg` | Moenda velha com pichações de Moradia/UFPE |
| `espiral_psicodelica_ufpe.webp` | `.jpg` | Bad End 03: Fenda dimensional da loucura |
| `belem_bar_noite.webp` | `.jpg` | Flashback 02: Calçada noturna do Belém Bar |
| `salao_principal_engenho.webp` | `.jpg` | Salão principal com passarela metálica alta |
| `grupo_whatsapp_paulista.webp` | `.jpg` | Bad End 04: Grupo Faria Limer de Beach Tennis |
| `tela_gameover_itaberaba.webp` | `.jpg` | Layout sensacionalista de jornal policial |
| `salao_principal_engenho_epico.webp` | `.jpg` | True Ending: Salão iluminado na vitória |

---

## 4. Placeholders SVG Automáticos

Enquanto você não inserir os arquivos PNG ou WebP:
- O motor renderiza **avatares vetoriais dinâmicos** com a silhueta, as iniciais e as cores temáticas oficiais (o vermelho e preto do Santa Cruz para Cipriano, o vermelho e branco do Náutico para Pedro Ivo e Luís, etc.).
- Os cenários ausentes exibem uma grade futurista com o nome do local e o caminho do arquivo esperado.
- **O jogo já é 100% jogável do início ao fim agora mesmo!**
