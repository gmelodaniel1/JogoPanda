/**
 * Auditoria de Cobertura de Sprites dos Personagens
 * Executa uma varredura em public/assets/sprites/ e compara com os personagens
 * e expressões declaradas em src/constants/characters.ts e usadas no roteiro.
 */

require('sucrase/register');
const fs = require('fs');
const path = require('path');
const { CHARACTERS_METADATA } = require('../src/constants/characters');

const SPRITES_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'sprites');

console.log('\n=============================================================');
console.log(' AUDITORIA DE COBERTURA DE SPRITES (PANDA DE FERRO)');
console.log('=============================================================\n');

let totalDeclared = 0;
let totalFound = 0;
const report = [];

for (const [charId, meta] of Object.entries(CHARACTERS_METADATA)) {
  if (charId === 'narrator' || charId === 'sistema') continue;

  const charDir = path.join(SPRITES_DIR, charId);
  const expressions = meta.knownExpressions || [];
  let foundForChar = 0;
  const missingForChar = [];

  for (const expr of expressions) {
    totalDeclared++;
    const pngPath = path.join(charDir, `${expr}.png`);
    const webpPath = path.join(charDir, `${expr}.webp`);

    if (fs.existsSync(pngPath) || fs.existsSync(webpPath)) {
      totalFound++;
      foundForChar++;
    } else {
      missingForChar.push(expr);
    }
  }

  report.push({
    id: charId,
    name: meta.name,
    total: expressions.length,
    found: foundForChar,
    missing: missingForChar,
  });
}

// Imprime resumo por personagem
for (const r of report) {
  const pct = r.total > 0 ? Math.round((r.found / r.total) * 100) : 100;
  const icon = r.found === r.total ? '✅' : r.found > 0 ? '🟡' : '⏳';
  console.log(`${icon} [${r.found}/${r.total} - ${pct}%] ${r.name} (${r.id})`);
  if (r.missing.length > 0 && r.missing.length <= 5) {
    console.log(`     Faltam: ${r.missing.join(', ')}`);
  } else if (r.missing.length > 5) {
    console.log(`     Faltam ${r.missing.length} poses (ex.: ${r.missing.slice(0, 3).join(', ')}...)`);
  }
}

const totalPct = totalDeclared > 0 ? Math.round((totalFound / totalDeclared) * 100) : 0;
console.log('\n-------------------------------------------------------------');
console.log(`TOTAL GERAL: ${totalFound} de ${totalDeclared} sprites inseridos (${totalPct}% concluído)`);
console.log('-------------------------------------------------------------\n');
