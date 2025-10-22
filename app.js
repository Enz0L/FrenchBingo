
// app.js — 2025 refresh
// Accessibility + modern patterns + true bingo logic (rows/cols/diagonals)

const RAW_EXPRESSIONS = [
  "À la brunante",
  "À la brune",
  "À la male heure",
  "Aux calendes grecques",
  "Battre l’estrade",
  "Battre la semelle",
  "Chercher noise",
  "N’avoir cure",
  "Se tenir coi",
  "Rester coite",
  "Trancher du grand seigneur",
  "Faire fi",
  "Être en goguette",
  "Mettre en goguette",
  "Avoir voix au chapitre",
  "Être en gésine",
  "Avoir pignon sur rue",
  "Faire des gorges chaudes",
  "Avoir le fiel noir",
  "Fille de joie",
  "À vau-l’eau",
  "À tire-larigot",
  "De haute lutte",
  "Sans barguigner",
  "À tire-d’aile",
  "À hue et à dia",
  "Dormir comme un loir",
  "Bayer aux corneilles",
  "Se gausser",
  "Crier haro sur",
  "Mettre aux arrêts",
  "Être marrie/marri",
  "Dépourvu de tout charroi",
  "Dépouiller l’anguille",
  "Porter la férule",
  "Être sur la sellette",
  "Donner le change",
  "Avoir de l’entregent",
  "Passer l’arme à gauche",
  "Faire long feu",
  "Pour deux liards de bon sens",
  "N’en avoir cure",
  "N’avoir pas maille à partir",
  "Avoir maille à partir",
  "À l’envi",
  "À l’encontre de",
  "À rebours",
  "Sur l’heure",
  "De conserve",
  "Par-devers soi",
  "Sans coup férir",
  "Quitte pour la peur",
  "S’en aller à vau-l’eau",
  "Ronger son frein",
  "Faire bonne chère",
  "De guerre lasse",
  "À l’envi l’un de l’autre",
  "De-ci, de-là",
  "Point d’orgue",
  "Faire la nique",
  "Faire le faraud",
  "Faire le paladin",
  "Être soudard",
  "Boniment de camelot",
  "Battre la breloque",
  "Raccommoder son honneur",
  "Raconter des balivernes",
  "Bagatelle de potentat",
  "Se rengorger",
  "S’empresser tout de go",
  "Tout de go",
  "À huis clos",
  "Porter ombrage",
  "Mettre à l’index",
  "Faire fi de",
  "À l’avenant",
  "À l’instant même",
  "De conserve avec",
  "À quia",
  "À l’encan",
  "À tour de bras",
  "Croiser le fer",
  "Lever l’écu",
  "Au surplus",
  "Au demeurant",
  "Tout au plus",
  "D’aventure",
  "En diable",
  "De son cru",
  "À qui mieux mieux",
  "Mille sabords !",
  "Sacrebleu !",
  "Cornegidouille !",
  "Ventre-saint-gris !",
  "Palsambleu !",
  "Par ma foi !",
  "Fichtre !",
  "Diantre !",
  "Saperlipopette !"
];

// Deduplicate defensively at runtime as well
const norm = s => s
  .replaceAll("’","'")
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().trim();

const EXPRESSIONS = Array.from(new Map(RAW_EXPRESSIONS.map(e => [norm(e), e])).values());

const state = {
  size: parseInt(localStorage.getItem('boardSize') || '5', 10),
  grid: [], // array of { text, marked }
  hasBingo: false,
  isFullBoard: false,
};

const el = sel => document.querySelector(sel);
const bingoGrid = el('#bingoGrid');
const victoryDialog = el('#victoryDialog');
const countInfo = el('#countInfo');

function sample(array, n){
  const copy = array.slice();
  const result = [];
  let m = Math.min(n, copy.length);
  while(m--){
    const i = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(i,1)[0]);
  }
  return result;
}

function buildGrid(){
  state.hasBingo = false;
  state.isFullBoard = false;
  bingoGrid.innerHTML = '';
  bingoGrid.style.gridTemplateColumns = `repeat(${state.size}, minmax(0, 1fr))`;
  const picks = sample(EXPRESSIONS, state.size * state.size);
  state.grid = picks.map(text => ({ text, marked: false }));

  for(let i=0;i<state.grid.length;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.type = 'button';
    cell.setAttribute('role','gridcell');
    cell.setAttribute('aria-pressed','false');
    cell.textContent = state.grid[i].text;
    cell.addEventListener('click', () => toggleCell(i, cell));
    cell.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggleCell(i, cell);
      }
    })
    bingoGrid.appendChild(cell);
  }

  renderList();
  localStorage.setItem('boardSize', String(state.size));
}

function toggleCell(index, elCell){
  const item = state.grid[index];
  item.marked = !item.marked;
  elCell.classList.toggle('marked', item.marked);
  elCell.setAttribute('aria-pressed', item.marked ? 'true' : 'false');
  const full = isFullBoardMarked();
  if (full && !state.isFullBoard){
    state.isFullBoard = true;
    state.hasBingo = true; // implicit
    celebrateUltimate();
    return;
  }
  const nowHasBingo = checkBingo();
  if (nowHasBingo && !state.hasBingo){
    state.hasBingo = true;
    celebrate();
  } else if (!nowHasBingo && state.hasBingo){
    state.hasBingo = false;
  }
}

function checkBingo(){
  const n = state.size;
  const m = (r,c) => state.grid[r*n + c].marked;

  // rows
  for(let r=0;r<n;r++){
    let ok = true;
    for(let c=0;c<n;c++) ok &= m(r,c);
    if(ok) return true;
  }
  // cols
  for(let c=0;c<n;c++){
    let ok = true;
    for(let r=0;r<n;r++) ok &= m(r,c);
    if(ok) return true;
  }
  // diagonals
  let d1=true, d2=true;
  for(let i=0;i<n;i++){
    d1 &= m(i,i);
    d2 &= m(i,n-1-i);
  }
  return d1 || d2;
}


function isFullBoardMarked(){
  return state.grid.length > 0 && state.grid.every(cell => cell.marked);
}

function celebrateUltimate(){
  try { victoryDialog.showModal(); } catch(e){}
  const title = document.querySelector('#victoryTitle');
  if (title) title.textContent = '🏆 Bingo Ultime !';
  const p = victoryDialog.querySelector('p');
  if (p) p.textContent = 'Toutes les cases sont cochées — maître absolu du vieux verbe !';

  // Bigger confetti show
  const end = Date.now() + 1500;
  (function frame(){
    confetti({ particleCount: 80, spread: 90, scalar: 1.1, ticks: 250 });
    if(Date.now() < end) requestAnimationFrame(frame);
  })();
}

function celebrate(){
  try { victoryDialog.showModal(); } catch(e){ /* older browsers */ }
  // Confetti burst
  const end = Date.now() + 800;
  (function frame(){
    confetti({ particleCount: 30, spread: 70, scalar: .8 });
    if(Date.now() < end) requestAnimationFrame(frame);
  })();
}

function renderList(filter=''){
  const list = el('#expressionList');
  list.innerHTML = '';
  const q = norm(filter);
  const items = EXPRESSIONS.filter(x => norm(x).includes(q));
  countInfo.textContent = `${items.length} / ${EXPRESSIONS.length}`;
  for(const x of items){
    const li = document.createElement('div');
    li.className = 'list-item';
    li.role = 'listitem';
    li.textContent = x;
    list.appendChild(li);
  }
}

function initControls(){
  const sizeSel = el('#boardSize');
  sizeSel.value = String(state.size);
  sizeSel.addEventListener('change', () => {
    state.size = parseInt(sizeSel.value, 10);
    buildGrid();
  });
  el('#newGameBtn').addEventListener('click', buildGrid);
  el('#clearMarksBtn').addEventListener('click', () => {
    state.hasBingo = false;
    state.isFullBoard = false;
    const title = document.querySelector('#victoryTitle'); if (title) title.textContent = '🎉 Bingo !';
    const p = victoryDialog.querySelector('p'); if (p) p.textContent = 'Bravo, fine lame du verbe ! Tu as complété une ligne.';
    document.querySelectorAll('.cell').forEach((cell, idx) => {
      state.grid[idx].marked = false;
      cell.classList.remove('marked');
      cell.setAttribute('aria-pressed','false');
    });
  });
  el('#shuffleBtn').addEventListener('click', () => buildGrid());
  el('#searchInput').addEventListener('input', (e) => renderList(e.target.value));
  el('#closeDialogBtn').addEventListener('click', () => victoryDialog.close());
  el('#playAgainBtn').addEventListener('click', () => {
    victoryDialog.close();
    buildGrid();
  });
  el('#toggleTheme').addEventListener('click', (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle('dark');
  });
}

// Boot
initControls();
buildGrid();


// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  buildGrid();
});
