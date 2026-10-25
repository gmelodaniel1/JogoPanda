import type { CharacterId } from '../constants/characters';
import type { BackgroundId } from '../constants/backgrounds';
import type { BgmTrack, SfxType } from '../types/dialogue';

/**
 * ============================================================================
 *  CONFIGURAÇÃO CENTRAL DO JOGO: PANDA DE FERRO
 * ============================================================================
 */

export const GAME_CONFIG = {
  /** Título principal */
  title: 'Panda de Ferro: O Mistério do Engenho Jussaral',
  /** Subtítulo / Descrição */
  tagline: 'Uma Visual Novel de Mistério, Comédia & Sobrevivência na Zona da Mata de Pernambuco',
  /** Selo pequeno acima do logo */
  badge: 'Panda de Ferro • Visual Novel',
  /** Prefixo do título no HUD */
  hudTitlePrefix: 'Panda de Ferro',

  /** Chave única de persistência no localStorage */
  storagePrefix: 'panda_de_ferro_',

  /** Cenário de fundo do menu principal */
  menuBackground: 'estrada_canavial_pe' as BackgroundId,

  /** Sprites decorativos nas laterais do menu principal */
  menuSprites: {
    left: { characterId: 'cipriano', expression: 'cipriano_limpando_celular' },
    right: { characterId: 'luis', expression: 'luis_julgando' },
  } as Record<'left' | 'right', { characterId: CharacterId; expression: string } | null>,

  /**
   * Conforme a Bíblia do Jogo (Linha 4):
   * "Mecânica Principal: Escolhas Diretas com Bad Ends Imediatos (Sem barras de HP ou Queridômetro)."
   * Desativa o medidor de afinidade/LOM na interface.
   */
  hasAffinityMeter: false,

  /** Personagem padrão caso necessário */
  defaultMeterCharacterId: 'cipriano' as CharacterId,

  /** Nomenclatura caso ativado */
  affinity: {
    name: 'Moral',
    shortLabel: 'PM',
  },

  credits: {
    aboutTitle: 'Sobre o Panda de Ferro',
    aboutText:
      'Uma história épica de mistério, rivalidade futebolística (Santa Cruz x Náutico), álcool isopropílico, cigarros mentolados, a Polícia Moral do Paço do Frevo e a luta incansável contra a Liga dos Banidos e Golpistas.',
    castTitle: 'Elenco Principal & Comunidade',
    castIntro: 'Personagens envolvidos no incidente do Engenho Jussaral:',
    footer: 'A presidência do Panda de Ferro agradece a sua preferência.',
  },

  /**
   * Avaliação de fim de episódio (quando alcança o True Ending)
   */
  completion: {
    subtitle: 'Relatório Final de Sobrevivência da Presidência do Panda de Ferro',
    evaluator: {
      characterId: 'cipriano' as CharacterId,
      displayName: 'Gabriel Cipriano',
      role: 'Presidente do Panda de Ferro',
    } as { characterId: CharacterId; displayName: string; role: string } | null,
    tiers: [
      {
        minNetDelta: -Infinity,
        badge: 'Vitória Triunfal • Gestão Inabalável',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        quote:
          'A democracia do Panda de Ferro permanece intacta. Os golpistas foram expurgados, o álcool isopropílico foi honrado e o Santa Cruz segue gigante. Uma vitória limpa e asseada.',
        expression: 'cipriano_epico_mentolado',
      },
    ],
  },

  /**
   * Detecção automática de áudio pelo texto da fala
   */
  audioCues: {
    sfx: [
      { sfx: 'impact', keywords: ['estrondo', 'trancando', 'grade de ferro despenca', 'desaba', 'explosao'] },
      { sfx: 'alert', keywords: ['apita', 'notificação', 'vibra', 'plantão', 'chamada de vídeo'] },
      { sfx: 'footsteps', keywords: ['passos', 'caminhando', 'correm', 'salta'] },
      { sfx: 'door', keywords: ['porta', 'tranca', 'trinco', 'guarita'] },
    ] as { sfx: SfxType; keywords: string[] }[],
    bgm: [
      { bgm: 'tension', keywords: ['emboscada', 'robôs', 'perigo', 'pimenta', 'furgão', 'cerco'] },
      { bgm: 'energetic', keywords: ['ataquem', 'contra-ofensiva', 'bluetooth', 'papaloc muncks'] },
      { bgm: 'casual', keywords: ['bom dia', 'estrada', 'carne de sol', 'belem bar'] },
    ] as { bgm: BgmTrack; keywords: string[] }[],
    defaultBgm: 'casual' as BgmTrack,
  },
};
