/**
 * ============================================================================
 *  CENÁRIOS DO JOGO
 * ============================================================================
 * Cada chave é o `background` usado nos JSONs dos episódios e o nome do arquivo:
 *   public/assets/backgrounds/<id>.webp   (preferencial)
 *   public/assets/backgrounds/<id>.jpg    (fallback)
 *
 * `aliases` permite aceitar outros nomes no JSON (ex.: o nome original do arquivo de arte).
 * Enquanto a imagem não existir, o jogo exibe um placeholder com o `label`.
 * ============================================================================
 */
export const BACKGROUNDS = {
  cenario_exemplo: {
    label: 'Cenário de Exemplo',
    aliases: [] as string[],
  },
  cenario_exemplo_2: {
    label: 'Segundo Cenário de Exemplo',
    aliases: [] as string[],
  },
} satisfies Record<string, { label: string; aliases: string[] }>;

/** Identificador válido de cenário (derivado automaticamente das chaves acima). */
export type BackgroundId = keyof typeof BACKGROUNDS;

/** Cenário usado quando o JSON referencia um id desconhecido. */
export const DEFAULT_BACKGROUND: BackgroundId = 'cenario_exemplo';

