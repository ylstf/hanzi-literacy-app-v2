/* ================================================================
   识字闯关星球 V3 — 纯网页增强版
   - 200题快速估算 + 撤回
   - 25组分组闯关 + 撤回
   - 多孩子管理
   - 错字本 + 重测
   - Canvas分享报告
   - Web Audio音效
   ================================================================ */

const BANK = Array.isArray(window.HANZI_BANK) ? window.HANZI_BANK : [];
const STORAGE_KEY = 'hanzi-literacy-v3';
const GROUP_SIZE = 100;
const GROUP_COUNT = Math.ceil(BANK.length / GROUP_SIZE);
const QUICK_TARGET = 200;

const app = document.querySelector('#app');
let state = loadState();
let screen = 'home';
let audioCtx = null;

// ========== 存储 ==========
function defaultState() {
  return {
    soundOn: true,
    activeChildId: '',
    children: [],
    childData: {}
  };
}

function loadState() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch { return defaultState(); }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function getActiveChildId() { return state.activeChildId; }

function getChildData() {
  const id = state.activeChildId;
  if (!id) return null;
  if (!state.childData[id]) {
    state.childData[id] = { quick: null, quickResults: [], groups: {}, wrongBook: [] };
  }
  return state.childData[id];
}

function html(v) {
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c]);
}


// ========== 数据 ==========
function itemById(id) { return BANK[id - 1]; }

function groupRange(gi) {
  const s = gi * GROUP_SIZE;
  return BANK.slice(s, Math.min(s + GROUP_SIZE, BANK.length));
}

// ========== 孩子管理 ==========
function addChild(nickname) {
  const id = 'c_' + Date.now();
  state.children.push({ id, nickname, createdAt: Date.now() });
  state.childData[id] = { quick: null, quickResults: [], groups: {}, wrongBook: [] };
  state.activeChildId = id;
  saveState();
  return id;
}

function removeChild(id) {
  state.children = state.children.filter(c => c.id !== id);
  delete state.childData[id];
  if (state.activeChildId === id) {
    state.activeChildId = state.children.length ? state.children[0].id : '';
  }
  saveState();
}

function switchChild(id) {
  state.activeChildId = id;
  saveState();
}


// ========== 快速估算 ==========
function initQuick() {
  return { level: 5, answers: [], usedIds: [], currentId: null, finished: false, undoStack: [] };
}

function pickQuick(q) {
  const used = new Set(q.usedIds);
  const lv = Math.max(1, Math.min(10, q.level));
  const same = BANK.filter(it => it.level === lv && !used.has(it.id));
  const pool = same.length ? same : BANK.filter(it => !used.has(it.id));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null;
}

function answerQuick(known) {
  const data = getChildData();
  if (!data || !data.quick) return;
  const q = data.quick;
  if (q.finished) return;
  const item = itemById(q.currentId);
  if (!item) return;

  q.undoStack.push({ level: q.level, currentId: q.currentId, usedLen: q.usedIds.length });
  q.undoStack = q.undoStack.slice(-2);
  q.answers.push({ id: item.id, level: item.level, known });
  q.usedIds.push(item.id);
  q.level = Math.max(1, Math.min(10, q.level + (known ? 1 : -1)));

  if (!known) addWrongChar(item.id);

  if (q.answers.length >= QUICK_TARGET) {
    q.finished = true;
    q.currentId = null;
    const result = estimateQuick(q);
    result.createdAt = Date.now();
    data.quickResults.unshift(result);
    data.quickResults = data.quickResults.slice(0, 20);
    data.quick = null;
    saveState();
    play('finish');
    renderResult('quick');
  } else {
    q.currentId = pickQuick(q);
    data.quick = q;
    saveState();
    play(known ? 'good' : 'bad');
    renderQuickTest();
  }
}

function undoQuick() {
  const data = getChildData();
  if (!data || !data.quick) return;
  const q = data.quick;
  const last = q.undoStack.pop();
  if (!last) return;
  q.answers.pop();
  q.usedIds = q.usedIds.slice(0, last.usedLen);
  q.level = last.level;
  q.currentId = last.currentId;
  q.finished = false;
  saveState();
  play('undo');
  renderQuickTest();
}

function estimateQuick(q) {
  let score = 0, prev = 1;
  for (let lv = 1; lv <= 10; lv++) {
    const g = q.answers.filter(a => a.level === lv);
    const rate = g.length ? g.filter(a => a.known).length / g.length : prev * 0.78;
    prev = rate; score += rate * 250;
  }
  const known = q.answers.filter(a => a.known).length;
  return { estimated: Math.max(0, Math.min(2500, Math.round(score/10)*10)), known, total: q.answers.length };
}


// ========== 分组闯关 ==========
function initGroup(gi) {
  const items = groupRange(gi);
  const order = items.map(it => it.id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { groupIndex: gi, currentOffset: 0, answers: {}, order, undoStack: [], completedAt: null };
}

function getGroup(gi) {
  const data = getChildData();
  if (!data) return null;
  const key = String(gi);
  if (!data.groups[key]) data.groups[key] = initGroup(gi);
  return data.groups[key];
}

function currentGroupItem(g) {
  if (g.currentOffset >= g.order.length) return null;
  return itemById(g.order[g.currentOffset]);
}

function groupProgress(g) {
  if (!g) return { answered: 0, known: 0, total: 0, done: false };
  const vals = Object.values(g.answers || {});
  const total = g.order.length;
  return { answered: vals.length, known: vals.filter(v => v === 'known').length, total, done: vals.length >= total };
}

function answerGroup(status) {
  const data = getChildData();
  if (!data) return;
  const gi = parseInt(screen.replace('group-test-', ''));
  const g = data.groups[String(gi)];
  if (!g) return;
  const item = currentGroupItem(g);
  if (!item) { renderResult('group', gi); return; }

  g.answers[item.id] = status;
  g.undoStack.push({ id: item.id, offset: g.currentOffset, status });
  g.undoStack = g.undoStack.slice(-2);
  g.currentOffset += 1;

  if (status === 'unknown') addWrongChar(item.id);

  if (g.currentOffset >= g.order.length) {
    g.completedAt = Date.now();
    saveState();
    play('finish');
    renderResult('group', gi);
  } else {
    saveState();
    play(status === 'known' ? 'good' : 'bad');
    renderGroupTest(gi);
  }
}

function undoGroup(gi) {
  const data = getChildData();
  if (!data) return;
  const g = data.groups[String(gi)];
  if (!g) return;
  const last = g.undoStack.pop();
  if (!last) return;
  delete g.answers[last.id];
  g.currentOffset = last.offset;
  g.completedAt = null;
  saveState();
  play('undo');
  renderGroupTest(gi);
}


// ========== 错字本 ==========
function addWrongChar(charId) {
  const data = getChildData();
  if (!data) return;
  if (!data.wrongBook.find(c => c.id === charId)) {
    data.wrongBook.push({ id: charId, addedAt: Date.now() });
    saveState();
  }
}

function removeWrongChar(charId) {
  const data = getChildData();
  if (!data) return;
  data.wrongBook = data.wrongBook.filter(c => c.id !== charId);
  saveState();
}


// ========== 音效 ==========
function play(type) {
  if (!state.soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const s = { good:[660,880,.12], bad:[260,220,.16], finish:[523,784,.22], undo:[420,360,.1] }[type] || [440,440,.1];
    osc.type = type === 'bad' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(s[0], now);
    osc.frequency.exponentialRampToValueAtTime(s[1], now + s[2]);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + s[2]);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + s[2] + 0.03);
  } catch {}
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  saveState();
  if (state.soundOn) play('good');
  renderCurrent();
}

function renderCurrent() {
  if (screen === 'home') renderHome();
  else if (screen === 'quick-test') renderQuickTest();
  else if (screen === 'quick-result') renderResult('quick');
  else if (screen === 'group-list') renderGroupList();
  else if (screen.startsWith('group-test-')) renderGroupTest(parseInt(screen.replace('group-test-', '')));
  else if (screen.startsWith('group-result-')) renderResult('group', parseInt(screen.replace('group-result-', '')));
  else if (screen === 'wrong-book') renderWrongBook();
  else if (screen === 'wrong-test') renderWrongTest();
  else renderHome();
}

// ===================== 渲染 =====================

function shell(content) {
  return '<header class="topbar"><div class="brand"><div class="planet">字</div><div><h1>识字闯关星球</h1><p>200题估算 · 25组闯关 · 多孩子</p></div></div><button class="sound-btn" data-action="toggle-sound">' + (state.soundOn ? '🔊 音效开' : '🔇 音效关') + '</button></header>' + content;
}

// ===== 首页 =====
function renderHome() {
  screen = 'home';
  const cd = getChildData();
  const children = state.children;
  const activeId = state.activeChildId;

  let childHTML = '';
  if (children.length === 0) {
    childHTML = '<div class="empty"><div class="icon">👶</div><p>还没有添加孩子</p></div>';
  } else {
    childHTML = '<div class="child-list">' + children.map(c =>
      '<div class="child-chip' + (c.id === activeId ? ' active' : '') + '" data-action="switch-child" data-id="' + c.id + '">' +
      html(c.nickname) +
      (children.length > 1 ? '<span class="child-delete" data-action="delete-child" data-id="' + c.id + '">×</span>' : '') +
      '</div>'
    ).join('') + '</div>';
  }

  let stats = '<div class="empty"><p>请选择一个孩子开始</p></div>';
  let modeCards = '';
  if (activeId && cd) {
    const qCount = cd.quickResults.length;
    const lastQR = cd.quickResults[0];
    let completedGroups = 0, totalAnswered = 0, totalKnown = 0;
    for (let i = 0; i < GROUP_COUNT; i++) {
      const p = groupProgress(cd.groups[String(i)]);
      if (p.done) completedGroups++;
      totalAnswered += p.answered;
      totalKnown += p.known;
    }
    const wrongCount = cd.wrongBook.length;

    stats = '<div class="stats">' +
      '<div class="stat"><span>已完成小组</span><strong>' + completedGroups + '/' + GROUP_COUNT + '</strong></div>' +
      '<div class="stat"><span>逐字已测</span><strong>' + totalAnswered + '</strong></div>' +
      '<div class="stat"><span>已确认认识</span><strong>' + totalKnown + '</strong></div>' +
      '</div>';

    modeCards = '<div class="mode-grid">' +
      '<button class="mode" data-action="start-quick"><div class="badge">测</div><h2>快速估算</h2><p>' + QUICK_TARGET + ' 题，快速得到识字量参考范围。</p>' +
      '<span class="btn primary">' + (cd.quick && !cd.quick.finished ? '继续快速估算' : '开始快速估算') + '</span></button>' +
      '<button class="mode" data-action="start-next-group"><div class="badge">闯</div><h2>分组闯关</h2><p>' + GROUP_COUNT + ' 组，共 ' + GROUP_SIZE + ' 字/组，适合长期逐字摸底。</p>' +
      '<span class="btn warn">继续闯关</span></button>' +
      '<button class="mode" data-action="open-wrong-book" style="background:var(--card);padding:20px;border-radius:var(--radius);box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:space-between;">' +
      '<div><h3 style="font-size:15px;">📖 错字本</h3><p class="muted" style="font-size:12px;">' + (wrongCount > 0 ? '共 ' + wrongCount + ' 个字' : '暂无错字') + '</p></div>' +
      '<span class="btn ghost">查看</span></button>' +
      '</div>';
  }

  // 小组列表
  let groupTiles = '<div class="section-header"><h2>' + GROUP_COUNT + ' 个识字小组</h2><button class="btn btn-ghost btn-sm" data-action="show-delete-child" ' + (!activeId ? 'disabled' : '') + '>删除孩子</button></div>';
  groupTiles += '<div class="group-grid">';
  for (let i = 0; i < GROUP_COUNT; i++) {
    const p = groupProgress(cd ? cd.groups[String(i)] : null);
    const pct = p.total ? Math.round(p.answered / p.total * 100) : 0;
    const cls = p.done ? 'done' : p.answered ? 'active' : '';
    groupTiles += '<div class="group-tile ' + cls + '" data-action="start-group" data-gi="' + i + '"><div class="num">第 ' + (i+1) + ' 组</div><div class="stat">' + p.answered + '/' + p.total + ' 字</div><div class="mini-bar"><div class="mini-bar-fill" style="width:' + pct + '%"></div></div></div>';
  }
  groupTiles += '</div>';

  // 家长提示
  const tipCard = '<div class="card"><h3>💡 家长小提示</h3><p class="muted">只要孩子能基本读出常见读音，就点"认识"。如果迟疑、猜测、需要提示，就点"不认识"。</p></div>';

  app.innerHTML = shell(
    '<section class="hero"><div class="panel">' +
    '<span class="tag">★ 增强版</span>' +
    '<h2 class="hero-title">一组一组<br /><span>点亮</span><span>汉字星球</span></h2>' +
    '<p class="hero-copy">' + QUICK_TARGET + '题快速估算 + ' + GROUP_COUNT + '组逐字闯关。支持多孩子、错字本、撤回、分享报告。</p>' +
    '<div class="child-section"><div class="child-header"><span class="child-label">当前孩子</span><button class="btn ghost btn-sm" data-action="show-add-child">+ 添加孩子</button></div>' + childHTML + '</div>' +
    modeCards +
    '</div>' +
    (activeId ? '<aside class="stack"><section class="card"><h3>当前记录</h3>' + stats + '</section>' + tipCard + '</aside>' : tipCard) +
    '</section>' +
    '<section class="group-section"><div class="group-header"><div><h2>' + GROUP_COUNT + ' 个识字小组</h2><p class="muted">每组 ' + GROUP_SIZE + ' 字，完成一组就休息一下。</p></div></div><div class="group-grid">' + groupTiles + '</div></section>'
  );
}

// ===== 快速估算测试 =====
function renderQuickTest() {
  screen = 'quick-test';
  const data = getChildData();
  if (!data) return renderHome();
  let q = data.quick;
  if (!q || q.finished) {
    q = initQuick();
    q.currentId = pickQuick(q);
    data.quick = q;
    saveState();
  }
  const item = itemById(q.currentId);
  const pct = Math.round(q.answers.length / QUICK_TARGET * 100);
  const est = q.answers.length > 0 ? estimateQuick(q).estimated : 0;

  app.innerHTML = shell(
    '<section class="test-layout">' +
    '<div class="test-card">' +
    '<div class="test-top"><div><h2>快速估算</h2><p class="muted">第 ' + (q.answers.length + 1) + ' / ' + QUICK_TARGET + ' 题</p></div><button class="btn ghost" data-action="home">暂停</button></div>' +
    '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
    '<div class="hanzi-stage"><div class="hanzi">' + html(item ? item.char : '?') + '</div></div>' +
    '<div class="judge-row">' +
    '<button class="btn good" data-action="quick-known">认识</button>' +
    '<button class="btn bad" data-action="quick-unknown">不认识</button>' +
    '</div>' +
    '<div class="side-actions" style="margin-top:8px;"><button class="btn warn" data-action="quick-undo" ' + (q.undoStack.length ? '' : 'disabled') + '>撤回上一步</button></div>' +
    '</div>' +
    '<aside class="stack">' +
    '<section class="card"><h3>当前估算</h3><div class="big-number">' + est + '</div><p class="muted">完成 ' + QUICK_TARGET + ' 题后生成正式估算</p></section>' +
    '<section class="card"><h3>键盘操作</h3><p class="muted">电脑上可按 1 认识、2 不认识、Backspace 撤回</p></section>' +
    '</aside></section>'
  );
}

// ===== 结果 =====
function renderResult(type, groupIndex) {
  screen = type === 'quick' ? 'quick-result' : 'group-result-' + groupIndex;
  const cd = getChildData();
  let title = '', bigNum = '', statsHTML = '', note = '', actionsHTML = '';

  if (type === 'quick') {
    const result = (cd && cd.quickResults[0]) || { estimated: 0, known: 0, total: 0 };
    const acc = result.total ? Math.round(result.known / result.total * 100) : 0;
    title = '⚡ 快速估算完成';
    bigNum = result.estimated;
    statsHTML = '<div class="stat-row"><div class="stat-item"><span class="num">' + result.total + '</span><span class="label">完成题数</span></div><div class="stat-item"><span class="num">' + result.known + '</span><span class="label">认识</span></div><div class="stat-item"><span class="num">' + acc + '%</span><span class="label">认识率</span></div></div>';
    note = '自适应抽样估算，非逐字精确统计';
    actionsHTML = '<button class="btn btn-primary btn-block" data-action="home">回首页</button><button class="btn btn-ghost btn-block" data-action="report-quick">分享报告</button><button class="btn btn-ghost btn-block" data-action="retry-quick">重新估算</button>';
  } else {
    const g = cd ? cd.groups[String(groupIndex)] : null;
    const p = groupProgress(g);
    const acc = p.total ? Math.round(p.known / p.total * 100) : 0;
    title = '🚀 第 ' + (groupIndex + 1) + ' 组完成';
    bigNum = p.known;
    statsHTML = '<div class="stat-row"><div class="stat-item"><span class="num">' + p.answered + '</span><span class="label">已测</span></div><div class="stat-item"><span class="num">' + p.known + '</span><span class="label">认识</span></div><div class="stat-item"><span class="num">' + (p.total - p.known) + '</span><span class="label">不认识</span></div></div>';
    note = '本组共 ' + p.total + ' 字，认识率 ' + acc + '%';
    const hasNext = groupIndex + 1 < GROUP_COUNT;
    actionsHTML = (hasNext ? '<button class="btn btn-primary btn-block" data-action="next-group" data-gi="' + groupIndex + '">下一组</button>' : '') +
      '<button class="btn btn-ghost btn-block" data-action="home">回首页</button>' +
      '<button class="btn btn-ghost btn-block" data-action="report-group" data-gi="' + groupIndex + '">分享报告</button>';
  }

  app.innerHTML = shell(
    '<section class="result-card"><span class="tag">' + title + '</span><h2>' + (type === 'quick' ? '大约认识' : '本组认识') + '</h2><div class="big-number">' + bigNum + '</div>' + statsHTML.replace(/stat-row/g, 'metric-grid').replace(/stat-item/g, 'metric').replace(/<span class="num">/g, '<strong>').replace(/<\/span><span class="label">/g, '</strong><span>') + '<p class="hero-copy">' + note + '</p><div class="actions">' + actionsHTML.replace(/result-actions/g, '') + '</div></section>'
  );
}

// ===== 分组列表 =====
function renderGroupList() {
  screen = 'group-list';
  let html2 = '<div style="margin-bottom:16px;"><div class="page-title">分组闯关</div><p class="page-sub">' + GROUP_COUNT + '组 × ' + GROUP_SIZE + '字，共 ' + BANK.length + ' 常用字</p></div>';
  html2 += '<div class="group-grid">';
  const cd = getChildData();
  for (let i = 0; i < GROUP_COUNT; i++) {
    const p = groupProgress(cd ? cd.groups[String(i)] : null);
    const pct = p.total ? Math.round(p.answered / p.total * 100) : 0;
    const cls = p.done ? 'done' : p.answered ? 'active' : '';
    html2 += '<div class="group-tile ' + cls + '" data-action="start-group" data-gi="' + i + '"><div class="num">第 ' + (i+1) + ' 组</div><div class="stat">' + p.answered + '/' + p.total + ' 字</div><div class="mini-bar"><div class="mini-bar-fill" style="width:' + pct + '%"></div></div></div>';
  }
  html2 += '</div>';
  app.innerHTML = shell(html2);
}

// ===== 分组测试 =====
function renderGroupTest(gi) {
  screen = 'group-test-' + gi;
  const data = getChildData();
  if (!data) return renderHome();
  let g = getGroup(gi);
  if (!g) return renderHome();

  // Skip already answered
  while (g.currentOffset < g.order.length && g.answers[g.order[g.currentOffset]]) {
    g.currentOffset++;
  }
  saveState();

  const progress = groupProgress(g);
  if (progress.done) {
    renderResult('group', gi);
    return;
  }

  const item = currentGroupItem(g);
  const pct = Math.round(progress.answered / progress.total * 100);

  app.innerHTML = shell(
    '<section class="test-layout">' +
    '<div class="test-card">' +
    '<div class="test-top"><div><h2>第 ' + (gi + 1) + ' 组</h2><p class="muted">第 ' + (progress.answered + 1) + ' / ' + progress.total + ' 题</p></div><button class="btn ghost" data-action="home">暂停</button></div>' +
    '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
    '<div class="hanzi-stage"><div class="hanzi">' + html(item ? item.char : '?') + '</div></div>' +
    '<div class="judge-row">' +
    '<button class="btn good" data-action="group-known">认识</button>' +
    '<button class="btn bad" data-action="group-unknown">不认识</button>' +
    '</div>' +
    '</div>' +
    '<aside class="stack">' +
    '<section class="card"><h3>这一组</h3><div class="stats">' +
    '<div class="stat"><span>已测</span><strong>' + progress.answered + '</strong></div>' +
    '<div class="stat"><span>认识</span><strong>' + progress.known + '</strong></div>' +
    '<div class="stat"><span>剩余</span><strong>' + (progress.total - progress.answered) + '</strong></div>' +
    '</div>' +
    '<div class="side-actions"><button class="btn warn" data-action="group-undo" ' + (g.undoStack.length ? '' : 'disabled') + '>撤回上一步</button><button class="btn ghost" data-action="group-list">回小组列表</button></div>' +
    '</section>' +
    '<section class="card"><h3>键盘操作</h3><p class="muted">电脑上可按 1 认识、2 不认识、Backspace 撤回</p></section>' +
    '</aside></section>'
  );
}

// ===== 错字本 =====
function renderWrongBook() {
  screen = 'wrong-book';
  const data = getChildData();
  const book = data ? data.wrongBook : [];
  const chars = book.map(c => { const it = itemById(c.id); return it ? { id: c.id, char: it.char } : null; }).filter(Boolean);

  let body;
  if (chars.length === 0) {
    body = '<div class="empty"><div class="icon">🎉</div><p>错字本是空的，继续加油！</p></div>';
  } else {
    body = '<div class="wrong-grid">' + chars.map(c => '<div class="wrong-char" data-action="retest-one" data-id="' + c.id + '">' + html(c.char) + '</div>').join('') + '</div>' +
      '<button class="btn btn-primary btn-block" data-action="retest-all">重测全部 (' + chars.length + ' 字)</button>';
  }

  app.innerHTML = shell(
    '<div style="margin-bottom:16px;"><div class="page-title">📖 错字本</div><p class="page-sub">所有被判定为"不认识"的字</p></div>' +
    body +
    '<button class="btn btn-ghost btn-block" data-action="home" style="margin-top:8px;">返回首页</button>'
  );
}

// ===== 错字重测 =====
function renderWrongTest() {
  screen = 'wrong-test';
  const data = getChildData();
  if (!data) return renderHome();

  if (!data._wrongTestQueue || data._wrongTestQueue.length === 0) {
    initWrongTest(data);
  }

  const queue = data._wrongTestQueue;
  if (queue.length === 0) {
    finishWrongTest();
    return;
  }

  const item = itemById(queue[0]);
  if (!item) { queue.shift(); saveState(); renderWrongTest(); return; }

  app.innerHTML = shell(
    '<div class="test-header"><div><div class="test-title">错字重测</div><div class="test-sub">剩余 ' + queue.length + ' 字</div></div><button class="btn btn-ghost btn-sm" data-action="wrong-book">返回</button></div>' +
    '<div class="hanzi-big">' + html(item.char) + '</div>' +
    '<p class="test-hint">孩子这次读出来了吗？</p>' +
    '<div class="test-actions">' +
    '<button class="btn btn-success test-btn btn-block" data-action="retest-known">✓ 认识了</button>' +
    '<button class="btn btn-danger test-btn btn-block" data-action="retest-unknown">✗ 还是不认识</button>' +
    '</div>'
  );
}

function initWrongTest(data) {
  data._wrongTestQueue = data.wrongBook.map(c => c.id);
  data._retestNewKnown = 0;
  saveState();
}

function finishWrongTest() {
  const data = getChildData();
  if (!data) return;
  const newKnown = data._retestNewKnown || 0;
  const total = (data._wrongTestQueue || []).length + newKnown;
  data._wrongTestQueue = [];
  data._retestNewKnown = 0;
  saveState();

  app.innerHTML = shell(
    '<div class="card result-card"><span class="tag">错字重测完成</span><div class="result-sub">本次又认识了</div><div class="big-number big-number-sm" style="color:var(--green);">' + newKnown + '</div><div class="stat-row"><div class="stat-item"><span class="num">' + total + '</span><span class="label">重测总数</span></div><div class="stat-item"><span class="num">' + newKnown + '</span><span class="label">新认识</span></div><div class="stat-item"><span class="num">' + (total - newKnown) + '</span><span class="label">仍不认识</span></div></div></div>' +
    '<button class="btn btn-primary btn-block" data-action="wrong-book">回错字本</button>'
  );
}

// ===== 报告 =====
function renderReport(type, gi) {
  screen = 'report';
  const canvas = document.querySelector('#reportCanvas');
  canvas.style.display = 'block';
  canvas.width = 750;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  const child = state.children.find(c => c.id === state.activeChildId);
  const nickname = child ? child.nickname : '未命名';
  const now = new Date();
  const dateStr = now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate();

  // Background
  ctx.fillStyle = '#FFF7ED';
  ctx.fillRect(0, 0, 750, 1000);
  // Top circle
  ctx.fillStyle = '#F97316';
  ctx.beginPath(); ctx.arc(375, 0, 200, 0, Math.PI * 2); ctx.fill();
  // Title
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('识字闯关星球', 375, 80);
  // Child + date
  ctx.fillStyle = '#1E293B'; ctx.font = 'bold 36px sans-serif';
  ctx.fillText(nickname + ' 的识字报告', 375, 240);
  ctx.fillStyle = '#64748B'; ctx.font = '24px sans-serif';
  ctx.fillText(dateStr, 375, 280);
  // Divider
  ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(80, 310); ctx.lineTo(670, 310); ctx.stroke();

  if (type === 'quick') {
    const cd = getChildData();
    const result = cd ? cd.quickResults[0] : null;
    if (result) {
      ctx.fillStyle = '#1E293B'; ctx.font = 'bold 120px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(result.estimated), 375, 480);
      ctx.fillStyle = '#64748B'; ctx.font = '28px sans-serif';
      ctx.fillText('大约认识', 375, 530);
      const acc = result.total ? Math.round(result.known / result.total * 100) : 0;
      const stats = [{ v: result.total + ' 题', l: '测试题数' }, { v: result.known + ' 字', l: '认识' }, { v: acc + '%', l: '认识率' }];
      let x = 150;
      stats.forEach(s => {
        ctx.fillStyle = '#1E293B'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.v, x, 640);
        ctx.fillStyle = '#64748B'; ctx.font = '22px sans-serif';
        ctx.fillText(s.l, x, 672);
        x += 225;
      });
    }
  } else {
    const cd = getChildData();
    const g = cd ? cd.groups[String(gi)] : null;
    const p = groupProgress(g);
    if (p.total > 0) {
      ctx.fillStyle = '#1E293B'; ctx.font = 'bold 120px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(p.known), 375, 480);
      ctx.fillStyle = '#64748B'; ctx.font = '28px sans-serif';
      ctx.fillText('第 ' + (gi + 1) + ' 组认识', 375, 530);
      const acc = Math.round(p.known / p.total * 100);
      const stats = [{ v: p.answered + ' 字', l: '已测' }, { v: p.known + ' 字', l: '认识' }, { v: acc + '%', l: '认识率' }];
      let x = 150;
      stats.forEach(s => {
        ctx.fillStyle = '#1E293B'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.v, x, 640);
        ctx.fillStyle = '#64748B'; ctx.font = '22px sans-serif';
        ctx.fillText(s.l, x, 672);
        x += 225;
      });
    }
  }

  ctx.fillStyle = '#64748B'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('来自"识字闯关星球"', 375, 960);

  const saveBtn = type === 'quick' ?
    '<button class="btn btn-primary btn-block" data-action="save-report-quick">保存图片到相册</button><button class="btn btn-ghost btn-block" data-action="home">回首页</button>' :
    '<button class="btn btn-primary btn-block" data-action="save-report-group" data-gi="' + gi + '">保存图片到相册</button><button class="btn btn-ghost btn-block" data-action="home">回首页</button>';

  app.innerHTML = shell('<div class="result-actions">' + saveBtn + '</div>');
}

// ===================== 事件处理 =====================

app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;

  // 音效
  if (action === 'toggle-sound') { toggleSound(); return; }

  // 添加孩子
  if (action === 'show-add-child') {
    showModal('添加孩子', (name) => {
      if (name.trim()) { addChild(name.trim()); renderHome(); }
    });
    return;
  }

  // 删除孩子确认
  if (action === 'show-delete-child') {
    const activeChild = state.children.find(c => c.id === state.activeChildId);
    if (!activeChild) return;
    if (confirm('确定删除「' + activeChild.nickname + '」吗？所有测评记录和错字本数据将永久丢失。')) {
      removeChild(state.activeChildId);
      renderHome();
    }
    return;
  }

  // 切换/删除孩子
  if (action === 'switch-child') { switchChild(t.dataset.id); renderHome(); return; }
  if (action === 'delete-child') {
    e.stopPropagation();
    const child = state.children.find(c => c.id === t.dataset.id);
    if (child && confirm('确定删除「' + child.nickname + '」吗？')) { removeChild(t.dataset.id); renderHome(); }
    return;
  }

  // 导航
  if (action === 'home') { renderHome(); return; }
  if (action === 'start-quick') {
    const data = getChildData();
    if (data && data.quick && !data.quick.finished) { renderQuickTest(); }
    else { const d = getChildData(); if (d) { d.quick = initQuick(); d.quick.currentId = pickQuick(d.quick); saveState(); } renderQuickTest(); }
    return;
  }
  if (action === 'retry-quick') {
    const d = getChildData(); if (d) { d.quick = initQuick(); d.quick.currentId = pickQuick(d.quick); d.quickResults = []; saveState(); }
    renderQuickTest(); return;
  }
  if (action === 'start-next-group') {
    let gi = 0;
    const cd = getChildData();
    if (cd) { for (let i = 0; i < GROUP_COUNT; i++) { if (!groupProgress(cd.groups[String(i)]).done) { gi = i; break; } } }
    renderGroupTest(gi); return;
  }
  if (action === 'start-group') { renderGroupTest(parseInt(t.dataset.gi)); return; }
  if (action === 'next-group') { renderGroupTest(parseInt(t.dataset.gi) + 1); return; }
  if (action === 'group-list') { renderGroupList(); return; }

  // 错字本
  if (action === 'open-wrong-book') { renderWrongBook(); return; }
  if (action === 'wrong-book') { renderWrongBook(); return; }
  if (action === 'retest-one') {
    const d = getChildData(); if (!d) return;
    d._wrongTestQueue = [parseInt(t.dataset.id)];
    d._retestNewKnown = 0; saveState(); renderWrongTest(); return;
  }
  if (action === 'retest-all') { const d = getChildData(); if (d) { initWrongTest(d); renderWrongTest(); } return; }

  // 错字重测
  if (action === 'retest-known') {
    const d = getChildData(); if (!d || !d._wrongTestQueue) return;
    const id = d._wrongTestQueue.shift();
    removeWrongChar(id);
    d._retestNewKnown = (d._retestNewKnown || 0) + 1;
    saveState();
    if (d._wrongTestQueue.length === 0) finishWrongTest(); else renderWrongTest();
    return;
  }
  if (action === 'retest-unknown') {
    const d = getChildData(); if (!d || !d._wrongTestQueue) return;
    d._wrongTestQueue.shift();
    saveState();
    if (d._wrongTestQueue.length === 0) finishWrongTest(); else renderWrongTest();
    return;
  }

  // 快速估算
  if (action === 'quick-known') { answerQuick(true); return; }
  if (action === 'quick-unknown') { answerQuick(false); return; }
  if (action === 'quick-undo') { undoQuick(); return; }

  // 分组闯关
  if (action === 'group-known') { answerGroup('known'); return; }
  if (action === 'group-unknown') { answerGroup('unknown'); return; }
  if (action === 'group-undo') {
    const gs = screen.replace('group-test-', '');
    undoGroup(parseInt(gs)); return;
  }

  // 报告
  if (action === 'report-quick') { renderReport('quick'); return; }
  if (action === 'report-group') { renderReport('group', parseInt(t.dataset.gi)); return; }

  // 保存报告
  if (action.startsWith('save-report')) {
    const canvas = document.querySelector('#reportCanvas');
    const link = document.createElement('a');
    link.download = '识字报告_' + new Date().toISOString().slice(0,10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    return;
  }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  if (screen === 'quick-test') {
    if (e.key === '1' || e.key === 'ArrowLeft') { e.preventDefault(); answerQuick(true); }
    else if (e.key === '2' || e.key === 'ArrowRight') { e.preventDefault(); answerQuick(false); }
    else if (e.key === 'Backspace') { e.preventDefault(); undoQuick(); }
  }
  if (screen.startsWith('group-test-')) {
    if (e.key === '1' || e.key === 'ArrowLeft') { e.preventDefault(); answerGroup('known'); }
    else if (e.key === '2' || e.key === 'ArrowRight') { e.preventDefault(); answerGroup('unknown'); }
    else if (e.key === 'Backspace') {
      e.preventDefault();
      const gs = screen.replace('group-test-', '');
      undoGroup(parseInt(gs));
    }
  }
});

// ========== 弹窗 ==========
function showModal(title, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = '<div class="modal-box"><h3>' + html(title) + '</h3><input id="modalInput" placeholder="输入孩子昵称（如：大宝）" maxlength="10" autofocus /><div class="modal-actions"><button class="btn btn-ghost" id="modalCancel">取消</button><button class="btn btn-primary" id="modalConfirm">确认</button></div></div>';
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#modalInput');
  input.focus();

  overlay.querySelector('#modalCancel').onclick = () => overlay.remove();
  overlay.querySelector('#modalConfirm').onclick = () => { onConfirm(input.value); overlay.remove(); };
  overlay.querySelector('.modal-overlay') && overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
  input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { onConfirm(input.value); overlay.remove(); } });
}

// ========== 启动 ==========
if (!BANK.length) {
  app.innerHTML = '<p style="text-align:center;padding:40px;">字库没有加载成功，请检查 data/hanzi.js。</p>';
} else {
  renderHome();
}
