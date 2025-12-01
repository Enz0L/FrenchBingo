// app.js — stable boot (everything after DOMContentLoaded)

document.addEventListener('DOMContentLoaded', () => {
  // --- Data ---
  const RAW_EXPRESSIONS = [
  "Dès potron-minet",
  "Dès potron-jacquet",
  "Entre chien et loup",
  "À la pique du jour",
  "Au chant du coq",
  "Courir le guilledou",
  "Peigner la girafe",
  "Peu me chaut",
  "Tailler une bavette",
  "Se monter le bourrichon",
  "Aller de guingois",
  "Courir la prétentaine",
  "Tomber des nues",
  "Jeter sa gourme",
  "Être dans les vignes du Seigneur",
  "Prendre ses cliques et ses claques",
  "En baver des ronds de chapeau",
  "Être dans de beaux draps",
  "Ne pas être piqué des hannetons",
  "Conter fleurette",
  "Battre monnaie",
  "Brûler la chandelle par les deux bouts",
  "Tirer le diable par la queue",
  "Sentir le fagot",
  "Broyer du noir",
  "Avoir le cafard",
  "Prendre la poudre d'escampette",
  "Se faire rouler dans la farine",
  "Tomber en quenouille",
  "Mettre la clé sous la porte",
  "Tirer à boulets rouges",
  "Avoir un poil dans la main",
  "Se faire tirer l'oreille",
  "Montrer patte blanche",
  "Tirer son épingle du jeu",
  "Être fort en gueule",
  "Faire chou blanc",
  "Battre la campagne",
  "Prendre ses jambes à son cou",
  "Ne pas avoir froid aux yeux",
  "Mettre les bouchées doubles",
  "Faire des pieds et des mains",
  "Tirer les marrons du feu",
  "Jeter l'argent par les fenêtres",
  "Monter sur ses grands chevaux",
  "Remettre les pendules à l'heure",
  "Mettre de l'eau dans son vin",
  "Jouer un tour de cochon",
  "Avoir le compas dans l'œil",
  "Être tiré à quatre épingles",
  "Se faire de la bile",
  "Avoir le cœur sur la main",
  "Ne pas être sorti de l'auberge",
  "Brûler ses vaisseaux",
  "Rendre son tablier",
  "Tourner casaque",
  "Mettre son grain de sel",
  "Passer un savon",
  "Manger à tous les râteliers",
  "Être dans le cirage",
  "Avoir la tête dans le guidon",
  "Rouler des mécaniques",
  "Par tous les diables !",
  "Tudieu !",
  "Morbleu !",
  "Parbleu !",
  "Mâtin !",
  "Bigre !",
  "Bougre !",
  "Que diable !",
  "Peste !",
  "Ma foi !
]

  // --- Utils ---
  const norm = s => s
    .replaceAll("’","'")
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim();

  const EXPRESSIONS = Array.from(new Map(RAW_EXPRESSIONS.map(e => [norm(e), e])).values());

  const state = {
    size: parseInt(localStorage.getItem('boardSize') || '5', 10),
    grid: [],
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
      });
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
      state.hasBingo = true;
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

    for(let r=0;r<n;r++){
      let ok = true;
      for(let c=0;c<n;c++) ok &= m(r,c);
      if(ok) return true;
    }
    for(let c=0;c<n;c++){
      let ok = true;
      for(let r=0;r<n;r++) ok &= m(r,c);
      if(ok) return true;
    }
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
    const end = Date.now() + 1500;
    (function frame(){
      confetti({ particleCount: 80, spread: 90, scalar: 1.1, ticks: 250 });
      if(Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function celebrate(){
    try { victoryDialog.showModal(); } catch(e){}
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
  const el = s => document.querySelector(s);
  const bingoGridEl = el('#bingoGrid');
  const victoryDialog = el('#victoryDialog');
  const countInfo = el('#countInfo');

  if(!bingoGridEl || !victoryDialog || !countInfo){
    console.warn('Bingo UI elements missing. Check #bingoGrid, #victoryDialog, #countInfo in index.html');
    return;
  }

  // keep references
  const sizeSel = el('#boardSize');
  const newGameBtn = el('#newGameBtn');
  const clearMarksBtn = el('#clearMarksBtn');
  const shuffleBtn = el('#shuffleBtn');
  const searchInput = el('#searchInput');
  const closeDialogBtn = el('#closeDialogBtn');
  const playAgainBtn = el('#playAgainBtn');
  const toggleTheme = el('#toggleTheme');

  if (sizeSel){
    sizeSel.value = String(state.size);
    sizeSel.addEventListener('change', () => {
      state.size = parseInt(sizeSel.value, 10);
      buildGrid();
    });
  }

  if (newGameBtn) newGameBtn.addEventListener('click', buildGrid);
  if (clearMarksBtn) clearMarksBtn.addEventListener('click', () => {
    state.hasBingo = false;
    state.isFullBoard = false;
    const title = document.querySelector('#victoryTitle'); if (title) title.textContent = '🎉 GO!';
    const p = victoryDialog.querySelector('p'); if (p) p.textContent = 'Bravo, fine lame du verbe ! Tu as complété une ligne.';
    document.querySelectorAll('.cell').forEach((cell, idx) => {
      state.grid[idx].marked = false;
      cell.classList.remove('marked');
      cell.setAttribute('aria-pressed','false');
    });
  });
  if (shuffleBtn) shuffleBtn.addEventListener('click', () => buildGrid());
  if (searchInput) searchInput.addEventListener('input', (e) => renderList(e.target.value));
  if (closeDialogBtn) closeDialogBtn.addEventListener('click', () => victoryDialog.close());
  if (playAgainBtn) playAgainBtn.addEventListener('click', () => { victoryDialog.close(); buildGrid(); });
  if (toggleTheme) toggleTheme.addEventListener('click', (e) => { e.preventDefault(); document.documentElement.classList.toggle('dark'); });

  // expose for other functions
  window.__BINGO = { bingoGrid: bingoGridEl, victoryDialog, countInfo };
}

// Start when DOM is ready

  initControls();
  buildGrid();
});
