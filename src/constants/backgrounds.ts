/**
 * ============================================================================
 *  CENÁRIOS DO JOGO: PANDA DE FERRO
 * ============================================================================
 */
export const BACKGROUNDS = {
  estrada_canavial_pe: {
    label: 'Estrada dos Canaviais (BR-101 Sul)',
    aliases: ['estrada', 'canavial', 'br101'],
  },
  carne_de_sol_paraibana_sepia: {
    label: 'Carne de Sol Paraibana (Flashback)',
    aliases: ['carne_de_sol', 'restaurante_paraibana'],
  },
  portao_engenho_jussaral: {
    label: 'Portão do Engenho Jussaral',
    aliases: ['portao_engenho', 'engenho_entrada'],
  },
  tela_preta_vermelha: {
    label: 'Combustão por Pimenta Malagueta',
    aliases: ['tela_queimando', 'fogo_pimenta'],
  },
  tela_gameover_itaberaba: {
    label: 'Plantão Policial: Itaberaba Notícias',
    aliases: ['gameover_itaberaba', 'itaberaba_plantao'],
  },
  patio_engenho_abandonado: {
    label: 'Pátio Interno do Engenho',
    aliases: ['patio_engenho', 'patio_abandonado'],
  },
  oficina_grafica_escura: {
    label: 'Oficina da ArtComercial',
    aliases: ['oficina_grafica', 'prensa_plastificacao'],
  },
  interior_moenda_labirinto: {
    label: 'Moenda Velha • Zona UFPE',
    aliases: ['moenda_labirinto', 'interior_moenda'],
  },
  espiral_psicodelica_ufpe: {
    label: 'Fenda Dimensional Moradia UFPE',
    aliases: ['espiral_ufpe', 'bloco_c_moradia'],
  },
  belem_bar_noite: {
    label: 'Belém Bar à Noite (Flashback)',
    aliases: ['belem_bar', 'bar_noite'],
  },
  salao_principal_engenho: {
    label: 'Salão Principal do Engenho',
    aliases: ['salao_engenho', 'passarela_metalica'],
  },
  grupo_whatsapp_paulista: {
    label: 'Panda Corp | Networking & High Stakes SP',
    aliases: ['whatsapp_paulista', 'pesadelo_faria_limer'],
  },
  salao_principal_engenho_epico: {
    label: 'Salão do Engenho • Vitória Presidencial',
    aliases: ['salao_epico', 'vitoria_epica'],
  },
} satisfies Record<string, { label: string; aliases: string[] }>;

export type BackgroundId = keyof typeof BACKGROUNDS;

export const DEFAULT_BACKGROUND: BackgroundId = 'estrada_canavial_pe';
