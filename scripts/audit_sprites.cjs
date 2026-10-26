/**
 * Auditoria de Cobertura de Sprites dos Personagens
 * Executa uma varredura em public/assets/sprites/ e compara com os personagens
 * e expressões declaradas em src/constants/characters.ts e usadas no roteiro.
 */

require('sucrase/register');
const fs = require('fs');
const path = require('path');
const { CHARACTERS_METADATA } = require('../src/constants/characters');
const { getSpriteCandidates, CHARACTER_BASE_SPRITES } = require('../src/utils/assetHelper');

const SPRITES_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'sprites');
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

console.log('\n=============================================================');
console.log(' AUDITORIA DE COBERTURA DE SPRITES (PANDA DE FERRO)');
console.log('=============================================================\n');

let totalDeclared = 0;
let totalExactFound = 0;
let totalResolved = 0;
const report = [];

for (const [charId, meta] of Object.entries(CHARACTERS_METADATA)) {
  if (charId === 'narrator' || charId === 'sistema') continue;

  const charDir = path.join(SPRITES_DIR, charId);
  const expressions = meta.knownExpressions || [];
  let exactForChar = 0;
  let resolvedForChar = 0;
  const missingForChar = [];

  const validExts = ['.webp', '.png', '.jfif', '.jpg', '.jpeg'];

  for (const expr of expressions) {
    totalDeclared++;
    const hasExact = validExts.some((ext) => fs.existsSync(path.join(charDir, `${expr}${ext}`)));
    const candidates = getSpriteCandidates(charId, expr);
    const hasResolved = candidates.some((cand) => {
      const cleanRel = cand.replace(/^\.\//, '').split('?')[0];
      return fs.existsSync(path.join(PUBLIC_DIR, cleanRel));
    });

    if (hasExact) {
      totalExactFound++;
      exactForChar++;
    }

    if (hasResolved) {
      totalResolved++;
      resolvedForChar++;
    } else {
      missingForChar.push(expr);
    }
  }

  report.push({
    id: charId,
    name: meta.name,
    baseSprite: CHARACTER_BASE_SPRITES[charId] || null,
    total: expressions.length,
    exact: exactForChar,
    resolved: resolvedForChar,
    missing: missingForChar,
  });
}

// Imprime resumo por personagem
for (const r of report) {
  const pct = r.total > 0 ? Math.round((r.resolved / r.total) * 100) : 100;
  const icon = r.resolved === r.total ? '✅' : r.resolved > 0 ? '🟡' : '⏳';
  const baseTag = r.baseSprite ? ` [Foto Base: ${r.baseSprite}]` : ' [Sem foto cadastrada]';
  console.log(`${icon} [${r.resolved}/${r.total} - ${pct}%] ${r.name} (${r.id})${baseTag}`);
  if (r.missing.length > 0 && r.missing.length <= 5) {
    console.log(`     Faltam: ${r.missing.join(', ')}`);
  } else if (r.missing.length > 5) {
    console.log(`     Faltam ${r.missing.length} poses (ex.: ${r.missing.slice(0, 3).join(', ')}...)`);
  }
}

const totalPct = totalDeclared > 0 ? Math.round((totalResolved / totalDeclared) * 100) : 0;
console.log('\n-------------------------------------------------------------');
console.log(`TOTAL COBERTURA EFETIVA: ${totalResolved} de ${totalDeclared} expressões cobertas (${totalPct}%)`);
console.log(`(Sprites com poses exclusivas exatas: ${totalExactFound} | Resolvidos via Foto Base Universal: ${totalResolved - totalExactFound})`);
console.log('-------------------------------------------------------------\n');

