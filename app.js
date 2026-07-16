const state = {
  view: "home",
  completed: JSON.parse(localStorage.getItem("tiantai-progress") || "[]"),
  accessMode: localStorage.getItem("tiantai-access") || "",
  activeMission: null,
  answerMission: null
};

const missions = [
  { id:"m1", no:1, date:"7月13日", phase:"线上预热", chapter:"第一幕 · 天之问 · 第1关", title:"谁为此山命名？", place:"线上 · 家庭共同完成", hint:"古人认为这座山峰峦高秀，与天上的“台宿”遥相呼应，留下了“上应台宿”的说法。请找到藏在序章中的两个关键字。", action:"亲子共同阅读序章，讨论“天”与“台”的含义，并提交两个字的口令。", answer:"台宿", open:true, prologue:true },
  { id:"m2", no:2, date:"7月14日", phase:"线上预热", chapter:"第一幕 · 天之问 · 第2关", title:"天上有台，地上何处相应？", place:"线上 · 家庭共同完成", hint:"昨日，我们从星空中找到了“台宿”；今天，请把天上的星宿与地上的山川合在一起。答案是两个最常见的字。", action:"和孩子一起完成“仰观与俯察”小游戏，找到连接星空与山川的两个字。", answer:"天地", answers:["天地","天和地"], open:true, day2:true },
  { id:"m3", no:3, date:"7月15日", phase:"线上预热", chapter:"第一幕 · 天之问 · 第3关", title:"天台匣为何开启？", place:"线上 · 家庭共同完成", hint:"前两关是序章，第3关是揭晓。7月21日抵达天台后，我们用什么收纳一路所得？答案是三个字。", action:"亲子共同回顾前两关，认识守台人、寻台人与天台匣，确认这只真实木匣在十五日解谜中的意义。", answer:"天台匣", open:true, day3:true },
  { id:"m4", no:4, date:"7月16日", phase:"线上预热", chapter:"第二幕 · 地之问 · 第4关", title:"天台山在中国哪里？", place:"线上 · 家庭共同完成", hint:"浙江在中国东南沿海，天台属于浙江东部的<strong class=\"key-green\">浙东</strong>地区。请用两个字说出天台山的位置。", action:"亲子共同观察中国与浙江地图，找到从自己家到天台山的方向和路线。", answer:"浙东", open:true, earthDay:4 },
  { id:"m5", no:5, date:"7月17日", phase:"线上预热", chapter:"第二幕 · 地之问 · 第5关", title:"这片山水有何不同？", place:"线上 · 家庭共同完成", hint:"高山、盆地、飞瀑、丹霞与草木共同组成了天台的自然面貌。请用四个字概括它。", action:"亲子共同寻找山、水、岩、林四类证据，拼出天台山水的客观特征。", answer:"山水神秀", open:false, earthDay:5 },
  { id:"m6", no:6, date:"7月18日", phase:"线上预热", chapter:"第二幕 · 地之问 · 第6关", title:"道门为何选择桐柏？", place:"线上 · 家庭共同完成", hint:"道教把适宜修行、亲近自然的名山胜境称作什么？答案是四个字。", action:"亲子共读葛玄与桐柏宫的故事，观察古人选择修行地时看重的山、水与清静。", answer:"洞天福地", open:false, earthDay:6 },
  { id:"m7", no:7, date:"7月19日", phase:"线上预热", chapter:"第二幕 · 地之问 · 第7关", title:"文人为何向天台而来？", place:"线上 · 家庭共同完成", hint:"无数诗人循水路入剡、过天姥、登天台，这条文化道路叫什么？答案是四个字。", action:"亲子选择一位来过或向往天台的文人，读一句诗文，寻找他眼中的天台。", answer:"唐诗之路", open:false, earthDay:7 },
  { id:"m8", no:8, date:"7月20日", phase:"线上预热", chapter:"第二幕 · 地之问 · 第8关", title:"佛门为何扎根天台？", place:"线上 · 家庭共同完成", hint:"智顗在天台山建立的中国化佛教宗派，以山为名。它叫什么？答案是三个字。", action:"亲子共同查看天台寺院示意图，认识国清寺与天台宗的主要人物和传播路线。", answer:"天台宗", open:false, earthDay:8 },
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
  const visibleMissions = isGuest ? missions.slice(0,8) : missions;
  app.innerHTML = `
    <section class="mission-header map-intro">
      <p class="eyebrow">中国文化之旅 · 编号 021</p>
      <h2>天台十五日秘境图</h2>
      <p class="muted">7月13日，第一封谜笺将在云端开启。接下来的十五天，线索会从屏幕走入山水；直到7月27日，所有答案将在天台完成归档。</p>
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
  const locked=!visible || !m.open;
  const lockedNote=!visible ? "7月21日起为线下实景游学任务" : "剧情封印中";
  return `<button class="quest-node node-${index+1} ${done?"done":locked?"locked":"open"}" type="button" aria-label="${m.date} ${m.title}" ${locked?`data-note="${lockedNote}"`:`data-open-mission="${m.id}"`}></button>`;
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

function day2HTML(){
  return `
    <div class="prologue-panel day2-panel">
      <div class="day2-cover">
        <p class="eyebrow">守台人的第二封信</p>
        <h3>天上有台，地上何处相应？</h3>
        <button class="audio-guide" type="button" data-audio="day2" data-player="day2Audio" data-audio-title="郭爸讲第二关" data-audio-src="assets/day2.mp3">
          <img src="assets/guoba-portrait.jpg" alt="书法郭爸">
          <span><strong>郭爸讲第二关</strong><small>点击收听 · 音频待上传</small><i class="audio-progress"><em></em></i></span>
          <b>▶</b>
        </button>
        <audio id="day2Audio" src="assets/day2.mp3" preload="none"></audio>
      </div>

      <div class="opening-poem day2-poem" aria-label="第二关定场诗">
        <div class="poem-line">${poemChar("纵","ze")}${poemChar("目","ru")}${poemChar("星","ping")}${poemChar("河","ping")}${poemChar("万","ze")}${poemChar("象","ze")}${poemChar("深","ping")}<span class="poem-punct">，</span></div>
        <div class="poem-line">${poemChar("徐","ping")}${poemChar("看","ping")}${poemChar("丘","ping")}${poemChar("壑","ru")}${poemChar("寄","ze")}${poemChar("幽","ping")}${poemChar("寻","ping")}<span class="poem-punct">。</span></div>
        <div class="poem-line">${poemChar("欲","ru")}${poemChar("知","ping")}${poemChar("台","ping")}${poemChar("岳","ze")}${poemChar("源","ping")}${poemChar("流","ping")}${poemChar("处","ze")}<span class="poem-punct">，</span></div>
        <div class="poem-line">${poemChar("胜","ze")}${poemChar("境","ze")}${poemChar("风","ping")}${poemChar("光","ping")}${poemChar("自","ze")}${poemChar("古","ze")}${poemChar("临","ping")}<span class="poem-punct">。</span></div>
      </div>

      <div class="guardian-letter">
        <img class="tie-line-seal" src="assets/守台.png" alt="守台印">
        <p class="letter-kicker">致新任寻台人：</p>
        <p>昨日，你们从古人的星空中找到了“台宿”，也找到了天台山名字里的第一把钥匙。</p>
        <p>但只抬头看天，还不能真正找到天台。</p>
        <p>古人仰望日月星辰，也俯身观察山川草木。他们相信，天上的星宿有自己的位置，地上的山河也有自己的秩序；天上的“台宿”与地上的“天台山”，便在这样的想象中遥遥相应。</p>
        <p>今天，请你们观察下面两幅小卷：先跟着小书童抬头望天，再跟着他低头看地。看看天上有什么、地上有什么，再把“上面的世界”和“下面的世界”各用一个最常见的字说出来。</p>
        <p class="letter-sign">——守台人</p>
      </div>

      <section class="two-realms" aria-label="天与地的对应线索">
        <article class="realm-card realm-sky">
          <div class="scroll-rod" aria-hidden="true"></div>
          <div class="celestial-icons" aria-hidden="true"><span class="sun">☀</span><span class="moon">☾</span><span class="star star-one">✦</span><span class="star star-two">✧</span><span class="star star-three">·</span></div>
          <div class="realm-copy"><p class="eyebrow">向上看</p><h4>日月星辰</h4><p>北斗、二十八宿、台宿，都在我们仰望的方向。</p><div class="realm-clues"><span>星空</span><span>台宿</span><span>日月</span></div></div>
          <img class="little-scholar scholar-up" src="assets/小孩向上看.png" alt="抬头仰望的小书童">
        </article>
        <div class="realm-link" aria-hidden="true"><svg viewBox="0 0 90 104"><path d="M45 5V99"/><path d="M29 21L45 5l16 16M29 83l16 16 16-16"/></svg><span>遥遥相应</span></div>
        <article class="realm-card realm-earth">
          <div class="scroll-rod" aria-hidden="true"></div>
          <svg class="earth-landscape" viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden="true"><path class="far-mountain" d="M0 98Q45 42 93 92Q133 24 190 91Q240 39 285 89Q322 55 360 88V150H0Z"/><path class="near-mountain" d="M0 119Q61 77 111 112Q173 63 224 113Q289 70 360 111V150H0Z"/><path class="water" d="M0 125Q68 112 139 128T280 127T360 126V150H0Z"/></svg>
          <div class="realm-copy"><p class="eyebrow">向下看</p><h4>山川草木</h4><p>天台山、石梁飞瀑、桐柏草木，都在我们行走的地方。</p><div class="realm-clues"><span>山川</span><span>天台</span><span>草木</span></div></div>
          <img class="little-scholar scholar-down" src="assets/小孩向下看.png" alt="低头俯察的小书童">
        </article>
      </section>

      <div class="pairing-board" aria-label="星空与山川配对">
        <h4>把两幅小卷连起来</h4>
        <div class="pair-row"><span>天上有星宿</span><b>⇄</b><span>地上有山川</span></div>
        <div class="pair-row"><span>天上有台宿</span><b>⇄</b><span>地上有天台山</span></div>
        <div class="pair-row"><span>仰观</span><b>⇄</b><span>俯察</span></div>
        <p>一个字在上，一个字在下；合在一起，就是今天的口令。</p>
        <div class="answer-slots" aria-label="两个字的答案"><span>?</span><span>?</span></div>
      </div>

      <div class="knowledge-box">
        <h4>给家长的文化线索</h4>
        <ul>
          <li>古人常把仰观天文与俯察地理放在一起理解世界。</li>
          <li>“上应台宿”是一种传统文化解释，体现了星宿与山川相互映照的观念。</li>
          <li>这并不是现代天文学结论，而是古人观察自然、建立秩序的一种文化想象。</li>
        </ul>
      </div>

      <div class="family-task day2-task">
        <h4>亲子小任务｜一分钟仰观与俯察</h4>
        <p><strong>第一步：</strong>和孩子一起走到窗边或户外，先抬头，说出三样“上面”的事物。</p>
        <p><strong>第二步：</strong>再低头或看向远处，说出三样“大地上”的事物。</p>
        <p><strong>第三步：</strong>回到上面的两幅小卷，找出那两个最常见的字，作为今日口令。</p>
      </div>

      <div class="day2-question">
        <p class="eyebrow">第二关 · 最终谜题</p>
        <h4>什么能够同时装下星辰与山川？</h4>
        <p>请输入两个字。答案就在“向上看”和“向下看”之间。</p>
      </div>
    </div>`;
}

function day3HTML(){
  return `
    <div class="prologue-panel day3-panel">
      <div class="day3-cover">
        <img class="tiantai-cover-pattern" src="assets/天台山水塔影底纹.png" alt="" aria-hidden="true">
        <p class="eyebrow">守台人的第三封信</p>
        <h3><span class="tiantai-box-name">天台匣</span>为何开启？</h3>
        <p class="cover-subtitle">前两日的答案，原来都在同一个故事里</p>
        <button class="audio-guide" type="button" data-audio="day3" data-player="day3Audio" data-audio-title="郭爸讲第3关" data-audio-src="assets/day3.mp3">
          <img src="assets/guoba-portrait.jpg" alt="书法郭爸">
          <span><strong>郭爸讲第3关</strong><small>点击收听</small><i class="audio-progress"><em></em></i></span>
          <b>▶</b>
        </button>
        <audio id="day3Audio" src="assets/day3.mp3" preload="none"></audio>
      </div>

      <section class="story-reveal" aria-label="十五日故事揭幕">
        <p class="reveal-label">第三日 · 故事揭幕</p>
        <h4>原来，我们从第一天起<br>就已经进入了同一个谜局</h4>
        <div class="reveal-line" aria-hidden="true"><span></span><b>✦</b><span></span></div>
        <p class="reveal-intro">守台人的信，引导我们用十五日寻找答案：</p>
        <blockquote>为什么两千年来，无数诗人、行者、僧人和道者，都不约而同地来到天台？</blockquote>
        <p>我们将在星空中得到山名，在山水中寻找证据，在历史中遇见来者，最后亲手完成一座微缩天台，并找到自己心中的“心台”。</p>
      </section>

      <section class="day3-module recap-module">
        <div class="module-heading"><span>01</span><div><h4>前情回顾</h4></div></div>
        <div class="recap-clues">
          <article><span class="clue-day">第1日</span><b>台宿</b><p>从古人的星空中，找到天台山名的第一枚线索。</p></article>
          <div class="recap-arrow">＋</div>
          <article><span class="clue-day">第2日</span><b>天地</b><p>发现天上的星宿与地上的山川，可以遥遥相应。</p></article>
        </div>
        <p class="recap-conclusion">这两条线索不是两个孤立的答案，它们正一前一后，推开同一只<span class="tiantai-box-name">“天台匣”</span>。</p>
        <figure class="tiantai-box-figure"><img src="assets/天台匣草图.png" alt="打开的天台匣草图，匣盖绘有星空，匣中放置山石、草木与收集瓶"><figcaption>这只匣子将从线上故事，一步步来到我们手中</figcaption></figure>
      </section>

      <section class="guardian-invitation">
        <img class="day3-seal" src="assets/守台.png" alt="守台印">
        <p class="letter-kicker">致新任寻台人：</p>
        <p>第三封信终于到了。</p>
        <p>前两日，你们从星空中找到了“台宿”，又从一上一下之间找到了“天地”。可是，你们可曾想过——我为什么要让你们寻找这些答案？</p>
        <p>相传，守台人世代守护着一只<span class="tiantai-box-name">“天台匣”</span>。匣中保存着关于天台的三个答案：<strong>天为什么选择这里，地为什么养育这里，人为什么不断来到这里。</strong></p>
        <p>这些答案从来不是写在一张纸上的。它们藏在日月星辰里，藏在山川草木里，也藏在两千年来无数来者留下的诗文、足迹与故事里。只有亲自仰望星空、走进山水、追寻来者、收集证据的人，才能让<span class="tiantai-box-name">“天台匣”</span>逐渐完整。</p>
        <p>7月13日，你们收到第一封信，成为新一代“寻台人”。前八天，你们将在云端寻找方向；7月21日抵达天台后，你们将领取实体木匣，把线上得到的答案，一件件装进现实世界。</p>
        <p>到7月27日，<span class="tiantai-box-name">“天台匣”</span>完成时，你们才能回答整场游戏的总谜题。</p>
        <p class="letter-sign">——守台人</p>
      </section>

      <section class="day3-module progress-module">
        <div class="module-heading"><span>02</span><div><h4><span class="tiantai-box-name">天台匣</span>进度</h4></div></div>
        <div class="box-progress" aria-label="天台匣三问进度">
          <article class="current"><i>天</i><div><b>天之问</b><small>第3关 · 即将完成</small></div><strong>100%</strong></article>
          <article><i>地</i><div><b>地之问</b><small>尚未开启</small></div><strong>0%</strong></article>
          <article><i>人</i><div><b>人之问</b><small>尚未开启</small></div><strong>0%</strong></article>
        </div>
        <div class="archive-count"><span>已归匣</span><b>2</b><em>/ 15 条线索</em></div>
      </section>

      <section class="day3-module question-module">
        <div class="module-heading"><span>03</span><div><h4>今日追问</h4></div></div>
        <p class="big-question">7月21日，我们用什么收纳一路所得？</p>
        <p>前两关找到方向，第三封信揭晓线索的归处。</p>
        <div class="box-purpose-clues" aria-label="天台匣的三个作用">
          <article><span>从线上到实景</span><b>抵达天台后领取真实木匣</b></article>
          <article><span>从答案到证据</span><b>装入山水草木与一路所得</b></article>
          <article><span>从天台到心台</span><b>完成微缩天台，回答谜题</b></article>
        </div>
        <div class="box-name-riddle"><small>它以我们要去的山为名，是贯穿十五天的核心信物</small><div class="three-answer-slots" aria-label="三个字的答案"><span>？</span><span>？</span><span>？</span></div></div>
        <p class="answer-nudge">答案就在守台人的第三封信和上面的木匣草图中。</p>
      </section>

      <section class="family-task day3-task">
        <h4>亲子小任务｜共读行程手册，准备行李</h4>
        <div class="handbook-task-content">
          <img src="assets/天台山行程手册透明底.png" alt="天台山行程手册示意图">
          <ul>
            <li><strong>行程安排</strong><span>看看每天要去哪里、做什么。</span></li>
            <li><strong>行程约定</strong><span>一起约好照顾自己、配合团队。</span></li>
            <li><strong>行李准备</strong><span>对照清单，逐一装好所需物品。</span></li>
          </ul>
        </div>
      </section>

      <section class="day3-module archive-module">
        <div class="module-heading"><span>04</span><div><h4>线索归匣</h4></div></div>
        <div class="archive-preview">
          <span class="archive-star">✦</span>
          <p>答对口令后，“天之问”的第三条线索将归入<span class="tiantai-box-name on-dark">“天台匣”</span>。</p>
        </div>
        <p class="next-letter">下一封信将带你们低头看向大地：<strong>天台的山水，为什么能成为草木生长、清泉汇聚的福地？</strong></p>
      </section>

      <div class="day3-final-question">
        <p class="eyebrow">第3关 · 天台匣揭晓</p>
        <h4>我们将用什么收纳一路所得？</h4>
      </div>
    </div>`;
}

function poemChar(char,tone){
  return `<span class="poem-char tone-${tone}"><span class="word">${char}</span><span class="tone-mark" aria-hidden="true"></span></span>`;
}

function renderAccessGate(){
  app.innerHTML = `<section class="access-gate"><div class="access-inner"><p class="eyebrow">进入秘境</p><h2>请选择你的身份</h2><p class="access-lead"><span>欢迎体验7月13日至20日的线上行前内容；</span><span>已报名学员可输入活动码，进入线上线下完整任务。</span></p><div class="access-options"><button class="access-card guest" data-access="guest"><span>体验线上行前内容</span><small>免注册 · 7月13日至20日开放</small></button><button class="access-card official" data-show-code><span>我是正式学员</span><small>输入活动码 · 进入完整游学任务</small></button></div><div class="code-panel hidden"><input id="accessCodeInput" placeholder="请输入活动码"><button class="primary-button" data-verify-code>进入完整秘境</button><p class="feedback" id="accessFeedback"></p></div></div></section>`;
}

function guestUnlockHTML(){
  return `<article class="unlock-card"><h3>期待与你共赴天台</h3><p>线上解谜将通过故事与线索，带我们提前学习天台文化的必备资料；线下则真正走进山水、寺观与古迹，在实景中寻找证据、完成任务。线上与线下彼此照应，才是一场完整的天台文化之旅。若时间允许，期待你加入线下游学，共同体验天台文化与实景解谜的魅力。7月21日起的线下联动任务将在报名后开放。</p><div class="tag-row"><span class="tag">七天六晚</span><span class="tag">实景解谜系列道具</span><span class="tag">亲子实景解谜</span></div><button class="primary-button guest-consult-button" data-note="报名咨询：微信同号18801128162，幼幼老师">报名咨询（微信同号18801128162，幼幼老师）</button></article>`;
}

const earthDayContent={
  4:{
    cover:"沿着中国地图，寻找天台坐标",subtitle:"从自己的家出发，找到我们即将抵达的那一座山",progress:"20%",answer:"浙东",next:"明日继续观察：同在浙东，天台山水为什么与众不同？",
    recap:`前三关，我们找到台宿、连接天地，并开启“天台匣”。现在，请把目光落到真正的中国地图上。`,
    question:"从大中国到小天台，要向哪里寻找？",
    body:`<div class="character-opening"><div class="story-image character-strip"><img class="auto-story-image" src="assets/day4-character.png" alt="脉与山篆书图片" onload="this.parentElement.classList.add('has-image')" onerror="this.hidden=true"></div><p>山，地面上由土石构成的隆起部分。脉，本义血管。是长的，有分支的，有高低起伏的。山一般是指独立的、高起的山。山脉则是指有分支的、绵延起伏的群山组。</p></div>
      <div class="location-story illustrated-location-story"><article><div class="story-copy"><i>1</i><div><b>先找中国的东南沿海</b><p>沿着中国东边的海岸寻找，我们会先找到浙江省。</p></div></div><div class="story-image"><img class="auto-story-image" src="assets/day4-china-map.png" alt="中国东南沿海位置图" onload="this.parentElement.classList.add('has-image')" onerror="this.hidden=true"></div></article><article><div class="story-copy"><i>2</i><div><b>再看浙江的东部</b><p>天台属于浙东地区，位于台州市的西北部。</p></div></div><div class="story-image"><img class="auto-story-image" src="assets/day4-zhejiang-map.png" alt="浙江东部位置图" onload="this.parentElement.classList.add('has-image')" onerror="this.hidden=true"></div></article><article><div class="story-copy"><i>3</i><div><b>最后找到天台山</b><p>它所在的天台山脉，是浙东丘陵山地的一部分。</p></div></div><div class="story-image"><img class="auto-story-image" src="assets/day4-tiantai-map.png" alt="天台山位置图" onload="this.parentElement.classList.add('has-image')" onerror="this.hidden=true"></div></article><article class="location-answer"><div class="story-copy"><i>✓</i><div><b>两个字记住它</b><p>浙江之东，简称“<strong class="key-green">浙东</strong>”。以后别人问天台在哪里，我们就能清楚回答。</p></div></div><div class="story-image"><img class="auto-story-image" src="assets/day4-zhedong-map.png" alt="浙东位置总结图" onload="this.parentElement.classList.add('has-image')" onerror="this.hidden=true"></div></article></div>`,
    task:`<div class="route-task-copy"><span>请家长和孩子一起在地图上找到自己家与天台，查一查两地相距大约多少公里。再找一张A6大小的纸（约为A4纸的四分之一），画出准备乘坐汽车、火车或飞机前往天台的路线。7月21日领取游学手册后，可以把它贴进手册里。</span></div><div class="image-placeholder route-map-placeholder"><img class="auto-story-image" src="assets/day4-route-task.png" alt="我家到天台路线示意图" onload="this.parentElement.classList.add('has-image')" onerror="this.hidden=true"></div>`
  },
  5:{
    cover:"山、水、岩、林，谁塑造了天台？",subtitle:"先看自然留下的证据，再听古人如何解释",progress:"40%",answer:"山水神秀",next:"下一封信将走进桐柏：道教为什么把名山胜境称为“洞天福地”？",
    recap:`昨日，我们确认天台位于浙东丘陵山地，也是三大水系的分水区域。位置找到了，新的问题随之出现：这里的山水究竟特别在哪里？`,
    question:"是什么让天台成为一座“有层次”的山？",
    body:`<div class="landscape-layers"><div class="layer-sky">云与雨</div><div class="layer-peak">华顶高山</div><div class="layer-water">溪涧飞瀑</div><div class="layer-rock">赤城丹霞</div></div>
      <div class="evidence-grid"><article><b>山有层次</b><p>低山、丘陵、河谷盆地与高峰相接，行走中能感到不断抬升和转折。</p></article><article><b>水会落差</b><p>充沛降水沿山谷汇流，遇到陡崖形成石梁飞瀑、天台山大瀑布等水景。</p></article><article><b>岩有颜色</b><p>赤城山以红色岩壁和洞穴著称，是天台辨识度很高的丹霞景观。</p></article><article><b>草木丰茂</b><p>海拔、坡向和湿润气候共同形成多样生境，古人也因此关注这里的茶与药草。</p></article></div>
      <p class="fact-note">这一关只观察自然本身。“洞天福地”将在下一关作为道教的文化解释正式出现。</p>`,
    task:"和孩子各选“山、水、岩、林”中的一种，画下它可能留下的自然证据。"
  },
  6:{
    cover:"葛玄为何来到桐柏山？",subtitle:"一座宫观的选址，藏着古人理解自然的方法",progress:"60%",answer:"洞天福地",next:"明日换一种目光：诗人、学者与旅行家为什么也不断走向天台？",
    recap:`我们先找到天台的地理坐标，又看见高山、溪瀑、丹霞与草木。自然条件并不会自己说话；不同的人，会用不同的思想理解它。`,
    question:"道教如何把自然山水变成修行之地？",
    body:`<div class="tongbai-scene"><span>九峰环抱</span><span>溪瀑相随</span><span>林木清幽</span><strong>桐柏宫</strong></div>
      <div class="timeline-cards"><article><b>三国吴赤乌年间</b><p>地方志记载葛玄曾在桐柏一带结庐、建法轮院与天台观，留下早期道教活动的故事。</p></article><article><b>唐宋以后</b><p>桐柏宫藏经、修道传统不断发展，后来又成为道教南宗祖庭的重要象征。</p></article><article><b>1958—1960</b><p>因修建桐柏水库，旧宫逐渐沉入水下，道众迁往鸣鹤观；1983年更名为桐柏宫。</p></article><article><b>今天</b><p>新的桐柏宫延续道教文化，也让我们看见一处圣地如何随时代迁移、重建。</p></article></div>
      <div class="idea-strip"><b>道法自然</b><span>不是征服山水，而是在山水的节律中安顿身心。</span></div>`,
    task:"闭眼安静一分钟，记录你听见的三种声音。想一想：安静为什么也能成为一种学习？"
  },
  7:{
    cover:"为什么诗路走向天台？",subtitle:"有人为山水而来，有人为访友求道而来，也有人为寻找自己而来",progress:"80%",answer:"唐诗之路",next:"明日进入佛门山水：为什么天台山中会出现如此密集的寺院与道场？",
    recap:`道教把天台看作适合修行的名山。可是来到这里的并不只有道者：诗人、士大夫、书家与旅行家，也把脚步和文字留在山中。`,
    question:"文人来到天台，究竟在寻找什么？",
    body:`<div class="poetry-route"><span>钱塘江</span><i>→</i><span>曹娥江</span><i>→</i><span>剡溪</span><i>→</i><span>天姥</span><i>→</i><b>天台</b></div>
      <div class="traveler-scroll"><article><b>孟浩然</b><p>“欲寻华顶去，不惮恶溪名。”远路与险阻，反而让寻访更有意义。</p></article><article><b>李白</b><p>赤城、华顶和沧海进入诗中，天台成为他寄托自由想象的精神高地。</p></article><article><b>朱熹</b><p>山水不仅可游，也可观物、读书、访贤，在行走中体会天地与人的关系。</p></article><article><b>徐霞客</b><p>两游天台并以天台篇开启《徐霞客游记》，用亲历、观察和记录验证山川。</p></article></div>
      <p class="fact-note">“浙东唐诗之路”不是一条笔直道路，而是一张由水路、山路、诗篇与人物共同连接的文化网络。</p>`,
    task:"从四位来者中选一位，说出：如果和他同行，你最想问他什么？"
  },
  8:{
    cover:"佛门为何扎根天台？",subtitle:"从一张寺院图，寻找中国化佛教的一条重要道路",progress:"100%",answer:"天台宗",next:"“地之问”完成。下一幕，我们将追随历代来者，回答“人为什么不断来到这里”。",
    recap:`五日以来，我们从地理位置走进自然山水，又看见道者与文人如何理解天台。今天，守台人让我们寻找山中另一组密集的坐标：寺院。`,
    question:"为什么一个佛教宗派，会以一座山命名？",
    body:`<div class="temple-map" aria-label="天台山主要佛教寺院示意图"><span class="tm-peak">华顶讲寺<small>现存</small></span><span class="tm-fang">方广寺<small>现存·石梁</small></span><span class="tm-gao">高明寺<small>现存·佛陇</small></span><span class="tm-ta">智者塔院<small>现存</small></span><span class="tm-guo">国清寺<small>祖庭</small></span><span class="tm-wan">万年寺<small>现存</small></span><span class="tm-xiu">修禅寺<small>历史遗址</small></span></div>
      <div class="lineage"><span>慧文</span><i>→</i><span>慧思</span><i>→</i><b>智顗</b><i>→</i><span>灌顶</span><i>→</i><span>湛然</span><i>→</i><span>道邃·行满</span><i>→</i><span>最澄赴日</span></div>
      <div class="evidence-grid"><article><b>为什么在山中？</b><p>幽静环境有利于禅观、讲学和共同生活；山路又把不同道场连接起来。</p></article><article><b>为什么叫天台宗？</b><p>智顗在天台山长期修学、讲说并建立体系，后人遂以其根本道场所在地命名。</p></article><article><b>国清寺从何而来？</b><p>智顗生前规划寺院，圆寂后由晋王杨广依其遗愿营建，成为天台宗根本道场。</p></article><article><b>如何走向海外？</b><p>唐代日本僧最澄来天台求法，归国后开创日本天台宗，天台由此成为跨海祖庭。</p></article></div>`,
    task:"在寺院图上找出国清寺、佛陇、石梁和华顶，选择你最想实地寻找的一处。"
  }
};

function earthDayHTML(m){
  const c=earthDayContent[m.earthDay];
  const completedBefore=Math.max(m.no-1,state.completed.filter(id=>Number(id.slice(1))<m.no).length);
  const earthPercent=(m.no-3)*20;
  return `<div class="earth-day-panel prologue-panel">
    <div class="earth-cover"><p>守台人的第${m.no}封信</p><h3>${c.cover}</h3><span>${c.subtitle}</span><button class="audio-guide" type="button" data-audio data-player="day${m.no}Audio" data-audio-src="assets/day${m.no}.mp3" data-audio-title="郭爸讲第${m.no}关"><img src="assets/guoba-portrait.jpg" alt="书法郭爸"><span><strong>郭爸讲第${m.no}关</strong><small>点击收听 · 音频待上传</small><i class="audio-progress"><em></em></i></span><b>▶</b></button><audio id="day${m.no}Audio" preload="metadata" src="assets/day${m.no}.mp3"></audio></div>
    <section class="day3-module earth-module recap-module"><div class="module-heading"><span>01</span><div><h4>前情回顾</h4></div></div><p>${c.recap}</p></section>
    <section class="day3-module earth-module progress-module"><div class="module-heading"><span>02</span><div><h4><span class="tiantai-box-name">天台匣</span>进度</h4></div></div><div class="box-progress" aria-label="天台匣三问进度"><article><i>天</i><div><b>天之问</b><small>第3/3关 · 已完成</small></div><strong>100%</strong></article><article class="current"><i>地</i><div><b>地之问</b><small>第${m.no-3}/5关 · 正在寻找</small></div><strong>${earthPercent}%</strong></article><article><i>人</i><div><b>人之问</b><small>尚未开启</small></div><strong>0%</strong></article></div><div class="archive-count"><span>已归匣</span><b>${completedBefore}</b><em>/ 15 条线索</em></div></section>
    <section class="day3-module earth-module question-module"><div class="module-heading"><span>03</span><div><h4>今日追问</h4></div></div><h5>${c.question}</h5>${c.body}<div class="earth-answer"><small>${m.no===4?"如果用两个字描述天台山的位置，你会用哪两个字？":"把今天找到的词写入口令"}</small>${[...c.answer].map(()=>"<span>？</span>").join("")}</div></section>
    <section class="family-task day3-task earth-family-task"><h4>${m.no===4?'亲子小任务｜画一张“我家到天台”的路线图':'亲子小任务'}</h4>${m.no===4?c.task:`<p>${c.task}</p>`}</section>
    <section class="day3-module earth-module archive-module"><div class="module-heading"><span>04</span><div><h4>线索归匣</h4></div></div><div class="archive-preview"><p>答对口令后，第${m.no}条线索将归入<span class="tiantai-box-name on-dark">“天台匣”</span>。</p></div><p class="next-letter"><strong>${c.next}</strong></p></section>
  </div>`;
}

function missionHTML(m){
  const done=state.completed.includes(m.id); const available=m.open || done;
  const specialContent=m.prologue?prologueHTML():m.day2?day2HTML():m.day3?day3HTML():m.earthDay?earthDayHTML(m):`<p class="mission-action"><strong>家庭行动：</strong>${m.action}</p><div class="clue-image">【任务图片占位符】</div>`;
  return `<article class="mission ${done?"done":available?"active":""} ${m.prologue||m.day2||m.day3||m.earthDay?"prologue-mission":""}"><div class="mission-top"><div><p class="eyebrow">${m.chapter}</p><h3>${m.title}</h3></div><span class="mission-state">${done?"已完成":available?"可调查":"剧情封印"}</span></div><p>地点：${m.place}</p><p>${m.hint}</p>${specialContent}${m.prologue?`<p class="mission-action"><strong>家庭行动：</strong>${m.action}</p>`:""}${done?'<button class="secondary-button" disabled>解谜成功，线索已归档</button>':available?`<button class="primary-button answer-button" data-id="${m.id}">输入答案</button>`:'<button class="secondary-button" disabled>等待领队解锁</button>'}</article>`
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
  const audio=e.target.closest("[data-audio]"); if(audio){const small=audio.querySelector("small");const icon=audio.querySelector("b");const bar=audio.querySelector(".audio-progress em");const player=document.querySelector(`#${audio.dataset.player||"prologueAudio"}`);const title=audio.dataset.audioTitle||"郭爸讲解";const src=audio.dataset.audioSrc||"assets/prologue.mp3";if(player){player.ontimeupdate=()=>{if(bar&&player.duration)bar.style.width=Math.min(100,player.currentTime/player.duration*100)+"%"};player.onended=()=>{audio.classList.remove("playing");if(icon)icon.textContent="▶";if(small)small.textContent="播放完成 · 再听一遍";if(bar)bar.style.width="0%"};if(!player.paused){player.pause();audio.classList.remove("playing");if(small)small.textContent="已暂停 · 再点继续播放";if(icon)icon.textContent="▶";return}player.play().then(()=>{audio.classList.add("playing");if(small)small.textContent=`正在播放${title} · 点击暂停`;if(icon)icon.textContent="Ⅱ"}).catch(()=>{if(small){small.textContent=`音频待上传：${src}`;setTimeout(()=>{small.textContent="点击收听 · 音频待上传"},1800)}})}return}
  const access=e.target.closest("[data-access]"); if(access){state.accessMode=access.dataset.access;localStorage.setItem("tiantai-access",state.accessMode);state.activeMission=null;render();return}
  if(e.target.closest("[data-show-code]")){document.querySelector(".code-panel")?.classList.remove("hidden");document.querySelector("#accessCodeInput")?.focus();return}
  if(e.target.closest("[data-verify-code]")){const code=document.querySelector("#accessCodeInput")?.value.trim().toUpperCase();const msg=document.querySelector("#accessFeedback");if(code==="TT2026"){state.accessMode="official";localStorage.setItem("tiantai-access","official");render()}else if(msg){msg.textContent="活动码暂时对不上，请向领队确认。"}return}
  if(e.target.closest("[data-reset-access]")){state.accessMode="";state.activeMission=null;localStorage.removeItem("tiantai-access");render();return}
  if(e.target.closest("[data-enter]")){state.view="journey";state.activeMission=null;render();return}
  const openMission=e.target.closest("[data-open-mission]"); if(openMission){state.activeMission=openMission.dataset.openMission;render();return}
  const answer=e.target.closest(".answer-button"); if(answer){state.answerMission=missions.find(m=>m.id===answer.dataset.id);const form=document.querySelector("#answerForm");const submitButton=form.querySelector("button[type='submit']");document.querySelector("#dialogTitle").textContent=state.answerMission.title;document.querySelector("#dialogHint").textContent="提示："+state.answerMission.hint;input.value="";input.disabled=false;feedback.textContent="";form.classList.remove("answer-correct","answer-wrong");form.dataset.answerState="";submitButton.textContent="验证线索";dialog.showModal();input.focus()}
});

document.querySelector("#answerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const submitButton=form.querySelector("button[type='submit']");
  if(form.dataset.answerState==="correct"){
    if(!state.completed.includes(state.answerMission.id))state.completed.push(state.answerMission.id);
    localStorage.setItem("tiantai-progress",JSON.stringify(state.completed));
    dialog.close();
    state.answerMission=null;
    render();
    return;
  }
  const value=input.value.trim().replace(/\s/g,"");
  const validAnswers=(state.answerMission.answers||[state.answerMission.answer]).map(answer=>answer.replace(/\s/g,""));
  if(validAnswers.includes(value)){
    form.classList.remove("answer-wrong");
    form.classList.add("answer-correct");
    form.dataset.answerState="correct";
    feedback.textContent=`🎉 恭喜你，答对了！第 ${state.answerMission.no} 条线索已经成功破解。`;
    input.disabled=true;
    submitButton.textContent="收下线索并归档";
  }else{
    form.classList.remove("answer-correct");
    form.classList.add("answer-wrong");
    form.dataset.answerState="wrong";
    feedback.textContent="很遗憾，答案还差一点，请继续探索。";
  }
});
input.addEventListener("input",()=>{
  const form=document.querySelector("#answerForm");
  if(form.dataset.answerState!=="wrong")return;
  form.classList.remove("answer-wrong");
  form.dataset.answerState="";
  feedback.textContent="";
});
document.querySelector(".dialog-close").addEventListener("click",()=>{
  dialog.close();
  state.answerMission=null;
});
back.addEventListener("click",()=>{
  if(state.view==="journey"&&state.activeMission){state.activeMission=null;render();return}
  if(state.view==="journey"){state.view="culture";render();return}
  if(state.view==="culture"||state.view==="literacy"||state.view==="profile"){state.view="home";state.activeMission=null;render();return}
  state.view="home";state.activeMission=null;render();
});
render();
