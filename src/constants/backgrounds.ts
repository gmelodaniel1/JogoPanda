/**
 * ============================================================================
 *  CENÁRIOS DO JOGO: PANDA DE FERRO
 * ============================================================================
 */
export interface BackgroundDefinition {
  label: string;
  aliases: string[];
  file?: string;
}

export const BACKGROUNDS = {
  estrada_canavial_pe: {
    label: 'Estrada dos Canaviais (BR-101 Sul)',
    aliases: ['estrada', 'canavial', 'br101'],
    file: 'CaminhoEngenhoPanda.jpg',
  },
  interior_carro: {
    label: 'Interior da Saveiro • Viagem para Jussaral',
    aliases: ['interior_do_carro', 'saveiro', 'carro', 'interiorcarro'],
    file: 'InteriorCarro.jfif',
  },
  carne_de_sol_paraibana_sepia: {
    label: 'Carne de Sol Paraibana (Flashback)',
    aliases: ['carne_de_sol', 'restaurante_paraibana'],
    file: 'CarnePanda.jfif',
  },
  portao_engenho_jussaral: {
    label: 'Portão do Engenho Jussaral',
    aliases: ['portao_engenho', 'engenho_entrada'],
    file: 'Engenho.jpg',
  },
  tela_preta_vermelha: {
    label: 'Combustão por Pimenta Malagueta',
    aliases: ['tela_queimando', 'fogo_pimenta'],
    file: 'JoelFogoPanda.jfif',
  },
  tela_gameover_itaberaba: {
    label: 'Plantão Policial: Itaberaba Notícias',
    aliases: ['gameover_itaberaba', 'itaberaba_plantao'],
    file: 'IataberabaBackground.jfif',
  },
  patio_engenho_abandonado: {
    label: 'Pátio Interno do Engenho',
    aliases: ['patio_engenho', 'patio_abandonado'],
    file: 'LugarEmboscad.jfif',
  },
  oficina_grafica_escura: {
    label: 'Oficina da ArtComercial',
    aliases: ['oficina_grafica', 'prensa_plastificacao'],
    file: 'GraficaEscuraPanda.jfif',
  },
  interior_moenda_labirinto: {
    label: 'Moenda Velha • Zona UFPE',
    aliases: ['moenda_labirinto', 'interior_moenda'],
    file: 'MoendaPanda.jpg',
  },
  espiral_psicodelica_ufpe: {
    label: 'Fenda Dimensional Moradia UFPE',
    aliases: ['espiral_ufpe', 'bloco_c_moradia'],
    file: 'EspiralAnd.jpg',
  },
  belem_bar_noite: {
    label: 'Belém Bar à Noite (Flashback)',
    aliases: ['belem_bar', 'bar_noite'],
    file: 'BelemPanda.jfif',
  },
  salao_principal_engenho: {
    label: 'Salão Principal do Engenho',
    aliases: ['salao_engenho', 'passarela_metalica'],
    file: 'EngenhoCombateFinal.jfif',
  },
  grupo_whatsapp_paulista: {
    label: 'Panda Corp | Networking & High Stakes SP',
    aliases: ['whatsapp_paulista', 'pesadelo_faria_limer'],
    file: 'PandaCorp.jfif',
  },
  salao_principal_engenho_epico: {
    label: 'Salão do Engenho • Vitória Presidencial',
    aliases: ['salao_epico', 'vitoria_epica'],
    file: 'PandaVitoria.jfif',
  },
} satisfies Record<string, BackgroundDefinition>;

export type BackgroundId = keyof typeof BACKGROUNDS;

export const DEFAULT_BACKGROUND: BackgroundId = 'estrada_canavial_pe';
