
const scenes = {};
scenes["index"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Key to the Gift</title>
   <!-- Audio handler -->
  <script src="audio.js"></script>
  <style>
    /* Reset & base */
    html, body {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      overflow: hidden; background: black;
      font-family: 'Courier New', monospace;
    }
    /* Wrapper at base resolution */
    #wrapper {
      position: absolute; top: 0; left: 0;
      width: 1920px; height: 1200px;
      transform-origin: top left;
    }
    /* Game container fills wrapper */
    #game-container {
      position: relative;
      width: 100%; height: 100%;
      background: url('background.png') center center no-repeat;
      background-size: contain;
    }
    /* Centered helper */
    .centered {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    /* Start button */
    #go-btn {
      width: 800px; height: 360px;
      font-size: 120px;
      cursor: pointer;
    }
    /* Loading text */
    #loading-screen p {
      font-size: 48px; color: white;
      margin: 0;
    }
    /* Gift cards section */
    #gift-section { display: none; }
    #gift-cards {
      display: flex; gap: 40px;
      justify-content: center;
    }
    .gift-card {
      width: 192px; height: 288px;
      image-rendering: pixelated;
      cursor: pointer;
      border: 4px solid white;
      transition: border 0.3s;
    }
    .gift-card.selected {
      border: 8px dashed yellow;
    }
    /* Get presents button */
    #get-presents {
      margin-top: 40px;
      width: 800px; height: 360px;
      background: url('button01.png') center center no-repeat;
      background-size: contain;
      border: none; cursor: pointer;
      opacity: 0.5; pointer-events: none;
    }
    #get-presents.enabled {
      opacity: 1; pointer-events: auto;
    }
    /* Shake effect */
    .shake { animation: shake 0.5s; }
    @keyframes shake {
      0%   { transform: translate(2px,2px); }
      25%  { transform: translate(-2px,-2px); }
      50%  { transform: translate(2px,-2px); }
      75%  { transform: translate(-2px,2px); }
      100% { transform: translate(0,0); }
    }
    /* Dragon bundle and dragon */
    .dragon-bundle {
      position: absolute; display: none;
      width: 128px; height: 64px;
      transition: all 2s ease-in-out;
    }
    .dragon {
      width: 128px; height: 64px;
      background: url('dragon.png') center center no-repeat;
      background-size: contain;
      image-rendering: pixelated;
      position: absolute; top: 0; left: 0;
    }
    /* Speech bubble */
    .speech {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%; transform: translateX(-50%);
      background: white; color: black;
      padding: 8px 12px;
      border: 4px solid red;
      border-radius: 4px;
      font-size: 24px;
      font-family: 'Arial Black', sans-serif;
      text-transform: uppercase;
      text-align: center;
      white-space: nowrap;
    }
    /* Transition overlay */
    #transition-overlay {
      position: absolute; top:0; left:0;
      width:100%; height:100%;
      background: black; opacity: 0;
      pointer-events: none;
      transition: opacity 1s ease-in-out;
    }
    #game-container.pixelate {
      animation: pixelateOut 1s ease-in-out forwards;
    }
    @keyframes pixelateOut {
      0%   { filter: blur(0); transform: scale(1); }
      40%  { filter: blur(4px); transform: scale(0.1); image-rendering: pixelated; }
      70%  { opacity: 0.4; }
      100% { filter: blur(0); transform: scale(1); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="game-container">
      <div id="start-screen" class="centered">
        <button id="go-btn">ПОГНАЛИ</button>
      </div>
      <div id="loading-screen" class="centered" style="display:none">
        <p>СОБИРАЕМ ПОДАРКИ...</p>
      </div>
      <div id="gift-section" class="centered">
        <div id="gift-cards">
          <img id="gift1" class="gift-card" src="gift_card_1.png" alt="Gift 1">
          <img id="gift2" class="gift-card" src="gift_card_2.png" alt="Gift 2">
        </div>
        <button id="get-presents"></button>
      </div>
      <div id="dragon-bundle" class="dragon-bundle">
        <div id="dragon" class="dragon"></div>
      </div>
    </div>
  </div>
  <div id="transition-overlay"></div>

  <script>
    // Scale wrapper to fit viewport
    function updateScale() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw/1920, vh/1200);
      const w = document.getElementById('wrapper');
      w.style.transform = \`scale(\${scale})\`;
      w.style.left = \`\${(vw - 1920*scale)/2}px\`;
      w.style.top  = \`\${(vh - 1200*scale)/2}px\`;
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // DOM refs
    const goBtn = document.getElementById('go-btn');
    const startS = document.getElementById('start-screen');
    const loadS  = document.getElementById('loading-screen');
    const giftS  = document.getElementById('gift-section');
    const gift1  = document.getElementById('gift1');
    const gift2  = document.getElementById('gift2');
    const getBtn = document.getElementById('get-presents');
    const gameC  = document.getElementById('game-container');
    const dragonB= document.getElementById('dragon-bundle');
    const dragon = document.getElementById('dragon');

    // Transition
    function startTransition() {
      gameC.classList.add('pixelate');
      document.getElementById('transition-overlay').style.opacity = '1';
      gameC.addEventListener('animationend', () => {
        window.location.href = 'scene2.html';
      }, { once: true });
    }

    // GO -> loading -> gifts
    goBtn.addEventListener('click', () => {
      startS.style.display = 'none';
      loadS.style.display  = 'block';
      setTimeout(() => {
        loadS.style.display = 'none';
        giftS.style.display = 'block';
      }, 2000);
    });

    // Gift selection
    let selected = new Set();
    function toggleGift(img) {
      if (selected.has(img.id)) {
        selected.delete(img.id);
        img.classList.remove('selected');
      } else {
        selected.add(img.id);
        img.classList.add('selected');
      }
      getBtn.classList.toggle('enabled', selected.size===2);
    }
    gift1.addEventListener('click', ()=>toggleGift(gift1));
    gift2.addEventListener('click', ()=>toggleGift(gift2));

    // Dragon sequence
    getBtn.addEventListener('click', ()=>{
      if (!getBtn.classList.contains('enabled')) return;
      gameC.classList.add('shake');
       window.audio.playExplosion();
      setTimeout(()=>{
        dragonB.style.display='block';
        dragonB.style.left='30%'; dragonB.style.top='20%';
        setTimeout(()=>{
          dragonB.style.left='50%'; dragonB.style.top='30%';
          dragonB.style.transform='translate(-50%,-50%) scale(3)';
          setTimeout(()=>{
            const bubble=document.createElement('div');
            bubble.className='speech'; 
            bubble.textContent='ХА-ХА!';
            window.audio.playEvilLaugh();
            dragon.appendChild(bubble);
            [gift1,gift2].forEach((g,i)=>{
              g.style.position='absolute';
              g.style.top='70px';
              g.style.left = i? '120px':'-60px';
              dragonB.appendChild(g);
            });
            setTimeout(()=>{
              dragonB.style.left='120%'; dragonB.style.top='10%';
              setTimeout(startTransition,1000);
            },1500);
          },1000);
        },1000);
      },500);
    });

    // Touch support
    [goBtn,gift1,gift2,getBtn].forEach(btn=>{
      btn.addEventListener('touchstart',e=>{e.preventDefault();btn.click();},{passive:false});
    });
  </script>
</body>
</html>
`;
scenes["scene2"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Scene2 - Key to the Gift</title>
  <!-- include shared audio logic -->
  <script src="audio.js"></script>
  <style>
    /* Reset & base */
    html, body {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      overflow: hidden; background: black;
      font-family: 'Courier New', monospace;
    }
    /* Transition timing var */
    :root {
      --transition-duration: 600ms;
    }
    /* Pixelated zoom-out animation */
    @keyframes pixelate-out {
      to {
        transform: scale(0.1);
        opacity: 0;
      }
    }
    /* Wrapper at base resolution */
    #wrapper {
      position: absolute; top: 0; left: 0;
      width: 1920px; height: 1200px;
      transform-origin: top left;
      image-rendering: pixelated;
    }
    /* When transitioning, apply the pixellated zoom out */
    #wrapper.transition {
      animation: pixelate-out var(--transition-duration) steps(8) forwards;
      transform-origin: center center;
    }
    /* Game area */
    #game-container {
      position: relative;
      width: 100%; height: 100%;
      background: url('background.png') center center no-repeat;
      background-size: contain;
    }
    /* Player sprite */
    #player {
      position: absolute;
      width: 640px; height: 320px;
      left: 800px; bottom: 100px;
      background: url('player_idle.png') center center no-repeat;
      background-size: contain;
      image-rendering: pixelated;
      transform-origin: center bottom;
    }
    #player.flipped { transform: scaleX(-1); }
    /* Speech bubble */
    .speech {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%; transform: translateX(-50%);
      background: white; color: black;
      padding: 8px 12px;
      border: 4px solid red;
      border-radius: 4px;
      font-size: 24px;
      font-family: 'Arial Black', sans-serif;
      text-transform: uppercase;
      text-align: center;
      white-space: normal;
    }
    /* Touch controls */
    #touch-controls {
      position: absolute;
      bottom: 5vh;
      left: 50%; transform: translateX(-50%);
      display: flex; gap: 2vw;
      pointer-events: none;
    }
    .touch-btn {
      width: 12vw; height: 12vw;
      max-width: 80px; max-height: 80px;
      background: rgba(255,255,255,0.8);
      border: 2px solid #333; border-radius: 50%;
      font-size: 4vw; line-height: 1; text-align: center;
      pointer-events: auto; user-select: none;
    }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="game-container">
      <div id="player"></div>
      <!-- Touch controls overlay -->
      <div id="touch-controls">
        <button id="btn-left" class="touch-btn">◀</button>
        <button id="btn-jump" class="touch-btn">▲</button>
        <button id="btn-right" class="touch-btn">▶</button>
      </div>
    </div>
  </div>

  <script>
    // Responsive scaling
    function updateScale() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw/1920, vh/1200);
      const wrap = document.getElementById('wrapper');
      wrap.style.transform = \`scale(\${scale})\`;
      wrap.style.left = \`\${(vw - 1920*scale)/2}px\`;
      wrap.style.top  = \`\${(vh - 1200*scale)/2}px\`;
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // Scene2 logic
    const player       = document.getElementById('player');
    const wrapper      = document.getElementById('wrapper');
    const leftLimit    = 0;
    const rightLimit   = 1920 - 320;
    let posX           = 800;
    let posY           = 0;
    let isJumping      = false;
    let jumpSpeed      = 0;
    const gravity      = 0.8;
    let keys           = {};
    let canMove        = false;
    let transitioning  = false;

    // Initial speech bubble
    const bubble = document.createElement('div');
    bubble.className = 'speech';
    bubble.textContent = 'НУ И ГДЕ МОИ ПОДАРКИ?! КУДА ТЕПЕРЬ ИДТИ - НАЛЕВО ИЛИ НАПРАВО?';
    player.appendChild(bubble);

    // Input handlers
    window.addEventListener('keydown', e => {
      keys[e.key.toLowerCase()] = true;
      if (!canMove && !transitioning) {
        canMove = true;
        bubble.remove();
      }
    });
    window.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('mousedown', () => {
      if (!canMove && !transitioning) {
        canMove = true;
        bubble.remove();
      }
    });
    [['left','arrowleft'], ['jump',' '], ['right','arrowright']].forEach(([id, key]) => {
      const btn = document.getElementById('btn-' + id);
      btn.addEventListener('touchstart', e => {
        e.preventDefault(); keys[key] = true;
        if (!canMove && !transitioning) {
          canMove = true;
          bubble.remove();
        }
      }, {passive:false});
      btn.addEventListener('touchend', e => {
        e.preventDefault(); keys[key] = false;
      }, {passive:false});
    });

    // Update player position
    function updatePos() {
      player.style.left   = posX + 'px';
      player.style.bottom = (100 + posY) + 'px';
    }

    /**
     * startTransition(side)
     * side = 'left' or 'right'
     * Pixelated zoom-out, then navigate passing exit side
     */
    function startTransition(side) {
      if (transitioning) return;
      transitioning = true;
      canMove = false;
      wrapper.classList.add('transition');
      setTimeout(() => {
        window.location.href = \`wizard01.html?exit=\${side}\`;
      }, 600); // matches --transition-duration
    }

    // Main game loop
    function gameLoop() {
      if (canMove && !transitioning) {
        // Move left
        if (keys['arrowleft'] || keys['a']) {
          posX = Math.max(leftLimit, posX - 4);
          player.classList.add('flipped');
          if (posX === leftLimit) startTransition('left');
        }
        // Move right
        if (keys['arrowright'] || keys['d']) {
          posX = Math.min(rightLimit, posX + 4);
          player.classList.remove('flipped');
          if (posX === rightLimit) startTransition('right');
        }
        // Jump
        if ((keys[' '] || keys['spacebar']) && !isJumping) {
          isJumping = true;
          jumpSpeed = 15;
          // play jump SFX
          window.audio.playJump();
        }
      }

      // Gravity
      if (isJumping) {
        posY += jumpSpeed;
        jumpSpeed -= gravity;
        if (posY <= 0) {
          posY = 0;
          isJumping = false;
        }
      }

      updatePos();
      requestAnimationFrame(gameLoop);
    }

    updatePos();
    gameLoop();
  </script>
</body>
</html>
`;
scenes["wizard01"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wizard 1 Encounter</title>
  <!-- include shared audio logic -->
  <script src="audio.js"></script>
  <style>
    /* Base reset */
    html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: black; font-family: 'Courier New', monospace; }
    /* Wrapper scaling */
    #wrapper { position: absolute; top: 0; left: 0; width: 1920px; height: 1200px; transform-origin: top left; }
    /* Background */
    #game-container { position: relative; width: 100%; height: 100%; background: url('background.png') center center / cover no-repeat; }
    /* Player sprite */
    #player {
      position: absolute; width: 320px; height: 320px; bottom: 80px; transform-origin: center bottom;
      background: url('player_idle.png') center center no-repeat;
      background-size: contain; image-rendering: pixelated;
    }
    #player.flipped { transform: scaleX(-1); }
    /* Wizard */
    #wizard { position: absolute; width: 300px; height: 300px; bottom: 80px; left: 50%; transform: translateX(-50%); pointer-events: none; }
    #wizard-img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
    /* Prompt */
    #prompt {
      position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
      background: white; color: black; padding: 8px 12px; border: 4px solid red; border-radius: 4px;
      font-size: 28px; font-family: 'Arial Black'; text-transform: uppercase;
      pointer-events: none; display: none; white-space: nowrap;
    }
    /* Dialog overlay */
    #dialog-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); display:none; }
    #dialog-box {
      position: absolute; top:50%; left:50%; transform: translate(-50%,-50%);
      background: white; padding: 24px; border: 4px solid black; width: 600px; max-width: 80vw;
      font-family: 'Courier New', monospace;
    }
    #dialog-text { margin-bottom: 16px; font-size: 28px; color: black; }
    .choice-btn {
      display: block; margin: 8px 0; padding: 12px 16px; background: #eee;
      border: 2px solid #333; cursor: pointer; font-size: 22px;
    }
    .choice-btn:hover { background: #ddd; }
    /* Collectible block */
    .collect-block { position: absolute; width: 60px; height: 40px; cursor: pointer; image-rendering: pixelated; }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="game-container">
      <div id="player"></div>
      <div id="wizard">
        <img id="wizard-img" src="wizard1.png" alt="Wizard" />
        <div id="prompt">Press E</div>
      </div>
      <div id="ground"></div>
      <div id="dialog-overlay">
        <div id="dialog-box">
          <p id="dialog-text"></p>
          <div id="choices"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Responsive scaling
    function updateScale() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw/1920, vh/1200);
      const wrap = document.getElementById('wrapper');
      wrap.style.transform = \`scale(\${scale})\`;
      wrap.style.left = \`\${(vw - 1920*scale)/2}px\`;
      wrap.style.top  = \`\${(vh - 1200*scale)/2}px\`;
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // DOM refs
    const player     = document.getElementById('player');
    const gameArea   = document.getElementById('game-container');
    const prompt     = document.getElementById('prompt');
    const overlay    = document.getElementById('dialog-overlay');
    const dialogText = document.getElementById('dialog-text');
    const choicesDiv = document.getElementById('choices');

    // Movement bounds
    const playerWidth = 320;
    const leftLimit   = 0;
    const rightLimit  = gameArea.clientWidth - playerWidth;

    // Spawn logic (for returning from wizard2)
    const params   = new URLSearchParams(location.search);
    const exitSide = params.get('exit');
    let spawnSide  = (exitSide === 'left') ? 'right' : 'left';
    let posX       = (spawnSide === 'left') ? leftLimit : rightLimit;
    let posY       = 0;

    // State & physics
    let keys = {}, isJumping = false, jumpSpeed = 0, gravity = 0.8;
    let inDialog = false, interactionFinished = false, waitingBlock = false;
    let puzzleSolved = false;
    let blockColor = 'red';

    // Dialog data
    const greeting   = 'Привет, Саша! Представляешь, я проснулся сегодня восьмибитным, а в голове вертится вопрос!';
    const question   = 'Какой стиль одежды ты предпочитаешь?';
    const answers    = [
      'Спорт (спортивка, кеды)',
      'Спорт шик (спортивка, туфли)',
      'Business Formal (брюки, пиджак, рубашка, галстук, туфли)',
      'Business Casual (брюки, пиджак, футболка, тапочки)'
    ];
    const correctIdx = 2;
    const correctTip = 'Ну конечно! Спасибо! Кстати, я должен дать тебе подсказку - это ROT.';

    // Show question
    function showQuestion() {
      dialogText.textContent = question;
      choicesDiv.innerHTML = '';
      answers.forEach((ans, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = ans;
        btn.onclick = () => selectAnswer(i);
        choicesDiv.appendChild(btn);
      });
    }

    // Initial dialog
    function startDialog() {
      inDialog = true;
      overlay.style.display = 'block';
      dialogText.textContent = greeting;
      choicesDiv.innerHTML = '';
      setTimeout(() => {
        const proceed = () => { showQuestion(); cleanupListeners(); };
        const cleanupListeners = () => {
          window.removeEventListener('keydown', proceed);
          window.removeEventListener('mousedown', proceed);
        };
        window.addEventListener('keydown', proceed);
        window.addEventListener('mousedown', proceed);
      }, 0);
    }

    // Handle answer
    function selectAnswer(i) {
      inDialog = true;
      overlay.style.display = 'block';
      choicesDiv.innerHTML = '';
      if (i === correctIdx) {
        dialogText.textContent = correctTip;
        const onInput = () => {
          cleanup(); overlay.style.display = 'none'; inDialog = false; interactionFinished = true; setupCollectible();
        };
        const cleanup = () => {
          window.removeEventListener('keydown', onInput);
          window.removeEventListener('mousedown', onInput);
        };
        window.addEventListener('keydown', onInput);
        window.addEventListener('mousedown', onInput);
      } else {
        dialogText.textContent = 'Нее, это не совсем то!';
        const onInput = () => { cleanup(); showQuestion(); };
        const cleanup = () => {
          window.removeEventListener('keydown', onInput);
          window.removeEventListener('mousedown', onInput);
        };
        window.addEventListener('keydown', onInput);
        window.addEventListener('mousedown', onInput);
      }
    }

    // Set up collectible block
    function setupCollectible() {
      waitingBlock = true;
      player.style.background = "url('player_hands.png') center center no-repeat";
      player.style.backgroundSize = 'contain';
      const block = document.createElement('div');
      block.className = 'collect-block';
      block.style.background = blockColor;
      block.style.left = (posX + (playerWidth - 60)/2) + 'px';
      block.style.bottom = (80 + posY + playerWidth + 10) + 'px';
      gameArea.appendChild(block);
      block.addEventListener('click', () => {
        block.style.transition = 'all 0.5s ease-out';
        block.style.left = '0px'; block.style.bottom = (gameArea.clientHeight - 40) + 'px';
        block.addEventListener('transitionend', () => {
          block.remove(); waitingBlock = false; interactionFinished = true; puzzleSolved = true; player.style.background = "url('player_idle.png') center center no-repeat"; player.style.backgroundSize = 'contain';
        }, { once: true });
      });
    }

    // Update position, proximity, loop
    function updatePos() { player.style.left = posX + 'px'; player.style.bottom = (80 + posY) + 'px'; }
    function checkProximity() {
      const wizardX = (gameArea.clientWidth - playerWidth)/2;
      prompt.style.display = (!inDialog && !waitingBlock && Math.abs(posX - wizardX) < playerWidth*0.6) ? 'block' : 'none';
    }
    function gameLoop() {
      if (!inDialog && !waitingBlock) {
        if (keys['arrowleft']||keys['a']) { posX = Math.max(leftLimit, posX-4); player.classList.add('flipped'); }
        if (keys['arrowright']||keys['d']){ posX = Math.min(rightLimit,posX+4); player.classList.remove('flipped'); }
        if ((keys[' ']||keys['arrowup']||keys['w']) && !isJumping) { isJumping=true; jumpSpeed=15; window.audio.playJump(); }
      }
      if (isJumping) { posY+=jumpSpeed; jumpSpeed-=gravity; if(posY<=0){posY=0;isJumping=false;} }
      updatePos(); checkProximity(); requestAnimationFrame(gameLoop);
    }
    updatePos(); gameLoop();

    // Input
    document.addEventListener('keydown', e => {
      const key = e.key.toLowerCase(); keys[key]=true;
      // Interact
      if (key==='e' && prompt.style.display==='block') {
        window.audio.playInteract();
        if (!interactionFinished) startDialog();
        else if (!waitingBlock) {
          overlay.style.display='block'; dialogText.textContent='Иди же дальше и собери все части ключа!'; choicesDiv.innerHTML='';
          setTimeout(()=>overlay.style.display='none',2000);
        }
      }
      // Leave
      if (puzzleSolved) {
        if ((key==='arrowleft'||key==='a')&&posX<=leftLimit) location.href='wizard02.html?exit=left';
        if ((key==='arrowright'||key==='d')&&posX>=rightLimit) location.href='wizard02.html?exit=right';
      }
    });
    document.addEventListener('keyup', e => { keys[e.key.toLowerCase()]=false; });
  </script>
</body>
</html>
`;
scenes["wizard02"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wizard Encounter with Document Sorting Puzzle</title>
  <script src="audio.js"></script>
  <style>
    /* Base reset */
    html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: black; font-family: 'Courier New', monospace; }
    /* Wrapper scaling */
    #wrapper { position: absolute; top: 0; left: 0; width: 1920px; height: 1200px; transform-origin: top left; }
    /* Background */
    #game-container { position: relative; width: 100%; height: 100%; background: url('background.png') center center / cover no-repeat; }
    /* Player sprite */
    #player {
      position: absolute; width: 320px; height: 320px; bottom: 80px; transform-origin: center bottom;
      background: url('player_idle.png') center center no-repeat;
      background-size: contain; image-rendering: pixelated;
    }
    #player.flipped { transform: scaleX(-1); }
    /* Wizard */
    #wizard { position: absolute; width: 280px; height: 280px; bottom: 80px; left: 50%; transform: translateX(-50%); pointer-events: none; }
    #wizard-img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
    /* Prompt */
    #prompt {
      position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
      background: white; color: black; padding: 8px 12px; border: 4px solid red; border-radius: 4px;
      font-size: 28px; font-family: 'Arial Black'; text-transform: uppercase;
      pointer-events: none; display: none; white-space: nowrap;
    }
    /* Collectible block */
    .collect-block { position: absolute; width: 60px; height: 40px; cursor: pointer; image-rendering: pixelated; }

    /* Puzzle-specific styles */
    #puzzle-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      display: none; z-index: 100;
    }
    #puzzle-box {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      background: white; padding: 32px; border: 4px solid black;
      width: 800px; max-width: 90vw; font-family: 'Courier New', monospace;
    }
    #puzzle-box #dialog-name {
      text-align: center; font-size: 28px; font-weight: bold;
      margin-bottom: 16px;
    }
    #puzzle-box #dialog-text {
      text-align: center; font-size: 24px; margin-bottom: 24px;
    }
    .blocks-container {
      display: grid; grid-template-columns: repeat(2,1fr);
      gap: 8px; max-height: 400px; overflow-y: auto; margin-bottom: 24px;
    }
    .block {
      padding: 12px; background: #eee; border: 2px solid #333;
      cursor: grab; user-select: none; font-size: 20px;
    }
    .drop-areas { display: flex; justify-content: space-between; }
    .drop-area-container { width: 45%; display: none; }
    .drop-area {
      width: 100%; min-height: 80px; border: 3px dashed #333;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: bold;
    }

    /* Screenshake animation */
    @keyframes screenshake {
      0%   { transform: translate(0, 0); }
      20%  { transform: translate(-8px, 0); }
      40%  { transform: translate(8px, 0); }
      60%  { transform: translate(-8px, 0); }
      80%  { transform: translate(8px, 0); }
      100% { transform: translate(0, 0); }
    }
    #game-container.shake { animation: screenshake 0.4s ease-in-out; }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="game-container">
      <div id="player"></div>
      <div id="wizard">
        <img id="wizard-img" src="wizard2.png" alt="Wizard" />
        <div id="prompt">Press E</div>
      </div>
      <div id="ground"></div>

      <!-- Puzzle Container -->
      <div id="puzzle-overlay">
        <div id="puzzle-box">
          <div id="dialog-name"></div>
          <div id="dialog-text"></div>
          <div id="blocks" class="blocks-container"></div>
          <div class="drop-areas">
            <div id="rejectContainer" class="drop-area-container">
              <div id="rejectArea" class="drop-area">ОТКЛОНИТЬ</div>
            </div>
            <div id="approveContainer" class="drop-area-container">
              <div id="approveArea" class="drop-area">УТВЕРДИТЬ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Responsive scaling
    function updateScale() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw / 1920, vh / 1200);
      const wrap = document.getElementById('wrapper');
      wrap.style.transform = \`scale(\${scale})\`;
      wrap.style.left = \`\${(vw - 1920 * scale) / 2}px\`;
      wrap.style.top  = \`\${(vh - 1200 * scale) / 2}px\`;
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // DOM refs
    const player           = document.getElementById('player');
    const gameArea         = document.getElementById('game-container');
    const prompt           = document.getElementById('prompt');
    const overlayPuzzle    = document.getElementById('puzzle-overlay');
    const dialogName       = document.getElementById('dialog-name');
    const dialogTextPuzzle = document.getElementById('dialog-text');
    const blocksDiv        = document.getElementById('blocks');
    const rejectContainer  = document.getElementById('rejectContainer');
    const approveContainer = document.getElementById('approveContainer');
    const rejectArea       = document.getElementById('rejectArea');
    const approveArea      = document.getElementById('approveArea');

    // Spawn logic for entering from wizard01.html
    const params    = new URLSearchParams(location.search);
    const exitSide  = params.get('exit');
    const spawnSide = (exitSide === 'left') ? 'right' : 'left';
    const leftLimit  = 0;
    const rightLimit = gameArea.clientWidth - player.clientWidth;
    const spawnX     = (spawnSide === 'left') ? leftLimit : rightLimit;
    player.style.left   = spawnX + 'px';
    player.style.bottom = '80px';

    // Puzzle data
    const rejectItems = [
      'Приказ об установлении дресс-кода для всех работников в любое время года - только черный костюм',
      'Приказ об объявлении выговора работникам, не употреблявшим коньяк Арарат на последнем корпоративе',
      'Ձայնագրություն Երևանի աշխատակիցներին շտապաբար վերադարձնելու մասին Պետերբուրգ։',
      'Приказ об окончании ковида в связи со срочным переездом',
      'Приказ об использовании eMM в работе всех департаментов'
    ];
    const approveItems = [
      'Правильный приказ 1',
      'Правильный приказ 2',
      'Правильный приказ 3',
      'Правильный приказ 4',
      'Правильный приказ 5'
    ];
    const items = [...rejectItems, ...approveItems].sort(() => Math.random() - 0.5);
    const rejectSet = new Set(rejectItems);
    const totalCount = items.length;
    let placedCount = 0;
    let interactionFinished = false;
    let waitingBlock = false;
    let puzzleSolved = false;

    // 1) Greeting → Puzzle
    function startDialog() {
      interactionFinished = true;
      overlayPuzzle.style.display = 'block';
      dialogName.textContent = '';
      dialogTextPuzzle.textContent = 'Ох, как хорошо что ты здесь, Саша! Все приказы в моей папке перепутались, помоги разобраться!';
      const proceed = e => {
        if (e.type === 'keydown' && e.key.toLowerCase() === 'e') return;
        window.removeEventListener('keydown', proceed);
        window.removeEventListener('mousedown', proceed);
        showPuzzle();
      };
      window.addEventListener('keydown', proceed);
      window.addEventListener('mousedown', proceed);
    }

    function showPuzzle() {
      dialogName.textContent = 'НА ПОДПИСЬ';
      dialogTextPuzzle.textContent = '';
      blocksDiv.innerHTML = '';
      items.forEach((text,i) => {
        const d = document.createElement('div');
        d.className = 'block';
        d.textContent = text;
        d.draggable = true;
        d.id = 'block' + i;
        d.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', d.id));
        blocksDiv.appendChild(d);
      });
      blocksDiv.style.display        = 'grid';
      rejectContainer.style.display  = 'block';
      approveContainer.style.display = 'block';
    }

    // 2) Drag & Drop with screenshake on wrong
    [rejectArea, approveArea].forEach(area => {
      area.addEventListener('dragover', e => e.preventDefault());
      area.addEventListener('drop', e => {
        e.preventDefault();
        const id    = e.dataTransfer.getData('text/plain');
        const block = document.getElementById(id);
        const correct = (area === rejectArea) ? rejectSet.has(block.textContent) : !rejectSet.has(block.textContent);
        if (correct) {
          block.remove(); placedCount++;
          if (placedCount === totalCount) finishPuzzle();
        } else {
          dialogTextPuzzle.textContent = 'Что на это скажет Марк?';
          gameArea.classList.add('shake');
          gameArea.addEventListener('animationend', () => gameArea.classList.remove('shake'), { once: true });
          setTimeout(() => dialogTextPuzzle.textContent = '', 3000);
        }
      });
    });

    // 3) Puzzle Complete
    function finishPuzzle() {
      dialogName.textContent = '';
      blocksDiv.style.display        = 'none';
      rejectContainer.style.display  = 'none';
      approveContainer.style.display = 'none';
      dialogTextPuzzle.innerHTML = 'Фух! Большое спасибо! Вот еще одна подсказка - ' +
  '<span style="color: gold; font-weight: bold;">GOLDEN</span>.';
      const proceed = e => {
        if (e.type === 'keydown' && e.key.toLowerCase() === 'e') return;
        window.removeEventListener('keydown', proceed);
        window.removeEventListener('mousedown', proceed);
        overlayPuzzle.style.display = 'none';
        setupCollectible(); puzzleSolved = true;
      };
      window.addEventListener('keydown', proceed);
      window.addEventListener('mousedown', proceed);
    }

    // Collectible spawn
    function setupCollectible() {
      waitingBlock = true;
      player.style.background = "url('player_hands.png') center center no-repeat";
      player.style.backgroundSize = 'contain';
      const block = document.createElement('div'); block.className = 'collect-block';
      block.style.background = 'gold';
      const xPos = (player.offsetLeft + (320 - 60)/2) + 'px';
      block.style.left = xPos; block.style.bottom = (80 + 320 + 10) + 'px'; gameArea.appendChild(block);
      block.addEventListener('click', () => {
        block.style.transition = 'all 0.5s ease-out';
        block.style.left = '0px'; block.style.bottom = (gameArea.clientHeight - 40) + 'px';
        block.addEventListener('transitionend', () => {
          block.remove(); waitingBlock = false;
          player.style.background = "url('player_idle.png') center center no-repeat";
          player.style.backgroundSize = 'contain';
        }, { once: true });
      });
    }

    // Movement & game loop
    let keys={}, isJumping=false, jumpSpeed=0, gravity=0.8;
    function checkProximity() {
      const wizardX = (gameArea.clientWidth-320)/2;
      prompt.style.display = (!waitingBlock && Math.abs(player.offsetLeft-wizardX)<192)?'block':'none';
    }
    function gameLoop(){
      if(!waitingBlock){
        if(keys['arrowleft']||keys['a']){player.style.left=Math.max(0,player.offsetLeft-4)+'px';player.classList.add('flipped');}
        if(keys['arrowright']||keys['d']){player.style.left=Math.min(gameArea.clientWidth-320,player.offsetLeft+4)+'px';player.classList.remove('flipped');}
        if((keys[' ']||keys['arrowup']||keys['w'])&&!isJumping){isJumping=true;jumpSpeed=15;window.audio.playJump();}
      }
      if(isJumping){const bottom=parseFloat(player.style.bottom)||0;player.style.bottom=bottom+jumpSpeed+'px';jumpSpeed-=gravity;if(bottom+jumpSpeed<=80){player.style.bottom='80px';isJumping=false;}}
      checkProximity();requestAnimationFrame(gameLoop);
    }
    gameLoop();

    // Input & scene transition
    document.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;
      if(e.key.toLowerCase()==='e'){ window.audio.playInteract(); if(!interactionFinished)startDialog();else if(!waitingBlock){overlayPuzzle.style.display='block';dialogTextPuzzle.textContent='Иди же дальше!';setTimeout(()=>overlayPuzzle.style.display='none',2000);}}
      if(puzzleSolved){const posX=player.offsetLeft;if((e.key.toLowerCase()==='arrowleft'||e.key.toLowerCase()==='a')&&posX<=leftLimit)location.href='wizard03.html?exit=left';if((e.key.toLowerCase()==='arrowright'||e.key.toLowerCase()==='d')&&posX>=rightLimit)location.href='wizard03.html?exit=right';}}
    );
    document.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
  </script>
</body>
</html>
`;
scenes["wizard03"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Czech Wizard</title>
  <script src="audio.js"></script>
  <style>
    /* Base reset */
    html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: black; font-family: 'Courier New', monospace; }
    /* Wrapper scaling */
    #wrapper { position: absolute; top: 0; left: 0; width: 1920px; height: 1200px; transform-origin: top left; }
    /* Background */
    #game-container { position: relative; width: 100%; height: 100%; background: url('background.png') center center / cover no-repeat; }
    /* Player sprite */
    #player { position: absolute; width: 320px; height: 320px; bottom: 80px; transform-origin: center bottom;
      background: url('player_idle.png') center center no-repeat; background-size: contain; image-rendering: pixelated; }
    #player.flipped { transform: scaleX(-1); }
    /* Wizard */
    #wizard { position: absolute; width: 300px; height: 300px; bottom: 80px; left: 50%; transform: translateX(-50%); pointer-events: none; }
    #wizard-img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
    /* Prompt */
    #prompt { position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
      background: white; color: black; padding: 8px 12px; border: 4px solid red; border-radius: 4px;
      font-size: 28px; font-family: 'Arial Black'; text-transform: uppercase;
      pointer-events: none; display: none; white-space: nowrap; }
    /* Dialog/puzzle overlay */
    #puzzle-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7);
      display: none; z-index: 100; }
    /* Box common style */
    .box {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      background: white; padding: 48px; border: 4px solid black;
      width: 900px; max-width: 90vw; text-align: center;
      font-family: 'Arial Black';
    }
    /* Greeting box */
    #greet-box { display: none; }
    /* Puzzle box */
    #puzzle-box { display: none; }
    #puzzle-box h1 { font-size: 42px; margin-bottom: 24px; }
    .puzzle-answer {
      display: block; width: 100%; margin: 12px 0; padding: 12px; font-size: 30px;
      cursor: pointer; border: 2px solid #333; background: #eee; user-select: none;
    }
    /* Shake animation */
    @keyframes shake {
      0% { transform: translate(-50%,-50%) translateX(0); }
      25% { transform: translate(-50%,-50%) translateX(-10px); }
      50% { transform: translate(-50%,-50%) translateX(10px); }
      75% { transform: translate(-50%,-50%) translateX(-10px); }
      100% { transform: translate(-50%,-50%) translateX(0); }
    }
    /* Collectible block */
    .collect-block { position: absolute; width: 60px; height: 40px; cursor: pointer; image-rendering: pixelated; }
    /* After-puzzle hint box above wizard */
    #wizard-message {
      position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
      background: white; padding: 32px; border: 4px solid black;
      width: 600px; max-width: 90vw; text-align: center;
      font-family: 'Arial Black'; font-size: 32px; display: none; pointer-events: auto; cursor: pointer; z-index: 101;
    }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="game-container">
      <div id="player"></div>
      <div id="wizard">
        <img id="wizard-img" src="wizard3.png" alt="Wizard" />
        <div id="prompt">Press E</div>
        <div id="wizard-message"></div>
      </div>
      <div id="ground"></div>
      <!-- Puzzle & Greeting Overlay -->
      <div id="puzzle-overlay">
        <div id="greet-box" class="box">
          <div>О, Саша, слава богу ты здесь! Надо срочно ответить на письмо из Финанзамт!</div>
        </div>
        <div id="puzzle-box" class="box">
          <h1>Чему вас научила немецко-армянская налоговая одиссея?</h1>
          <div id="error-text" style="display:none; margin:16px 0; font-size:30px; color:red;">Эх, все же придется звонить KPMG!</div>
          <button class="puzzle-answer" data-correct="false">Провайдеры бывают глобальными, а ответственность нет</button>
          <button class="puzzle-answer" data-correct="false">В Finanzamt отвечают медленно, но зато верно</button>
          <button class="puzzle-answer" data-correct="false">Когда тебе отвечают “мы это уточним” — лучше начинай уточнять сам</button>
          <button class="puzzle-answer" data-correct="false">На лучшую налоговую консультацию к SVP R&D можно записаться через телеграм</button>
          <button class="puzzle-answer" data-correct="true">Все вышеперечисленное</button>
          
        </div>
      </div>
    </div>
  </div>
  <script>
    // Scaling
    function updateScale() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw / 1920, vh / 1200);
      const wrap = document.getElementById('wrapper');
      wrap.style.transform = \`scale(\${scale})\`;
      wrap.style.left = \`\${(vw - 1920 * scale) / 2}px\`;
      wrap.style.top = \`\${(vh - 1200 * scale) / 2}px\`;
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // DOM refs
    const player = document.getElementById('player');
    const gameArea = document.getElementById('game-container');
    const prompt = document.getElementById('prompt');
    const overlay = document.getElementById('puzzle-overlay');
    const greetBox = document.getElementById('greet-box');
    const puzzleBox = document.getElementById('puzzle-box');
    const wizardMsg = document.getElementById('wizard-message');

    // Initial spawn
    const params = new URLSearchParams(location.search);
    const exitSide = params.get('exit');
    const leftLimit = 0;
    const rightLimit = gameArea.clientWidth - player.clientWidth;
    const spawnX = (exitSide === 'left') ? rightLimit : leftLimit;
    player.style.left = spawnX + 'px';
    player.style.bottom = '80px';

    let interactionFinished = false;
    let waitingBlock = false;
    let puzzleSolved = false;
    let blockSpawned = false; // prevents duplicate block spawn

    // Greeting & puzzle
    function startPlaceholder() {
      interactionFinished = true;
      overlay.style.display = 'block';
      greetBox.style.display = 'block';
      function ack() {
        greetBox.style.display = 'none';
        puzzleBox.style.display = 'block';
      }
      overlay.addEventListener('click', ack, { once: true });
      document.addEventListener('keydown', ack, { once: true });
    }

    // Collectible
    function setupCollectible() {
      blockSpawned = true;
      waitingBlock = true;
      player.style.background = "url('player_hands.png') center center no-repeat";
      player.style.backgroundSize = 'contain';
      const block = document.createElement('div');
      block.className = 'collect-block';
      block.style.background = 'black';
      const xPos = (player.offsetLeft + (320 - 60) / 2) + 'px';
      block.style.left = xPos;
      block.style.bottom = (80 + 320 + 10) + 'px';
      gameArea.appendChild(block);
      block.addEventListener('click', () => {
        block.style.transition = 'all 0.5s ease-out';
        block.style.left = '0px';
        block.style.bottom = (gameArea.clientHeight - 40) + 'px';
        block.addEventListener('transitionend', () => {
          block.remove();
          waitingBlock = false;
          player.style.background = "url('player_idle.png') center center no-repeat";
          player.style.backgroundSize = 'contain';
        }, { once: true });
      });
    }

    // Final dialog after collect (not automatic)
    function showFinalDialog() {
      wizardMsg.innerHTML = 'Отлично! Осталось совсем чуть-чуть! Не отступай!';
      wizardMsg.style.display = 'block';
      wizardMsg.addEventListener('click', () => { wizardMsg.style.display = 'none'; }, { once: true });
      document.addEventListener('keydown', () => { wizardMsg.style.display = 'none'; }, { once: true });
    }

    // Puzzle answer logic
    document.querySelectorAll('.puzzle-answer').forEach(btn => btn.addEventListener('click', () => {
      const correct = btn.dataset.correct === 'true';
      if (!correct) {
        puzzleBox.style.animation = 'shake 0.5s';
        document.getElementById('error-text').style.display = 'block';
        function clearErr() {
          puzzleBox.style.animation = '';
          document.getElementById('error-text').style.display = 'none';
          document.removeEventListener('mousemove', clearErr);
        }
        document.addEventListener('mousemove', clearErr, { once: true });
      } else {
        overlay.style.display = 'none';
        puzzleSolved = true;
        puzzleBox.style.display = 'none';
        // Show Schwarz hint and then collectible
        wizardMsg.innerHTML = 'Ну конечно! Спасибо тебе! Последняя подсказка - <strong>SCHWARZ</strong>';
        wizardMsg.style.display = 'block';
        function ackWizard() {
          wizardMsg.style.display = 'none';
          if (!blockSpawned) setupCollectible();
        }
        wizardMsg.addEventListener('click', ackWizard, { once: true });
        document.addEventListener('keydown', ackWizard, { once: true });
      }
    }));

    // Movement
    let keys = {}, isJumping = false, jumpSpeed = 0, gravity = 0.8;
    function checkProximity() {
      const wizardX = (gameArea.clientWidth - 320) / 2;
      const near = Math.abs(player.offsetLeft - wizardX) < 192;
      const show = !waitingBlock && near && (!interactionFinished || puzzleSolved);
      prompt.style.display = show ? 'block' : 'none';
    }
    function gameLoop() {
      if (!waitingBlock) {
        if (keys['arrowleft'] || keys['a']) {
          player.style.left = Math.max(0, player.offsetLeft - 4) + 'px';
          player.classList.add('flipped');
        }
        if (keys['arrowright'] || keys['d']) {
          player.style.left = Math.min(gameArea.clientWidth - 320, player.offsetLeft + 4) + 'px';
          player.classList.remove('flipped');
        }
        if ((keys[' '] || keys['arrowup'] || keys['w']) && !isJumping) {
          isJumping = true;
          jumpSpeed = 15;
          window.audio.playJump();
        }
      }
      if (isJumping) {
        const bottom = parseFloat(player.style.bottom) || 0;
        player.style.bottom = bottom + jumpSpeed + 'px';
        jumpSpeed -= gravity;
        if (bottom + jumpSpeed <= 80) {
          player.style.bottom = '80px';
          isJumping = false;
        }
      }
      checkProximity();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();

    // Input handling
    document.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      keys[key] = true;
      if (key === 'e') {
        window.audio.playInteract();
        const wizardX = (gameArea.clientWidth - 320) / 2;
        const near = Math.abs(player.offsetLeft - wizardX) < 192;
        if (!interactionFinished && near) {
          startPlaceholder();
        } else if (puzzleSolved && near) {
          // Final dialog only on E
          showFinalDialog();
        }
      }
      if (puzzleSolved) {
        const posX = player.offsetLeft;
        if ((key === 'arrowleft' || key === 'a') && posX <= leftLimit) {
          window.location.href = \`chest.html?exit=left\`;
        }
        if ((key === 'arrowright' || key === 'd') && posX >= rightLimit) {
          window.location.href = \`chest.html?exit=right\`;
        }
      }
    });
    document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  </script>
</body>
</html>
`;
scenes["chest"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wizard Chest Puzzle</title>
  <script src="audio.js"></script>
  <style>
    /* Base reset */
    html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: black; font-family: 'Courier New', monospace; }
    /* Wrapper scaling */
    #wrapper { position: absolute; top: 0; left: 0; width: 1920px; height: 1200px; transform-origin: top left; }
    /* Background */
    #game-container { position: relative; width: 100%; height: 100%; background: url('background.png') center center / cover no-repeat; }
    /* Player sprite */
    #player { position: absolute; width: 320px; height: 320px; bottom: 80px; transform-origin: center bottom; background: url('player_idle.png') center center no-repeat; background-size: contain; image-rendering: pixelated; }
    #player.flipped { transform: scaleX(-1); }
    /* Wizard / Chest sprite */
    #wizard { position: absolute; width: 320px; height: 320px; bottom: 80px; left: 50%; transform: translateX(-50%); pointer-events: none; }
    #wizard-img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
    /* Prompt */
    #prompt { position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%); background: white; color: black; padding: 8px 12px; border: 4px solid red; border-radius: 4px; font-size: 28px; font-family: 'Arial Black'; text-transform: uppercase; pointer-events: none; display: none; white-space: nowrap; }
    /* Dialog overlay */
    #dialog-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); display:none; }
    #dialog-box { position: relative; top:50%; left:50%; transform: translate(-50%,-50%); background: white; padding: 24px; border: 4px solid black; width: 800px; max-width: 90vw; font-family: 'Courier New', monospace; text-align: center; }
    #box-container { display: flex; justify-content: center; width: 100%; margin-bottom: 20px; }
    .draggable-box { width: 60px; height: 40px; margin: 0 10px; cursor: grab; image-rendering: pixelated; }
    #dialog-text { margin: 20px 0 0; font-size: 28px; color: black; }
    .drop-target { display: inline-block; width: 120px; border-bottom: 2px solid #333; margin: 0 5px; vertical-align: middle; min-height: 36px; cursor: pointer; }
    #open-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #eee; border: 2px solid #333; font-size: 24px; cursor: pointer; }
    #feedback { margin-top: 12px; font-size: 24px; color: red; height: 30px; }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="game-container">
      <div id="player"></div>
      <div id="wizard">
        <img id="wizard-img" src="chest_closed.png" alt="Chest" />
        <div id="prompt">Press E</div>
      </div>
      <div id="ground"></div>
      <div id="dialog-overlay">
        <div id="dialog-box">
          <div id="box-container"></div>
          <p id="dialog-text"></p>
          <button id="open-btn">ОТКРЫТЬ</button>
          <div id="feedback"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Responsive scaling
    function updateScale() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const scale = Math.min(vw / 1920, vh / 1200);
      const wrap = document.getElementById('wrapper');
      wrap.style.transform = \`scale(\${scale})\`;
      wrap.style.left = \`\${(vw - 1920 * scale) / 2}px\`;
      wrap.style.top = \`\${(vh - 1200 * scale) / 2}px\`;
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // DOM refs
    const player = document.getElementById('player');
    const gameArea = document.getElementById('game-container');
    const prompt = document.getElementById('prompt');
    const overlay = document.getElementById('dialog-overlay');
    const dialogText = document.getElementById('dialog-text');
    const boxContainer = document.getElementById('box-container');
    const openBtn = document.getElementById('open-btn');
    const feedback = document.getElementById('feedback');

    // Puzzle state
    let puzzleSolved = false;
    let inDialog = false;
    let dragData = null;

    // Movement state
    let keys = {};
    let isJumping = false;
    let jumpSpeed = 0;
    const gravity = 0.8;

    // Puzzle data
    const colors = ['black', 'red', 'gold'];
    const words = { black: 'SWARTZ', red: 'BLUTEGE', gold: 'GOLDENE' };
    const correctOrder = ['black', 'red', 'gold'];

    // Movement bounds & spawn logic (defined before functions)
    const playerWidth = 320;
    const leftLimit = 0;
    const rightLimit = gameArea.clientWidth - playerWidth;
    const params = new URLSearchParams(location.search);
    const exitSide = params.get('exit');
    const spawnSide = exitSide === 'left' ? 'right' : 'left';
    let posX = spawnSide === 'left' ? leftLimit : rightLimit;
    let posY = 0;

    // Greeting text
    const greeting = 'А вот и последняя загадка! Подарки уже совсем рядом!';

    // Dialog starter
    function startDialog() {
      if (puzzleSolved) return;
      inDialog = true;
      overlay.style.display = 'block';
      dialogText.textContent = greeting;
      boxContainer.innerHTML = '';
      openBtn.style.display = 'none';
      feedback.textContent = '';

      function proceed() {
        overlay.removeEventListener('click', proceed);
        document.removeEventListener('keydown', proceed);
        dialogText.textContent =
          'Aus der _________ der Knechtschaft durch _________ Schlachten ans _________ Licht der Freiheit.';
        setupPuzzle();
      }

      overlay.addEventListener('click', proceed, { once: true });
      document.addEventListener('keydown', proceed, { once: true });
    }

    // Create draggable box element
    function createBox(color) {
      const box = document.createElement('div');
      box.className = 'draggable-box';
      box.draggable = true;
      box.dataset.color = color;
      box.style.background = color;
      box.addEventListener('dragstart', () => {
        feedback.textContent = '';
        dragData = { color, from: 'box' };
      });
      return box;
    }

    // Setup puzzle UI
    function setupPuzzle() {
      boxContainer.innerHTML = '';
      colors.forEach(c => boxContainer.appendChild(createBox(c)));
      openBtn.style.display = 'none';
      dialogText.innerHTML =
        \`Aus der <span class="drop-target" data-index="0"></span> der Knechtschaft durch <span class="drop-target" data-index="1"></span> Schlachten ans <span class="drop-target" data-index="2"></span> Licht der Freiheit.\`;

      document.querySelectorAll('.drop-target').forEach(target => {
        target.draggable = true;
        target.addEventListener('dragstart', e => {
          if (!target.dataset.filled) { e.preventDefault(); return; }
          feedback.textContent = '';
          const color = target.dataset.filled;
          dragData = { color, from: 'target' };
          const img = document.createElement('div');
          img.style.cssText = \`width:60px;height:40px;background:\${color};position:absolute;top:-1000px;\`;
          document.body.appendChild(img);
          e.dataTransfer.setDragImage(img, 30, 20);
          setTimeout(() => document.body.removeChild(img), 0);
          target.textContent = '';
          delete target.dataset.filled;
        });
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('drop', e => {
          e.preventDefault();
          const prev = target.dataset.filled;
          if (prev) boxContainer.appendChild(createBox(prev));
          const { color, from } = dragData;
          target.textContent = words[color];
          target.style.color = color;
          target.dataset.filled = color;
          if (from === 'box') {
            const orig = boxContainer.querySelector(\`.draggable-box[data-color="\${color}"]\`);
            if (orig) orig.remove();
          }
          checkAllFilled();
          dragData = null;
        });
        target.addEventListener('dragend', () => {
          if (dragData && dragData.from === 'target') {
            boxContainer.appendChild(createBox(dragData.color));
            checkAllFilled();
            dragData = null;
          }
        });
      });
    }

    // Verify slots before enabling open button
    function checkAllFilled() {
      const all = Array.from(document.querySelectorAll('.drop-target'));
      openBtn.style.display = all.every(t => t.dataset.filled) && !puzzleSolved ? 'inline-block' : 'none';
    }

    // Chest opening logic
    openBtn.addEventListener('click', () => {
      if (puzzleSolved) return;
      feedback.textContent = '';
      const order = Array.from(document.querySelectorAll('.drop-target')).map(t => t.dataset.filled);
      if (order.join() !== correctOrder.join()) {
        feedback.textContent = 'ЧТО-ТО НЕ ТО!';
        return;
      }
      puzzleSolved = true;
      prompt.style.display = 'none';
      window.audio.stopBgm();
      const chestAudio = window.audio.playChestOpen();
      document.getElementById('wizard-img').src = 'chest_opened.png';
      overlay.style.display = 'none';
      inDialog = false;
      if (chestAudio) {
        chestAudio.addEventListener('ended', () => {
          overlay.style.display = 'block';
          inDialog = true;
          dialogText.innerHTML =
            'ПОЗДРАВЛЯЕМ С ДНЕМ РОЖДЕНИЯ! ВОТ ТУТ ТВОИ ПОДАРКИ!<br/><a href="#">[Google Drive Link]</a>';
          boxContainer.innerHTML = '';
          openBtn.style.display = 'none';
          feedback.textContent = '';
          window.audio.playVictory();
        });
      }
    });

    // Update player position and prompt
    function updatePos() {
      player.style.left = posX + 'px';
      player.style.bottom = (80 + posY) + 'px';
    }
    function checkProximity() {
      if (puzzleSolved) { prompt.style.display = 'none'; return; }
      const wizardX = (gameArea.clientWidth - playerWidth) / 2;
      prompt.style.display = !inDialog && Math.abs(posX - wizardX) < playerWidth * 0.6 ? 'block' : 'none';
    }
    function gameLoop() {
      if (!inDialog && !puzzleSolved) {
        if (keys['arrowleft'] || keys['a']) { posX = Math.max(leftLimit, posX - 4); player.classList.add('flipped'); }
        if (keys['arrowright'] || keys['d']) { posX = Math.min(rightLimit, posX + 4); player.classList.remove('flipped'); }
        if ((keys[' '] || keys['arrowup'] || keys['w']) && !isJumping) { isJumping = true; jumpSpeed = 15; window.audio.playJump(); }
      }
      if (isJumping) {
        posY += jumpSpeed;
        jumpSpeed -= gravity;
        if (posY <= 0) { posY = 0; isJumping = false; }
      }
      updatePos();
      checkProximity();
      requestAnimationFrame(gameLoop);
    }
    updatePos();
    gameLoop();

    // Input listeners
    document.addEventListener('keydown', e => {
      if (puzzleSolved) return;
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e' && prompt.style.display === 'block' && !inDialog) {
        window.audio.playInteract();
        startDialog();
      }
    });
    document.addEventListener('keyup', e => {
      if (puzzleSolved) return;
      const key = e.key.toLowerCase();
      if (key === 'e') window.audio.playInteract();
      keys[key] = false;
    });
  </script>
</body>
</html>
`;

function loadScene(scene) {
    document.getElementById('game-container').innerHTML = scenes[scene] || '<div>Scene not found!</div>';
}

window.onhashchange = () => {
    const scene = location.hash.slice(2) || 'index';
    loadScene(scene);
};

document.addEventListener('DOMContentLoaded', () => {
    loadScene(location.hash.slice(2) || 'index');
});
