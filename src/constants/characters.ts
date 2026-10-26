import type { CharacterMeta } from '../types/character';

/**
 * ============================================================================
 *  ELENCO DE PERSONAGENS: PANDA DE FERRO
 * ============================================================================
 */
const _RAW_CHARACTERS = {
  cipriano: {
    id: 'cipriano',
    name: 'Gabriel Cipriano',
    nickname: 'O Presidente',
    title: 'Presidente do Panda de Ferro • Tricolor Fanático',
    hasRomanceRoute: false,
    themeColor: '#ef4444', // Vermelho/Preto/Branco (Santa Cruz)
    badgeColor: '#b91c1c',
    baseSprite: 'cipriano_neutro.webp',
    defaultExpression: 'cipriano_neutro',
    knownExpressions: [
      'cipriano_neutro',
      'cipriano_limpando_celular',
      'cipriano_sorriso_mentolado',
      'cipriano_irritado_alcool',
      'cipriano_serio_mentolado',
      'cipriano_calmo_mentolado',
      'cipriano_chocado_ponto_final',
      'cipriano_triste',
      'cipriano_epico_mentolado',
    ],
  },
  pedro_ivo: {
    id: 'pedro_ivo',
    name: 'Pedro Ivo',
    nickname: 'O Climatologista',
    title: 'Meteorologista Oficial • Alvirrubro Racional',
    hasRomanceRoute: false,
    themeColor: '#dc2626', // Vermelho e Branco (Náutico)
    badgeColor: '#991b1b',
    baseSprite: 'pedro_ivo_neutro.webp',
    defaultExpression: 'pedro_ivo_neutro',
    knownExpressions: [
      'pedro_ivo_neutro',
      'pedro_ivo_serio',
      'pedro_ivo_analisando',
      'pedro_ivo_surpreso',
      'pedro_ivo_sorriso_discreto',
    ],
  },
  luis: {
    id: 'luis',
    name: 'Luís',
    nickname: 'Polícia Moral',
    title: 'Agente da Polícia Moral • Servidor do Paço do Frevo',
    hasRomanceRoute: false,
    themeColor: '#ea580c', // Laranja vibrante do frevo
    badgeColor: '#c2410c',
    baseSprite: 'luis_neutro.webp',
    defaultExpression: 'luis_neutro',
    knownExpressions: [
      'luis_neutro',
      'luis_julgando',
      'luis_rindo',
      'luis_emocionado',
      'luis_desconfiado',
      'luis_alerta',
      'luis_assustado',
      'luis_surpreso',
      'luis_cerveja',
      'luis_indignado',
      'luis_vitorioso',
    ],
  },
  malu_maciel: {
    id: 'malu_maciel',
    name: 'Malu Maciel',
    nickname: 'A Investigadora',
    title: 'Irmã de Luís • Inteligência Digital',
    hasRomanceRoute: false,
    themeColor: '#06b6d4', // Ciano digital
    badgeColor: '#0891b2',
    baseSprite: 'malu_maciel_videochamada.webp',
    defaultExpression: 'malu_maciel_videochamada',
    knownExpressions: ['malu_maciel_videochamada', 'malu_maciel_feliz'],
  },
  sandro_vagner: {
    id: 'sandro_vagner',
    name: 'Sandro Vagner',
    nickname: 'O Repórter',
    title: 'Plantão Jornalístico de Urgência',
    hasRomanceRoute: false,
    themeColor: '#f59e0b', // Amarelo jornalismo
    badgeColor: '#d97706',
    baseSprite: 'sandro_reporter.webp',
    defaultExpression: 'sandro_reporter',
    knownExpressions: ['sandro_reporter', 'sandro_anotando'],
  },
  conrado: {
    id: 'conrado',
    name: 'Conrado',
    nickname: 'O Guardião do Bom Dia',
    title: 'Emissário da Paz Matinal e Estabilidade',
    hasRomanceRoute: false,
    themeColor: '#fbbf24', // Dourado solar
    badgeColor: '#d97706',
    defaultExpression: 'conrado_bom_dia',
    knownExpressions: ['conrado_bom_dia'],
  },
  joel_das_pimentas: {
    id: 'joel_das_pimentas',
    name: 'Joel das Pimentas',
    title: 'Comerciante de Pimentas Revoltado',
    hasRomanceRoute: false,
    themeColor: '#b91c1c', // Pimenta malagueta
    badgeColor: '#7f1d1d',
    baseSprite: 'joel_das_pimentas_furioso.webp',
    defaultExpression: 'joel_das_pimentas_furioso',
    knownExpressions: ['joel_das_pimentas_furioso', 'joel_atacando', 'joel_desesperado'],
  },
  itaberaba_noticias: {
    id: 'itaberaba_noticias',
    name: 'Itaberaba Notícias',
    title: 'Robô Policial Sensacionalista da Bahia',
    hasRomanceRoute: false,
    themeColor: '#475569', // Cinza escuro mórbido
    badgeColor: '#334155',
    baseSprite: 'robo_itaberaba.webp',
    defaultExpression: 'robo_itaberaba',
    knownExpressions: ['robo_itaberaba', 'robo_itaberaba_curto'],
  },
  conecta_professores: {
    id: 'conecta_professores',
    name: 'Conecta Professores',
    title: 'Robô Burocrático de Cursos e Editais MEC',
    hasRomanceRoute: false,
    themeColor: '#2563eb', // Azul institucional
    badgeColor: '#1d4ed8',
    baseSprite: 'robo_conecta.webp',
    defaultExpression: 'robo_conecta',
    knownExpressions: ['robo_conecta', 'robo_conecta_curto'],
  },
  artcomercial: {
    id: 'artcomercial',
    name: 'ArtComercial',
    title: 'Robô Impressora Industrial Assassina',
    hasRomanceRoute: false,
    themeColor: '#7c3aed', // Roxo industrial
    badgeColor: '#6d28d9',
    defaultExpression: 'robo_artcomercial',
    knownExpressions: ['robo_artcomercial', 'robo_artcomercial_curto'],
  },
  and: {
    id: 'and',
    name: 'And',
    nickname: 'O Louco da Moradia UFPE',
    title: 'Moradia/UFPE ❤️🫁🧠 Papaloc Muncks',
    hasRomanceRoute: false,
    themeColor: '#ec4899', // Rosa psicodélico
    badgeColor: '#db2777',
    baseSprite: 'and_louco_ufpe.webp',
    defaultExpression: 'and_louco_ufpe',
    knownExpressions: ['and_louco_ufpe', 'and_paz', 'and_confuso'],
  },
  bilu: {
    id: 'bilu',
    name: 'Bilu',
    nickname: 'Gilherto Sim , Ok ❤️',
    title: 'Membro Místico dos Banidos',
    hasRomanceRoute: false,
    themeColor: '#f43f5e', // Rosa coração
    badgeColor: '#e11d48',
    baseSprite: 'bilu_coracao.webp',
    defaultExpression: 'bilu_coracao',
    knownExpressions: ['bilu_coracao', 'bilu_assustado', 'bilu_confuso'],
  },
  gildro_iviano: {
    id: 'gildro_iviano',
    name: 'Gildro Iviano',
    nickname: 'O Faria Limer Paulista',
    title: 'A Mente Golpista • Sapatênis & Suéter nos Ombros',
    hasRomanceRoute: false,
    themeColor: '#10b981', // Verde Faria Lima
    badgeColor: '#059669',
    baseSprite: 'gildro_iviano_vilao_paulista.webp',
    defaultExpression: 'gildro_iviano_vilao_paulista',
    knownExpressions: ['gildro_iviano_vilao_paulista', 'gildro_ameacando', 'gildro_derrotado'],
  },
  sistema: {
    id: 'sistema',
    name: 'Sistema',
    title: 'Notificação do WhatsApp',
    hasRomanceRoute: false,
    themeColor: '#22c55e', // Verde WhatsApp
    badgeColor: '#16a34a',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral'],
  },
  protagonist: {
    id: 'protagonist',
    name: 'Você',
    title: 'Membro do Panda de Ferro',
    hasRomanceRoute: false,
    themeColor: '#a855f7',
    badgeColor: '#9333ea',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral'],
  },
  narrator: {
    id: 'narrator',
    name: '',
    title: 'Narrador',
    hasRomanceRoute: false,
    themeColor: '#94a3b8',
    badgeColor: '#64748b',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral'],
  },
} satisfies Record<string, CharacterMeta>;

export type CharacterId = keyof typeof _RAW_CHARACTERS;

export const CHARACTERS_METADATA: Record<CharacterId, CharacterMeta> = _RAW_CHARACTERS;

/** Elenco principal em destaque */
export const AFFINITY_ROSTER_IDS: CharacterId[] = [
  'cipriano',
  'pedro_ivo',
  'luis',
  'gildro_iviano',
  'joel_das_pimentas',
  'malu_maciel',
  'sandro_vagner',
  'conrado',
  'and',
  'bilu',
];

export const GALLERY_CHARACTER_IDS: CharacterId[] = [
  'cipriano',
  'pedro_ivo',
  'luis',
  'gildro_iviano',
  'joel_das_pimentas',
  'itaberaba_noticias',
  'conecta_professores',
  'artcomercial',
  'and',
  'bilu',
  'malu_maciel',
  'sandro_vagner',
  'conrado',
];

export const EXTRA_CHARACTER_ALIASES: Record<string, CharacterId> = {
  narrador: 'narrator',
  voce: 'protagonist',
  'você': 'protagonist',
  'gabriel cipriano': 'cipriano',
  'presidente': 'cipriano',
  'pedro': 'pedro_ivo',
  'pedro ivo': 'pedro_ivo',
  'luís': 'luis',
  'luis': 'luis',
  'malu': 'malu_maciel',
  'malu maciel': 'malu_maciel',
  'sandro': 'sandro_vagner',
  'sandro vagner': 'sandro_vagner',
  'joel': 'joel_das_pimentas',
  'joel das pimentas': 'joel_das_pimentas',
  'gildro': 'gildro_iviano',
  'gildro iviano': 'gildro_iviano',
  'itaberaba': 'itaberaba_noticias',
  'itaberaba notícias': 'itaberaba_noticias',
  'conecta': 'conecta_professores',
  'conecta professores': 'conecta_professores',
  'art comercial': 'artcomercial',
  'artcomercial': 'artcomercial',
};
