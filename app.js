// app.js — stable boot (everything after DOMContentLoaded)

document.addEventListener('DOMContentLoaded', () => {
  // --- Data ---
 const RAW_EXPRESSIONS = [
    // Expressions temporelles
    "Dès potron-minet",
    "Dès potron-jacquet",
    "À la pique du jour",
    "À la saint-glinglin",
    "Tous les trente-six du mois",
    "Au temps jadis",
    "Entre chien et loup",
    
    // Amour et séduction
    "Courir le guilledou",
    "Conter fleurette",
    "Être béguine de quelqu'un",
    "Faire le joli cœur",
    "Courir la prétentaine",
    
    // Argent et misère
    "N'avoir ni sou ni maille",
    "Battre monnaie",
    "Tirer le diable par la queue",
    "Ne pas valoir un kopeck",
    "Être dans la dèche",
    "Être dans la mouise",
    "Être gros-jean comme devant",
    "De la roupie de sansonnet",
    
    // Folie et bizarrerie
    "Peigner la girafe",
    "Se monter le bourrichon",
    "Avoir des trichines",
    "Battre la campagne",
    "Bayer aux corneilles",
    
    // Mort et fin
    "Passer l'arme à gauche",
    "Casser sa pipe",
    "Rendre l'âme",
    "C'est la fin des haricots",
    "Sentir le fagot",
    
    // Attitudes et comportements
    "Peu me chaut",
    "Tailler une bavette",
    "Jeter sa gourme",
    "Faire bombance",
    "Faire ribote",
    "Faire des façons",
    "Faire des embarras",
    "Faire le mariole",
    "S'entendre comme larrons en foire",
    "Musarder",
    "Lanterner",
    "Traîner la savate",
    "Battre le pavé",
    "Aller de guingois",
    "Tomber en quenouille",
    
    // Actions énergiques
    "Prendre la poudre d'escampette",
    "Prendre ses cliques et ses claques",
    "Trancher dans le vif",
    "En découdre",
    "Ferrailler",
    "Croiser le fer",
    "Rompre une lance",
    "Tirer à boulets rouges",
    "Faire long feu",
    
    // États et situations
    "Tomber des nues",
    "Être dans les vignes du Seigneur",
    "Ne pas être piqué des hannetons",
    "Être dans les choux",
    "Être aux abois",
    "Broyer du noir",
    "Être marri",
    
    // Interjections désuètes
    "Par tous les diables !",
    "Tudieu !",
    "Morbleu !",
    "Parbleu !",
    "Sacrebleu !",
    "Mâtin !",
    "Bigre !",
    "Bougre !",
    "Que diable !",
    "Peste !",
    "Ma foi !",
    "Fichtre !",
    "Diantre !",
    "Saperlipopette !",
    "Bernique !",
    "Des clous !"
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
