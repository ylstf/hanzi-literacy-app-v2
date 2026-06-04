const BANK = Array.isArray(window.HANZI_BANK) ? window.HANZI_BANK : [];
const STORAGE_KEY = "hanzi-literacy-v2";
const GROUP_SIZE = 100;
const GROUP_COUNT = Math.ceil(BANK.length / GROUP_SIZE);
const QUICK_TARGET = 200;
const GENTLE_TARGET = 50;
const UNDO_LIMIT = 10;
const SHARE_URL = "https://www.beijingheshiedu.com/";
const QUICK_MILESTONES = {
  50: {
    title: "太棒了，已经完成 50 题啦！",
    body: "可以喝口水，也可以继续挑战。孩子状态舒服时，结果会更稳定。",
  },
  100: {
    title: "真厉害，已经完成一半啦！",
    body: "坚持到这里很不容易。想休息一下也没关系，进度会自动保存。",
  },
  150: {
    title: "快到终点啦！",
    body: "再完成 50 题就能生成测评结果。稳稳来，不着急。",
  },
};
const GENTLE_MILESTONES = {
  25: {
    title: "太棒了，已经完成一半啦！",
    body: "不认识也没关系，认真读完就是很棒的挑战。",
  },
};
const GENTLE_LAYERS = [
  {
    key: "basic",
    label: "基础生活高频字",
    target: 15,
    min: 0,
    max: 100,
    chars: "人口手目日月水火山田天大小上下中一二三十",
  },
  {
    key: "life",
    label: "儿童生活常见字",
    target: 15,
    min: 100,
    max: 250,
    chars: "爸妈我你他她家书学玩吃走来去看说",
  },
  {
    key: "early",
    label: "一年级早期常见字",
    target: 12,
    min: 250,
    max: 450,
    chars: "云雨风花草鸟虫里外东西南北前后",
  },
  {
    key: "next",
    label: "稍进阶常用字",
    target: 8,
    min: 450,
    max: 700,
    chars: "明晚园课同问答笑读写",
  },
];
const GENTLE_STAGE_RULES = [
  {
    max: 80,
    name: "识字起步期",
    range: "0-80",
    advice: "可以从生活里的字、绘本封面和孩子熟悉的名字开始。每天认识几个就很好，不急着追数量。",
  },
  {
    max: 200,
    name: "基础积累期",
    range: "80-200",
    advice: "孩子已经有一些基础了。建议继续用亲子共读和生活识字慢慢积累，遇到不认识的字可以先做成小练习清单。",
  },
  {
    max: 400,
    name: "早期阅读准备期",
    range: "200-400",
    advice: "可以尝试短句、儿歌和很简单的分级读物。读不出来时先鼓励，再把这些字放进“不认识的字”里复习。",
  },
  {
    max: 700,
    name: "可以尝试简单分级阅读",
    range: "400-700",
    advice: "孩子可以开始接触更完整的小故事。建议选择字少、图多、重复句式多的读物，让阅读保持轻松。",
  },
];

const app = document.querySelector("#app");
let state = load();
let screen = "home";
let audioContext = null;
let activeReportKind = "current";

function createChild(nickname = "小朋友") {
  const id = `child-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  return {
    id,
    nickname,
    groups: {},
    gentle: null,
    gentleHistory: [],
    quick: null,
    quickHistory: [],
    wrongbook: {},
    review: null,
  };
}

function defaultState() {
  return {
    version: 2,
    soundOn: true,
    activeChildId: null,
    children: {},
    lastRoute: "home",
  };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== "object") return defaultState();
  if (raw.children && raw.activeChildId) return { ...defaultState(), ...raw };

  const child = createChild("小朋友");
  child.groups = raw.groups || {};
  child.gentle = raw.gentle || null;
  child.gentleHistory = raw.gentleHistory || [];
  child.quick = raw.quick || null;
  child.quickHistory = raw.quickHistory || [];
  child.wrongbook = raw.wrongbook || buildWrongbookFromGroups(child.groups);
  return {
    version: 2,
    soundOn: raw.soundOn !== false,
    activeChildId: child.id,
    children: { [child.id]: child },
  };
}

function buildWrongbookFromGroups(groups) {
  const wrongbook = {};
  Object.values(groups || {}).forEach((group) => {
    Object.entries(group.answers || {}).forEach(([id, status]) => {
      if (status === "unknown") wrongbook[id] = { id: Number(id), source: "group", updatedAt: Date.now() };
    });
  });
  return wrongbook;
}

function load() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return defaultState();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setRoute(route) {
  state.lastRoute = route;
  save();
}

function scrollToTop() {
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function child() {
  if (!state.children[state.activeChildId]) {
    const next = createChild("小朋友");
    state.activeChildId = next.id;
    state.children[next.id] = next;
    save();
  }
  return ensureChildShape(state.children[state.activeChildId]);
}

function ensureChildShape(current) {
  if (!current.groups) current.groups = {};
  if (!current.gentleHistory) current.gentleHistory = [];
  if (!current.quickHistory) current.quickHistory = [];
  if (!current.wrongbook) current.wrongbook = {};
  return current;
}

function html(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

function itemById(id) {
  return BANK[id - 1];
}

function groupRange(groupIndex) {
  const start = groupIndex * GROUP_SIZE;
  const end = Math.min(start + GROUP_SIZE, BANK.length);
  return BANK.slice(start, end);
}

function getGroup(groupIndex) {
  const current = child();
  const key = String(groupIndex);
  if (!current.groups[key]) {
    current.groups[key] = {
      groupIndex,
      currentOffset: 0,
      answers: {},
      order: groupRange(groupIndex).map((item) => item.id),
      undoStack: [],
      completedAt: null,
    };
  }
  return current.groups[key];
}

function groupProgress(groupIndex) {
  const group = child().groups[String(groupIndex)];
  if (!group) return { answered: 0, known: 0, total: groupRange(groupIndex).length, done: false };
  const values = Object.values(group.answers || {});
  const total = group.order.length;
  return {
    answered: values.length,
    known: values.filter((v) => v === "known").length,
    total,
    done: values.length >= total,
  };
}

function updateWrongbook(id, status, source) {
  const current = child();
  if (status === "unknown") {
    current.wrongbook[id] = { id: Number(id), source, updatedAt: Date.now() };
  } else {
    delete current.wrongbook[id];
  }
}

function updateSavedAnswers(id, status) {
  const current = child();
  const numericId = Number(id);
  let touchedGentle = false;
  let touchedQuick = false;

  Object.values(current.groups || {}).forEach((group) => {
    if (group.answers && Object.prototype.hasOwnProperty.call(group.answers, numericId)) {
      group.answers[numericId] = status;
    }
  });

  if (current.gentle?.answers?.length) {
    current.gentle.answers.forEach((answer) => {
      if (answer.id === numericId) {
        answer.known = status === "known";
        touchedGentle = true;
      }
    });
  }

  if (current.quick?.answers?.length) {
    current.quick.answers.forEach((answer) => {
      if (answer.id === numericId) {
        answer.known = status === "known";
        touchedQuick = true;
      }
    });
  }

  if (touchedGentle && current.gentle?.finished && current.gentleHistory?.length) {
    current.gentleHistory[0] = {
      ...current.gentleHistory[0],
      ...estimateGentle(),
      refreshedAt: Date.now(),
    };
  }

  if (touchedQuick && current.quick?.finished && current.quickHistory?.length) {
    current.quickHistory[0] = {
      ...current.quickHistory[0],
      ...estimateQuick(),
      refreshedAt: Date.now(),
    };
  }
}

function footerHtml() {
  return `
    <footer class="site-footer">
      <p>问题和建议：微信 <strong>ylstf08</strong></p>
      <p>数据仅保存在本机浏览器 · 结果供家庭阅读和识字练习参考</p>
      <p><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备2025151450号</a></p>
    </footer>
  `;
}

function currentSummary() {
  const current = child();
  const groupStats = Array.from({ length: GROUP_COUNT }, (_, i) => groupProgress(i));
  const completedGroups = groupStats.filter((g) => g.done).length;
  const groupAnswered = groupStats.reduce((sum, g) => sum + g.answered, 0);
  const groupKnown = groupStats.reduce((sum, g) => sum + g.known, 0);
  const latestGentle = current.gentleHistory?.[0] || null;
  const gentleKnown = latestGentle?.known ?? 0;
  const gentleTotal = latestGentle?.total ?? 0;
  const gentleUnknown = Math.max(0, gentleTotal - gentleKnown);
  const latestQuick = current.quickHistory?.[0] || null;
  const quickKnown = latestQuick?.known ?? 0;
  const quickTotal = latestQuick?.total ?? 0;
  const quickUnknown = Math.max(0, quickTotal - quickKnown);
  const wrongCount = Object.keys(current.wrongbook || {}).length;
  const estimated = latestQuick?.estimated ?? latestGentle?.estimated ?? groupKnown;
  const range = latestQuick ? `${latestQuick.low}-${latestQuick.high}` : latestGentle ? `${latestGentle.range}` : "完成测评后显示";

  return {
    nickname: current.nickname,
    date: new Date().toLocaleDateString("zh-CN"),
    estimated,
    range,
    latestGentle,
    gentleKnown,
    gentleUnknown,
    latestQuick,
    quickKnown,
    quickUnknown,
    wrongCount,
    completedGroups,
    groupAnswered,
    groupKnown,
  };
}

function shell(content) {
  const current = child();
  const kids = Object.values(state.children);
  return `
    <header class="topbar">
      <div class="brand">
        <div class="planet">字</div>
        <div>
          <h1>识字闯关星球</h1>
          <p>儿童识字量测评工具 · 书法郭爸团队出品</p>
        </div>
      </div>
      <div class="top-actions">
        <label class="kid-switch">
          <span>当前孩子</span>
          <select data-action="switch-child">
            ${kids.map((kid) => `<option value="${kid.id}" ${kid.id === current.id ? "selected" : ""}>${html(kid.nickname)}</option>`).join("")}
          </select>
        </label>
        <button class="sound-toggle" data-action="add-child">加孩子</button>
        <button class="sound-toggle sound-control" data-action="toggle-sound">${state.soundOn ? "音效开" : "音效关"}</button>
      </div>
    </header>
    ${content}
    ${footerHtml()}
  `;
}

function pageNav(title, rightLabel = "回首页", rightAction = "home") {
  const right = rightLabel ? `<button class="btn ghost" data-action="${rightAction}">${html(rightLabel)}</button>` : '<span class="nav-spacer"></span>';
  return `
    <nav class="page-nav" aria-label="页面导航">
      <button class="btn ghost" data-action="back">返回</button>
      <strong>${html(title)}</strong>
      ${right}
    </nav>
  `;
}

function goBack() {
  if (screen === "wrong-review") return renderWrongbook();
  return renderHome();
}

function nextGroupActionLabel(groupIndex) {
  const progress = groupProgress(groupIndex);
  if (progress.answered === 0) return `从第 ${groupIndex + 1} 组开始`;
  if (!progress.done) return `继续第 ${groupIndex + 1} 组`;
  return `查看第 ${groupIndex + 1} 组`;
}

function renderHome() {
  if (!state.activeChildId || !state.children[state.activeChildId]) {
    renderOnboarding();
    return;
  }
  screen = "home";
  setRoute("home");
  const current = child();
  const totalAnswered = Object.keys(current.groups).reduce((sum, key) => {
    return sum + Object.keys(current.groups[key].answers || {}).length;
  }, 0);
  const totalKnown = Object.keys(current.groups).reduce((sum, key) => {
    return sum + Object.values(current.groups[key].answers || {}).filter((v) => v === "known").length;
  }, 0);
  const completedGroups = Array.from({ length: GROUP_COUNT }, (_, i) => groupProgress(i)).filter((g) => g.done).length;
  const gentleProgress = current.gentle && !current.gentle.finished ? current.gentle.answers.length : 0;
  const latestGentle = current.gentleHistory?.[0] || null;
  const quickProgress = current.quick && !current.quick.finished ? current.quick.answers.length : 0;
  const latestQuick = current.quickHistory?.[0] || null;
  const wrongCount = Object.keys(current.wrongbook || {}).length;
  const nextGroup = Array.from({ length: GROUP_COUNT }, (_, i) => i).find((i) => !groupProgress(i).done) ?? GROUP_COUNT - 1;
  const nextGroupLabel = nextGroupActionLabel(nextGroup);
  const hasAnyReport = latestGentle || latestQuick || totalAnswered;
  const reportLabel = hasAnyReport ? "查看测评报告" : "完成测评后生成报告";

  app.innerHTML = shell(`
    <section class="home-grid">
      <div class="panel home-main">
        <p class="eyebrow">${html(current.nickname)} 的识字测评</p>
        <h2 class="hero-title">先快速摸底<br /><span>再慢慢闯关</span></h2>
        <p class="hero-copy">
          孩子看字读出来，家长按真实情况点“认识”或“不认识”。
          低龄孩子可以先轻松摸底；想要更稳定估算时，再做完整估算。
        </p>
        <div class="inline-actions">
          <button class="btn ghost" data-action="guide">测评规则与字库来源</button>
        </div>
        <div class="mode-grid home-mode-grid">
          <div class="mode">
            <div class="badge">摸</div>
            <h2>轻松摸底</h2>
            <p>${gentleProgress ? `已完成 ${gentleProgress}/${GENTLE_TARGET} 题，继续后会接着上次进度。` : "适合幼儿园或识字量较少的孩子，约 50 题，不认识也没关系。"}</p>
            <div class="mode-actions">
              <button class="btn primary" data-action="gentle-start">${gentleProgress ? "继续轻松摸底" : "开始轻松摸底"}</button>
              <button class="btn ghost" data-action="report-gentle" ${latestGentle ? "" : "disabled"}>${latestGentle ? "生成轻松摸底报告" : "完成后生成报告"}</button>
            </div>
          </div>
          <div class="mode">
            <div class="badge">估</div>
            <h2>完整估算</h2>
            <p>${quickProgress ? `已完成 ${quickProgress}/200 题，继续后会接着上次进度。` : "适合想更稳定估算识字量的孩子，约 10-15 分钟，可暂停继续。"}</p>
            <div class="mode-actions">
              <button class="btn primary" data-action="quick-start">${quickProgress ? "继续完整估算" : "开始完整估算"}</button>
              <button class="btn ghost" data-action="report-quick" ${latestQuick ? "" : "disabled"}>${latestQuick ? "生成完整估算报告" : "完成后生成报告"}</button>
            </div>
          </div>
          <div class="mode">
            <div class="badge">闯</div>
            <h2>逐字闯关</h2>
            <p>每组 100 字，按实际结果逐字保存。可以按顺序测，也可以选择任意小组。</p>
            <div class="mode-actions">
              <button class="btn soft" data-action="group-start-next">${nextGroupLabel}</button>
              <button class="btn ghost" data-action="group-list">选择小组</button>
              <button class="btn ghost" data-action="report-group" ${totalAnswered ? "" : "disabled"}>${totalAnswered ? "生成逐字闯关报告" : "测过后生成报告"}</button>
            </div>
          </div>
        </div>
      </div>

      <aside class="stack">
        <section class="card">
          <h3>当前进度</h3>
          <div class="stats">
            <div class="stat"><span>轻松摸底</span><strong>${latestGentle ? latestGentle.stageName : gentleProgress ? `${gentleProgress}/${GENTLE_TARGET}` : "未完成"}</strong></div>
            <div class="stat"><span>完整估算</span><strong>${latestQuick ? `${latestQuick.estimated} 字` : quickProgress ? `${quickProgress}/200` : "未完成"}</strong></div>
            <div class="stat"><span>已完成小组</span><strong>${completedGroups}/${GROUP_COUNT}</strong></div>
            <div class="stat"><span>逐字已测</span><strong>${totalAnswered}/${BANK.length}</strong></div>
            <div class="stat"><span>已确认认识</span><strong>${totalKnown}</strong></div>
            <div class="stat"><span>不认识的字</span><strong>${wrongCount}</strong></div>
          </div>
          <div class="side-actions">
            <button class="btn review" data-action="wrongbook">查看不认识的字</button>
            <button class="btn ghost" data-action="report" ${hasAnyReport ? "" : "disabled"}>${reportLabel}</button>
          </div>
        </section>
      </aside>
    </section>

    <section class="group-section">
      <details class="method-detail danger-zone">
        <summary>管理当前孩子记录</summary>
        <p>这里的操作只影响“${html(current.nickname)}”在本机浏览器里的记录。</p>
        <button class="btn ghost" data-action="reset-child">清空当前孩子记录</button>
      </details>
    </section>
  `);
  scrollToTop();
}

function renderOnboarding() {
  screen = "onboarding";
  app.innerHTML = `
    <section class="onboarding">
      <div class="planet">字</div>
      <p class="eyebrow">儿童识字量测评工具 · 书法郭爸团队出品</p>
      <h1>欢迎来到识字闯关星球</h1>
      <p class="hero-copy">请输入孩子昵称。之后测评记录、不认识的字和闯关进度都会按孩子分别保存。</p>
      <div class="name-form">
        <input id="child-name-input" type="text" maxlength="20" placeholder="例如：乐乐、小宇、一年级哥哥" autocomplete="off" />
        <button class="btn primary" data-action="create-first-child">开始使用</button>
      </div>
      <p class="muted">数据只保存在这台设备的浏览器里，不会上传服务器。</p>
      <p class="feedback">问题和建议：微信 <strong>ylstf08</strong></p>
    </section>
    ${footerHtml()}
  `;
  setTimeout(() => document.querySelector("#child-name-input")?.focus(), 0);
  scrollToTop();
}

function renderGuide() {
  screen = "guide";
  setRoute("guide");
  app.innerHTML = shell(`
    <section class="result-card guide-card guide-page">
      ${pageNav("规则与来源")}
      <h2>测评规则与字库来源</h2>
      <div class="guide-list">
        <p><strong>1. 孩子读字：</strong>屏幕每次只显示一个汉字，让孩子直接读出来。</p>
        <p><strong>2. 家长判断：</strong>孩子能基本读出常见读音，就点“认识”；卡住、猜测、需要提示，都点“不认识”。</p>
        <p><strong>3. 轻松摸底：</strong>一次 50 题，适合低龄或识字量较少的孩子。结果只给出粗略阶段和练习建议。</p>
        <p><strong>4. 完整估算：</strong>一次 200 题，通常约 10-15 分钟，可暂停后继续。完成后会给出大致识字量范围。</p>
        <p><strong>5. 逐字闯关：</strong>每组 100 字，可分多天完成；可以按顺序测，也可以选择任意小组。</p>
        <p><strong>6. 按错可撤回：</strong>轻松摸底、完整估算、分组闯关和“不认识的字”重测都可以撤回最近 10 步，电脑上也可按 3 撤回。</p>
        <p><strong>7. 不认识的字：</strong>点过“不认识”的字会自动进入列表，之后可以单独重测或全部重测。</p>
        <p><strong>8. 数据保存：</strong>记录只保存在本机浏览器。换设备或清理浏览器缓存，可能会丢失记录。</p>
      </div>
      <details class="method-detail">
        <summary>了解估算方法</summary>
        <p>轻松摸底会从基础生活字、儿童常见字和早期阅读字中分层抽样，用较短测评判断孩子大概处在哪个识字阶段。</p>
        <p>完整估算会从不同难度的汉字中抽样，根据孩子在各难度层的表现，推算 2500 字中的大致掌握量。它适合快速摸底，不是逐字统计。</p>
        <p>分组闯关则是逐字记录：孩子测过哪些字、哪些认识、哪些不认识，都会按实际点击结果保存。</p>
      </details>
      <details class="method-detail">
        <summary>了解 2500 字来源</summary>
        <p>当前字库共 2500 个常用汉字，底稿参考《现代汉语常用字表》常用字部分整理。</p>
        <p>本工具适合作为家庭阅读和识字练习参考，不是官方测评。后续可继续校对为更贴近小学阶段的专用字表。</p>
      </details>
    </section>
  `);
  scrollToTop();
}

function renderGroupList() {
  screen = "group-list";
  setRoute("group-list");
  app.innerHTML = shell(`
    <section class="result-card group-list-page list-page">
      ${pageNav("选择小组")}
      <h2>选择识字小组</h2>
      <p class="hero-copy">每组 100 字。可以按顺序测，也可以根据孩子情况选择任意小组。</p>
      <div class="group-grid">
        ${Array.from({ length: GROUP_COUNT }, (_, i) => groupTile(i)).join("")}
      </div>
    </section>
  `);
  scrollToTop();
}

function groupTile(groupIndex) {
  const progress = groupProgress(groupIndex);
  const pct = Math.round((progress.answered / progress.total) * 100);
  const cls = progress.done ? "done" : progress.answered ? "active" : "";
  return `
    <button class="group-tile ${cls}" data-action="group-start" data-group="${groupIndex}">
      <span class="group-num">第 ${groupIndex + 1} 组</span>
      <span class="muted">${progress.answered}/${progress.total} 字</span>
      <div class="mini-progress"><span style="width:${pct}%"></span></div>
    </button>
  `;
}

function startNextGroup() {
  const next = Array.from({ length: GROUP_COUNT }, (_, i) => i).find((i) => !groupProgress(i).done);
  startGroup(typeof next === "number" ? next : GROUP_COUNT - 1);
}

function startGroup(groupIndex) {
  const group = getGroup(groupIndex);
  if (groupProgress(groupIndex).done) {
    renderGroupResult(groupIndex);
    return;
  }
  while (group.currentOffset < group.order.length && group.answers[group.order[group.currentOffset]]) {
    group.currentOffset += 1;
  }
  save();
  renderGroupTest(groupIndex);
}

function currentGroupItem(group) {
  return itemById(group.order[group.currentOffset]);
}

function answerGroup(status) {
  const groupIndex = Number(screen.replace("group-", ""));
  const group = getGroup(groupIndex);
  const item = currentGroupItem(group);
  if (!item) return renderGroupResult(groupIndex);

  const previous = group.answers[item.id];
  const previousWrongbook = child().wrongbook[item.id] ? { ...child().wrongbook[item.id] } : null;
  group.answers[item.id] = status;
  group.undoStack.push({ id: item.id, offset: group.currentOffset, previous, previousWrongbook });
  group.undoStack = group.undoStack.slice(-UNDO_LIMIT);
  group.currentOffset += 1;
  updateWrongbook(item.id, status, "group");
  play(status === "known" ? "good" : "bad");

  if (group.currentOffset >= group.order.length) {
    group.completedAt = Date.now();
    save();
    renderGroupResult(groupIndex);
    celebrate(`第 ${groupIndex + 1} 组完成啦！`);
    return;
  }

  save();
  renderGroupTest(groupIndex);
}

function undoGroup() {
  const groupIndex = Number(screen.replace("group-", ""));
  const group = getGroup(groupIndex);
  const last = group.undoStack.pop();
  if (!last) return;
  if (last.previous) {
    group.answers[last.id] = last.previous;
  } else {
    delete group.answers[last.id];
  }
  if (last.previousWrongbook) child().wrongbook[last.id] = last.previousWrongbook;
  else delete child().wrongbook[last.id];
  group.currentOffset = last.offset;
  group.completedAt = null;
  play("undo");
  save();
  renderGroupTest(groupIndex);
}

function renderGroupTest(groupIndex) {
  screen = `group-${groupIndex}`;
  setRoute(`group-${groupIndex}`);
  const group = getGroup(groupIndex);
  const item = currentGroupItem(group);
  const progress = groupProgress(groupIndex);
  const pct = Math.round((progress.answered / progress.total) * 100);

  app.innerHTML = shell(`
    <section class="test-layout">
      <div class="test-card">
        ${pageNav(`第 ${groupIndex + 1} 组`, "暂停并回首页")}
        <div class="test-top">
          <div>
            <h2>第 ${groupIndex + 1} 组</h2>
            <p class="muted">第 ${progress.answered + 1} 题 / ${progress.total} 题</p>
          </div>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <div class="hanzi-stage">
          <div class="hanzi">${html(item.char)}</div>
        </div>
        <div class="judge-row">
          <button class="btn good" data-action="group-known">认识 <span class="desktop-only">1</span></button>
          <button class="btn bad" data-action="group-unknown">不认识 <span class="desktop-only">2</span></button>
        </div>
      </div>

      <aside class="stack">
        <section class="card">
          <h3>这一组</h3>
          <div class="stats">
            <div class="stat"><span>已测</span><strong>${progress.answered}</strong></div>
            <div class="stat"><span>认识</span><strong>${progress.known}</strong></div>
            <div class="stat"><span>剩余</span><strong>${progress.total - progress.answered}</strong></div>
          </div>
          <div class="side-actions">
            <button class="btn warn" data-action="group-undo" ${group.undoStack.length ? "" : "disabled"}>撤回最近一步</button>
            <button class="btn ghost" data-action="home">暂停并回首页</button>
          </div>
        </section>
        <section class="card desktop-only-block">
          <h3>键盘操作</h3>
          <p>电脑上可按 1 表示认识，按 2 表示不认识，按 3 撤回。</p>
        </section>
      </aside>
    </section>
  `);
}

function renderGroupResult(groupIndex) {
  screen = "result";
  setRoute(`group-result-${groupIndex}`);
  const progress = groupProgress(groupIndex);
  const pct = progress.total ? Math.round((progress.known / progress.total) * 100) : 0;

  app.innerHTML = shell(`
    <section class="result-card">
      <span class="tag">★ 第 ${groupIndex + 1} 组完成</span>
      <h2>这一组认识</h2>
      <div class="big-number">${progress.known}</div>
      <p class="hero-copy">本组共 ${progress.total} 字，认识率 ${pct}%。完成一组就很棒，可以休息一下再继续。</p>
      <div class="metric-grid">
        <div class="metric"><span>已测</span><strong>${progress.answered}</strong></div>
        <div class="metric"><span>认识</span><strong>${progress.known}</strong></div>
        <div class="metric"><span>不认识</span><strong>${progress.total - progress.known}</strong></div>
      </div>
      <div class="actions">
        ${groupIndex < GROUP_COUNT - 1 ? `<button class="btn primary" data-action="group-next" data-group="${groupIndex}">下一组</button>` : ""}
        <button class="btn review" data-action="wrongbook">查看不认识的字</button>
        <button class="btn ghost" data-action="report-group">查看逐字闯关报告</button>
        <button class="btn ghost" data-action="home">回首页</button>
      </div>
    </section>
  `);
  scrollToTop();
}

function shuffleItems(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function uniqueChars(chars) {
  return Array.from(new Set(String(chars).split("")));
}

function buildGentleOrder() {
  const used = new Set();
  const byChar = new Map(BANK.map((item) => [item.char, item]));
  const order = [];

  GENTLE_LAYERS.forEach((layer) => {
    const preferred = shuffleItems(uniqueChars(layer.chars)
      .map((char) => byChar.get(char))
      .filter((item) => item && !used.has(item.id)));
    const preferredIds = new Set(preferred.map((item) => item.id));
    const fallback = shuffleItems(BANK.filter((item) => !used.has(item.id) && !preferredIds.has(item.id)));
    const picked = [...preferred, ...fallback].slice(0, layer.target);
    picked.forEach((item) => {
      used.add(item.id);
      order.push({ id: item.id, layer: layer.key });
    });
  });

  return order;
}

function startGentle(forceNew = false) {
  const current = child();
  if (forceNew || !current.gentle || current.gentle.finished) {
    current.gentle = {
      order: buildGentleOrder(),
      answers: [],
      undoStack: [],
      milestones: [],
      currentOffset: 0,
      finished: false,
    };
  }
  if (!current.gentle.order?.length) current.gentle.order = buildGentleOrder();
  if (!current.gentle.answers) current.gentle.answers = [];
  if (!current.gentle.undoStack) current.gentle.undoStack = [];
  if (!current.gentle.milestones) current.gentle.milestones = [];
  if (typeof current.gentle.currentOffset !== "number") current.gentle.currentOffset = current.gentle.answers.length;
  save();
  renderGentle();
}

function currentGentleItem(gentle = child().gentle) {
  const entry = gentle?.order?.[gentle.currentOffset];
  const item = entry ? itemById(entry.id) : null;
  return item ? { ...entry, item } : null;
}

function answerGentle(known) {
  const current = child();
  const gentle = current.gentle;
  const entry = currentGentleItem(gentle);
  if (!entry) return finishGentle();
  const previousWrongbook = current.wrongbook[entry.id] ? { ...current.wrongbook[entry.id] } : null;
  const answer = { id: entry.id, layer: entry.layer, known, previousWrongbook };

  gentle.answers.push(answer);
  gentle.undoStack.push(answer);
  gentle.undoStack = gentle.undoStack.slice(-UNDO_LIMIT);
  gentle.currentOffset += 1;
  updateWrongbook(entry.id, known ? "known" : "unknown", "gentle");
  play(known ? "good" : "bad");
  save();

  if (gentle.answers.length >= GENTLE_TARGET) finishGentle();
  else {
    renderGentle();
    maybeShowGentleMilestone(gentle.answers.length);
  }
}

function undoGentle() {
  const gentle = child().gentle;
  const last = gentle?.undoStack?.pop();
  if (!last) return;
  gentle.answers = gentle.answers.filter((answer) => answer !== last);
  gentle.currentOffset = Math.max(0, gentle.currentOffset - 1);
  if (last.previousWrongbook) child().wrongbook[last.id] = last.previousWrongbook;
  else delete child().wrongbook[last.id];
  gentle.finished = false;
  play("undo");
  save();
  renderGentle();
}

function estimateGentle() {
  const gentle = child().gentle;
  const answers = gentle?.answers || [];
  const layerScores = GENTLE_LAYERS.map((layer) => {
    const layerAnswers = answers.filter((answer) => answer.layer === layer.key);
    const known = layerAnswers.filter((answer) => answer.known).length;
    const rate = layerAnswers.length ? known / layerAnswers.length : 0;
    return {
      ...layer,
      known,
      total: layerAnswers.length,
      rate,
      score: rate * (layer.max - layer.min),
    };
  });
  const raw = layerScores.reduce((sum, layer) => sum + layer.score, 0);
  const estimated = Math.max(0, Math.min(700, Math.round(raw / 10) * 10));
  const stage = GENTLE_STAGE_RULES.find((rule) => estimated <= rule.max) || GENTLE_STAGE_RULES[GENTLE_STAGE_RULES.length - 1];
  const known = answers.filter((answer) => answer.known).length;

  return {
    estimated,
    low: Number(stage.range.split("-")[0]),
    high: Number(stage.range.split("-")[1]),
    range: stage.range,
    stageName: stage.name,
    advice: stage.advice,
    known,
    total: answers.length,
    layerScores,
  };
}

function finishGentle() {
  const current = child();
  const result = { createdAt: Date.now(), ...estimateGentle() };
  current.gentle.finished = true;
  current.gentleHistory.unshift(result);
  current.gentleHistory = current.gentleHistory.slice(0, 10);
  save();
  renderGentleResult(result);
  celebrate("轻松摸底完成啦！");
}

function maybeShowGentleMilestone(count) {
  const gentle = child().gentle;
  const milestone = GENTLE_MILESTONES[count];
  if (!milestone || gentle.milestones?.includes(count)) return;
  gentle.milestones = [...(gentle.milestones || []), count];
  save();
  play("milestone");
  document.querySelector(".modal-layer")?.remove();
  app.insertAdjacentHTML("beforeend", `
    <div class="modal-layer stage-layer" role="dialog" aria-modal="true" aria-labelledby="stage-title">
      <section class="modal-card stage-card">
        <h2 id="stage-title">${html(milestone.title)}</h2>
        <p>${html(milestone.body)}</p>
        <div class="modal-actions">
          <button class="btn primary" type="button" data-action="stage-continue">继续摸底</button>
          <button class="btn ghost" type="button" data-action="stage-rest">休息一下</button>
        </div>
      </section>
    </div>
  `);
}

function renderGentle() {
  screen = "gentle";
  setRoute("gentle");
  const gentle = child().gentle;
  const entry = currentGentleItem(gentle);
  if (!entry) return renderGentleResult(estimateGentle());
  const pct = Math.round((gentle.answers.length / GENTLE_TARGET) * 100);

  app.innerHTML = shell(`
    <section class="test-layout">
      <div class="test-card gentle-test-card">
        ${pageNav("轻松摸底", "暂停并回首页")}
        <div class="test-top">
          <div>
            <h2>轻松摸底</h2>
            <p class="muted">第 ${gentle.answers.length + 1} 题 / ${GENTLE_TARGET} 题</p>
          </div>
        </div>
        <div class="progress gentle-progress"><span style="width:${pct}%"></span></div>
        <div class="hanzi-stage"><div class="hanzi">${html(entry.item.char)}</div></div>
        <div class="judge-row">
          <button class="btn good" data-action="gentle-known">认识 <span class="desktop-only">1</span></button>
          <button class="btn bad" data-action="gentle-unknown">不认识 <span class="desktop-only">2</span></button>
        </div>
      </div>
      <aside class="stack">
        <section class="card gentle-side-card">
          <h3>慢慢来</h3>
          <div class="progress-number">${gentle.answers.length}/${GENTLE_TARGET}</div>
          <p>这是给低龄孩子的轻松摸底。不认识也没关系，结果只是后续练习的参考。</p>
          <div class="side-actions">
            <button class="btn warn" data-action="gentle-undo" ${gentle.undoStack.length ? "" : "disabled"}>撤回最近一步</button>
            <button class="btn ghost" data-action="home">暂停并回首页</button>
          </div>
        </section>
        <section class="card">
          <h3>怎么判断</h3>
          <p>孩子能基本读出来，就点“认识”；卡住、猜测或需要提示，就点“不认识”。电脑上可按 1、2、3 操作。</p>
        </section>
      </aside>
    </section>
  `);
}

function renderGentleResult(result) {
  screen = "gentle-result";
  setRoute("gentle-result");
  app.innerHTML = shell(`
    <section class="result-card gentle-result-card">
      <span class="tag">★ 50 题轻松摸底完成</span>
      <h2>${html(result.stageName)}</h2>
      <div class="big-number gentle-stage-name">${html(result.range)}</div>
      <p class="hero-copy">这是 50 题轻松摸底，适合低龄或识字量较少的孩子，结果是粗略参考。孩子愿意认真读完，就已经很棒了。</p>
      <div class="metric-grid">
        <div class="metric"><span>完成题数</span><strong>${result.total}/${GENTLE_TARGET}</strong></div>
        <div class="metric"><span>判断认识</span><strong>${result.known}</strong></div>
        <div class="metric"><span>粗略范围</span><strong>${html(result.range)} 字</strong></div>
        <div class="metric"><span>待复习字</span><strong>${Object.keys(child().wrongbook || {}).length}</strong></div>
      </div>
      <p class="hero-copy">${html(result.advice)}</p>
      <div class="actions">
        <button class="btn primary" data-action="home">回首页</button>
        <button class="btn review" data-action="wrongbook">查看不认识的字</button>
        <button class="btn ghost" data-action="report-gentle">查看轻松摸底报告</button>
        <button class="btn caution" data-action="gentle-new">重新摸底</button>
      </div>
    </section>
  `);
  scrollToTop();
}

function startQuick(forceNew = false) {
  const current = child();
  if (forceNew || !current.quick || current.quick.finished) {
    current.quick = { level: 2, answers: [], usedIds: [], undoStack: [], redoIds: [], milestones: [], currentId: null, finished: false };
  }
  if (!current.quick.undoStack) current.quick.undoStack = [];
  if (!current.quick.redoIds) current.quick.redoIds = [];
  if (!current.quick.milestones) current.quick.milestones = [];
  if (!current.quick.currentId) current.quick.currentId = pickQuick();
  save();
  renderQuick();
}

function pickQuick() {
  const quick = child().quick;
  const used = new Set(quick.usedIds);
  const level = Math.max(1, Math.min(10, quick.level));
  const sameLevel = BANK.filter((item) => item.level === level && !used.has(item.id));
  const pool = sameLevel.length ? sameLevel : BANK.filter((item) => !used.has(item.id));
  return pool[Math.floor(Math.random() * pool.length)]?.id || null;
}

function answerQuick(known) {
  const current = child();
  const quick = current.quick;
  const item = itemById(quick.currentId);
  if (quick.redoIds?.[0] === item.id) quick.redoIds.shift();
  const answer = {
    id: item.id,
    level: item.level,
    known,
    previousLevel: quick.level,
    previousWrongbook: current.wrongbook[item.id] ? { ...current.wrongbook[item.id] } : null,
  };
  quick.answers.push(answer);
  quick.usedIds.push(item.id);
  quick.undoStack.push(answer);
  quick.undoStack = quick.undoStack.slice(-UNDO_LIMIT);
  quick.level = Math.max(1, Math.min(10, quick.level + (known ? 1 : -1)));
  quick.currentId = quick.answers.length >= QUICK_TARGET ? null : quick.redoIds[0] || pickQuick();
  updateWrongbook(item.id, known ? "known" : "unknown", "quick");
  play(known ? "good" : "bad");
  save();
  if (quick.answers.length >= QUICK_TARGET) finishQuick();
  else {
    renderQuick();
    maybeShowQuickMilestone(quick.answers.length);
  }
}

function undoQuick() {
  const quick = child().quick;
  const last = quick?.undoStack?.pop();
  if (!last) return;
  quick.answers = quick.answers.filter((answer) => answer !== last);
  quick.usedIds = quick.usedIds.filter((id) => id !== last.id);
  quick.level = last.previousLevel;
  quick.redoIds = [last.id, ...(quick.redoIds || []).filter((id) => id !== last.id)].slice(0, UNDO_LIMIT);
  quick.currentId = last.id;
  if (last.previousWrongbook) child().wrongbook[last.id] = last.previousWrongbook;
  else delete child().wrongbook[last.id];
  play("undo");
  save();
  renderQuick();
}

function estimateQuick() {
  const quick = child().quick;
  const answers = quick?.answers || [];
  let score = 0;
  let previous = 1;
  for (let level = 1; level <= 10; level += 1) {
    const group = answers.filter((a) => a.level === level);
    const rate = group.length ? group.filter((a) => a.known).length / group.length : previous * 0.78;
    previous = rate;
    score += rate * 250;
  }
  const known = answers.filter((a) => a.known).length;
  const margin = answers.length >= QUICK_TARGET ? 110 : 220;
  return {
    estimated: Math.max(0, Math.min(2500, Math.round(score / 10) * 10)),
    low: Math.max(0, Math.round((score - margin) / 10) * 10),
    high: Math.min(2500, Math.round((score + margin) / 10) * 10),
    known,
    total: answers.length,
  };
}

function finishQuick() {
  const current = child();
  const result = { createdAt: Date.now(), ...estimateQuick() };
  current.quick.finished = true;
  current.quickHistory.unshift(result);
  current.quickHistory = current.quickHistory.slice(0, 10);
  save();
  renderQuickResult(result);
  celebrate("完整估算完成啦！");
}

function maybeShowQuickMilestone(count) {
  const quick = child().quick;
  const milestone = QUICK_MILESTONES[count];
  if (!milestone || quick.milestones?.includes(count)) return;
  quick.milestones = [...(quick.milestones || []), count];
  save();
  play("milestone");
  document.querySelector(".modal-layer")?.remove();
  app.insertAdjacentHTML("beforeend", `
    <div class="modal-layer stage-layer" role="dialog" aria-modal="true" aria-labelledby="stage-title">
      <section class="modal-card stage-card">
        <h2 id="stage-title">${html(milestone.title)}</h2>
        <p>${html(milestone.body)}</p>
        <div class="modal-actions">
          <button class="btn primary" type="button" data-action="stage-continue">继续测评</button>
          <button class="btn ghost" type="button" data-action="stage-rest">休息一下</button>
        </div>
      </section>
    </div>
  `);
}

function renderQuick() {
  screen = "quick";
  setRoute("quick");
  const quick = child().quick;
  const item = itemById(quick.currentId);
  const pct = Math.round((quick.answers.length / QUICK_TARGET) * 100);
  const estimate = estimateQuick();

  app.innerHTML = shell(`
    <section class="test-layout">
      <div class="test-card">
        ${pageNav("完整估算", "暂停并回首页")}
        <div class="test-top">
          <div>
            <h2>完整估算</h2>
            <p class="muted">第 ${quick.answers.length + 1} 题 / ${QUICK_TARGET} 题</p>
          </div>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <div class="hanzi-stage"><div class="hanzi">${html(item.char)}</div></div>
        <div class="judge-row">
          <button class="btn good" data-action="quick-known">认识 <span class="desktop-only">1</span></button>
          <button class="btn bad" data-action="quick-unknown">不认识 <span class="desktop-only">2</span></button>
        </div>
      </div>
      <aside class="stack">
        <section class="card">
          <h3>正在完整估算</h3>
          <div class="progress-number">${quick.answers.length}/${QUICK_TARGET}</div>
          <p>完成 ${QUICK_TARGET} 题后再显示正式结果，孩子累了可以暂停，下次继续。</p>
          <div class="side-actions">
            <button class="btn warn" data-action="quick-undo" ${quick.undoStack.length ? "" : "disabled"}>撤回最近一步</button>
            <button class="btn ghost" data-action="home">暂停并回首页</button>
          </div>
        </section>
        <section class="card">
          <h3>怎么判断</h3>
          <p>孩子能基本读出常见读音，就点“认识”；卡住、猜测或需要提示，就点“不认识”。电脑上可按 1、2、3 操作。</p>
        </section>
      </aside>
    </section>
  `);
}

function renderQuickResult(result) {
  screen = "result";
  setRoute("quick-result");
  app.innerHTML = shell(`
    <section class="result-card">
      <span class="tag">★ 200 题完整估算完成</span>
      <h2>大约认识</h2>
      <div class="big-number">${result.estimated}</div>
      <p class="hero-copy">这是抽样估算，不是逐字精确统计。合理参考范围约为 ${result.low} - ${result.high} 字。</p>
      <div class="metric-grid">
        <div class="metric"><span>完成题数</span><strong>${result.total}</strong></div>
        <div class="metric"><span>判断认识</span><strong>${result.known}</strong></div>
        <div class="metric"><span>认识率</span><strong>${Math.round((result.known / result.total) * 100)}%</strong></div>
      </div>
      <div class="actions">
        <button class="btn primary" data-action="home">回首页</button>
        <button class="btn review" data-action="wrongbook">查看不认识的字</button>
        <button class="btn ghost" data-action="report-quick">查看完整估算报告</button>
        <button class="btn caution" data-action="quick-new">重新估算</button>
      </div>
    </section>
  `);
}

function renderReport(kind = null) {
  screen = "report";
  const summary = currentSummary();
  const hasGentle = Boolean(summary.latestGentle);
  const hasQuick = Boolean(summary.latestQuick);
  const hasGroup = summary.groupAnswered > 0;

  if (kind === "gentle" && !hasGentle) kind = hasQuick ? "quick" : hasGroup ? "group" : "current";
  if (kind === "quick" && !hasQuick) kind = hasGentle ? "gentle" : hasGroup ? "group" : "current";
  if (kind === "group" && !hasGroup) kind = hasGentle ? "gentle" : hasQuick ? "quick" : "current";
  if (!kind) kind = hasGentle ? "gentle" : hasQuick ? "quick" : hasGroup ? "group" : "current";

  activeReportKind = kind;
  setRoute(`report-${kind}`);
  const report = buildReportData(kind, summary);
  app.innerHTML = shell(`
    <section class="result-card report-page">
      ${pageNav("测评报告")}
      ${reportTabsHtml(kind, hasGentle, hasQuick, hasGroup)}
      <h2>${html(report.heading)}</h2>
      <p class="hero-copy">${html(report.intro)}</p>
      <div class="report-preview" id="report-preview">
        <div class="report-card-view ${kind === "group" ? "group-report" : ""} ${kind === "gentle" ? "gentle-report" : ""}">
          <p class="report-brand">儿童识字量测评工具｜书法郭爸团队出品</p>
          <h3>${html(report.cardTitle)}</h3>
          ${reportStageMainHtml(report)}
          <div class="report-metrics">
            ${report.metrics.map(([label, value]) => `<span><small>${html(label)}</small>${html(value)}</span>`).join("")}
          </div>
          ${report.hideCardAdvice ? "" : `<p class="report-advice">${html(report.advice)}</p>`}
          <div class="report-qr-row">
            <img alt="网站二维码" src="${qrImageUrl(SHARE_URL)}" />
            <p>扫码体验<br />儿童识字量测评</p>
          </div>
        </div>
      </div>
      <canvas id="report-canvas" class="report-canvas" width="900" height="1200"></canvas>
      <div id="report-image-panel" class="report-image-panel" hidden>
        <img id="report-image" class="report-image" alt="生成的测评报告图片" />
        <div class="save-tip">
          <strong>长按上方图片保存到相册</strong>
          <span>如果长按没有保存入口<br />再试试浏览器下载</span>
        </div>
      </div>
      <div class="actions report-save-actions">
        <a id="report-download-link" class="btn ghost report-download-secondary" href="#" download hidden>浏览器下载试试</a>
        <button id="report-generate-button" class="btn report-action" data-action="download-report">生成报告图片</button>
        <button class="btn ghost" data-action="home">回首页</button>
      </div>
    </section>
  `);
  drawReportCanvas(kind);
  scrollToTop();
}

function reportStageMainHtml(report) {
  if (!report.stageName) {
    return `
      <div class="report-main-number">${html(report.mainNumber)}</div>
      <p>${html(report.mainLabel)}</p>
    `;
  }

  return `
    <div class="report-stage-main">
      <small>粗略范围</small>
      <strong>${html(report.rangeValue)} 字</strong>
      <span><b>识字阶段</b>${html(report.stageName)}</span>
    </div>
  `;
}

function reportTabsHtml(active, hasGentle, hasQuick, hasGroup) {
  if (!hasGentle && !hasQuick && !hasGroup) return "";
  return `
    <div class="report-tabs" role="tablist" aria-label="报告类型">
      <button class="report-tab ${active === "gentle" ? "active" : ""}" data-action="report-gentle" ${hasGentle ? "" : "disabled"}>轻松摸底</button>
      <button class="report-tab ${active === "quick" ? "active" : ""}" data-action="report-quick" ${hasQuick ? "" : "disabled"}>完整估算</button>
      <button class="report-tab ${active === "group" ? "active" : ""}" data-action="report-group" ${hasGroup ? "" : "disabled"}>逐字闯关</button>
    </div>
  `;
}

function buildReportData(kind, summary) {
  if (kind === "gentle" && summary.latestGentle) {
    return {
      title: "轻松摸底报告",
      heading: `${summary.nickname} 的轻松摸底结果`,
      cardTitle: `${summary.nickname} 的轻松摸底报告`,
      intro: "这份报告来自 50 题轻松摸底，适合低龄或识字量较少的孩子，结果是粗略参考。",
      mainNumber: summary.latestGentle.stageName,
      mainLabel: `粗略范围：${summary.latestGentle.range} 字`,
      stageName: summary.latestGentle.stageName,
      rangeValue: summary.latestGentle.range,
      hideCardAdvice: true,
      metrics: [
        ["完成题数", `${summary.latestGentle.total}/${GENTLE_TARGET}`],
        ["判断认识", `${summary.gentleKnown} 个`],
        ["本次不认识", `${summary.gentleUnknown} 个`],
        ["待复习字", `${summary.wrongCount} 个`],
        ["当前日期", summary.date],
      ],
      advice: summary.latestGentle.refreshedAt
        ? "这份报告已根据后续重测刷新。不认识也没关系，可以把这些字放进日常阅读和亲子游戏里慢慢熟悉。"
        : summary.latestGentle.advice,
    };
  }

  if (kind === "quick" && summary.latestQuick) {
    return {
      title: "完整估算报告",
      heading: `${summary.nickname} 的完整估算结果`,
      cardTitle: `${summary.nickname} 的完整估算报告`,
      intro: "这份报告来自 200 题抽样测评，适合快速了解孩子的大致识字量。",
      mainNumber: String(summary.latestQuick.estimated),
      mainLabel: "大约认识字数",
      metrics: [
        ["参考范围", `${summary.latestQuick.low}-${summary.latestQuick.high} 字`],
        ["完成题数", `${summary.latestQuick.total}/${QUICK_TARGET}`],
        ["本次认识", `${summary.quickKnown} 个`],
        ["本次不认识", `${summary.quickUnknown} 个`],
        ["待复习字", `${summary.wrongCount} 个`],
      ],
      advice: summary.latestQuick.refreshedAt
        ? "这份报告已根据后续重测刷新。建议把“不认识的字”当作后续亲子阅读练习清单。"
        : "建议结合亲子阅读继续观察，也可以先重测“不认识的字”，再刷新报告。",
    };
  }

  if (kind === "group") {
    return {
      title: "逐字闯关报告",
      heading: `${summary.nickname} 的逐字闯关记录`,
      cardTitle: `${summary.nickname} 的逐字闯关报告`,
      intro: "这份报告只统计已经逐字测过的汉字，适合家长长期跟踪。",
      mainNumber: String(summary.groupKnown),
      mainLabel: "已确认认识字数",
      metrics: [
        ["逐字已测", `${summary.groupAnswered}/${BANK.length}`],
        ["已完成小组", `${summary.completedGroups}/${GROUP_COUNT}`],
        ["待复习字", `${summary.wrongCount} 个`],
        ["当前日期", summary.date],
      ],
      advice: "建议继续下一组，或先重测不认识的字。",
    };
  }

  return {
    title: "当前记录",
    heading: `${summary.nickname} 的当前记录`,
    cardTitle: `${summary.nickname} 的当前记录`,
    intro: "目前还没有完成轻松摸底或完整估算，这里先展示已经记录下来的逐字进度。",
    mainNumber: String(summary.groupKnown),
    mainLabel: "已确认认识字数",
    metrics: [
      ["逐字已测", `${summary.groupAnswered}/${BANK.length}`],
      ["已完成小组", `${summary.completedGroups}/${GROUP_COUNT}`],
      ["待复习字", `${summary.wrongCount} 个`],
      ["完整估算", "未完成"],
    ],
    advice: "可以先完成 50 题轻松摸底，或继续完成 200 题完整估算，再生成更完整的报告。",
  };
}

function qrImageUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(url)}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y;
}

async function drawReportCanvas(kind = activeReportKind) {
  const canvas = document.querySelector("#report-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const summary = currentSummary();
  const report = buildReportData(kind, summary);
  const isGroupReport = kind === "group";
  const isGentleReport = kind === "gentle";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = isGentleReport ? "#fff0c4" : isGroupReport ? "#ffe1ec" : "#dff3ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffdf5";
  roundRect(ctx, 54, 54, 792, 1092, 34);
  ctx.fill();
  ctx.strokeStyle = "#25313a";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = "#263238";
  ctx.font = "700 42px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText("识字闯关星球", 100, 130);
  ctx.font = "500 24px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillStyle = "#66717a";
  ctx.fillText("儿童识字量测评工具｜书法郭爸团队出品", 100, 170);

  ctx.fillStyle = "#263238";
  ctx.font = "800 52px PingFang SC, Microsoft YaHei, sans-serif";
  drawWrappedText(ctx, report.cardTitle, 100, 250, 700, 62);

  if (isGentleReport) {
    ctx.fillStyle = "#66717a";
    ctx.font = "800 26px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText("粗略范围", 100, 360);
    ctx.fillStyle = "#378b4d";
    ctx.font = "900 82px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText(`${report.rangeValue || report.mainLabel.replace("粗略范围：", "")} 字`, 100, 440);
    ctx.fillStyle = "#f0ffe9";
    roundRect(ctx, 100, 468, 570, 70, 18);
    ctx.fill();
    ctx.strokeStyle = "#25313a";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#66717a";
    ctx.font = "700 22px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText("识字阶段", 124, 510);
    ctx.fillStyle = "#263238";
    ctx.font = "900 26px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText(String(report.stageName || report.mainNumber), 250, 512);
  } else {
    ctx.fillStyle = isGroupReport ? "#d66a94" : "#2586c4";
    ctx.font = "900 150px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText(String(report.mainNumber), 100, 430);
    ctx.fillStyle = "#263238";
    ctx.font = "700 32px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText(report.mainLabel, 100, 480);
  }

  ctx.font = "700 28px PingFang SC, Microsoft YaHei, sans-serif";
  report.metrics.forEach(([label, value], index) => {
    const x = 100 + (index % 2) * 350;
    const y = 560 + Math.floor(index / 2) * 96;
    ctx.fillStyle = "#fff8e5";
    roundRect(ctx, x, y - 38, 300, 76, 18);
    ctx.fill();
    ctx.strokeStyle = "#25313a";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#66717a";
    ctx.font = "500 22px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText(label, x + 22, y - 10);
    ctx.fillStyle = "#263238";
    ctx.font = "800 28px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText(String(value), x + 22, y + 26);
  });

  if (!report.hideCardAdvice) {
    ctx.fillStyle = "#66717a";
    ctx.font = "500 23px PingFang SC, Microsoft YaHei, sans-serif";
    drawWrappedText(ctx, report.advice, 100, 835, 700, 36);
  }

  try {
    const qr = await loadImage(qrImageUrl(SHARE_URL));
    ctx.drawImage(qr, 100, 910, 180, 180);
  } catch {
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 100, 910, 180, 180, 16);
    ctx.fill();
    ctx.strokeStyle = "#25313a";
    ctx.stroke();
    ctx.fillStyle = "#263238";
    ctx.font = "700 22px PingFang SC, Microsoft YaHei, sans-serif";
    ctx.fillText("扫码入口", 145, 995);
  }
  ctx.fillStyle = "#263238";
  ctx.font = "700 28px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText("扫码体验识字测评", 310, 960);
  ctx.fillStyle = "#66717a";
  ctx.font = "500 22px PingFang SC, Microsoft YaHei, sans-serif";
  drawWrappedText(ctx, SHARE_URL, 310, 1005, 430, 32);
  ctx.fillText(`生成日期：${summary.date}`, 310, 1085);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function downloadReport() {
  drawReportCanvas(activeReportKind).then(() => {
    const canvas = document.querySelector("#report-canvas");
    if (!canvas) return;
    const panel = document.querySelector("#report-image-panel");
    const image = document.querySelector("#report-image");
    const link = document.querySelector("#report-download-link");
    const button = document.querySelector("#report-generate-button");
    const report = buildReportData(activeReportKind, currentSummary());
    try {
      const dataUrl = canvas.toDataURL("image/png");
      if (image) image.src = dataUrl;
      if (link) {
        link.href = dataUrl;
        link.download = `${child().nickname}-${report.title}.png`;
        link.hidden = false;
      }
      if (panel) {
        panel.hidden = false;
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (button) button.hidden = true;
    } catch {
      alert("报告图片生成失败。可以先截图保存，或部署到线上后再试一次。");
    }
  });
}

function celebrate(message = "完成啦！") {
  play("finish");
  document.querySelector(".confetti-layer")?.remove();
  const layer = document.createElement("div");
  const colors = ["#73c7f3", "#9edb8f", "#ffd84d", "#ff8d7a", "#ffc8dc"];
  layer.className = "confetti-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <div class="celebrate-message">${html(message)}</div>
    ${Array.from({ length: 42 }, (_, i) => {
      const left = 6 + Math.random() * 88;
      const delay = Math.random() * 0.45;
      const drift = -60 + Math.random() * 120;
      const color = colors[i % colors.length];
      return `<span style="--left:${left}%; --delay:${delay}s; --drift:${drift}px; --color:${color};"></span>`;
    }).join("")}
  `;
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2200);
}

function renderWrongbook() {
  screen = "wrongbook";
  setRoute("wrongbook");
  const ids = Object.keys(child().wrongbook || {}).map(Number).sort((a, b) => a - b);
  app.innerHTML = shell(`
    <section class="result-card list-page wrongbook-page">
      ${pageNav("不认识的字", "暂停并回首页")}
      <p class="eyebrow">${html(child().nickname)} 的识字记录</p>
      <h2>不认识的字</h2>
      <div class="big-number">${ids.length}</div>
      <p class="hero-copy">这里汇总轻松摸底、完整估算和分组闯关中点过“不认识”的字。它更像后续练习清单，重测时如果点“认识”，会自动从列表移除并刷新记录。</p>
      <div class="actions">
        <button class="btn primary" data-action="wrongbook-review-all" ${ids.length ? "" : "disabled"}>重测这些字</button>
      </div>
      <div class="wrong-grid">
        ${ids.length ? ids.map((id) => wrongTile(id)).join("") : '<p class="muted">暂时没有记录不认识的字。</p>'}
      </div>
    </section>
  `);
  scrollToTop();
}

function wrongTile(id) {
  const item = itemById(id);
  if (!item) return "";
  return `
    <button class="wrong-tile" data-action="wrongbook-review-one" data-id="${id}">
      <strong>${html(item.char)}</strong>
      <span>重测这个字</span>
    </button>
  `;
}

function startWrongReview(ids) {
  const validIds = ids.map(Number).filter((id) => itemById(id));
  if (!validIds.length) return renderWrongbook();
  child().review = { order: validIds, currentOffset: 0, undoStack: [] };
  save();
  renderWrongReview();
}

function answerWrongReview(status) {
  const review = child().review;
  const id = review.order[review.currentOffset];
  const previousWrongbook = child().wrongbook[id] ? { ...child().wrongbook[id] } : null;
  const previousGroupAnswers = Object.entries(child().groups || {})
    .filter(([, group]) => group.answers && Object.prototype.hasOwnProperty.call(group.answers, Number(id)))
    .map(([groupKey, group]) => [groupKey, group.answers[Number(id)]]);
  const previousGentleAnswers = (child().gentle?.answers || [])
    .filter((answer) => answer.id === Number(id))
    .map((answer) => answer.known);
  const previousQuickAnswers = (child().quick?.answers || [])
    .filter((answer) => answer.id === Number(id))
    .map((answer) => answer.known);
  updateWrongbook(id, status, "review");
  updateSavedAnswers(id, status);
  review.undoStack.push({ id, offset: review.currentOffset, previousWrongbook, previousGroupAnswers, previousGentleAnswers, previousQuickAnswers });
  review.undoStack = review.undoStack.slice(-UNDO_LIMIT);
  review.currentOffset += 1;
  play(status === "known" ? "good" : "bad");
  save();
  if (review.currentOffset >= review.order.length) renderWrongbook();
  else renderWrongReview();
}

function undoWrongReview() {
  const review = child().review;
  const last = review?.undoStack?.pop();
  if (!last) return;
  if (last.previousWrongbook) child().wrongbook[last.id] = last.previousWrongbook;
  else delete child().wrongbook[last.id];
  (last.previousGroupAnswers || []).forEach(([groupIndex, status]) => {
    const group = child().groups[groupIndex];
    if (group?.answers) group.answers[last.id] = status;
  });
  if (last.previousGentleAnswers?.length && child().gentle?.answers?.length) {
    let index = 0;
    child().gentle.answers.forEach((answer) => {
      if (answer.id === Number(last.id) && index < last.previousGentleAnswers.length) {
        answer.known = last.previousGentleAnswers[index];
        index += 1;
      }
    });
    if (child().gentle.finished && child().gentleHistory?.length) {
      child().gentleHistory[0] = {
        ...child().gentleHistory[0],
        ...estimateGentle(),
        refreshedAt: Date.now(),
      };
    }
  }
  if (last.previousQuickAnswers?.length && child().quick?.answers?.length) {
    let index = 0;
    child().quick.answers.forEach((answer) => {
      if (answer.id === Number(last.id) && index < last.previousQuickAnswers.length) {
        answer.known = last.previousQuickAnswers[index];
        index += 1;
      }
    });
    if (child().quick.finished && child().quickHistory?.length) {
      child().quickHistory[0] = {
        ...child().quickHistory[0],
        ...estimateQuick(),
        refreshedAt: Date.now(),
      };
    }
  }
  review.currentOffset = last.offset;
  play("undo");
  save();
  renderWrongReview();
}

function renderWrongReview() {
  screen = "wrong-review";
  setRoute("wrong-review");
  const review = child().review;
  const id = review.order[review.currentOffset];
  const item = itemById(id);
  const pct = Math.round((review.currentOffset / review.order.length) * 100);
  app.innerHTML = shell(`
    <section class="test-layout">
      <div class="test-card">
        ${pageNav("不认识的字重测", "暂停并回首页")}
        <div class="test-top">
          <div>
            <h2>不认识的字重测</h2>
            <p class="muted">第 ${review.currentOffset + 1} 题 / ${review.order.length} 题</p>
          </div>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <div class="hanzi-stage"><div class="hanzi">${html(item.char)}</div></div>
        <div class="judge-row">
          <button class="btn good" data-action="wrong-known">认识 <span class="desktop-only">1</span></button>
          <button class="btn bad" data-action="wrong-unknown">不认识 <span class="desktop-only">2</span></button>
        </div>
      </div>
      <aside class="stack">
        <section class="card">
          <h3>重测说明</h3>
          <p>点“认识”后，这个字会从列表移除，并同步刷新已经保存的测评记录；点“不认识”会继续保留。</p>
          <div class="side-actions">
            <button class="btn warn" data-action="wrong-undo" ${review.undoStack.length ? "" : "disabled"}>撤回最近一步</button>
            <button class="btn ghost" data-action="home">暂停并回首页</button>
          </div>
        </section>
      </aside>
    </section>
  `);
}

function addChild() {
  document.querySelector(".modal-layer")?.remove();
  app.insertAdjacentHTML("beforeend", `
    <div class="modal-layer" role="dialog" aria-modal="true" aria-labelledby="add-child-title">
      <form class="modal-card" data-action="confirm-add-child">
        <h2 id="add-child-title">添加孩子</h2>
        <p>输入孩子昵称，之后记录会按孩子分别保存。</p>
        <input id="new-child-name-input" type="text" maxlength="20" placeholder="例如：乐乐、小宇、一年级哥哥" autocomplete="off" />
        <div class="modal-actions">
          <button class="btn primary" type="submit">确认添加</button>
          <button class="btn ghost" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    </div>
  `);
  setTimeout(() => document.querySelector("#new-child-name-input")?.focus(), 0);
}

function closeModal() {
  document.querySelector(".modal-layer")?.remove();
}

function confirmAddChild() {
  const input = document.querySelector("#new-child-name-input");
  const nickname = input?.value?.trim();
  if (!nickname) {
    input?.focus();
    return;
  }
  const next = createChild(nickname.trim().slice(0, 20));
  state.children[next.id] = next;
  state.activeChildId = next.id;
  save();
  closeModal();
  renderHome();
}

function createFirstChild() {
  const input = document.querySelector("#child-name-input");
  const nickname = input?.value?.trim();
  if (!nickname) {
    input?.focus();
    return;
  }
  const next = createChild(nickname.slice(0, 20));
  state.children[next.id] = next;
  state.activeChildId = next.id;
  save();
  renderHome();
}

function switchChild(id) {
  if (!state.children[id]) return;
  state.activeChildId = id;
  save();
  renderHome();
}

function resetChild() {
  if (!confirm(`确定清空“${child().nickname}”的本机记录吗？其他孩子不会受影响。`)) return;
  const current = child();
  state.children[current.id] = { ...createChild(current.nickname), id: current.id };
  save();
  renderHome();
}

function play(type) {
  if (!state.soundOn) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const settings = {
      good: [660, 880, 0.12],
      bad: [260, 220, 0.16],
      finish: [523, 1046, 0.32],
      milestone: [784, 1175, 0.18],
      undo: [420, 360, 0.1],
    }[type] || [440, 440, 0.1];
    osc.type = type === "bad" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(settings[0], now);
    osc.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + settings[2]);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + settings[2] + 0.03);
  } catch {
    // Browsers may block audio until a user gesture; click-triggered playback will work later.
  }
}

function rerenderCurrent() {
  if (screen === "home") renderHome();
  else if (screen === "onboarding") renderOnboarding();
  else if (screen === "guide") renderGuide();
  else if (screen === "group-list") renderGroupList();
  else if (screen === "report") renderReport();
  else if (screen === "gentle") renderGentle();
  else if (screen === "gentle-result") renderGentleResult(child().gentleHistory?.[0] || estimateGentle());
  else if (screen === "quick") renderQuick();
  else if (screen.startsWith("group-")) renderGroupTest(Number(screen.replace("group-", "")));
  else if (screen === "wrongbook") renderWrongbook();
  else if (screen === "wrong-review") renderWrongReview();
  else renderHome();
}

function restoreLastRoute() {
  if (!state.activeChildId || !state.children[state.activeChildId]) return renderOnboarding();
  const route = state.lastRoute || "home";

  if (route === "guide") return renderGuide();
  if (route === "group-list") return renderGroupList();
  if (route === "gentle") {
    const gentle = child().gentle;
    if (gentle?.finished && child().gentleHistory?.[0]) return renderGentleResult(child().gentleHistory[0]);
    if (gentle?.order?.length && gentle.currentOffset < gentle.order.length) return renderGentle();
    return renderHome();
  }
  if (route === "gentle-result") {
    const latestGentle = child().gentleHistory?.[0];
    return latestGentle ? renderGentleResult(latestGentle) : renderHome();
  }
  if (route === "quick") {
    const quick = child().quick;
    if (quick?.finished && child().quickHistory?.[0]) return renderQuickResult(child().quickHistory[0]);
    if (quick?.currentId) return renderQuick();
    return renderHome();
  }
  if (route === "quick-result") {
    const latestQuick = child().quickHistory?.[0];
    return latestQuick ? renderQuickResult(latestQuick) : renderHome();
  }
  if (route === "wrongbook") return renderWrongbook();
  if (route === "wrong-review") {
    const review = child().review;
    if (review?.order?.length && review.currentOffset < review.order.length) return renderWrongReview();
    return renderWrongbook();
  }

  const groupMatch = route.match(/^group-(\d+)$/);
  if (groupMatch) return startGroup(Math.min(Number(groupMatch[1]), GROUP_COUNT - 1));

  const groupResultMatch = route.match(/^group-result-(\d+)$/);
  if (groupResultMatch) return renderGroupResult(Math.min(Number(groupResultMatch[1]), GROUP_COUNT - 1));

  const reportMatch = route.match(/^report-(gentle|quick|group|current)$/);
  if (reportMatch) return renderReport(reportMatch[1]);

  return renderHome();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  save();
  if (state.soundOn) play("good");
  rerenderCurrent();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "back") goBack();
  if (action === "home") renderHome();
  if (action === "guide") renderGuide();
  if (action === "group-list") renderGroupList();
  if (action === "report") renderReport();
  if (action === "report-gentle") renderReport("gentle");
  if (action === "report-quick") renderReport("quick");
  if (action === "report-group") renderReport("group");
  if (action === "download-report") downloadReport();
  if (action === "stage-continue") closeModal();
  if (action === "stage-rest") {
    closeModal();
    renderHome();
  }
  if (action === "toggle-sound") toggleSound();
  if (action === "add-child") addChild();
  if (action === "close-modal") closeModal();
  if (action === "create-first-child") createFirstChild();
  if (action === "reset-child") resetChild();
  if (action === "group-start-next") startNextGroup();
  if (action === "group-start") startGroup(Number(target.dataset.group));
  if (action === "group-known") answerGroup("known");
  if (action === "group-unknown") answerGroup("unknown");
  if (action === "group-undo") undoGroup();
  if (action === "group-next") startGroup(Math.min(Number(target.dataset.group) + 1, GROUP_COUNT - 1));
  if (action === "gentle-start") startGentle();
  if (action === "gentle-new") startGentle(true);
  if (action === "gentle-known") answerGentle(true);
  if (action === "gentle-unknown") answerGentle(false);
  if (action === "gentle-undo") undoGentle();
  if (action === "quick-start") startQuick();
  if (action === "quick-new") startQuick(true);
  if (action === "quick-known") answerQuick(true);
  if (action === "quick-unknown") answerQuick(false);
  if (action === "quick-undo") undoQuick();
  if (action === "wrongbook") renderWrongbook();
  if (action === "wrongbook-review-all") startWrongReview(Object.keys(child().wrongbook || {}));
  if (action === "wrongbook-review-one") startWrongReview([target.dataset.id]);
  if (action === "wrong-known") answerWrongReview("known");
  if (action === "wrong-unknown") answerWrongReview("unknown");
  if (action === "wrong-undo") undoWrongReview();
});

app.addEventListener("submit", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  event.preventDefault();
  const action = target.dataset.action;
  if (action === "confirm-add-child") confirmAddChild();
});

app.addEventListener("change", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  if (target.dataset.action === "switch-child") switchChild(target.value);
});

document.addEventListener("keydown", (event) => {
  const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
  if (screen === "onboarding" && event.key === "Enter") {
    createFirstChild();
  }
  if (document.querySelector(".modal-layer") || typing) return;
  if (screen === "gentle") {
    if (event.key === "1" || event.key === "ArrowLeft") answerGentle(true);
    if (event.key === "2" || event.key === "ArrowRight") answerGentle(false);
    if (event.key === "3" || event.key === "Backspace") undoGentle();
  }
  if (screen === "quick") {
    if (event.key === "1" || event.key === "ArrowLeft") answerQuick(true);
    if (event.key === "2" || event.key === "ArrowRight") answerQuick(false);
    if (event.key === "3" || event.key === "Backspace") undoQuick();
  }
  if (screen.startsWith("group-")) {
    if (event.key === "1" || event.key === "ArrowLeft") answerGroup("known");
    if (event.key === "2" || event.key === "ArrowRight") answerGroup("unknown");
    if (event.key === "3" || event.key === "Backspace") undoGroup();
  }
  if (screen === "wrong-review") {
    if (event.key === "1" || event.key === "ArrowLeft") answerWrongReview("known");
    if (event.key === "2" || event.key === "ArrowRight") answerWrongReview("unknown");
    if (event.key === "3" || event.key === "Backspace") undoWrongReview();
  }
});

if (!BANK.length) {
  app.innerHTML = "<p>字库没有加载成功，请检查 data/hanzi.js。</p>";
} else {
  const groupMatch = location.hash.match(/^#group-(\d+)$/);
  if (groupMatch) startGroup(Math.min(Number(groupMatch[1]), GROUP_COUNT - 1));
  else restoreLastRoute();
}
