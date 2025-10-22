
// app.js — 2025 refresh
// Accessibility + modern patterns + true bingo logic (rows/cols/diagonals)

const RAW_EXPRESSIONS = [
  "Dès potron-minet",
  "Entre chien et loup",
  "Sur-le-champ",
  "En un clin d’œil",
  "De but en blanc",
  "À la Saint-Glinglin",
  "À la semaine des quatre jeudis",
  "Avant que le coq chante",
  "En moins de deux",
  "Quand les poules auront des dents",
  "Au diable Vauvert",
  "Par monts et par vaux",
  "À tire-d’aile",
  "À bride abattue",
  "Prendre la clé des champs",
  "Prendre la poudre d’escampette",
  "Partir ventre à terre",
  "Battre la campagne",
  "Aller son petit bonhomme de chemin",
  "Tirer sa révérence",
  "Boire à tire-larigot",
  "Avaler des couleuvres",
  "Avoir les dents longues",
  "Être soupe au lait",
  "Manger son pain blanc",
  "Manger de la vache enragée",
  "Mettre de l’eau dans son vin",
  "En faire ses choux gras",
  "Être aux petits oignons",
  "Tomber dans les pommes",
  "Tirer le diable par la queue",
  "N’avoir pas un sou vaillant",
  "Être sur la paille",
  "Vendre la peau de l’ours avant de l’avoir tué",
  "Coûter la peau des fesses",
  "Avoir maille à partir",
  "Payer rubis sur l’ongle",
  "Battre monnaie",
  "Jeter l’argent par les fenêtres",
  "Rouler sur l’or",
  "Se mettre martel en tête",
  "Avoir les miquettes",
  "Avoir la berlue",
  "Être aux cent coups",
  "Avoir le cœur gros",
  "Rire sous cape",
  "Faire contre mauvaise fortune bon cœur",
  "Se ronger les sangs",
  "Se mettre en rogne",
  "Avoir la chair de poule",
  "Faire le joli cœur",
  "Rouler des patins",
  "Courir la prétentaine",
  "Avoir du chien",
  "Tenir la chandelle",
  "Se mettre en ribouldingue",
  "Jeter son dévolu",
  "Avoir le béguin",
  "Faire la cour",
  "Soupirer pour quelqu’un",
  "De fil en aiguille",
  "Dormir sur ses deux oreilles",
  "Ménager la chèvre et le chou",
  "Être sur des charbons ardents",
  "Porter la culotte",
  "En tenir une couche",
  "Faire bonne chère",
  "Couper l’herbe sous le pied",
  "Jeter l’éponge",
  "Laver son linge sale en famille",
  "Être tiré à quatre épingles",
  "Être frais comme un gardon",
  "Avoir un poil dans la main",
  "Mettre la main à la pâte",
  "Avoir la tête dans les nuages",
  "Tomber des nues",
  "Avoir l’air emprunté",
  "Prendre la grosse tête",
  "Perdre la face",
  "Rester bouche bée",
  "Palsambleu !",
  "Mortecouille !",
  "Que diable !",
  "Fichtre !",
  "Diantre !",
  "Cornegidouille !",
  "Sapristi !",
  "Par ma foi !",
  "Ventre-saint-gris !",
  "Nom d’une pipe !",
  "Chasser le naturel, il revient au galop",
  "Petit à petit, l’oiseau fait son nid",
  "Qui vole un œuf vole un bœuf",
  "À cheval donné, on ne regarde pas la bride",
  "Pierre qui roule n’amasse pas mousse",
  "Quand le vin est tiré, il faut le boire",
  "Tel est pris qui croyait prendre",
  "Chat échaudé craint l’eau froide",
  "Qui veut voyager loin ménage sa monture",
  "Il ne faut pas vendre la peau de l’ours avant de l’avoir tué"
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
