import type { CharacterId } from '../constants/characters';
import type { BackgroundId } from '../constants/backgrounds';
import type { BgmTrack, SfxType } from '../types/dialogue';

/**
 * ============================================================================
 *  CONFIGURAÇÃO CENTRAL DO JOGO
 * ============================================================================
 * Este é o principal arquivo para "trocar a identidade" do jogo.
 * Textos de menu, créditos, avaliação de fim de episódio, nome do medidor de
 * afinidade e palavras-chave de áudio ficam todos aqui.
 *
 * Personagens  -> src/constants/characters.ts
 * Cenários     -> src/constants/backgrounds.ts
 * Episódios    -> src/data/episodes/ (JSON) + src/data/episodes/index.ts
 * ============================================================================
 */

export interface CompletionFeedbackTier {
  /** Saldo mínimo de afinidade no episódio para cair nesta faixa. */
  minNetDelta: number;
  badge: string;
  /** Classes Tailwind do badge. */
  badgeColor: string;
  quote: string;
  /** Expressão do avaliador exibida nesta faixa. */
  expression: string;
}

export const GAME_CONFIG = {
  /** Título principal (logo do menu, créditos, aba do navegador). */
  title: 'Jogo do Panda',
  /** Subtítulo/descrição curta exibida abaixo do logo. */
  tagline: 'Uma visual novel interativa. Substitua este texto em src/config/game.config.ts.',
  /** Selo pequeno exibido acima do logo no menu principal. */
  badge: 'Visual Novel',
  /** Prefixo do título exibido no HUD durante o jogo. Ex.: "Jogo do Panda • Ep. 1: ..." */
  hudTitlePrefix: 'Jogo do Panda',

  /**
   * Prefixo das chaves no localStorage. Mantenha único por jogo para que os saves
   * não colidam com outros jogos hospedados no mesmo domínio.
   */
  storagePrefix: 'jogo_do_panda_',

  /** Cenário de fundo do menu principal. */
  menuBackground: 'cenario_exemplo' as BackgroundId,

  /** Sprites decorativos nas laterais do menu principal (null para ocultar). */
  menuSprites: {
    left: { characterId: 'personagem_a', expression: 'neutral' },
    right: { characterId: 'personagem_b', expression: 'neutral' },
  } as Record<'left' | 'right', { characterId: CharacterId; expression: string } | null>,

  /** Personagem exibido no medidor quando o narrador/protagonista está falando. */
  defaultMeterCharacterId: 'personagem_a' as CharacterId,

  /** Nomenclatura do medidor de afinidade (no Lana Doce era "Love'o'Meter / LOM"). */
  affinity: {
    name: 'Afinidade',
    shortLabel: 'AF',
  },

  credits: {
    aboutTitle: 'Sobre o Jogo',
    aboutText:
      'Escreva aqui a descrição do seu jogo, da sua equipe ou da inspiração por trás da história.',
    castTitle: 'Personagens',
    castIntro: 'Elenco principal da história:',
    footer: 'Feito com carinho',
  },

  /**
   * Avaliação exibida na tela de conclusão de episódio.
   * Um personagem "avaliador" comenta o desempenho com base no saldo de afinidade.
   * Defina `evaluator` como null para ocultar o card.
   */
  completion: {
    subtitle: 'Balanço das interações e afinidades deste episódio',
    evaluator: {
      characterId: 'personagem_a' as CharacterId,
      displayName: 'Personagem A',
      role: 'Avaliador(a)',
    } as { characterId: CharacterId; displayName: string; role: string } | null,
    /** Ordenadas do maior para o menor `minNetDelta`. A última funciona como "senão". */
    tiers: [
      {
        minNetDelta: 15,
        badge: 'Desempenho Excelente',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        quote: 'Texto de avaliação para um episódio excelente.',
        expression: 'happy',
      },
      {
        minNetDelta: 5,
        badge: 'Desempenho Positivo',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        quote: 'Texto de avaliação para um episódio positivo.',
        expression: 'happy',
      },
      {
        minNetDelta: -5,
        badge: 'Desempenho Regular',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        quote: 'Texto de avaliação para um episódio regular.',
        expression: 'neutral',
      },
      {
        minNetDelta: -Infinity,
        badge: 'Desempenho Crítico',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        quote: 'Texto de avaliação para um episódio com muitos atritos.',
        expression: 'sad',
      },
    ] as CompletionFeedbackTier[],
  },

  /**
   * Detecção automática de áudio pelo texto da fala (opcional).
   * Se o texto do nó contiver alguma palavra-chave, o efeito/trilha é aplicado.
   * Campos `sfx`/`bgm` explícitos no JSON do episódio sempre têm prioridade.
   */
  audioCues: {
    sfx: [
      { sfx: 'footsteps', keywords: ['passos', 'andando'] },
      { sfx: 'door', keywords: ['porta', 'tranca', 'chave'] },
    ] as { sfx: SfxType; keywords: string[] }[],
    bgm: [
      { bgm: 'romance', keywords: ['amor', 'apaixonad', 'carinho'] },
    ] as { bgm: BgmTrack; keywords: string[] }[],
    /** Trilha usada quando nenhuma palavra-chave casar. */
    defaultBgm: 'casual' as BgmTrack,
  },
};

