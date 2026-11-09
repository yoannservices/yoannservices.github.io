// Analyse la syntaxe de tous les modules de src/ sans les exécuter : node --experimental-vm-modules test/syntax.mjs
// (node --check ne signale pas les erreurs des modules ES avec Node 24.)
import vm from 'node:vm';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });
let bad = 0;
for (const f of walk(new URL('../src', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  try { new vm.SourceTextModule(readFileSync(f, 'utf8'), { identifier: f }); } catch (e) { bad++; console.log(`${f}\n  ${e.message}`); }
}
console.log(bad ? `${bad} fichier(s) en erreur` : 'syntaxe OK');
process.exit(bad ? 1 : 0);
