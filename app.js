const state = {
  view: "home",
  completed: JSON.parse(localStorage.getItem("tiantai-progress") || "[]"),
  accessMode: localStorage.getItem("tiantai-access") || "",
  activeMission: null,
  answerMission: null
};

const missions = [
  { id:"m1", no:1, date:"7月13日", phase:"线上预热", chapter:"序章 · 天外来信", title:"谁为此山命名？", place:"线上 · 家庭共同完成", hint:"古人认为这座山峰峦高秀，与天上的“台宿”遥相呼应，留下了“上应台宿”的说法。请找到藏在序章中的两个关键字。", action:"亲子共同阅读序章，讨论“天”与“台”的含义，并提交两个字的口令。", answer:"台宿", open:true, prologue:true },
  { id:"m2", no:2, date:"7月14日", phase:"线上预热", chapter:"序章 · 家庭报到", title:"写下我们的出发心愿", place:"线上 · 微信群", hint:"解开地名后，每个家庭将领取一枚“寻心印”。", action:"录制20秒家庭出发宣言：我们是谁、为什么出发、最想在天台找到什么。", answer:"寻心", open:false },
  { id:"m3", no:3, date:"7月15日", phase:"线上预热", chapter:"序章 · 天台初识", title:"在地图上找到天台", place:"线上 · 家庭共同完成", hint:"出发前，先把天台放进中国文化的地图里。", action:"和孩子一起查找天台山、国清寺、石梁飞瀑、桐柏宫的位置，并在旅行手账上画出第一张路线草图。", answer:"天台", open:false },
  { id:"m4", no:4, date:"7月16日", phase:"线上预热", chapter:"序章 · 唐诗之路", title:"诗人为什么向东南走？", place:"线上 · 家庭共同完成", hint:"天台是浙东唐诗之路的重要终点。", action:"任选一位到过天台的诗人，读一首相关诗歌，写下一个你最想现场验证的画面。", answer:"诗路", open:false },
  { id:"m5", no:5, date:"7月17日", phase:"线上预热", chapter:"序章 · 霞客之志", title:"徐霞客为什么出发？", place:"线上 · 家庭共同完成", hint:"第二天的山水壮游，将以徐霞客为主线。", action:"亲子共读徐霞客相关小故事，写下“我愿意坚持寻找的一个答案”。", answer:"志行", open:false },
  { id:"m6", no:6, date:"7月18日", phase:"线上预热", chapter:"序章 · 和合之门", title:"儒释道为什么都来这里？", place:"线上 · 家庭共同完成", hint:"天台不只是一座山，也是诗、佛、道相会的地方。", action:"用三句话分别写下你理解的诗、佛、道，并想一想它们为什么会在天台相遇。", answer:"和合", open:false },
  { id:"m7", no:7, date:"7月19日", phase:"线上预热", chapter:"序章 · 材料包预备", title:"给未来的自己写一封信", place:"线上 · 家庭共同完成", hint:"真正的材料包将在现场发放，但第一件材料可以从家里开始。", action:"写一封给7月27日自己的短信：希望这次天台之行结束时，我收获了什么？", answer:"初心", open:false },
  { id:"m8", no:8, date:"7月20日", phase:"线上预热", chapter:"序章 · 启程前夜", title:"三十人即将会师", place:"线上 · 微信群", hint:"明天，线上线索将落到真实山水里。", action:"整理行李、准备手账，在群里发送一张“启程照片”和一句出发口号。", answer:"会师", open:false },
  { id:"m9", no:9, date:"7月21日", phase:"现场第一日", chapter:"第一日 · 会合", title:"三十人的第一张地图", place:"圣爱安养院", hint:"四支小队将在开营仪式中首次会合。", action:"认识队友、确定队名与队印，完成家庭和小队身份卡。", answer:"开营", open:false },
  { id:"m10", no:10, date:"7月22日", phase:"现场第二日", chapter:"第二日 · 霞客之路", title:"把脚步写成答案", place:"石梁景区", hint:"沿着徐霞客的文字与摩崖石刻，从金溪翠谷走向石梁飞瀑。", action:"完成沿途观察、吟诵、拓字与霞客精神任务。", answer:"志行", open:false },
  { id:"m11", no:11, date:"7月23日", phase:"现场第三日", chapter:"第三日 · 以笔入山", title:"把摩崖带回纸上", place:"圣爱安养院", hint:"山上的大字，将在今天成为每个人的作品。", action:"完成摩崖大字、诗文小字、吟诵与夜间展览。", answer:"笔墨", open:false },
  { id:"m12", no:12, date:"7月24日", phase:"现场第四日", chapter:"第四日 · 道法自然", title:"一草一木皆有名", place:"桐柏宫 · 紫凝山", hint:"寻找植物、制作标本，也寻找人与自然相处的方法。", action:"完成药材观察、手写标签、经折装与经典吟诵。", answer:"自然", open:false },
  { id:"m13", no:13, date:"7月25日", phase:"现场第五日", chapter:"第五日 · 诗从瀑布来", title:"诗人眼中的水", place:"天台山大瀑布", hint:"从真实的水声、光线和高度中，找回唐诗的现场。", action:"观察瀑布并完成一页诗画旅行日记。", answer:"诗路", open:false },
  { id:"m14", no:14, date:"7月26日", phase:"现场第六日", chapter:"第六日 · 和合之门", title:"国清三贤留下的答案", place:"国清寺", hint:"寒山、拾得、丰干、济公与历代书家，在这里留下不同的足迹。", action:"完成建筑、匾额、碑刻与和合故事任务。", answer:"和合", open:false },
  { id:"m15", no:15, date:"7月27日", phase:"现场第七日", chapter:"第七日 · 归来", title:"我们找到的天台", place:"圣爱安养院", hint:"把六天的作品、标本、日记与故事合在一起。", action:"小队布展、个人分享、互赠照片并写下纪念册留言。", answer:"心台", open:false }
];

const pastTours = [
  {no:"020",name:"绍兴游学"},{no:"019",name:"徽州游学"},{no:"018",name:"西安游学"},
  {no:"017",name:"景德镇游学 2"},{no:"016",name:"景德镇游学 1"},
  ...Array.from({length:15},(_,i)=>({no:String(15-i).padStart(3,"0"),name:"北京游学"}))
];

const app = document.querySelector("#app");
const back = document.querySelector(".back-button");
const dialog = document.querySelector("#answerDialog");
const input = document.querySelector("#answerInput");
const feedback = document.querySelector("#answerFeedback");
const phoneTime = document.querySelector("#phoneTime");
phoneTime.textContent = new Intl.DateTimeFormat("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());

function getFamilyCode(){
  let code = localStorage.getItem("tiantai-family-code");
  if(!code){
    const seed = Math.floor(1000 + Math.random() * 9000);
    code = `天台-${seed}号`;
    localStorage.setItem("tiantai-family-code", code);
  }
  return code;
}

function renderHome(){
  app.innerHTML = `
    <section class="poster-home" aria-label="书法郭爸共学社群主页">
      <img class="poster-home-image" src="assets/guoba-homepage-poster-v2.png" alt="书法郭爸共学社群主页：一棵从中国文化土壤里长出来的书法树">
      <button class="poster-hotspot hotspot-poetry" type="button" data-note="网页更新中……" aria-label="进入诗文吟诵"></button>
      <button class="poster-hotspot hotspot-classic" type="button" data-note="网页更新中……" aria-label="进入经典吟诵"></button>
      <button class="poster-hotspot hotspot-etymology" type="button" data-note="网页更新中……" aria-label="进入字源解经"></button>
      <button class="poster-hotspot hotspot-culture" type="button" data-nav="culture" aria-label="进入文化之旅"></button>
      <button class="poster-hotspot hotspot-partner" type="button" data-note="网页更新中……" aria-label="进入机构合作"></button>
      <button class="poster-hotspot hotspot-hardpen" type="button" data-note="网页更新中……" aria-label="进入硬笔写字"></button>
      <button class="poster-hotspot hotspot-softpen" type="button" data-note="网页更新中……" aria-label="进入软笔书法"></button>
      <a class="poster-hotspot hotspot-literacy" href="literacy/index.html" aria-label="进入字源识字"></a>
      <p class="tree-note" aria-live="polite"></p>
      <div class="poster-toast" aria-live="polite"></div>
    </section>`;
}

function renderLiteracy(){
  app.innerHTML = `
    <section class="mission-header">
      <p class="eyebrow">书法郭爸共学社群</p>
      <h2>字源识字</h2>
      <p class="muted">这里先作为“识字星球 / 字源识字”的二级入口。后续可以接入已有识字星球页面、课程卡片、任务和学习记录。</p>
      <button class="primary-button" data-note="识字星球内容正在接入中。">进入识字星球</button>
    </section>
    <article class="game-card"><div class="game-body"><h3>识字星球</h3><p>汉字启蒙 × 字源解经 × 亲子共学</p><div class="tag-row"><span class="tag">二级页面占位</span><span class="tag">可继续扩展</span></div></div></article>`;
}

function renderCulture(){
  app.innerHTML = `
    <section class="hero" id="cultureHome">
      <div class="status-ribbon hero-ribbon">正在进行</div>
      <div class="hero-topline">
        <img class="hero-avatar" src="assets/guoba-portrait.jpg" alt="书法郭爸">
        <div>
          <div class="series-badge">编号 021</div>
          <p class="eyebrow">书法郭爸共学社群 · 文化之旅</p>
        </div>
      </div>
      <h2>浙江天台山游学</h2>
      <p>一封跨越千年的来信，将三十位同行者引向云雾深处。答案不只藏在屏幕里，也藏在即将启程的山水之间。</p>
      <div class="tag-row"><span class="tag">亲子协作</span><span class="tag">线上序章</span><span class="tag">实景终章</span></div>
      <button class="primary-button" data-enter="tiantai">进入秘境</button>
    </section>
    <div class="archive-heading"><span>往期文化之旅</span><small>已全部完结</small></div>
    <section class="archive-list">${pastTours.map(tour=>`<article class="archive-card" aria-disabled="true"><span class="archive-no">${tour.no}</span><div><h3>${tour.name}</h3><p>书法郭爸-中国文化之旅</p></div><span class="finished-mark">已完结</span></article>`).join("")}</section>`;
}

function renderJourney(){
  if(!state.accessMode){
    renderAccessGate();
    return;
  }
  if(state.activeMission){
    const mission = missions.find(m=>m.id===state.activeMission) || missions[0];
    app.innerHTML = missionHTML(mission);
    return;
  }
  renderMissionMap();
}

function renderMissionMap(){
  const done = state.completed.length;
  const isGuest = state.accessMode === "guest";
  const visibleMissions = isGuest ? missions.slice(0,3) : missions;
  app.innerHTML = `
    <section class="mission-header map-intro">
      <p class="eyebrow">中国文化之旅 · 编号 021</p>
      <h2>${isGuest ? "体验秘境" : "天台十五日秘境图"}</h2>
      <p class="muted">${isGuest ? "你正在体验开放关卡。正式报名后，可解锁从7月13日至7月27日的完整十五关。" : "7月13日，第一封谜笺将在云端开启。接下来的十五天，线索会从屏幕走入山水；直到7月27日，所有答案将在天台完成归档。"}</p>
      <div class="progress-track"><div class="progress-fill" style="width:${done/missions.length*100}%"></div></div>
      <small>${done} / ${missions.length} 条线索已归档</small>
      <div class="access-switch"><span>${isGuest ? "体验游客模式" : "正式学员模式"}</span><button class="secondary-button" data-reset-access>切换身份</button></div>
    </section>
    <section class="quest-map" aria-label="天台十五日秘境图">
      <img class="quest-map-image" src="assets/tiantai-15-map.png" alt="天台十五日秘境图">
      ${missions.map((m,i)=>mapNodeHTML(m,i,visibleMissions.some(v=>v.id===m.id))).join("")}
    </section>
    ${isGuest ? guestUnlockHTML() : ""}`;
}

function mapNodeHTML(m,index,visible){
  const done=state.completed.includes(m.id);
  const locked=!visible;
  return `<button class="quest-node node-${index+1} ${done?"done":locked?"locked":"open"}" type="button" aria-label="${m.date} ${m.title}" ${locked?'data-note="正式报名后解锁完整十五关"':`data-open-mission="${m.id}"`}></button>`;
}

function prologueHTML(){
  return `
    <div class="prologue-panel">
      <div class="prologue-cover">
        <p class="eyebrow">序章 · 星宿落人间</p>
        <h3>谁为此山命名？</h3>
        <button class="audio-guide" type="button" data-audio="prologue">
          <img src="assets/guoba-portrait.jpg" alt="书法郭爸">
          <span><strong>郭爸讲序章</strong><small>点击收听 · 音频待上传</small><i class="audio-progress"><em></em></i></span>
          <b>▶</b>
        </button>
        <audio id="prologueAudio" src="assets/prologue.mp3" preload="none"></audio>
      </div>
      <div class="opening-poem" aria-label="序章定场诗">
        <div class="poem-line">
          ${poemChar("凝","ping")}${poemChar("观","ping")}${poemChar("星","ping")}${poemChar("斗","ze")}${poemChar("问","ze")}${poemChar("山","ping")}${poemChar("名","ping")}<span class="poem-punct">，</span>
        </div>
        <div class="poem-line">
          ${poemChar("俯","ze")}${poemChar("入","ru")}${poemChar("烟","ping")}${poemChar("霞","ping")}${poemChar("访","ze")}${poemChar("古","ze")}${poemChar("城","ping")}<span class="poem-punct">。</span>
        </div>
        <div class="poem-line">
          ${poemChar("莫","ru")}${poemChar("作","ru")}${poemChar("寻","ping")}${poemChar("常","ping")}${poemChar("游","ping")}${poemChar("赏","ze")}${poemChar("看","ping")}<span class="poem-punct">，</span>
        </div>
        <div class="poem-line">
          ${poemChar("书","ping")}${poemChar("声","ping")}${poemChar("足","ru")}${poemChar("迹","ru")}${poemChar("共","ze")}${poemChar("文","ping")}${poemChar("程","ping")}<span class="poem-punct">。</span>
        </div>
      </div>
      <div class="prologue-story">
        <p>话说天地初分，清浊既判。古人仰观天象，俯察山川，见日月有行，星辰有位，便知人间万事，并非孤零零地散在大地上。</p>
        <p>于是他们把天上的星空分为三垣二十八宿：紫微垣居中，象征天上宫阙；太微垣列位，象征朝廷礼法；天市垣如市，象征万物会聚。星辰在天，各有名号；山河在地，也有回应。</p>
        <p>这便是古人所说的“天人相应”。天上有星宿，地上有州郡山川；天上有秩序，地上也有礼乐文章。山不只是山，水不只是水，一处地名，常常藏着古人理解世界的方式。</p>
        <p>天台山之名，正与这种观念相连。南朝陶弘景《真诰》中说：“天台山高一万八千丈，周回八百里，有八重，四面如一，当斗牛之分，上应台宿，故名天台。”这一段文字，正把天台山放进了古人的星空秩序里。</p>
        <p>所以，所谓“台”，不是平常桌台之台，而是星官之台、天阶之台；所谓“天”，也不只是头顶的天空，而是古人仰望星辰时建立起来的文化秩序。山川在地，星宿在天，一处地名，便像一枚暗号，把天文、地理和文化记忆连在一起。</p>
        <p>所以，我们此行的第一道谜题，不在石梁飞瀑，不在国清古刹，也不在唐诗碑刻，而在一个名字里：为什么这里叫“天台”？</p>
      </div>
      <div class="sky-map-card" aria-label="古人眼中的天空示意图" style="padding:15px;border-radius:20px;background:linear-gradient(180deg,#173f30,#eef5ea);border:1px solid #d5e1d6;box-shadow:0 12px 26px rgba(38,76,52,.14);overflow:hidden;">
        <div class="sky-map-title" style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:12px;color:#fff;">
          <span>古人眼中的天空</span>
          <small>三垣 · 二十八宿 · 天人相应</small>
        </div>
        <svg class="sky-map-svg" viewBox="0 0 320 230" role="img" aria-label="三垣二十八宿与天台山关系示意图" style="display:block;width:100%;height:auto;border-radius:18px;background:radial-gradient(circle at 50% 42%,rgba(255,232,139,.2),transparent 13%),radial-gradient(circle at 50% 42%,rgba(92,163,126,.22),transparent 38%),#0d2c25;border:1px solid rgba(255,255,255,.18);">
          <circle cx="160" cy="88" r="78" fill="none" stroke="rgba(240,246,210,.45)" stroke-width="1.5" stroke-dasharray="4 5"/>
          <circle cx="160" cy="88" r="52" fill="none" stroke="rgba(240,246,210,.5)" stroke-width="1"/>
          <circle cx="160" cy="88" r="28" fill="rgba(250,231,142,.16)" stroke="rgba(250,231,142,.55)" stroke-width="1"/>
          <g fill="#f7df7a">
            <circle cx="58" cy="54" r="2.3"/><circle cx="266" cy="50" r="2"/><circle cx="96" cy="154" r="2"/><circle cx="258" cy="126" r="2.2"/><circle cx="160" cy="28" r="2"/>
          </g>
          <text x="160" y="28" text-anchor="middle" fill="#fff8d6" font-size="13" font-weight="700">二十八宿</text>
          <text x="160" y="83" text-anchor="middle" fill="#fff8d6" font-size="14" font-weight="700">紫微垣</text>
          <text x="160" y="101" text-anchor="middle" fill="#dce8d5" font-size="10">天上宫阙</text>
          <text x="70" y="96" text-anchor="middle" fill="#fff8d6" font-size="13" font-weight="700">太微垣</text>
          <text x="70" y="113" text-anchor="middle" fill="#dce8d5" font-size="10">朝廷礼法</text>
          <text x="250" y="96" text-anchor="middle" fill="#fff8d6" font-size="13" font-weight="700">天市垣</text>
          <text x="250" y="113" text-anchor="middle" fill="#dce8d5" font-size="10">万物会聚</text>
          <rect x="210" y="51" width="72" height="25" rx="12" fill="rgba(131,182,60,.35)" stroke="rgba(255,255,220,.34)"/>
          <text x="246" y="68" text-anchor="middle" fill="#fffbd0" font-size="12" font-weight="700">台宿 / 三台</text>
          <path d="M230 77 C218 104, 196 134, 173 172" fill="none" stroke="#f4dd75" stroke-width="2" stroke-dasharray="5 5"/>
          <rect x="112" y="176" width="96" height="34" rx="17" fill="rgba(255,255,245,.92)"/>
          <text x="160" y="198" text-anchor="middle" fill="#154232" font-size="18" font-weight="900" font-family="Songti SC, STSong, serif">天台山</text>
        </svg>
        <div class="sky-map-tabs" style="display:grid;gap:8px;margin-top:10px;">
          <details open style="border-radius:14px;background:rgba(255,255,249,.82);border:1px solid #d4e1d4;padding:9px 11px;"><summary>什么是三垣？</summary><p>三垣是古人理解北方星空的重要区域，可粗略理解为天上的宫城、朝廷与市集。</p></details>
          <details style="border-radius:14px;background:rgba(255,255,249,.82);border:1px solid #d4e1d4;padding:9px 11px;"><summary>什么是二十八宿？</summary><p>二十八宿像一圈星空坐标，帮助古人观测日月运行，也进入了历法、地理和文学。</p></details>
          <details style="border-radius:14px;background:rgba(255,255,249,.82);border:1px solid #d4e1d4;padding:9px 11px;"><summary>为什么连到天台？</summary><p>旧说天台山“上应台宿”，正体现了古人把天上星宿与地上山川互相映照的观看方式。</p></details>
        </div>
      </div>
      <div class="knowledge-box">
        <h4>给家长的知识线索</h4>
        <ul>
          <li>古代中国天文学不只是观星，也参与了礼制、地理、历法与文化想象的建立。</li>
          <li>“三垣二十八宿”是传统星官体系的重要结构，古人常用它理解天上的秩序。</li>
          <li>“上应台宿”的说法，把天台山与天上的“台宿”联系起来，体现了天文与地理相互映照的观念。</li>
        </ul>
      </div>
      <div class="family-task">
        <h4>亲子小任务</h4>
        <p>请和孩子一起写下三个字：<strong>天、台、山</strong>。再问孩子两个问题：这里的“天”只是天空吗？这里的“台”又藏着什么星辰线索？</p>
      </div>
    </div>`;
}

function poemChar(char,tone){
  return `<span class="poem-char tone-${tone}"><span class="word">${char}</span><span class="tone-mark" aria-hidden="true"></span></span>`;
}

function renderAccessGate(){
  app.innerHTML = `<section class="access-gate"><div class="access-inner"><p class="eyebrow">进入秘境</p><h2>请选择你的身份</h2><p class="access-lead"><span>如果你还在了解天台山游学，可以先免费体验几关；</span><span>如果你已经报名缴费，请输入活动码解锁完整任务。</span></p><div class="access-options"><button class="access-card guest" data-access="guest"><span>先体验几关</span><small>免注册 · 免费体验 · 感受玩法</small></button><button class="access-card official" data-show-code><span>我是正式学员</span><small>输入活动码 · 解锁全部关卡</small></button></div><div class="code-panel hidden"><input id="accessCodeInput" placeholder="请输入活动码"><button class="primary-button" data-verify-code>解锁完整秘境</button><p class="feedback" id="accessFeedback"></p></div></div></section>`;
}

function guestUnlockHTML(){
  return `<article class="unlock-card"><h3>完整秘境等待解锁</h3><p>你已经进入天台秘境的第一层。正式报名后，将解锁 7 月 13 日线上预热、7 月 21 日起线上线下双线任务、线下材料包和完整结营线索。</p><div class="tag-row"><span class="tag">七天六晚</span><span class="tag">材料包任务</span><span class="tag">亲子实景解谜</span></div><button class="primary-button" data-note="请联系书法郭爸咨询报名，正式学员可获得活动码。">咨询报名 / 解锁完整任务</button></article>`;
}

function missionHTML(m){
  const done=state.completed.includes(m.id); const available=m.open || done;
  return `<article class="mission ${done?"done":available?"active":""} ${m.prologue?"prologue-mission":""}"><div class="mission-top"><div><p class="eyebrow">${m.chapter}</p><h3>${m.title}</h3></div><span class="mission-state">${done?"已完成":available?"可调查":"剧情封印"}</span></div><p>地点：${m.place}</p><p>${m.hint}</p>${m.prologue?prologueHTML():`<p class="mission-action"><strong>家庭行动：</strong>${m.action}</p><div class="clue-image">【任务图片占位符】</div>`}${m.prologue?`<p class="mission-action"><strong>家庭行动：</strong>${m.action}</p>`:""}${done?'<button class="secondary-button" disabled>线索已归档</button>':available?`<button class="primary-button answer-button" data-id="${m.id}">输入答案</button>`:'<button class="secondary-button" disabled>等待领队解锁</button>'}</article>`
}

function renderProfile(){
  const familyCode = getFamilyCode();
  app.innerHTML=`<section class="mission-header"><p class="eyebrow">调查员档案</p><h2>我的旅程</h2><p class="muted">我的代码：${familyCode}</p></section><div class="empty-card"><h2>${state.completed.length}</h2><p>已破解线索</p><p>更新中</p></div>`;
}

function render(){
  document.body.classList.toggle("portal-view",state.view==="home");
  back.classList.toggle("hidden",state.view==="home");
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.view));
  if(state.view==="home")renderHome(); else if(state.view==="culture")renderCulture(); else if(state.view==="literacy")renderLiteracy(); else if(state.view==="journey")renderJourney(); else renderProfile();
  app.scrollTo({top:0,behavior:"auto"});
}

document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-nav]"); if(nav){state.view=nav.dataset.nav;state.activeMission=null;render();return}
  const scrollTarget=e.target.closest("[data-scroll]"); if(scrollTarget){document.querySelector("#"+scrollTarget.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"});return}
  const note=e.target.closest("[data-note]"); if(note){const noteText=note.dataset.note;const toast=document.querySelector(".poster-toast");const noteBox=document.querySelector(".tree-note"); if(toast){toast.textContent=noteText;toast.classList.add("show");setTimeout(()=>{if(toast.textContent===noteText)toast.classList.remove("show")},1800)}else if(noteBox){noteBox.textContent=noteText;setTimeout(()=>{if(noteBox.textContent===noteText)noteBox.textContent=""},2600)}else{let mini=document.querySelector(".mini-toast");if(!mini){mini=document.createElement("div");mini.className="mini-toast";document.body.appendChild(mini)}mini.textContent=noteText;mini.classList.add("show");setTimeout(()=>mini.classList.remove("show"),1800)}return}
  const audio=e.target.closest("[data-audio]"); if(audio){const small=audio.querySelector("small");const icon=audio.querySelector("b");const bar=audio.querySelector(".audio-progress em");const player=document.querySelector("#prologueAudio");if(player){player.ontimeupdate=()=>{if(bar&&player.duration)bar.style.width=Math.min(100,player.currentTime/player.duration*100)+"%"};player.onended=()=>{audio.classList.remove("playing");if(icon)icon.textContent="▶";if(small)small.textContent="播放完成 · 再听一遍";if(bar)bar.style.width="0%"};if(!player.paused){player.pause();audio.classList.remove("playing");if(small)small.textContent="已暂停 · 再点继续播放";if(icon)icon.textContent="▶";return}player.play().then(()=>{audio.classList.add("playing");if(small)small.textContent="正在播放郭爸讲解 · 点击暂停";if(icon)icon.textContent="Ⅱ"}).catch(()=>{if(small){small.textContent="音频待上传：assets/prologue.mp3";setTimeout(()=>{small.textContent="点击收听 · 音频待上传"},1800)}})}return}
  const access=e.target.closest("[data-access]"); if(access){state.accessMode=access.dataset.access;localStorage.setItem("tiantai-access",state.accessMode);state.activeMission=null;render();return}
  if(e.target.closest("[data-show-code]")){document.querySelector(".code-panel")?.classList.remove("hidden");document.querySelector("#accessCodeInput")?.focus();return}
  if(e.target.closest("[data-verify-code]")){const code=document.querySelector("#accessCodeInput")?.value.trim().toUpperCase();const msg=document.querySelector("#accessFeedback");if(code==="TT2026"){state.accessMode="official";localStorage.setItem("tiantai-access","official");render()}else if(msg){msg.textContent="活动码暂时对不上，请向领队确认。"}return}
  if(e.target.closest("[data-reset-access]")){state.accessMode="";state.activeMission=null;localStorage.removeItem("tiantai-access");render();return}
  if(e.target.closest("[data-enter]")){state.view="journey";state.activeMission=null;render();return}
  const openMission=e.target.closest("[data-open-mission]"); if(openMission){state.activeMission=openMission.dataset.openMission;render();return}
  const answer=e.target.closest(".answer-button"); if(answer){state.answerMission=missions.find(m=>m.id===answer.dataset.id);document.querySelector("#dialogTitle").textContent=state.answerMission.title;document.querySelector("#dialogHint").textContent="提示："+state.answerMission.hint;input.value="";feedback.textContent="";dialog.showModal();input.focus()}
});

document.querySelector("#answerForm").addEventListener("submit",e=>{
  e.preventDefault(); const value=input.value.trim().replace(/\s/g,"");
  if(value===state.answerMission.answer){if(!state.completed.includes(state.answerMission.id))state.completed.push(state.answerMission.id);localStorage.setItem("tiantai-progress",JSON.stringify(state.completed));feedback.textContent="验证成功，线索已归档。";setTimeout(()=>{dialog.close();render()},700)}else{feedback.textContent="这条线索还对不上，再观察一下。"}
});
back.addEventListener("click",()=>{
  if(state.view==="journey"&&state.activeMission){state.activeMission=null;render();return}
  if(state.view==="journey"){state.view="culture";render();return}
  if(state.view==="culture"||state.view==="literacy"||state.view==="profile"){state.view="home";state.activeMission=null;render();return}
  state.view="home";state.activeMission=null;render();
});
render();
