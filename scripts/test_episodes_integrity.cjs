/**
 * Suíte de Testes de Integridade dos Episódios e Roteiros
 * Valida a árvore de nós, escolhas ramificadas, integridade dos IDs de personagens e cenários.
 */

require('sucrase/register');

const fs = require('fs');
const path = require('path');
const { ALL_EPISODES, EPISODE_NUMBERS } = require('../src/data/episodes');
const { validateEpisodeScript } = require('../src/utils/episodeParser');
const { CHARACTERS_METADATA } = require('../src/constants/characters');
const { BACKGROUNDS } = require('../src/constants/backgrounds');
const { getBackgroundCandidates, getBackgroundPath, getSpriteCandidates } = require('../src/utils/assetHelper');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SPRITES_DIR = path.join(PUBLIC_DIR, 'assets', 'sprites');
const BACKGROUNDS_DIR = path.join(PUBLIC_DIR, 'assets', 'backgrounds');

let totalErrors = 0;
let totalWarnings = 0;

for (const epNum of EPISODE_NUMBERS) {
  const script = ALL_EPISODES[epNum];

  console.log(`\n========================================`);
  console.log(`Verificando Episódio ${epNum}: "${script.title}"`);
  console.log(`========================================`);

  const nodeCount = Object.keys(script.nodes).length;
  console.log(`ID: "${script.id}" | Nó inicial: "${script.initialNodeId}" | Total de nós: ${nodeCount}`);

  // 1. Validação estrutural do grafo de diálogo
  const { errors: graphErrors } = validateEpisodeScript(script);
  for (const err of graphErrors) {
    console.error(`[ERRO DE GRAFO] ${err}`);
    totalErrors++;
  }

  let choiceCount = 0;
  let endingCount = 0;
  let customSpritesFound = 0;
  let placeholderSprites = 0;
  let realBackgroundNodes = 0;
  let placeholderBackgroundNodes = 0;
  const verifiedBackgroundFiles = new Set();

  for (const [nodeId, node] of Object.entries(script.nodes)) {
    // 2. Verificar identificador de cenário
    if (node.background) {
      if (!BACKGROUNDS[node.background]) {
        console.warn(`[AVISO CENÁRIO] Nó "${nodeId}": Cenário "${node.background}" não está explicitamente em BACKGROUNDS (usará alias ou fallback padrão).`);
        totalWarnings++;
      } else {
        const bgDef = BACKGROUNDS[node.background];
        const candidates = getBackgroundCandidates(node.background);
        const hasRealBg = candidates.some((cand) => {
          const cleanRel = cand.replace(/^\.\//, '').split('?')[0];
          return fs.existsSync(path.join(PUBLIC_DIR, cleanRel));
        });
        if (hasRealBg) {
          realBackgroundNodes++;
          if (bgDef.file) verifiedBackgroundFiles.add(bgDef.file);
        } else {
          placeholderBackgroundNodes++;
        }
      }
    }

    // 3. Verificar personagens em cena
    for (const sp of [node.sprite, node.secondarySprite].filter(Boolean)) {
      if (!CHARACTERS_METADATA[sp.characterId]) {
        console.error(`[ERRO DE PERSONAGEM] Personagem "${sp.characterId}" no nó "${nodeId}" não existe em CHARACTERS_METADATA.`);
        totalErrors++;
      } else {
        const candidates = getSpriteCandidates(sp.characterId, sp.expression);
        const exists = candidates.some((cand) => {
          const cleanRel = cand.replace(/^\.\//, '').split('?')[0];
          return fs.existsSync(path.join(PUBLIC_DIR, cleanRel));
        });
        if (exists) {
          customSpritesFound++;
        } else {
          placeholderSprites++;
        }
      }
    }

    // 4. Verificar escolhas e afinidade
    if (node.choices && node.choices.length > 0) {
      choiceCount += node.choices.length;
      for (const choice of node.choices) {
        if (choice.affinityChanges) {
          for (const change of choice.affinityChanges) {
            if (!CHARACTERS_METADATA[change.characterId]) {
              console.error(`[ERRO DE AFINIDADE] Escolha "${choice.id}" afeta personagem inexistente: "${change.characterId}".`);
              totalErrors++;
            }
            if (change.delta === 0) {
              console.error(`[ERRO DE AFINIDADE] Escolha "${choice.id}" contém delta === 0.`);
              totalErrors++;
            }
          }
        }
      }
    }

    // 5. Contabilizar desfechos
    if (node.isEnding) {
      endingCount++;
      console.log(`  -> Nó de desfecho identificado: "${nodeId}" ("${node.text.substring(0, 45)}...")`);
    }
  }

  // 6. Detectar nós órfãos (inalcançáveis)
  const reachable = new Set();
  const queue = [script.initialNodeId];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || reachable.has(id) || !script.nodes[id]) continue;
    reachable.add(id);
    const n = script.nodes[id];
    if (n.nextNodeId) queue.push(n.nextNodeId);
    for (const c of n.choices || []) queue.push(c.nextNodeId);
  }

  for (const nodeId of Object.keys(script.nodes)) {
    if (!reachable.has(nodeId)) {
      console.error(`[ERRO DE GRAFO] Nó "${nodeId}" é inalcançável a partir de "${script.initialNodeId}".`);
      totalErrors++;
    }
  }

  if (endingCount === 0) {
    console.error(`[ERRO] Episódio ${epNum} não possui nenhum nó de desfecho (isEnding)!`);
    totalErrors++;
  }

  console.log(`Total de escolhas interativas: ${choiceCount} | Nós de desfecho: ${endingCount}`);
  console.log(`Cenários: ${realBackgroundNodes} nós com fotos reais (${Array.from(verifiedBackgroundFiles).join(', ')}), ${placeholderBackgroundNodes} nós com SVG estilizado.`);
  console.log(`Assets visuais: ${customSpritesFound} falas com sprites reais com fotos mapeadas, ${placeholderSprites} utilizando avatar SVG dinâmico.`);
}

console.log(`\n========================================`);
if (totalErrors === 0) {
  console.log(`[SUCESSO] Roteiros e definições estruturais validadas com 0 ERROS! (${totalWarnings} avisos)`);
  process.exit(0);
} else {
  console.error(`[FALHA] Suíte de integridade encontrou ${totalErrors} erro(s).`);
  process.exit(1);
}
