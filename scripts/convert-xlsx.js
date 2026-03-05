import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const workbook = XLSX.readFile(resolve(rootDir, 'AI_Governance_Stakeholder_Map_Scored.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(sheet);

// Seeded random for deterministic jitter
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const jitter = () => (rand() - 0.5) * 0.3; // ±0.15

const scored = [];
const unscored = [];
const categoriesSet = new Set();

raw.forEach((row, i) => {
  const player = row['Player'] || row['player'] || '';
  const category = row['Category'] || row['category'] || '';
  const power = parseFloat(row['Power (1-10)'] || row['Power'] || '');
  const interest = parseFloat(row['Interest (1-10)'] || row['Interest'] || '');
  const quadrant = row['Quadrant'] || row['quadrant'] || '';
  const rationale = row['Rationale'] || row['rationale'] || '';
  const source = row['Source'] || row['source'] || '';

  if (!player) return;

  categoriesSet.add(category);

  const entry = {
    id: i + 1,
    player: player.trim(),
    category: category.trim(),
    quadrant: quadrant.trim(),
    rationale: rationale.trim(),
    source: source.trim(),
  };

  if (!isNaN(power) && !isNaN(interest) && power > 0 && interest > 0) {
    entry.power = power;
    entry.interest = interest;
    entry.powerJittered = Math.round((power + jitter()) * 100) / 100;
    entry.interestJittered = Math.round((interest + jitter()) * 100) / 100;
    scored.push(entry);
  } else {
    entry.power = null;
    entry.interest = null;
    unscored.push(entry);
  }
});

const data = {
  scored,
  unscored,
  categories: [...categoriesSet].sort(),
};

const outPath = resolve(rootDir, 'src', 'data', 'stakeholders.json');
writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Converted ${scored.length} scored + ${unscored.length} unscored stakeholders → ${outPath}`);
