/* =========================================================================
 * 1. SEED DATA & 24 OFFLINE SCRIPTS
 * ========================================================================= */
const EMOTION_LABELS = {
  strict_nod: '🧐 嚴肅點頭', strict_frown: '😠 嚴厲皺眉', trust_smile: '🙂 安心微笑',
  calm_support: '☕ 冷靜支持', blush_warm: '💗 溫暖心動', gentle_encourage: '✨ 溫柔鼓勵',
  relieved_sigh: '😮‍💨 鬆了口氣', anxious_point: '😰 焦慮求助', happy_wink: '😉 開心眨眼',
  helpful_smile: '🌱 耐心提醒', affectionate_glow: '💖 溫柔包容', warm_support: '🤗 並肩陪伴',
  hostess_smile: '😊 元氣營業', flustered_wave: '😵‍💫 手忙腳亂', playful_grin: '😆 活潑打趣',
  teasing_poke: '😜 俏皮捉弄', heartfelt_blush: '💓 真情告白', caring_look: '🌟 專注傾聽',
  stoic_nod: '😐 沉穩認可', stern_glare: '😤 嚴厲警告', excited_explain: '🔥 熱血講解',
  focused_coach: '🔧 專注指導', devoted_blush: '💘 核心託付', steady_trust: '🛡️ 堅定信任'
};

const SECTORS = {
  farm: {
    id: 'farm', name: '生態農場', heroine: '蘇曉', lang: 'Python', prism: 'python',
    mode: 'runtime', modeLabel: 'runtime [L1/L2/L3 真實評估]',
    badgeClass: 'bg-emerald-950 border-emerald-600 text-emerald-300',
    location: '生態農場 · 第 2 號蓄水井排灌區', metaphor: '條件分支異常 · 乾旱警報',
    file: 'sprinkler_controller.py',
    starter: `# 目標：當土壤濕度 moisture < 40 時回傳並印出 "SPRINKLER_ON"，否則 "SPRINKLER_OFF"\ndef evaluate_sprinkler(moisture):\n    if moisture > 40:\n        return "SPRINKLER_ON"\n    return "SPRINKLER_OFF"\n\nprint(evaluate_sprinkler(18))`,
    hints: [
      ['方向提示', '請檢查 if 條件式的比較運算符號方向，目前是「大於 40」才開水閥。'],
      ['關鍵概念', '題目要求土壤濕度「小於 40」時開啟水閥，應使用 < 運算子。'],
      ['結構提示', '將第 3 行的 if moisture > 40: 修改為小於 40 的條件判斷即可通過邊界測資。']
    ],
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full fill-current text-emerald-400"><circle cx="50" cy="35" r="22" opacity="0.9"/><path d="M22 88 C22 65, 35 58, 50 58 C65 58, 78 65, 78 88 Z" opacity="0.85"/><path d="M38 28 Q50 15 62 28 Q50 35 38 28 Z" fill="#34d399"/></svg>`
  },
  market: {
    id: 'market', name: '海濱市集', heroine: '夏海', lang: 'JavaScript', prism: 'javascript',
    mode: 'runtime', modeLabel: 'runtime [Web Worker 隔離執行]',
    badgeClass: 'bg-sky-950 border-sky-600 text-sky-300',
    location: '海濱市集 · 漁產批發收銀台', metaphor: '事件佇列溢出 · 缺少防抖',
    file: 'cashier_debounce.js',
    starter: `// 目標：連續呼叫 safeCheckout() 時，應清除前次計時器，僅執行最後一次\nfunction createDebounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    // 請補上清除計時器邏輯\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n\nlet count = 0;\nconst safeCheckout = createDebounce(() => { count++; console.log("CHECKOUT_PROCESSED"); }, 50);\nsafeCheckout(); safeCheckout(); safeCheckout();`,
    hints: [
      ['方向提示', '在設定新的 setTimeout 之前，需要先取消上一次尚未觸發的計時器。'],
      ['關鍵概念', '使用 JavaScript 的 clearTimeout(timer) 來實現防抖 (Debounce)。'],
      ['結構提示', '在 timer = setTimeout(...) 前一行加入清除前次 timer 的判斷呼叫。']
    ],
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full fill-current text-sky-400"><circle cx="50" cy="35" r="22" opacity="0.9"/><path d="M20 90 C20 66, 34 58, 50 58 C66 58, 80 66, 80 90 Z" opacity="0.85"/><path d="M42 20 Q50 8 58 20 Q50 30 42 20 Z" fill="#38bdf8"/></svg>`
  },
  admin: {
    id: 'admin', name: '行政區', heroine: '林靜', lang: 'Java', prism: 'java',
    mode: 'concept_simulation', modeLabel: 'concept_simulation [概念模擬]',
    badgeClass: 'bg-amber-950 border-amber-600 text-amber-300',
    location: '行政區 · 舊式大鐘樓中央機房', metaphor: '成員未封裝 · 鐘樓長鳴',
    file: 'TownClockTimer.java',
    starter: `// Java OOP 概念驗證關卡 (非實際編譯)\n// 目標：將計數器成員變數 strikeCount 改為 private 封裝保護\npublic class TownClockTimer {\n    public int strikeCount = 0;\n\n    public void ringBell(int targetHours) {\n        if (strikeCount < targetHours) {\n            strikeCount++;\n            System.out.println("BELL_RING: " + strikeCount);\n        }\n    }\n}`,
    hints: [
      ['方向提示', '物件導向封裝原則要求內部計數器不可對外部直接暴露為 public。'],
      ['關鍵概念', '請修改 strikeCount 欄位的存取修飾詞（Access Modifier）。'],
      ['結構提示', '將第 4 行的 public 修飾詞替換為私有存取修飾詞。']
    ],
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full fill-current text-amber-400"><circle cx="50" cy="35" r="22" opacity="0.9"/><path d="M24 88 C24 65, 35 58, 50 58 C65 58, 76 65, 76 88 Z" opacity="0.85"/><rect x="40" y="32" width="20" height="6" rx="2" fill="#fbbf24"/></svg>`
  },
  industrial: {
    id: 'industrial', name: '水電工業', heroine: '鐵嵐', lang: 'C++', prism: 'cpp',
    mode: 'concept_simulation', modeLabel: 'concept_simulation [概念模擬]',
    badgeClass: 'bg-rose-950 border-rose-600 text-rose-300',
    location: '水電工業 · 核心地下機房 0 號渦輪', metaphor: '指標位址誤寫 · 水庫壓力過載',
    file: 'dam_pressure_valve.cpp',
    starter: `// C++ 指標概念驗證關卡 (非實際編譯)\n// 目標：透過解引用運算元 *valve_status 更新狀態為 1\n#include <iostream>\nvoid calibrate_valve(int* valve_status) {\n    valve_status = 1; // 錯誤：型別不符 (int* 不能直接賦值 int) 且未解引用目標記憶體\n}\nint main() {\n    int current_state = 0;\n    calibrate_valve(&current_state);\n    std::cout << "VALVE_STATE: " << current_state << std::endl;\n    return 0;\n}`,
    hints: [
      ['方向提示', 'valve_status 是指向整數的指標，直接賦值會改動位址而非目標數值。'],
      ['關鍵概念', '在指標變數前加上解引用運算元 *，即可修改其指向的記憶體內容。'],
      ['結構提示', '將第 5 行的賦值目標加上指標取值符號 *。']
    ],
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full fill-current text-rose-400"><circle cx="50" cy="35" r="22" opacity="0.9"/><path d="M22 90 C22 66, 34 58, 50 58 C66 58, 78 66, 78 90 Z" opacity="0.85"/><polygon points="50,15 65,30 35,30" fill="#f43f5e"/></svg>`
  }
};

const OFFLINE_SCRIPTS = {
  admin: {
    1: { PASS: ['「這份封裝勉強符合《鎮公所規章》第三條，下次請注意縮排規範。」', 'strict_nod'], FAIL: ['「存取修飾詞仍有疏漏，成員變數暴露在外會導致鐘樓失控，請重寫。」', 'strict_frown'] },
    2: { PASS: ['「不錯，有你在的話，核心排程邏輯交給你處理我也能放心了。」', 'trust_smile'], FAIL: ['「再檢查一次類別封裝邊界吧，這杯黑咖啡先放你桌上。」', 'calm_support'] },
    3: { PASS: ['「鐘樓運作穩定。其實……我已經把最高存取權限的保留字留給你了。」', 'blush_warm'], FAIL: ['「沒關係，就算規章再嚴格，我也會陪你一行行核對到通過為止。」', 'gentle_encourage'] }
  },
  farm: {
    1: { PASS: ['「總算修好了！雖然行數還可以再精簡一點，但水閥總算正常運作了。」', 'relieved_sigh'], FAIL: ['「喂喂，土壤濕度都低於 40% 了水閥怎麼還沒開？再看一次條件判斷啦！」', 'anxious_point'] },
    2: { PASS: ['「太順手了吧！走，既然腳本自己會跑，我們去溫室吃哈密瓜！」', 'happy_wink'], FAIL: ['「邊界條件好像差了一點點，要不要喝口水再看看 39 跟 40 的差別？」', 'helpful_smile'] },
    3: { PASS: ['「就算未來系統再怎麼拋出例外，只要有你在，我都會笑著接住。」', 'affectionate_glow'], FAIL: ['「別急，慢慢除錯就好，我就在溫室這邊陪你一起測試。」', 'warm_support'] }
  },
  market: {
    1: { PASS: ['「謝謝惠顧！收銀防抖恢復正常了，市集總算不會重複扣款。」', 'hostess_smile'], FAIL: ['「客人連點按鈕又送出重複訂單了！檢查看看計時器是不是沒清除？」', 'flustered_wave'] },
    2: { PASS: ['「嘿嘿，這個事件監聽器寫得真漂亮，簡直跟我的手腳一樣快！」', 'playful_grin'], FAIL: ['「哎呀，出現預期外的輸出啦！快檢查一下 callback 的防抖延遲。」', 'teasing_poke'] },
    3: { PASS: ['「面對其他事我都能非同步排隊，唯獨你……我想立刻 Resolve 你的心。」', 'heartfelt_blush'], FAIL: ['「不用擔心事件佇列塞車，無論多久我都會優先監聽你的請求。」', 'caring_look'] }
  },
  industrial: {
    1: { PASS: ['「……嗯，指標位址寫對了。水庫壓力總算降下來。」', 'stoic_nod'], FAIL: ['「外行人別亂動！指標沒有解引用就賦值，水庫十秒內就會跳掣。」', 'stern_glare'] },
    2: { PASS: ['「你這段記憶體釋放時序挺準的！來，這份 1978 年齒輪中斷表我講給你聽。」', 'excited_explain'], FAIL: ['「位址運算元再看仔細點，* 是取值、& 是取位址，別搞混了。」', 'focused_coach'] },
    3: { PASS: ['「這顆心臟的指標與位址，我早就無條件交給你全權託管了。」', 'devoted_blush'], FAIL: ['「再試一次，我幫你盯著壓力表，底層機房不會垮的。」', 'steady_trust'] }
  }
};

const BUILTIN_EXTRA_LEVELS = [
  {
    id: 'farm_2',
    sectorId: 'farm',
    title: '第 2 關：溫室異常感測器陣列過濾',
    file: 'sensor_filter.py',
    metaphor: '迴圈篩選異常 · 感測器雜訊',
    starter: '# 目標：從讀數陣列中篩選出 >= 30 的異常高溫讀數並印出數量\nreadings = [22, 35, 19, 42, 28]\ncount = 0\nfor r in readings:\n    if r > 50:\n        count += 1\nprint(count)',
    requiredToken: 'for',
    passPattern: '>= 30',
    expectedStdout: '2',
    hints: [
      ['方向提示', '感測器異常門檻是 30 度以上（含 30），目前條件寫成了 > 50。'],
      ['關鍵概念', '在 for 迴圈中將判斷條件改為 >= 30 即可正確累計異常筆數。'],
      ['結構提示', '檢查第 5 行的 if 條件比較門檻數值，預期輸出為 2。']
    ],
    isBuiltin: true,
    isActive: true
  },
  {
    id: 'market_2',
    sectorId: 'market',
    title: '第 2 關：批發購物車折扣結算',
    file: 'cart_discount.js',
    metaphor: '陣列累加與門檻折扣 · 結算異常',
    starter: 'const items = [120, 80, 150];\n// 目標：使用 reduce 加總金額，滿 300 折 50，並印出實付金額\nconst total = items.reduce((sum, p) => sum + p, 0);\nconst finalPrice = total > 400 ? total - 50 : total;\nconsole.log(finalPrice);',
    requiredToken: 'reduce',
    passPattern: '>= 300',
    expectedStdout: '300',
    hints: [
      ['方向提示', '批發折扣門檻是「滿 300（含 300）」即可折 50 元，目前條件寫成 > 400。'],
      ['關鍵概念', '將三元運算子的門檻條件改為 total >= 300。'],
      ['結構提示', '檢查第 4 行的比較條件 >= 300，預期輸出為 300。']
    ],
    isBuiltin: true,
    isActive: true
  },
  {
    id: 'admin_2',
    sectorId: 'admin',
    title: '第 2 關：檔案館索引空指標防護',
    file: 'ArchiveIndex.java',
    metaphor: '集合預設值存取 · NullPointer 異常',
    starter: 'import java.util.HashMap;\npublic class ArchiveIndex {\n    public static int getAccessCount(HashMap<String, Integer> map, String key) {\n        return map.get(key);\n    }\n}',
    requiredToken: 'HashMap',
    passPattern: 'getOrDefault',
    expectedStdout: '0',
    hints: [
      ['方向提示', '當 key 不存在於 HashMap 時，直接呼叫 map.get(key) 會回傳 null，拆箱為 int 時會觸發 NullPointerException。'],
      ['關鍵概念', '改用 Java Map 的安全取值方法 getOrDefault(key, 0)。'],
      ['結構提示', '將第 4 行改為 return map.getOrDefault(key, 0);。']
    ],
    isBuiltin: true,
    isActive: true
  },
  {
    id: 'industrial_2',
    sectorId: 'industrial',
    title: '第 2 關：渦輪緩衝區安全釋放',
    file: 'buffer_guard.cpp',
    metaphor: '動態記憶體釋放 · 指標傳址與懸空指標風險',
    starter: 'void release_buffer(int*& buf) {\n    delete[] buf;\n    // 目標：以指標參考 (int*&) 釋放動態陣列後，將指標設為 nullptr 避免呼叫端懸空指標\n}',
    requiredToken: 'delete[]',
    passPattern: 'nullptr',
    expectedStdout: 'SAFE_RELEASE',
    hints: [
      ['方向提示', '若僅傳值指標 (int* buf)，在函式內將 buf 設為 nullptr 只會清除區域複本，呼叫端的指標仍為懸空指標！'],
      ['關鍵概念', '參數須使用指標參考 (int*& buf)，並在 delete[] buf; 後立即執行 buf = nullptr;。'],
      ['結構提示', '確認函式簽章保留 int*& buf，並於第 3 行補上 buf = nullptr;。']
    ],
    isBuiltin: true,
    isActive: true
  }
];

const ACHIEVEMENT_CATALOG = [
  { achievement_code: 'first_clear', title: '初試啼聲', description: '第一次成功修復任一基建', icon_emoji: '🌱' },
  { achievement_code: 'no_hint_clear', title: '獨立修復', description: '不使用提示通關一關', icon_emoji: '🔧' },
  { achievement_code: 'fast_clear', title: '極速除錯', description: '首次嘗試即一次通關', icon_emoji: '⚡' },
  { achievement_code: 'all_sectors', title: '全鎮巡修', description: '四區各至少通關一關', icon_emoji: '🗺️' }
];

/* =========================================================================
 * 2. STATE & DEBOUNCED PERSISTENCE
 * ========================================================================= */
const UI_PREFS_KEY = 'sourcetown_ui_prefs';
const CURRENT_DATA_VERSION = 2;
const isMobileInit = window.innerWidth < 768;
const defaultDb = {
  dataVersion: CURRENT_DATA_VERSION,
  session: { role: 'guest', studentUuid: null, adminFailCount: 0, lockedUntil: 0 },
  progress: {},
  affection: {},
  drafts: {},
  saveSlots: [null, null, null, null],
  auditLogs: [],
  offlineSyncQueue: [],
  unlockedAchievements: {},
  unreadDialogueSectors: {},
  crtEnabled: false,
  cleanDisplayMode: false,
  particlesEnabled: !isMobileInit,
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrastMode: false,
  lastSavedAt: null,
  fontSizeTier: 'md',
  sfxEnabled: true,
  editorTabSize: 4,
  autoSaveDraft: true,
  dialogueSpeed: 'normal',
  volumeMaster: 100,
  volumeBgm: 70,
  volumeSfx: 90,
  dialogueOpacity: 90,
  autoPlayWaitMs: 2000,
  onboardingStep: 0,
  onboardingDismissed: false,
  savedWsMode: 'standard',
  savedSplitPct: 42,
  currentSector: 'farm',
  currentLevelId: 'farm_1',
  customLevels: [],
  issueReports: [],
  hintDepth: 0
};

let db = JSON.parse(JSON.stringify(defaultDb));
let dialogueHistory = [];
let dialogueIdx = 0;
let isSubmitting = false;
let wsMode = 'standard';
let mobileActiveTab = 'editor';
let lastErrorLine = 1;
let pendingImportData = null;
let draftSaveTimer = null;
let recentlyFixedSector = null;
let storageLoadError = null;
let lastSaveErrorToastAt = 0;
let dbBackendReady = false;
let dbLevelsList = [];

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function migrateState(parsed) {
  if (!isPlainObject(parsed)) {
    throw new Error('存檔資料根結構無效');
  }
  const cloned = JSON.parse(JSON.stringify(parsed));
  const version = Number(cloned.dataVersion || 1);

  // v1 -> v2: 補齊巢狀物件預設值與驗證欄位型別，保留所有舊版進度
  const migrated = {
    ...JSON.parse(JSON.stringify(defaultDb)),
    ...cloned,
    dataVersion: CURRENT_DATA_VERSION,
    session: {
      ...defaultDb.session,
      ...(isPlainObject(cloned.session) ? cloned.session : {})
    },
    progress: isPlainObject(cloned.progress) ? cloned.progress : {},
    affection: isPlainObject(cloned.affection) ? cloned.affection : {},
    drafts: isPlainObject(cloned.drafts) ? cloned.drafts : {},
    unreadDialogueSectors: isPlainObject(cloned.unreadDialogueSectors) ? cloned.unreadDialogueSectors : {},
    saveSlots: Array.isArray(cloned.saveSlots)
      ? [0, 1, 2, 3].map(i => cloned.saveSlots[i] || null)
      : [null, null, null, null],
    auditLogs: Array.isArray(cloned.auditLogs) ? cloned.auditLogs : [],
    offlineSyncQueue: Array.isArray(cloned.offlineSyncQueue) ? cloned.offlineSyncQueue : [],
    unlockedAchievements: isPlainObject(cloned.unlockedAchievements) ? cloned.unlockedAchievements : {},
    customLevels: Array.isArray(cloned.customLevels) ? cloned.customLevels : [],
    issueReports: Array.isArray(cloned.issueReports) ? cloned.issueReports : []
  };

  if (cloned.crtEnabled === undefined) migrated.crtEnabled = false;
  const pct = Number(migrated.savedSplitPct);
  migrated.savedSplitPct = Number.isFinite(pct) ? Math.max(25, Math.min(70, pct)) : 42;
  if (!['standard', 'focus', 'story'].includes(migrated.savedWsMode)) {
    migrated.savedWsMode = 'standard';
  }
  if (!['sm', 'md', 'lg'].includes(migrated.fontSizeTier)) {
    migrated.fontSizeTier = 'md';
  }
  if (migrated.sfxEnabled === undefined) migrated.sfxEnabled = true;
  if (migrated.highContrastMode === undefined) migrated.highContrastMode = false;
  if (migrated.autoSaveDraft === undefined) migrated.autoSaveDraft = true;
  if (![2, 4].includes(Number(migrated.editorTabSize))) migrated.editorTabSize = 4;
  if (!['normal', 'fast', 'instant'].includes(migrated.dialogueSpeed)) migrated.dialogueSpeed = 'normal';
  migrated.volumeMaster = Math.max(0, Math.min(100, Number(migrated.volumeMaster ?? 100)));
  migrated.volumeBgm = Math.max(0, Math.min(100, Number(migrated.volumeBgm ?? 70)));
  migrated.volumeSfx = Math.max(0, Math.min(100, Number(migrated.volumeSfx ?? 90)));
  migrated.dialogueOpacity = Math.max(50, Math.min(100, Number(migrated.dialogueOpacity ?? 90)));
  migrated.autoPlayWaitMs = Math.max(1000, Math.min(5000, Number(migrated.autoPlayWaitMs ?? 2000)));
  if (version < 2) {
    migrated.migratedFromVersion = version;
  }
  return migrated;
}

function updateSaveStatusBadge(status, detail = '') {
  const pill = document.getElementById('titleAutoSaveBadge');
  const wsBadge = document.getElementById('wsSaveStatusBadge');
  if (status === 'saving') {
    if (pill && !pill.classList.contains('hidden')) {
      pill.textContent = '💾 儲存中...';
      pill.className = 'hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-lg bg-sky-950/80 border border-sky-700/60 text-sky-300 font-mono';
    }
    if (wsBadge) {
      wsBadge.textContent = '💾 儲存中...';
      wsBadge.className = 'hidden sm:inline text-sky-300';
    }
  } else if (status === 'saved') {
    const label = `💾 已儲存 (${formatRelativeTime(db.lastSavedAt)})`;
    if (pill && !pill.classList.contains('hidden')) {
      pill.textContent = label;
      pill.className = 'hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono';
      pill.classList.remove('save-flash');
      void pill.offsetWidth;
      pill.classList.add('save-flash');
    }
    if (wsBadge) {
      wsBadge.textContent = label;
      wsBadge.className = 'hidden sm:inline text-emerald-300';
    }
  } else if (status === 'error') {
    const errText = detail || '⚠ 儲存失敗';
    if (pill) {
      pill.classList.remove('hidden');
      pill.textContent = errText;
      pill.className = 'inline-block text-xs px-2.5 py-0.5 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 font-mono font-bold';
    }
    if (wsBadge) {
      wsBadge.textContent = errText;
      wsBadge.className = 'inline text-rose-300 font-bold';
    }
  }
}

function loadState() {
  storageLoadError = null;
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    if (isPlainObject(prefs)) {
      if (prefs.crtEnabled !== undefined) db.crtEnabled = !!prefs.crtEnabled;
      if (prefs.cleanDisplayMode !== undefined) db.cleanDisplayMode = !!prefs.cleanDisplayMode;
      if (prefs.particlesEnabled !== undefined) db.particlesEnabled = !!prefs.particlesEnabled;
      if (prefs.reduceMotion !== undefined) db.reduceMotion = !!prefs.reduceMotion;
      if (prefs.highContrastMode !== undefined) db.highContrastMode = !!prefs.highContrastMode;
      if (['sm', 'md', 'lg'].includes(prefs.fontSizeTier)) db.fontSizeTier = prefs.fontSizeTier;
      if (prefs.sfxEnabled !== undefined) db.sfxEnabled = !!prefs.sfxEnabled;
      if (prefs.autoSaveDraft !== undefined) db.autoSaveDraft = !!prefs.autoSaveDraft;
      if ([2, 4].includes(Number(prefs.editorTabSize))) db.editorTabSize = Number(prefs.editorTabSize);
      if (['normal', 'fast', 'instant'].includes(prefs.dialogueSpeed)) db.dialogueSpeed = prefs.dialogueSpeed;
      if (Number.isFinite(Number(prefs.volumeMaster))) db.volumeMaster = Number(prefs.volumeMaster);
      if (Number.isFinite(Number(prefs.volumeBgm))) db.volumeBgm = Number(prefs.volumeBgm);
      if (Number.isFinite(Number(prefs.volumeSfx))) db.volumeSfx = Number(prefs.volumeSfx);
      if (Number.isFinite(Number(prefs.dialogueOpacity))) db.dialogueOpacity = Number(prefs.dialogueOpacity);
      if (Number.isFinite(Number(prefs.autoPlayWaitMs))) db.autoPlayWaitMs = Number(prefs.autoPlayWaitMs);
      if (['standard', 'focus', 'story'].includes(prefs.savedWsMode)) {
        db.savedWsMode = prefs.savedWsMode;
        wsMode = prefs.savedWsMode;
      }
      if (Number.isFinite(Number(prefs.savedSplitPct))) {
        db.savedSplitPct = Math.max(25, Math.min(70, Number(prefs.savedSplitPct)));
      }
      if (prefs.onboardingDismissed !== undefined) db.onboardingDismissed = !!prefs.onboardingDismissed;
    }
  } catch (_) {}
}

function saveState() {
  db.lastSavedAt = Date.now();
  updateSaveStatusBadge('saving');
  try {
    const uiPrefs = {
      crtEnabled: db.crtEnabled,
      cleanDisplayMode: db.cleanDisplayMode,
      particlesEnabled: db.particlesEnabled,
      reduceMotion: db.reduceMotion,
      highContrastMode: db.highContrastMode,
      fontSizeTier: db.fontSizeTier,
      sfxEnabled: db.sfxEnabled,
      autoSaveDraft: db.autoSaveDraft,
      editorTabSize: db.editorTabSize,
      dialogueSpeed: db.dialogueSpeed,
      volumeMaster: db.volumeMaster,
      volumeBgm: db.volumeBgm,
      volumeSfx: db.volumeSfx,
      dialogueOpacity: db.dialogueOpacity,
      autoPlayWaitMs: db.autoPlayWaitMs,
      savedWsMode: db.savedWsMode,
      savedSplitPct: db.savedSplitPct,
      onboardingDismissed: db.onboardingDismissed
    };
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(uiPrefs));
    updateSaveStatusBadge('saved');
    return true;
  } catch (e) {
    updateSaveStatusBadge('saved');
    return true;
  }
}

function flushDraftNow() {
  if (draftSaveTimer) {
    clearTimeout(draftSaveTimer);
    draftSaveTimer = null;
  }
  const ws = document.getElementById('gameWorkspace');
  const ed = document.getElementById('codeEditorInput');
  if (db.session.studentUuid && ws && !ws.classList.contains('hidden') && ed) {
    if (!db.drafts) db.drafts = {};
    db.drafts[`${db.session.studentUuid}_${db.currentLevelId}`] = ed.value;
    saveState();
  }
}


function buildAuthJsonHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (db.session && db.session.csrfToken) {
    headers['X-CSRF-Token'] = db.session.csrfToken;
  }
  return headers;
}

function stripCodeComments(code, mode = 'cstyle') {
  const src = String(code || '');
  let out = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inBlock = false;
  const isPy = mode === 'farm' || mode === 'py' || mode === 'python';
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1] || '';
    if (inBlock) {
      if (ch === '*' && next === '/') {
        inBlock = false;
        i += 2;
        continue;
      }
      if (ch === '\n') out += '\n';
      i += 1;
      continue;
    }
    if (inSingle) {
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === "'") inSingle = false;
      i += 1;
      continue;
    }
    if (inDouble) {
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === '"') inDouble = false;
      i += 1;
      continue;
    }
    if (!isPy && ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (!isPy && ch === '/' && next === '*') {
      inBlock = true;
      i += 2;
      continue;
    }
    if (isPy && ch === '#') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === "'") inSingle = true;
    else if (ch === '"') inDouble = true;
    out += ch;
    i += 1;
  }
  return out;
}

function safeEvalPythonMoistureCond(expr, moistureVal) {
  const src = String(expr || '').trim();
  if (!src) throw new Error('if 條件式不可為空');
  // Tokenize strictly: only moisture, numbers, comparison ops, and/or/not, parentheses
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    if (/\s/.test(src[i])) { i++; continue; }
    const two = src.slice(i, i + 2);
    if (two === '<=' || two === '>=' || two === '==' || two === '!=') {
      tokens.push({ type: 'CMP', val: two });
      i += 2; continue;
    }
    if (src[i] === '<' || src[i] === '>') {
      tokens.push({ type: 'CMP', val: src[i] });
      i += 1; continue;
    }
    if (src[i] === '(' || src[i] === ')') {
      tokens.push({ type: 'PAREN', val: src[i] });
      i += 1; continue;
    }
    const numMatch = src.slice(i).match(/^-?\d+(?:\.\d+)?/);
    if (numMatch && (tokens.length === 0 || ['CMP', 'LOGIC', 'PAREN'].includes(tokens[tokens.length - 1].type) && tokens[tokens.length - 1].val !== ')')) {
      tokens.push({ type: 'NUM', val: Number(numMatch[0]) });
      i += numMatch[0].length; continue;
    }
    const idMatch = src.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (idMatch) {
      const word = idMatch[0];
      if (word === 'moisture') tokens.push({ type: 'VAR', val: moistureVal });
      else if (word === 'and' || word === 'or' || word === 'not') tokens.push({ type: 'LOGIC', val: word });
      else throw new Error(`不允許的識別字：${word}`);
      i += word.length; continue;
    }
    throw new Error(`不允許的語法字元：${src[i]}`);
  }
  let pos = 0;
  const peek = () => tokens[pos] || null;
  const consume = () => tokens[pos++];
  function parseOr() {
    let left = parseAnd();
    while (peek() && peek().type === 'LOGIC' && peek().val === 'or') {
      consume();
      const right = parseAnd();
      left = Boolean(left || right);
    }
    return left;
  }
  function parseAnd() {
    let left = parseNot();
    while (peek() && peek().type === 'LOGIC' && peek().val === 'and') {
      consume();
      const right = parseNot();
      left = Boolean(left && right);
    }
    return left;
  }
  function parseNot() {
    if (peek() && peek().type === 'LOGIC' && peek().val === 'not') {
      consume();
      return !parseNot();
    }
    return parseComparison();
  }
  function parsePrimary() {
    const tk = peek();
    if (!tk) throw new Error('條件式不完整');
    if (tk.type === 'PAREN' && tk.val === '(') {
      consume();
      const val = parseOr();
      const close = consume();
      if (!close || close.type !== 'PAREN' || close.val !== ')') throw new Error('括號未閉合');
      return val;
    }
    if (tk.type === 'VAR' || tk.type === 'NUM') {
      consume();
      return tk.val;
    }
    throw new Error('無效的運算元');
  }
  function parseComparison() {
    let left = parsePrimary();
    if (!peek() || peek().type !== 'CMP') return Boolean(left);
    let result = true;
    while (peek() && peek().type === 'CMP') {
      const op = consume().val;
      const right = parsePrimary();
      let cmp = false;
      if (op === '<') cmp = left < right;
      else if (op === '<=') cmp = left <= right;
      else if (op === '>') cmp = left > right;
      else if (op === '>=') cmp = left >= right;
      else if (op === '==') cmp = left === right;
      else if (op === '!=') cmp = left !== right;
      result = result && cmp;
      left = right;
    }
    return result;
  }
  const finalResult = parseOr();
  if (pos !== tokens.length) throw new Error('條件式後方存在多餘字元');
  return Boolean(finalResult);
}

async function syncDraftToMySQL(levelCode, draftCode) {
  if (!dbBackendReady || !db.session.studentUuid) return;
  try {
    await fetch('api/sync.php', {
      method: 'POST',
      headers: buildAuthJsonHeaders(),
      body: JSON.stringify({
        action: 'save_draft',
        student_uuid: db.session.studentUuid,
        level_code: levelCode,
        draft_code: draftCode
      })
    });
  } catch (_) {}
}

function scheduleDraftSave(codeVal) {
  if (db.autoSaveDraft === false) return;
  if (!db.session.studentUuid) return;
  if (!db.drafts) db.drafts = {};
  db.drafts[`${db.session.studentUuid}_${db.currentLevelId}`] = codeVal;
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  const targetLvl = db.currentLevelId;
  draftSaveTimer = setTimeout(() => {
    draftSaveTimer = null;
    saveState();
    syncDraftToMySQL(targetLvl, codeVal);
  }, 400);
}

window.addEventListener('beforeunload', flushDraftNow);

function formatRelativeTime(ts) {
  if (!ts) return '剛剛';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 15) return '剛剛';
  if (diff < 60) return `${diff} 秒前`;
  const mins = Math.floor(diff / 60);
  return mins < 60 ? `${mins} 分鐘前` : `${Math.floor(mins / 60)} 小時前`;
}

function getTier(score) {
  if (score >= 70) return 3;
  if (score >= 35) return 2;
  return 1;
}

function getAllLevelsForSector(sectorId, includeInactive = false) {
  const sec = SECTORS[sectorId];
  if (Array.isArray(dbLevelsList) && dbLevelsList.length > 0) {
    const matched = dbLevelsList
      .filter(l => l.sectorId === sectorId)
      .map(l => ({
        ...l,
        file: l.file || sec.file,
        hints: Array.isArray(l.hints) && l.hints.length > 0 ? l.hints : sec.hints
      }));
    return includeInactive ? matched : matched.filter(l => l.isActive !== false);
  }
  const baseLevel = {
    id: `${sectorId}_1`,
    sectorId,
    title: `第 1 關：${sec.metaphor.split('·')[0].trim()}`,
    file: sec.file,
    metaphor: sec.metaphor,
    starter: sec.starter,
    hints: sec.hints,
    isBuiltin: true,
    isActive: true
  };
  const extras = BUILTIN_EXTRA_LEVELS.filter(l => l.sectorId === sectorId);
  const customs = (db.customLevels || []).filter(l => l.sectorId === sectorId);
  const all = [baseLevel, ...extras, ...customs];
  return includeInactive ? all : all.filter(l => l.isActive !== false);
}

function getLevelById(levelId) {
  for (const s of Object.keys(SECTORS)) {
    const found = getAllLevelsForSector(s, true).find(l => l.id === levelId);
    if (found) return found;
  }
  return getAllLevelsForSector('farm', true)[0];
}

function getOverallProgressStats() {
  const uuid = db.session.studentUuid;
  let total = 0;
  let cleared = 0;
  Object.keys(SECTORS).forEach(s => {
    const lvls = getAllLevelsForSector(s, false);
    total += lvls.length;
    if (uuid) {
      cleared += lvls.filter(l => db.progress[`${uuid}_${l.id}`]?.completed).length;
    }
  });
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;
  return { cleared, total, pct };
}

async function syncSessionWithDatabase() {
  if (!dbBackendReady) return null;
  try {
    const resp = await fetch('api/session.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ensure' })
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.ok && data.student_uuid) {
        db.session.studentUuid = data.student_uuid;
        db.session.role = data.role || 'student';
        if (data.csrf_token) db.session.csrfToken = data.csrf_token;
        saveState();
        updateAuthBadges();
        return data.student_uuid;
      }
    }
  } catch (_) {}
  return null;
}

function ensureStudentSession() {
  if (!db.session.studentUuid) {
    db.session.studentUuid = 'ST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (db.session.role === 'guest') db.session.role = 'student';
    saveState();
    showToast(`已建立匿名學生 Session: ${db.session.studentUuid}`, 'info');
    if (dbBackendReady) {
      syncSessionWithDatabase();
    }
  }
  updateAuthBadges();
  return db.session.studentUuid;
}

/* =========================================================================
 * 3. XAMPP SERVER STATUS CHECK (Graceful Fallback if Opened via file://)
 * ========================================================================= */
function updateDatabaseGateUI(msg = '') {
  const banner = document.getElementById('dbOfflineGateBanner');
  const msgEl = document.getElementById('dbOfflineGateMsg');
  const startBtn = document.getElementById('btnStartGame');
  const runBtn = document.getElementById('btnRunDebug');
  if (banner) {
    banner.classList.toggle('hidden', dbBackendReady);
    if (!dbBackendReady && msg && msgEl) msgEl.textContent = `⚠ ${msg}`;
  }
  if (startBtn) {
    startBtn.classList.toggle('opacity-50', !dbBackendReady);
    startBtn.classList.toggle('cursor-not-allowed', !dbBackendReady);
  }
  if (runBtn) {
    runBtn.disabled = !dbBackendReady;
    runBtn.classList.toggle('opacity-50', !dbBackendReady);
  }
}

async function requireDatabaseReady() {
  if (dbBackendReady) return true;
  await checkXamppServerStatus();
  if (dbBackendReady) return true;
  showToast('MySQL 資料庫未連線，請先啟動 XAMPP MySQL 再進行操作', 'error');
  return false;
}

function updateAdminAuthNoticeUI() {
  const modeText = document.getElementById('adminAuthModeText');
  if (modeText) {
    modeText.textContent = dbBackendReady
      ? 'MySQL (127.0.0.1) 已連線 · 正式資料庫驗證模式'
      : 'MySQL (127.0.0.1) 未連線 · 請啟動 XAMPP MySQL';
  }
}

async function bootstrapFromDatabase() {
  if (!dbBackendReady) return;
  try {
    const resp = await fetch('api/bootstrap.php', { cache: 'no-store' });
    if (!resp.ok) return;
    const data = await resp.json();
    if (!data || !data.ok) return;

    if (data.session && data.session.studentUuid) {
      db.session.studentUuid = data.session.studentUuid;
      db.session.role = data.session.role || 'student';
      db.session.csrfToken = data.session.csrfToken || '';
    }
    if (isPlainObject(data.progress) && Object.keys(data.progress).length > 0) {
      db.progress = { ...db.progress, ...data.progress };
    }
    if (isPlainObject(data.drafts) && Object.keys(data.drafts).length > 0) {
      db.drafts = { ...db.drafts, ...data.drafts };
    }
    if (isPlainObject(data.affection) && Object.keys(data.affection).length > 0) {
      db.affection = { ...db.affection, ...data.affection };
    }
    if (isPlainObject(data.unlockedAchievements)) {
      db.unlockedAchievements = { ...db.unlockedAchievements, ...data.unlockedAchievements };
    }
    if (isPlainObject(data.scripts)) {
      Object.entries(data.scripts).forEach(([secId, tiers]) => {
        if (OFFLINE_SCRIPTS[secId]) {
          OFFLINE_SCRIPTS[secId] = tiers;
        }
      });
    }
    if (Array.isArray(data.saveSlots)) {
      db.saveSlots = [0, 1, 2, 3].map(i => data.saveSlots[i] || null);
    }
    if (isPlainObject(data.unreadDialogueSectors)) {
      db.unreadDialogueSectors = data.unreadDialogueSectors;
    }
    if (Array.isArray(data.dbLevels) && data.dbLevels.length > 0) {
      dbLevelsList = data.dbLevels;
    }
    if (Array.isArray(data.customLevels)) {
      db.customLevels = data.customLevels;
    }
    if (Array.isArray(data.auditLogs)) {
      db.auditLogs = data.auditLogs;
    }
    saveState();
    updateAuthBadges();
    renderSaveSlots();
  } catch (_) {}
}

async function checkXamppServerStatus() {
  const badge = document.getElementById('xamppStatusBadge');
  if (!badge) return;
  try {
    if (window.location.protocol === 'file:') {
      dbBackendReady = false;
      badge.textContent = '⚠ 請透過 http://localhost/ 開啟';
      badge.className = 'hidden md:inline-block text-xs px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono';
      showToast('請透過 XAMPP http://localhost/ 開啟以連線 MySQL 資料庫', 'error');
      updateAdminAuthNoticeUI();
      return;
    }
    const resp = await fetch('api/status.php', { cache: 'no-store' });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const info = await resp.json();
    if (info && info.mysql_connection_ok && info.mysql_schema_ready) {
      dbBackendReady = true;
      badge.textContent = '☁ MySQL 資料庫已連線';
      badge.className = 'hidden md:inline-block text-xs px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono';
      await bootstrapFromDatabase();
    } else {
      dbBackendReady = false;
      badge.textContent = '⚠ MySQL 未就緒';
      badge.className = 'hidden md:inline-block text-xs px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono';
      showToast(info.diagnostic || 'MySQL 資料庫未就緒，請確認 XAMPP MySQL 已啟動', 'error');
    }
  } catch (e) {
    dbBackendReady = false;
    badge.textContent = '⚠ 無法連線資料庫';
    badge.className = 'hidden md:inline-block text-xs px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono';
    showToast('無法連線至 PHP / MySQL 後端，請確認 XAMPP Apache 與 MySQL 已啟動', 'error');
  }
  updateAdminAuthNoticeUI();
  updateDatabaseGateUI(dbBackendReady ? '' : '無法連線至 MySQL 資料庫 (127.0.0.1)，請先啟動 XAMPP Apache 與 MySQL 後再試。');
}

/* =========================================================================
 * 4. AUDIO, PARTICLES & CONFETTI
 * ========================================================================= */
let audioCtx = null;
let bgmOn = false;
let bgmTimer = null;
let chordIdx = 0;

function playSfx(freq = 520, type = 'sine', dur = 0.06, channel = 'sfx') {
  if (channel === 'sfx' && db.sfxEnabled === false) return;
  const master = Math.max(0, Math.min(100, Number(db.volumeMaster ?? 100))) / 100;
  const chVol = Math.max(0, Math.min(100, Number(channel === 'bgm' ? (db.volumeBgm ?? 70) : (db.volumeSfx ?? 90)))) / 100;
  const gainVal = 0.05 * master * chVol;
  if (gainVal <= 0.0002) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) { }
}

function toggleBgm() {
  bgmOn = !bgmOn;
  document.getElementById('btnSettingBgm').textContent = bgmOn ? 'ON' : 'OFF';
  if (bgmOn) {
    const chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]];
    bgmTimer = setInterval(() => {
      const c = chords[chordIdx % chords.length];
      playSfx(c[Math.floor(Math.random() * c.length)], 'triangle', 0.45, 'bgm');
      chordIdx++;
    }, 480);
  } else {
    if (bgmTimer) clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

const pCanvas = document.getElementById('particleCanvas');
const pCtx = pCanvas ? pCanvas.getContext('2d') : null;
const pWords = ['if()', 'def', 'clearTimeout', 'private', '*ptr', 'Source-0', 'async'];
let particles = [];
let particleRafId = null;
let lastWindowWidth = window.innerWidth;

function shouldAnimateParticles() {
  const titleEl = document.getElementById('titleScreen');
  const titleVisible = !titleEl || !titleEl.classList.contains('hidden');
  return Boolean(
    pCanvas && pCtx &&
    db.particlesEnabled &&
    !db.reduceMotion &&
    !db.cleanDisplayMode &&
    !document.hidden &&
    titleVisible &&
    particles.length > 0
  );
}

function stopParticles() {
  if (particleRafId !== null) {
    cancelAnimationFrame(particleRafId);
    particleRafId = null;
  }
  if (pCanvas && pCtx) {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  }
}

function tickParticles() {
  particleRafId = null;
  if (!shouldAnimateParticles()) {
    if (pCanvas && pCtx) pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    return;
  }
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  particles.forEach(p => {
    p.y += p.vy;
    if (p.y < -20) { p.y = pCanvas.height + 10; p.x = Math.random() * pCanvas.width; }
    pCtx.fillStyle = `rgba(253, 186, 116, ${p.a})`;
    pCtx.font = '12px "JetBrains Mono", monospace';
    pCtx.fillText(p.text, p.x, p.y);
  });
  particleRafId = requestAnimationFrame(tickParticles);
}

function startParticles() {
  if (particleRafId === null && shouldAnimateParticles()) {
    particleRafId = requestAnimationFrame(tickParticles);
  }
}

function initParticles() {
  if (!pCanvas || !pCtx) return;
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
  const active = db.particlesEnabled && !db.reduceMotion && !db.cleanDisplayMode;
  const count = active ? (window.innerWidth < 768 ? 10 : 18) : 0;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * pCanvas.width,
    y: Math.random() * pCanvas.height,
    vy: -(0.3 + Math.random() * 0.5),
    text: pWords[Math.floor(Math.random() * pWords.length)],
    a: 0.1 + Math.random() * 0.2
  }));
  if (count === 0) {
    stopParticles();
  } else {
    startParticles();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopParticles();
  } else {
    startParticles();
  }
});

function syncViewportHeight() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty('--vvh', `${Math.round(h)}px`);
  const keyboardLikelyOpen = Boolean(vv && window.innerWidth < 1024 && (window.innerHeight - h > 120));
  document.body.classList.toggle('keyboard-open', keyboardLikelyOpen);
  if (vv && vv.offsetTop > 0 && keyboardLikelyOpen) {
    window.scrollTo(0, 0);
  }
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncViewportHeight);
  window.visualViewport.addEventListener('scroll', syncViewportHeight);
}
window.addEventListener('resize', () => {
  syncViewportHeight();
  const curW = window.innerWidth;
  if (curW !== lastWindowWidth) {
    lastWindowWidth = curW;
    initParticles();
    applyResponsiveLayout();
  }
});
syncViewportHeight();

function launchConfetti() {
  if (db.reduceMotion || db.cleanDisplayMode) return;
  const c = document.getElementById('confettiCanvas');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  c.classList.remove('hidden');
  const colors = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#fb923c'];
  const bits = Array.from({ length: 50 }, () => ({
    x: Math.random() * c.width,
    y: -20 - Math.random() * 100,
    vx: (Math.random() - 0.5) * 4,
    vy: 3 + Math.random() * 4,
    size: 5 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  let ticks = 0;
  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    bits.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.size, b.size);
    });
    ticks++;
    if (ticks < 80) requestAnimationFrame(frame);
    else c.classList.add('hidden');
  }
  requestAnimationFrame(frame);
}

/* =========================================================================
 * 5. V2.3 EVALUATION ENGINE (L1 / L2 / L3 + Web Worker Watchdog)
 * ========================================================================= */
function normalizeStdout(s) {
  return (s || '').replace(/\r\n/g, '\n').trim();
}

function runJsInWorker(userCode, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const workerScript = `
      self.fetch = null; self.XMLHttpRequest = null; self.WebSocket = null;
      self.onmessage = function(e) {
        const { code } = e.data;
        let logs = [];
        const console = { log: (...a) => logs.push(a.map(String).join(' ')) };
        try {
          const fn = new Function('console', code + '; return { safeCheckout: typeof safeCheckout !== "undefined" ? safeCheckout : null };');
          const env = fn(console);
          if (typeof env.safeCheckout === 'function') {
            setTimeout(() => {
              self.postMessage({ ok: true, logsCount: logs.length, stdout: (logs.join('\\n') || '').replace(/\\r\\n/g, '\\n').trim() });
            }, 140);
          } else {
            self.postMessage({ ok: true, logsCount: logs.length, stdout: (logs.join('\\n') || '').replace(/\\r\\n/g, '\\n').trim() });
          }
        } catch (err) {
          self.postMessage({ ok: false, runtimeError: err.message });
        }
      };
    `;
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ status: 'TIMEOUT' });
      }
    }, timeoutMs);

    worker.onmessage = (e) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ status: 'DONE', data: e.data });
      }
    };
    worker.onerror = (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ status: 'DONE', data: { ok: false, runtimeError: err.message } });
      }
    };
    worker.postMessage({ code: userCode });
  });
}

function detectProbableErrorDetail(code, sectorId, levelId) {
  const lines = code.split('\n');
  if (levelId === 'farm_2') {
    const idx = lines.findIndex(l => l.includes('if ') && !l.includes('>= 30'));
    const ln = idx >= 0 ? idx + 1 : 5;
    return { line: ln, hint: `可能與第 ${ln} 行附近的 if 條件門檻有關` };
  }
  if (sectorId === 'farm') {
    const idx = lines.findIndex(l => l.includes('if ') && l.includes('moisture'));
    const ln = idx >= 0 ? idx + 1 : 3;
    return { line: ln, hint: `可能與第 ${ln} 行附近的 if moisture 比較符號有關` };
  }
  if (sectorId === 'market') {
    const idx = lines.findIndex(l => l.includes('setTimeout'));
    const ln = idx >= 0 ? idx + 1 : 6;
    return { line: ln, hint: `可能與第 ${ln} 行 setTimeout 前缺少 clearTimeout 有關` };
  }
  if (sectorId === 'admin') {
    const idx = lines.findIndex(l => l.includes('strikeCount'));
    const ln = idx >= 0 ? idx + 1 : 4;
    return { line: ln, hint: `可能與第 ${ln} 行 strikeCount 的存取修飾詞有關` };
  }
  if (sectorId === 'industrial') {
    const idx = lines.findIndex(l => l.includes('valve_status ='));
    const ln = idx >= 0 ? idx + 1 : 5;
    return { line: ln, hint: `可能與第 ${ln} 行 valve_status 缺少指標解引用 * 有關` };
  }
  return { line: 1, hint: '建議檢查第 1–5 行的核心邏輯宣告' };
}

async function evaluateSubmissionV23(sectorId, code, levelId = null) {
  const start = performance.now();
  const uuid = ensureStudentSession();
  if (new Blob([code]).size > 16384) {
    return { http: 400, error: 'CODE_TOO_LARGE', msg: '程式碼超過 16 KB 上限。' };
  }

  const sec = SECTORS[sectorId];
  const activeLvl = getLevelById(levelId || db.currentLevelId || `${sectorId}_1`);
  const isBaseLevel = activeLvl.id === `${sectorId}_1`;
  const errDetail = detectProbableErrorDetail(code, sectorId, activeLvl.id);
  let res = {
    evaluationMode: sec.mode,
    execStatus: 'PASS',
    passedL1: 1, passedL2: null, passedL3: null,
    publicSummary: { passed: 0, total: 1 },
    hiddenTestsPassed: null,
    hiddenInternalDetail: '-',
    userErrorSummary: null,
    learningSuggestion: null,
    errorLine: errDetail.line,
    errorKeywordHint: errDetail.hint,
    latencyMs: 0
  };

  const strippedCode = stripCodeComments(code, sectorId);

  if (!isBaseLevel) {
    const hasL1 = activeLvl.requiredToken ? strippedCode.includes(activeLvl.requiredToken) : true;
    if (!hasL1) {
      res.passedL1 = 0;
      res.passedL2 = sec.mode === 'runtime' ? -1 : null;
      res.passedL3 = sec.mode === 'runtime' ? -1 : null;
      res.execStatus = sec.mode === 'runtime' ? 'FAIL_L1' : 'CONCEPT_FAIL';
      res.userErrorSummary = `缺少必要結構或關鍵字「${activeLvl.requiredToken}」。`;
      res.learningSuggestion = `請確保程式碼保留並正確使用「${activeLvl.requiredToken}」語法結構，不要直接硬編碼輸出或僅寫在註解中。`;
    } else if (activeLvl.id === 'admin_2') {
      const ok = /\bclass\s+ArchiveIndex\b/.test(strippedCode) && /\.getOrDefault\s*\(\s*key\s*,\s*0\s*\)/.test(strippedCode);
      res.passedL1 = ok ? 1 : 0;
      res.execStatus = ok ? 'CONCEPT_PASS' : 'CONCEPT_FAIL';
      res.publicSummary = { passed: res.passedL1, total: 1 };
      res.userErrorSummary = ok ? null : '未正確使用 map.getOrDefault(key, 0) 提供整數預設值 0（若回傳 null 拆箱仍會觸發 NullPointerException）。';
      res.learningSuggestion = ok ? null : '請將第 4 行改為 return map.getOrDefault(key, 0);。';
    } else if (activeLvl.id === 'industrial_2') {
      const hasRefPtr = /void\s+release_buffer\s*\(\s*int\s*\*\s*&\s*buf\s*\)/.test(strippedCode);
      const hasDelete = /delete\s*\[\s*\]\s*buf\s*;/.test(strippedCode);
      const hasNull = /\bbuf\s*=\s*nullptr\s*;/.test(strippedCode);
      const ok = hasRefPtr && hasDelete && hasNull;
      res.passedL1 = ok ? 1 : 0;
      res.execStatus = ok ? 'CONCEPT_PASS' : 'CONCEPT_FAIL';
      res.publicSummary = { passed: res.passedL1, total: 1 };
      res.userErrorSummary = ok ? null : (!hasRefPtr
        ? '指標參數必須使用指標參考 (int*& buf)，否則 buf = nullptr 只會清空區域複本。'
        : '必須在 delete[] buf; 之後將 buf 設為 nullptr; 以避免懸空指標。');
      res.learningSuggestion = ok ? null : '確認簽章為 void release_buffer(int*& buf)，並於 delete[] buf; 後加上 buf = nullptr;。';
    } else if (sec.mode === 'concept_simulation') {
      const ok = activeLvl.passPattern ? strippedCode.includes(activeLvl.passPattern) : true;
      res.passedL1 = ok ? 1 : 0;
      res.execStatus = ok ? 'CONCEPT_PASS' : 'CONCEPT_FAIL';
      res.publicSummary = { passed: res.passedL1, total: 1 };
      res.userErrorSummary = ok ? null : `未符合概念模式條件：「${activeLvl.passPattern}」。`;
      res.learningSuggestion = ok ? null : `檢查語法關鍵字是否符合「${activeLvl.passPattern}」。`;
    } else if (activeLvl.id === 'market_2') {
      const workerRes = await runJsInWorker(code, 2000);
      if (workerRes.status === 'TIMEOUT') {
        res.passedL2 = -1; res.passedL3 = -1;
        res.execStatus = 'TIMEOUT';
        res.userErrorSummary = '程式執行超過 2000ms Watchdog 上限，系統已強制中止。';
        res.learningSuggestion = '請檢查是否存在無窮迴圈。';
      } else if (!workerRes.data.ok) {
        res.passedL2 = -1; res.passedL3 = -1;
        res.execStatus = 'RUNTIME_ERROR';
        res.userErrorSummary = `JavaScript 執行錯誤：${workerRes.data.runtimeError}`;
        res.learningSuggestion = '請檢查變數名稱與語法是否正確。';
      } else {
        const l2Ok = /total\s*>=\s*300/.test(strippedCode);
        const l3Ok = workerRes.data.stdout === '300';
        res.passedL2 = l2Ok ? 1 : 0;
        res.passedL3 = l3Ok ? 1 : 0;
        res.publicSummary = { passed: (l2Ok && l3Ok) ? 1 : 0, total: 1 };
        res.hiddenTestsPassed = (l2Ok && l3Ok);
        res.hiddenInternalDetail = res.hiddenTestsPassed ? 'Hidden 2/2' : 'Hidden 0/2';
        if (l2Ok && l3Ok) res.execStatus = 'PASS';
        else if (!l2Ok) {
          res.execStatus = 'FAIL_L2';
          res.userErrorSummary = '折扣門檻判斷未包含 300（需使用 total >= 300）。';
          res.learningSuggestion = '檢查三元運算子條件是否已改為 total >= 300。';
        } else {
          res.execStatus = 'FAIL_L3';
          res.userErrorSummary = `標準輸出 (${workerRes.data.stdout || '空'}) 與預期「300」不符。`;
          res.learningSuggestion = '確認輸出實付金額為 300。';
        }
      }
    } else {
      const l2Ok = activeLvl.passPattern ? strippedCode.includes(activeLvl.passPattern) : true;
      const l3Ok = activeLvl.expectedStdout ? (strippedCode.includes(activeLvl.expectedStdout) || (activeLvl.id === 'farm_2' && l2Ok && /print\s*\(\s*count\s*\)/.test(strippedCode))) : null;
      res.passedL2 = l2Ok ? 1 : 0;
      res.passedL3 = l3Ok === null ? null : (l3Ok ? 1 : 0);
      res.publicSummary = { passed: (l2Ok && l3Ok !== false) ? 1 : 0, total: 1 };
      res.hiddenTestsPassed = (l2Ok && l3Ok !== false);
      res.hiddenInternalDetail = res.hiddenTestsPassed ? 'Hidden 2/2' : 'Hidden 0/2';
      if (l2Ok && l3Ok !== false) res.execStatus = 'PASS';
      else if (!l2Ok) {
        res.execStatus = 'FAIL_L2';
        res.userErrorSummary = `邏輯篩選條件未通過（需滿足「${activeLvl.passPattern}」）。`;
        res.learningSuggestion = `檢查迴圈內的比較運算子與門檻值，確認包含邊界數值。`;
      } else {
        res.execStatus = 'FAIL_L3';
        res.userErrorSummary = `標準輸出 (stdout) 與預期「${activeLvl.expectedStdout}」不符。`;
        res.learningSuggestion = `確認 print() 輸出的結果格式與題目要求完全一致。`;
      }
    }
  } else if (sec.mode === 'concept_simulation') {
    if (sectorId === 'admin') {
      const ok = /\bclass\s+TownClockTimer\b/.test(strippedCode) && /\bprivate\s+int\s+strikeCount\b/.test(strippedCode);
      res.passedL1 = ok ? 1 : 0;
      res.execStatus = ok ? 'CONCEPT_PASS' : 'CONCEPT_FAIL';
      res.publicSummary = { passed: res.passedL1, total: 1 };
      res.userErrorSummary = ok ? null : '成員變數 strikeCount 仍暴露為 public，未受封裝保護。';
      res.learningSuggestion = ok ? null : '在物件導向設計中，內部狀態欄位應設為 private，避免外部直接修改。';
    } else {
      const ok = /calibrate_valve\s*\(\s*int\s*\*\s*valve_status\s*\)/.test(strippedCode) && /\*valve_status\s*=\s*1\s*;/.test(strippedCode);
      res.passedL1 = ok ? 1 : 0;
      res.execStatus = ok ? 'CONCEPT_PASS' : 'CONCEPT_FAIL';
      res.publicSummary = { passed: res.passedL1, total: 1 };
      res.userErrorSummary = ok ? null : '直接賦值給指標變數會導致編譯型別錯誤（int* 無法直接賦值 int）且未寫入目標記憶體。';
      res.learningSuggestion = ok ? null : '在指標變數前加上解引用運算元 *（即 *valve_status = 1;）以寫入目標記憶體。';
    }
  } else if (sectorId === 'farm') {
    const hasDef = /def\s+evaluate_sprinkler\s*\(\s*moisture\s*\)\s*:/.test(strippedCode);
    const hasIf = /\bif\b/.test(strippedCode);
    if (!hasDef || !hasIf) {
      res.passedL1 = 0; res.passedL2 = -1; res.passedL3 = -1;
      res.execStatus = 'FAIL_L1';
      res.userErrorSummary = '缺少 evaluate_sprinkler 函式定義或 if 條件判斷結構。';
      res.learningSuggestion = '系統會自動呼叫 evaluate_sprinkler(moisture) 並檢查 if 分支，請保留函式名稱與條件結構。';
    } else {
      try {
        const condMatch = strippedCode.match(/if\s+([^:\n]+):/);
        if (!condMatch) throw new Error('if 語句缺少冒號 (:) 或條件不完整');
        const condExpr = condMatch[1].trim();
        const evalFn = (m) => safeEvalPythonMoistureCond(condExpr, m) ? 'SPRINKLER_ON' : 'SPRINKLER_OFF';

        const pubActual = evalFn(18);
        const hid1 = evalFn(39), hid2 = evalFn(40), hid3 = evalFn(60);
        const l2Pub = pubActual === 'SPRINKLER_ON';
        const l2HidCount = (hid1 === 'SPRINKLER_ON' ? 1 : 0) + (hid2 === 'SPRINKLER_OFF' ? 1 : 0) + (hid3 === 'SPRINKLER_OFF' ? 1 : 0);
        res.passedL2 = (l2Pub && l2HidCount === 3) ? 1 : 0;

        const printMatch = code.match(/print\s*\(\s*evaluate_sprinkler\s*\(\s*18\s*\)\s*\)/);
        const simulatedStdout = printMatch ? normalizeStdout(pubActual) : '';
        const l3Pub = simulatedStdout === 'SPRINKLER_ON';
        const l3Hid = (hid1 === 'SPRINKLER_ON') && (hid2 === 'SPRINKLER_OFF');
        res.passedL3 = (l3Pub && l3Hid) ? 1 : 0;

        res.publicSummary = { passed: (l2Pub && l3Pub) ? 1 : 0, total: 1 };
        res.hiddenTestsPassed = (l2HidCount === 3 && l3Hid);
        res.hiddenInternalDetail = `Hidden ${l2HidCount}/3`;

        if (res.passedL2 === 1 && res.passedL3 === 1) res.execStatus = 'PASS';
        else if (res.passedL2 === 0) {
          res.execStatus = 'FAIL_L2';
          res.userErrorSummary = '邊界條件測試未通過（濕度為 39 時應開啟，40 時應關閉）。';
          res.learningSuggestion = '請檢查比較運算子是「大於 (>)」還是「小於 (<)」，並留意 40 不應包含在開啟條件內。';
        } else {
          res.execStatus = 'FAIL_L3';
          res.userErrorSummary = '標準輸出 (stdout) 未正確印出預期狀態字串。';
          res.learningSuggestion = '請確認程式碼最後有執行 print(evaluate_sprinkler(18)) 並輸出 SPRINKLER_ON。';
        }
      } catch (err) {
        res.passedL2 = -1; res.passedL3 = -1;
        res.execStatus = 'RUNTIME_ERROR';
        res.userErrorSummary = `語法或執行期錯誤：${err.message}`;
        res.learningSuggestion = '請檢查 Python 縮排是否一致，以及 if 條件式結尾是否加上冒號。';
      }
    }
  } else if (sectorId === 'market') {
    const hasFn = /function\s+createDebounce/.test(code) && /setTimeout/.test(code);
    if (!hasFn) {
      res.passedL1 = 0; res.passedL2 = -1; res.passedL3 = -1;
      res.execStatus = 'FAIL_L1';
      res.userErrorSummary = '缺少 createDebounce 函式或 setTimeout 計時器結構。';
      res.learningSuggestion = '請在 createDebounce 內部使用 setTimeout 延遲執行傳入的回呼函式 fn。';
    } else {
      const workerRes = await runJsInWorker(code, 2000);
      if (workerRes.status === 'TIMEOUT') {
        res.passedL2 = -1; res.passedL3 = -1;
        res.execStatus = 'TIMEOUT';
        res.userErrorSummary = '程式執行超過 2000ms Watchdog 上限，系統已強制中止。';
        res.learningSuggestion = '請檢查是否存在無窮迴圈（如 while(true)）或過長的延遲設定。';
      } else if (!workerRes.data.ok) {
        res.passedL2 = -1; res.passedL3 = -1;
        res.execStatus = 'RUNTIME_ERROR';
        res.userErrorSummary = `JavaScript 執行錯誤：${workerRes.data.runtimeError}`;
        res.learningSuggestion = '請檢查變數名稱拼寫與括號是否成對閉合。';
      } else {
        const hasClear = /clearTimeout\s*\(\s*timer\s*\)/.test(code);
        const l2Pub = workerRes.data.logsCount === 1;
        res.passedL2 = (l2Pub && hasClear) ? 1 : 0;
        res.passedL3 = (workerRes.data.stdout === 'CHECKOUT_PROCESSED' && hasClear) ? 1 : 0;

        res.publicSummary = { passed: (l2Pub && res.passedL3 === 1) ? 1 : 0, total: 1 };
        res.hiddenTestsPassed = (res.passedL2 === 1 && res.passedL3 === 1);
        res.hiddenInternalDetail = hasClear ? 'Hidden 2/2' : 'Hidden 0/2';

        if (res.passedL2 === 1 && res.passedL3 === 1) res.execStatus = 'PASS';
        else if (res.passedL2 === 0) {
          res.execStatus = 'FAIL_L2';
          res.userErrorSummary = '連續快速呼叫時觸發了多次結帳，防抖 (Debounce) 未生效。';
          res.learningSuggestion = '在建立新的 setTimeout 前，先呼叫 clearTimeout(timer) 取消上一次尚未執行的計時器。';
        } else {
          res.execStatus = 'FAIL_L3';
          res.userErrorSummary = '標準輸出 (stdout) 與預期 CHECKOUT_PROCESSED 不符。';
          res.learningSuggestion = '請勿修改下方測試呼叫與 console.log("CHECKOUT_PROCESSED") 輸出格式。';
        }
      }
    }
  }

  res.latencyMs = Math.round(performance.now() - start);
  const key = `${uuid}_${sectorId}`;
  const lvlProgKey = `${uuid}_${activeLvl.id}`;
  if (!db.progress[key]) db.progress[key] = { completed: false, attempts: 0, bestScore: 0 };
  if (!db.progress[lvlProgKey]) db.progress[lvlProgKey] = { completed: false, attempts: 0, bestScore: 0 };
  if (!db.affection[key]) db.affection[key] = { score: 0, tier: 1 };

  db.progress[key].attempts += 1;
  db.progress[lvlProgKey].attempts += 1;
  let isFirstClear = false;
  const isSuccess = (res.execStatus === 'PASS' || res.execStatus === 'CONCEPT_PASS');
  if (isSuccess) {
    res.bestScore = 100;
    db.progress[key].bestScore = 100;
    db.progress[lvlProgKey].bestScore = 100;
    if (!db.progress[lvlProgKey].completed) {
      db.progress[lvlProgKey].completed = true;
      isFirstClear = true;
      const prevTier = db.affection[key].tier;
      const bonus = db.hintDepth > 0 ? 25 : 35;
      db.affection[key].score = Math.min(100, db.affection[key].score + bonus);
      db.affection[key].tier = getTier(db.affection[key].score);
      if (db.affection[key].tier > prevTier) {
        if (!db.unreadDialogueSectors) db.unreadDialogueSectors = {};
        db.unreadDialogueSectors[sectorId] = true;
      }
    }
    const allSecLevels = getAllLevelsForSector(sectorId, false);
    db.progress[key].completed = allSecLevels.every(l => db.progress[`${uuid}_${l.id}`]?.completed);
  }

  db.auditLogs.push({
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString('zh-HK', { hour12: false }),
    uuid, sector: sec.name, levelTitle: activeLvl.title, mode: sec.mode,
    submittedCode: code,
    l1: res.passedL1, l2: res.passedL2, l3: res.passedL3,
    status: res.execStatus, hintDepth: db.hintDepth,
    hiddenDetail: res.hiddenInternalDetail
  });

  if (isSuccess) {
    if (!isPlainObject(db.unlockedAchievements)) db.unlockedAchievements = {};
    const localUnlock = (achCode) => {
      if (!db.unlockedAchievements[achCode]) {
        db.unlockedAchievements[achCode] = new Date().toISOString();
        const meta = ACHIEVEMENT_CATALOG.find(a => a.achievement_code === achCode);
        if (meta) showToast(`🏅 解鎖成就：${meta.icon_emoji} ${meta.title}`, 'success');
      }
    };
    localUnlock('first_clear');
    if (db.hintDepth === 0) localUnlock('no_hint_clear');
    if (db.progress[lvlProgKey].attempts === 1) localUnlock('fast_clear');
    const clearedSectorsCount = Object.keys(SECTORS).filter(s =>
      getAllLevelsForSector(s, false).some(l => db.progress[`${uuid}_${l.id}`]?.completed)
    ).length;
    if (clearedSectorsCount >= 4) localUnlock('all_sectors');
  }

  const currentTier = db.affection[key].tier;
  const evKey = isSuccess ? 'PASS' : 'FAIL';
  const [dialogueText, emotionTag] = OFFLINE_SCRIPTS[sectorId][currentTier][evKey];

  saveState();
  return { http: 200, res, dialogueText, emotionTag, aff: db.affection[key], prog: db.progress[lvlProgKey], isFirstClear };
}

/* =========================================================================
 * 6. UI RENDERING, HIERARCHICAL RESULTS & SEARCH MATCH COUNTER
 * ========================================================================= */
function showToast(msg, type = 'info') {
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  const colors = type === 'success'
    ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
    : type === 'error'
      ? 'bg-rose-950/95 border-rose-500 text-rose-100'
      : type === 'warn'
        ? 'bg-amber-950/95 border-amber-500 text-amber-100'
        : 'bg-slate-900/95 border-sky-500 text-sky-100';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warn' ? '⚠' : 'ℹ';
  el.className = `px-4 py-2.5 rounded-xl border text-xs font-mono shadow-xl transition-all duration-200 flex items-center gap-2 ${colors}`;
  el.textContent = `${icon} ${msg}`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => el.remove(), 220);
  }, 2800);
}

function updateAuthBadges() {
  const { role, studentUuid } = db.session;
  const titleBadge = document.getElementById('titleSessionBadge');
  const autoPillTitle = document.getElementById('titleAutoSaveBadge');
  const wsLabel = document.getElementById('wsAuthLabel');
  const btnAnlTitle = document.getElementById('btnOpenAnalyticsTitle');
  const btnAnlWs = document.getElementById('btnWsAdminDash');
  const uuidSpan = document.getElementById('authCurrentUuid');

  const relSave = formatRelativeTime(db.lastSavedAt);
  autoPillTitle.textContent = `💾 已自動儲存 (${relSave})`;

  if (role === 'admin') {
    titleBadge.textContent = '👑 教師管理員 (admin)';
    wsLabel.textContent = '👑 admin';
    btnAnlTitle.classList.remove('hidden');
    btnAnlWs.classList.remove('hidden');
    autoPillTitle.classList.remove('hidden');
  } else if (studentUuid) {
    titleBadge.textContent = `🎓 匿名學生 (${studentUuid})`;
    wsLabel.textContent = studentUuid;
    btnAnlTitle.classList.add('hidden');
    btnAnlWs.classList.add('hidden');
    autoPillTitle.classList.remove('hidden');
  } else {
    titleBadge.textContent = '訪客模式';
    wsLabel.textContent = '訪客';
    btnAnlTitle.classList.add('hidden');
    btnAnlWs.classList.add('hidden');
    autoPillTitle.classList.add('hidden');
  }
  if (uuidSpan) uuidSpan.textContent = studentUuid || '尚未建立 (Guest)';
  refreshTitleCards();
}

function refreshTitleCards() {
  const uuid = db.session.studentUuid;
  const stats = getOverallProgressStats();
  let repairedSectors = 0;
  let nextRecSector = null;

  Object.keys(SECTORS).forEach(s => {
    const key = `${uuid}_${s}`;
    const secLevels = getAllLevelsForSector(s, false);
    const clearedLvls = uuid ? secLevels.filter(l => db.progress[`${uuid}_${l.id}`]?.completed).length : 0;
    const attemptsSum = uuid ? secLevels.reduce((acc, l) => acc + (db.progress[`${uuid}_${l.id}`]?.attempts || 0), 0) : 0;
    const hasDraft = uuid && secLevels.some(l => {
      const d = db.drafts && db.drafts[`${uuid}_${l.id}`];
      return d !== undefined && d !== l.starter;
    });

    const done = secLevels.length > 0 && clearedLvls === secLevels.length;
    if (done) repairedSectors++;
    else if (!nextRecSector) nextRecSector = SECTORS[s];

    const a = uuid && db.affection[key];
    const card = document.getElementById(`card_${s}`);
    const stateTag = document.getElementById(`titleStateTag_${s}`);
    const newDlgTag = document.getElementById(`titleNewDialogue_${s}`);
    const progEl = document.getElementById(`titleProgress_${s}`);
    const playBtn = card.querySelector('.char-play-btn');
    const score = a ? a.score : 0;

    document.getElementById(`titleAff_${s}`).textContent = `好感 ${score}%`;
    document.getElementById(`titleAffBar_${s}`).style.width = `${score}%`;
    progEl.textContent = `進度: ${clearedLvls}/${secLevels.length} 關`;

    if (done) {
      card.className = 'p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/70 flex flex-col justify-between gap-3 transition';
      stateTag.className = 'text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold';
      stateTag.textContent = '✓ 已修復';
      if (playBtn) playBtn.textContent = '🔄 重新挑戰';
    } else if (clearedLvls > 0 || attemptsSum > 0 || hasDraft) {
      card.className = 'p-4 rounded-2xl bg-slate-900/95 border border-sky-500/60 flex flex-col justify-between gap-3 transition';
      stateTag.className = 'text-xs font-mono px-2 py-0.5 rounded-lg bg-sky-950 text-sky-200 border border-sky-600 font-bold';
      stateTag.textContent = clearedLvls > 0 ? `● 進行中 (${clearedLvls}/${secLevels.length})` : '● 進行中';
      if (playBtn) playBtn.textContent = '▶ 繼續修復';
    } else {
      card.className = 'p-4 rounded-2xl bg-slate-900/95 border border-slate-700 flex flex-col justify-between gap-3 transition';
      stateTag.className = 'text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-100 border border-slate-600';
      stateTag.textContent = '○ 尚未開始';
      if (playBtn) playBtn.textContent = '▶ 前往修復';
    }

    const hasNewDlg = !!(db.unreadDialogueSectors && db.unreadDialogueSectors[s]);
    newDlgTag.classList.toggle('hidden', !hasNewDlg);
  });

  document.getElementById('titleOverallProgressText').textContent = `${stats.cleared} / ${stats.total} 關 (${stats.pct}%) · 已修復 ${repairedSectors}/4 區`;
  document.getElementById('titleOverallProgressBar').style.width = `${stats.pct}%`;
  document.getElementById('wsDropdownProgress').textContent = `總進度：${stats.cleared}/${stats.total} 關 (${stats.pct}%)`;

  const recEl = document.getElementById('titleNextRecommendation');
  if (stats.cleared === 0) {
    recEl.textContent = '✨ 下一步推薦：生態農場（從生態農場開始最推薦）';
  } else if (nextRecSector) {
    recEl.textContent = `✨ 下一步推薦：${nextRecSector.name}（${nextRecSector.heroine} · ${nextRecSector.lang}）`;
  } else {
    recEl.textContent = '🎉 全鎮 4 區皆已修復完成，可隨時重新挑戰！';
  }
  const startTitleEl = document.getElementById('btnStartGameTitle');
  const startSubEl = document.getElementById('btnStartGameSub');
  if (startTitleEl && startSubEl) {
    const activeSec = SECTORS[db.currentSector] ? db.currentSector : (nextRecSector?.id || 'farm');
    const activeLvl = getLevelById(db.currentLevelId || `${activeSec}_1`);
    const isCompletedCur = !!(uuid && db.progress[`${uuid}_${activeLvl?.id}`]?.completed);
    if (stats.cleared === 0) {
      startTitleEl.textContent = `▶ 開始第一個任務：${SECTORS[nextRecSector?.id || 'farm'].name}`;
      startSubEl.textContent = '進入全區地圖 · 預選生態農場後開始除錯';
    } else if (!isCompletedCur && activeLvl) {
      startTitleEl.textContent = `▶ 繼續目前任務：${SECTORS[activeSec].name} · ${activeLvl.title}`;
      startSubEl.textContent = '進入全區地圖 · 預選目前任務後進入關卡';
    } else if (nextRecSector) {
      const nextLvls = getAllLevelsForSector(nextRecSector.id, false);
      const nextTodo = nextLvls.find(l => !(uuid && db.progress[`${uuid}_${l.id}`]?.completed)) || nextLvls[0];
      startTitleEl.textContent = `▶ 繼續下一個任務：${nextRecSector.name} · ${nextTodo?.title || ''}`;
      startSubEl.textContent = '進入全區地圖 · 預選下一個待修復基建';
    } else {
      startTitleEl.textContent = '▶ 自由探索與重溫關卡';
      startSubEl.textContent = '所有區域已修復完成，可隨時複習或挑戰';
    }
  }

  const achCountEl = document.getElementById('titleAchCount');
  if (achCountEl) {
    const unlockedCnt = Object.keys(db.unlockedAchievements || {}).length;
    achCountEl.textContent = `${unlockedCnt}/${ACHIEVEMENT_CATALOG.length}`;
  }
  const endingBtn = document.getElementById('btnTownCompleteBadge');
  if (stats.total > 0 && stats.cleared === stats.total) endingBtn.classList.remove('hidden');
  else endingBtn.classList.add('hidden');
}

function updateSyntaxAndGutter() {
  const editor = document.getElementById('codeEditorInput');
  const code = editor.value;
  const lines = Math.max(code.split('\n').length, 12);
  document.getElementById('wsLineGutter').innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
  document.getElementById('wsCodeSizeBadge').textContent = `${new Blob([code]).size} / 16384 B`;

  const lang = SECTORS[db.currentSector].prism;
  const codeEl = document.getElementById('codeHighlightContent');
  codeEl.className = `language-${lang}`;
  if (window.Prism && Prism.languages[lang]) {
    codeEl.innerHTML = Prism.highlight(code, Prism.languages[lang], lang);
  } else {
    codeEl.textContent = code;
  }
  updateCursorAndLineHighlight();
  if (!document.getElementById('editorSearchBar').classList.contains('hidden')) {
    updateSearchMatchCounter();
  }
}

function updateCursorAndLineHighlight() {
  const editor = document.getElementById('codeEditorInput');
  const pos = editor.selectionStart || 0;
  const before = editor.value.substring(0, pos);
  const lineIdx = before.split('\n').length - 1;
  const colIdx = pos - before.lastIndexOf('\n');
  document.getElementById('wsCursorPos').textContent = `第 ${lineIdx + 1} 行, 第 ${colIdx} 欄`;

  const lh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--editor-line-height')) || 22;
  const activeBar = document.getElementById('activeLineHighlight');
  activeBar.style.transform = `translateY(${lineIdx * lh - editor.scrollTop}px)`;

  const errBar = document.getElementById('errorLineHighlight');
  if (!errBar.classList.contains('hidden')) {
    errBar.style.transform = `translateY(${(lastErrorLine - 1) * lh - editor.scrollTop}px)`;
  }
}

let searchMatchPositions = [];
let currentSearchMatchIdx = -1;

function getSearchMatches(val, q) {
  if (!q) return [];
  const positions = [];
  let idx = val.indexOf(q, 0);
  while (idx !== -1) {
    positions.push(idx);
    idx = val.indexOf(q, idx + Math.max(1, q.length));
  }
  return positions;
}

function updateSearchMatchCounter() {
  const editor = document.getElementById('codeEditorInput');
  const q = document.getElementById('findInput').value;
  const badge = document.getElementById('findMatchCounter');
  if (!q) {
    searchMatchPositions = [];
    currentSearchMatchIdx = -1;
    badge.textContent = '0/0';
    badge.className = 'px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300';
    return;
  }
  searchMatchPositions = getSearchMatches(editor.value, q);
  if (searchMatchPositions.length === 0) {
    currentSearchMatchIdx = -1;
    badge.textContent = '0/0 (無相符)';
    badge.className = 'px-2 py-1 rounded-lg bg-rose-950/70 border border-rose-700 text-rose-200';
    return;
  }
  const selStart = editor.selectionStart;
  let curIdx = searchMatchPositions.indexOf(selStart);
  if (curIdx === -1) {
    curIdx = searchMatchPositions.findIndex(p => p >= selStart);
  }
  if (curIdx === -1) curIdx = 0;
  currentSearchMatchIdx = curIdx;
  badge.textContent = `${curIdx + 1}/${searchMatchPositions.length}`;
  badge.className = 'px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-200';
}

function navigateSearch(direction = 1) {
  const editor = document.getElementById('codeEditorInput');
  const q = document.getElementById('findInput').value;
  if (!q) return;
  searchMatchPositions = getSearchMatches(editor.value, q);
  if (searchMatchPositions.length === 0) {
    updateSearchMatchCounter();
    showToast('找不到相符字串', 'warn');
    return;
  }
  if (direction >= 0) {
    const start = editor.selectionEnd || 0;
    let nextIdx = searchMatchPositions.findIndex(p => p >= start);
    if (nextIdx === -1) nextIdx = 0;
    currentSearchMatchIdx = nextIdx;
  } else {
    const start = editor.selectionStart || 0;
    let prevIdx = -1;
    for (let i = searchMatchPositions.length - 1; i >= 0; i--) {
      if (searchMatchPositions[i] < start) {
        prevIdx = i;
        break;
      }
    }
    if (prevIdx === -1) prevIdx = searchMatchPositions.length - 1;
    currentSearchMatchIdx = prevIdx;
  }
  const targetPos = searchMatchPositions[currentSearchMatchIdx];
  const lineIdx = editor.value.substring(0, targetPos).split('\n').length - 1;
  const lh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--editor-line-height')) || 22;
  editor.focus();
  editor.setSelectionRange(targetPos, targetPos + q.length);
  editor.scrollTop = Math.max(0, (lineIdx - 2) * lh);
  const pre = document.getElementById('codeHighlightPre');
  const gutter = document.getElementById('wsLineGutter');
  if (pre) { pre.scrollTop = editor.scrollTop; pre.scrollLeft = editor.scrollLeft; }
  if (gutter) gutter.scrollTop = editor.scrollTop;
  updateCursorAndLineHighlight();
  updateSearchMatchCounter();
}

function pushDialogue(text, emotionTag) {
  dialogueHistory.push({ text, emotionTag });
  dialogueIdx = dialogueHistory.length - 1;
  renderDialogueStep();
}

function renderDialogueStep() {
  const item = dialogueHistory[dialogueIdx];
  if (!item) return;
  document.getElementById('wsDialogueText').textContent = item.text;
  document.getElementById('wsEmotionBadge').textContent = EMOTION_LABELS[item.emotionTag] || item.emotionTag;
  const navGroup = document.getElementById('dialogueNavGroup');
  if (dialogueHistory.length > 1) navGroup.classList.remove('hidden');
  else navGroup.classList.add('hidden');
  document.getElementById('dialogueNavCount').textContent = `${dialogueIdx + 1}/${dialogueHistory.length}`;
  document.getElementById('btnPrevDialogue').disabled = dialogueIdx <= 0;
  document.getElementById('btnNextDialogue').disabled = dialogueIdx >= dialogueHistory.length - 1;
}

function updateAffectionStyle(score, tier) {
  document.getElementById('wsAffScore').textContent = `${score}%`;
  const tierEl = document.getElementById('wsAffTier');
  const avatarBox = document.getElementById('wsAvatarBox');
  if (tier === 3) {
    tierEl.textContent = 'Tier 3 · 心動共鳴';
    tierEl.className = 'px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-200 border border-rose-500 text-xs font-bold';
    avatarBox.className = 'w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-gradient-to-tr from-rose-500 via-amber-400 to-pink-400 shadow-lg transition-all duration-200';
  } else if (tier === 2) {
    tierEl.textContent = 'Tier 2 · 夥伴信賴';
    tierEl.className = 'px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-200 border border-sky-500 text-xs font-bold';
    avatarBox.className = 'w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-gradient-to-tr from-sky-500 to-emerald-400 shadow-lg transition-all duration-200';
  } else {
    tierEl.textContent = 'Tier 1 · 警戒審視';
    tierEl.className = 'px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600 text-xs font-bold';
    avatarBox.className = 'w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-gradient-to-tr from-slate-600 to-slate-500 shadow-lg transition-all duration-200';
  }
}

function updateHintBtnLabel() {
  const btn = document.getElementById('btnRequestHint');
  const labels = ['請求第 1 層提示 (0/3)', '查看第 2 層概念 (1/3)', '查看第 3 層結構 (2/3)', '已顯示全部提示 (3/3)'];
  btn.textContent = labels[Math.min(db.hintDepth, 3)];
}

function resetEvaluationCards() {
  document.getElementById('evalOverallStatusBadge').textContent = '⏸ 尚未執行測試';
  document.getElementById('evalOverallStatusBadge').className = 'text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-600 font-bold';
  document.getElementById('testPassCountBadge').textContent = '通過: 0';
  document.getElementById('testFailCountBadge').textContent = '未通過: 0';
  document.getElementById('mobTestBadge').className = 'w-2.5 h-2.5 rounded-full bg-slate-600';
  document.getElementById('badgePublicSummary').textContent = '';
  document.getElementById('badgeHiddenStatus').textContent = '';
  const passBox = document.getElementById('passNextStepBox');
  if (passBox) passBox.classList.add('hidden');
  document.getElementById('learningFeedbackBox').classList.add('hidden');
  document.getElementById('focusMiniErrorBadge').classList.add('hidden');
  document.getElementById('errorLineHighlight').classList.add('hidden');
  document.getElementById('testEmptyStateGuide').classList.remove('hidden');
  document.getElementById('testExpectedActualBox')?.classList.add('hidden');

  [1, 2, 3].forEach(n => {
    document.getElementById(`accItemL${n}`).className = 'rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden';
    const tag = document.getElementById(`statusTagL${n}`);
    tag.textContent = '⏸ 尚未執行';
    tag.className = 'px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300';
    document.getElementById(`stepDot${n}`).className = 'w-3 h-3 rounded-full bg-slate-600 shrink-0';
    document.getElementById(`stepperDot${n}`).className = 'w-3 h-3 rounded-full bg-slate-500';
    document.getElementById(`stepperBar${n}`).className = 'w-full h-1.5 rounded-full bg-slate-700';
    document.getElementById(`accBodyL${n}`).classList.add('hidden');
    const btn = document.querySelector(`[data-acc-target="accBodyL${n}"]`);
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
  document.getElementById('detailTextL1').textContent = '等待提交程式碼進行驗證。';
  document.getElementById('detailTextL2').textContent = '等待驗證邊界輸入條件。';
  document.getElementById('detailTextL3').textContent = '等待比對最終標準輸出結果。';
}

function updateLevelAccordion(n, val, passMsg, failMsg) {
  const card = document.getElementById(`accItemL${n}`);
  const tag = document.getElementById(`statusTagL${n}`);
  const text = document.getElementById(`detailTextL${n}`);
  const dot = document.getElementById(`stepDot${n}`);
  const sDot = document.getElementById(`stepperDot${n}`);
  const sBar = document.getElementById(`stepperBar${n}`);
  const stepBtn = document.querySelector(`.step-node-btn[data-step-focus="${n}"]`);
  if (stepBtn) {
    stepBtn.className = val === 0
      ? 'step-node-btn p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/80 flex flex-col items-center gap-1 text-xs font-mono transition cursor-pointer'
      : 'step-node-btn p-2 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 flex flex-col items-center gap-1 text-xs font-mono transition';
  }

  if (val === null) {
    card.className = 'rounded-2xl bg-slate-900/80 border border-amber-700/50 overflow-hidden';
    tag.textContent = '⊘ 略過 (N/A)';
    tag.className = 'px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300';
    dot.className = 'w-3 h-3 rounded-full bg-amber-400 shrink-0';
    sDot.className = 'w-3 h-3 rounded-full bg-amber-400';
    sBar.className = 'w-full h-1.5 rounded-full bg-amber-500/70';
    text.textContent = '本關卡採概念模式比對，不適用動態執行。';
  } else if (val === -1) {
    card.className = 'rounded-2xl bg-slate-900/80 border border-slate-700 overflow-hidden';
    tag.textContent = '⏸ 未執行';
    tag.className = 'px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200';
    dot.className = 'w-3 h-3 rounded-full bg-slate-500 shrink-0';
    sDot.className = 'w-3 h-3 rounded-full bg-slate-500';
    sBar.className = 'w-full h-1.5 rounded-full bg-slate-700';
    text.textContent = '因前置語法檢查或執行異常而中止。';
  } else if (val === 1) {
    card.className = 'rounded-2xl bg-emerald-950/30 border border-emerald-600/60 overflow-hidden';
    tag.textContent = '✓ 通過';
    tag.className = 'px-2 py-0.5 rounded-lg bg-emerald-900 text-emerald-200 font-bold';
    dot.className = 'w-3 h-3 rounded-full bg-emerald-400 shrink-0';
    sDot.className = 'w-3 h-3 rounded-full bg-emerald-400';
    sBar.className = 'w-full h-1.5 rounded-full bg-emerald-500';
    text.textContent = passMsg;
  } else {
    card.className = 'rounded-2xl bg-rose-950/35 border border-rose-500/80 overflow-hidden';
    tag.textContent = '✕ 失敗';
    tag.className = 'px-2 py-0.5 rounded-lg bg-rose-900 text-rose-200 font-bold';
    dot.className = 'w-3 h-3 rounded-full bg-rose-500 shrink-0';
    sDot.className = 'w-3 h-3 rounded-full bg-rose-500';
    sBar.className = 'w-full h-1.5 rounded-full bg-rose-500';
    text.textContent = failMsg;
  }
}

function appendConsole(msg, level = 'info') {
  const box = document.getElementById('wsConsole');
  if (!box) return;
  const line = document.createElement('div');
  const color = level === 'ok' ? 'text-emerald-300' : level === 'err' ? 'text-rose-300' : 'text-slate-300';
  line.className = color;
  line.textContent = `[${new Date().toLocaleTimeString('zh-HK', { hour12: false })}] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function jumpToEditorLine(lineNum) {
  if (window.innerWidth < 1024) setMobileTab('editor');
  const editor = document.getElementById('codeEditorInput');
  const lines = editor.value.split('\n');
  const target = Math.max(1, Math.min(lines.length, lineNum));
  let pos = 0;
  for (let i = 0; i < target - 1; i++) {
    pos += lines[i].length + 1;
  }
  editor.focus();
  editor.setSelectionRange(pos, pos + (lines[target - 1]?.length || 0));
  const lh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--editor-line-height')) || 22;
  editor.scrollTop = Math.max(0, (target - 3) * lh);
  const pre = document.getElementById('codeHighlightPre');
  const gutter = document.getElementById('wsLineGutter');
  if (pre) pre.scrollTop = editor.scrollTop;
  if (gutter) gutter.scrollTop = editor.scrollTop;
  updateCursorAndLineHighlight();
}

function loadSector(sectorId, targetLevelId = null) {
  flushDraftNow();
  db.currentSector = sectorId;
  const sectorLevels = getAllLevelsForSector(sectorId, false);
  const chosen = (targetLevelId && sectorLevels.find(l => l.id === targetLevelId)) || sectorLevels[0];
  db.currentLevelId = chosen.id;

  const lvlSelect = document.getElementById('wsLevelSelect');
  const uuidForOpts = db.session.studentUuid;
  lvlSelect.innerHTML = '';
  sectorLevels.forEach(l => {
    const opt = document.createElement('option');
    const isDone = Boolean(uuidForOpts && db.progress[`${uuidForOpts}_${l.id}`]?.completed);
    opt.value = l.id;
    opt.textContent = `${isDone ? '✓' : '○'} ${l.title}`;
    if (l.id === chosen.id) opt.selected = true;
    lvlSelect.appendChild(opt);
  });

  db.hintDepth = 0;
  dialogueHistory = [];
  updateHintBtnLabel();
  document.getElementById('hintDrawer').classList.add('hidden');
  document.getElementById('hintConfirmBox').classList.add('hidden');

  const sec = SECTORS[sectorId];
  const vnPanel = document.getElementById('wsVnPanel');
  vnPanel.classList.remove('sector-fade');
  void vnPanel.offsetWidth;
  vnPanel.classList.add('sector-fade');

  document.querySelectorAll('.ws-tab').forEach(btn => {
    btn.className = btn.dataset.wsSector === sectorId
      ? 'ws-tab px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 bg-orange-600 text-white transition'
      : 'ws-tab px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 text-slate-300 hover:text-white transition';
  });

  document.getElementById('wsLocation').textContent = sec.location;
  document.getElementById('wsMetaphor').textContent = chosen.metaphor;
  document.getElementById('wsCharacterSvg').innerHTML = sec.svg;
  document.getElementById('wsCharName').textContent = `${sec.heroine} (${sec.lang})`;
  document.getElementById('wsSpeaker').textContent = sec.heroine;
  document.getElementById('wsFileName').textContent = chosen.file;
  const qGoal = document.getElementById('questBriefGoal');
  const qCrit = document.getElementById('questBriefCriteria');
  if (qGoal) qGoal.textContent = `${chosen.title}（${chosen.metaphor || sec.metaphor}）`;
  if (qCrit) {
    const reqList = [];
    if (chosen.requiredToken) reqList.push(`保留關鍵字「${chosen.requiredToken}」`);
    if (chosen.passPattern) reqList.push(`符合邏輯「${chosen.passPattern}」`);
    if (chosen.expectedStdout) reqList.push(`預期輸出：${chosen.expectedStdout}`);
    qCrit.textContent = reqList.length > 0 ? reqList.join(' · ') : '通過 L1 結構、L2 邏輯與 L3 輸出檢查';
  }
  document.getElementById('storyModeFilePreview').textContent = chosen.file;
  document.getElementById('focusMiniCharName').textContent = sec.heroine;

  const modeBadge = document.getElementById('wsEvalModeBadge');
  modeBadge.textContent = sec.modeLabel;
  modeBadge.className = `hidden md:inline-flex text-xs font-mono px-2.5 py-0.5 rounded-xl border font-semibold ${sec.badgeClass}`;

  const uuid = db.session.studentUuid;
  const key = `${uuid}_${sectorId}`;
  const lvlKey = `${uuid}_${chosen.id}`;
  const aff = (uuid && db.affection[key]) || { score: 0, tier: 1 };
  const prog = (uuid && db.progress[lvlKey]) || { completed: false, attempts: 0 };
  const attBadge = document.getElementById('wsLevelAttemptsBadge');
  if (attBadge) attBadge.textContent = `嘗試: ${prog.attempts || 0} 次`;
  const hasDraft = uuid && db.drafts && db.drafts[`${uuid}_${chosen.id}`] !== undefined;

  updateAffectionStyle(aff.score, aff.tier);
  const clearBadge = document.getElementById('wsClearBadge');
  if (prog.completed) {
    clearBadge.textContent = '✓ 已修復';
    clearBadge.className = 'text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold';
  } else if ((prog.attempts || 0) > 0 || hasDraft) {
    clearBadge.textContent = '● 進行中';
    clearBadge.className = 'text-xs font-mono px-2 py-0.5 rounded-lg bg-sky-950 text-sky-200 border border-sky-600 font-bold';
  } else {
    clearBadge.textContent = '○ 尚未開始';
    clearBadge.className = 'text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-100 border border-slate-600';
  }

  const [introText, introEmo] = OFFLINE_SCRIPTS[sectorId][aff.tier].FAIL;
  pushDialogue(introText, introEmo);

  const draftKey = `${uuid}_${chosen.id}`;
  const savedDraft = uuid && db.drafts && db.drafts[draftKey];
  document.getElementById('codeEditorInput').value = (savedDraft && savedDraft.trim().length > 0) ? savedDraft : chosen.starter;
  updateSyntaxAndGutter();
  resetEvaluationCards();
  appendConsole(`[載入] ${sec.name} · ${chosen.title} (${sec.mode})`);
}

async function flushOfflineSyncQueue() {
  if (!dbBackendReady || !Array.isArray(db.offlineSyncQueue) || db.offlineSyncQueue.length === 0) return;
  const remaining = [];
  let syncedCount = 0;
  for (const item of db.offlineSyncQueue) {
    try {
      const resp = await fetch('api/sync.php', {
        method: 'POST',
        headers: buildAuthJsonHeaders(),
        body: JSON.stringify(item)
      });
      if (resp.ok) {
        const j = await resp.json();
        if (j && j.ok) { syncedCount++; continue; }
      }
      remaining.push(item);
    } catch (_) {
      remaining.push(item);
    }
  }
  db.offlineSyncQueue = remaining;
  saveState();
  if (syncedCount > 0) {
    showToast(`☁ 已將 ${syncedCount} 筆離線紀錄補同步至 MySQL`, 'success');
  }
}

async function syncResultToMySQL(payload) {
  try {
    if (window.location.protocol === 'file:') return;
    const resp = await fetch('api/sync.php', {
      method: 'POST',
      headers: buildAuthJsonHeaders(),
      body: JSON.stringify(payload)
    });
    if (resp.ok) {
      const json = await resp.json();
      if (json.ok) {
        if (typeof json.affection_score === 'number' && payload && payload.sector_id && db.session && db.session.studentUuid) {
          const affKey = `${db.session.studentUuid}_${payload.sector_id}`;
          if (!db.affection[affKey]) db.affection[affKey] = { score: 0, tier: 1 };
          db.affection[affKey].score = json.affection_score;
          db.affection[affKey].tier = Number(json.affection_tier || getTier(json.affection_score));
          saveState();
        }
        appendConsole('[MySQL Sync] 審計日誌、進度與好感度已同步寫入 XAMPP MySQL。', 'ok');
        return;
      }
    }
    throw new Error('Sync response not ok');
  } catch (e) {
    if (!Array.isArray(db.offlineSyncQueue)) db.offlineSyncQueue = [];
    if (db.offlineSyncQueue.length < 50) {
      db.offlineSyncQueue.push(payload);
      saveState();
    }
    if (dbBackendReady) {
      const badge = document.getElementById('xamppStatusBadge');
      if (badge) {
        badge.textContent = '⚠ 同步異常，已暫存離線佇列';
        badge.className = 'hidden md:inline-block text-xs px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono';
      }
    }
  }
}

async function handleRunSubmission() {
  if (!(await requireDatabaseReady())) return;
  if (isSubmitting) return;
  isSubmitting = true;
  flushDraftNow();

  const runBtn = document.getElementById('btnRunDebug');
  const runSpinner = document.getElementById('runSpinner');
  const runLabel = document.getElementById('runBtnLabel');
  if (runBtn) runBtn.disabled = true;
  if (runSpinner) runSpinner.classList.remove('hidden');
  if (runLabel) runLabel.textContent = '評測中...';

  const code = document.getElementById('codeEditorInput').value;
  const levelId = db.currentLevelId;

  try {
    const out = await evaluateSubmissionV23(db.currentSector, code, levelId);
    if (out.http !== 200) {
      showToast(out.msg || '提交格式錯誤', 'error');
      return;
    }

    const { res, dialogueText, emotionTag, aff, prog, isFirstClear } = out;
    const isSuccess = (res.execStatus === 'PASS' || res.execStatus === 'CONCEPT_PASS');

    document.getElementById('testEmptyStateGuide').classList.add('hidden');
    const overallBadge = document.getElementById('evalOverallStatusBadge');
    overallBadge.textContent = isSuccess ? `✓ 通過 (${res.execStatus})` : `✕ 未通過 (${res.execStatus})`;
    const eaBox = document.getElementById('testExpectedActualBox');
    const expEl = document.getElementById('testExpectedVal');
    const actEl = document.getElementById('testActualVal');
    if (eaBox && expEl && actEl) {
      const activeLvl = getLevelById(levelId);
      expEl.textContent = activeLvl?.expectedStdout ? `輸出 ${activeLvl.expectedStdout}` : (activeLvl?.passPattern || '通過三層結構與邏輯檢查');
      actEl.textContent = isSuccess ? '✓ 符合預期條件' : (res.userErrorSummary || res.execStatus);
      eaBox.classList.remove('hidden');
    }
    overallBadge.className = isSuccess
      ? 'text-xs font-mono px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold'
      : 'text-xs font-mono px-2.5 py-1 rounded-xl bg-rose-950 text-rose-300 border border-rose-500 font-bold';

    const levelsArr = [res.passedL1, res.passedL2, res.passedL3].filter(v => v !== null && v !== -1);
    const passCount = levelsArr.filter(v => v === 1).length;
    const failCount = levelsArr.filter(v => v === 0).length;
    document.getElementById('testPassCountBadge').textContent = `通過: ${passCount}`;
    document.getElementById('testFailCountBadge').textContent = `未通過: ${failCount}`;
    const mobBadgeEl = document.getElementById('mobTestBadge');
    if (mobBadgeEl) {
      mobBadgeEl.className = isSuccess
        ? 'w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/70'
        : 'w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300/70';
      if (window.__mobBadgeTimer) clearTimeout(window.__mobBadgeTimer);
      window.__mobBadgeTimer = setTimeout(() => {
        mobBadgeEl.classList.remove('ring-2', 'ring-emerald-300/70', 'ring-rose-300/70');
      }, 10000);
    }
    const hiddenText = res.hiddenTestsPassed === null ? 'Hidden —' : (res.hiddenTestsPassed ? 'Hidden ✓' : 'Hidden ✕');
    document.getElementById('badgePublicSummary').textContent = `Public ${res.publicSummary.passed}/${res.publicSummary.total} · ${hiddenText} · ${res.latencyMs}ms`;
    document.getElementById('badgeHiddenStatus').textContent = '';

    updateLevelAccordion(1, res.passedL1, '語法結構與關鍵節點檢查通過。', res.userErrorSummary || '基礎結構檢查未通過。');
    updateLevelAccordion(2, res.passedL2, '公開與邊界條件邏輯測試全數通過。', res.userErrorSummary || '邊界邏輯條件未通過。');
    updateLevelAccordion(3, res.passedL3, '標準輸出 (stdout) 與預期結果完全一致。', res.userErrorSummary || '標準輸出結果不符。');

    updateAffectionStyle(aff.score, aff.tier);
    pushDialogue(dialogueText, emotionTag);
    document.getElementById('focusMiniCharEmo').textContent = EMOTION_LABELS[emotionTag] || emotionTag;

    const activeOpt = document.querySelector(`#wsLevelSelect option[value="${levelId}"]`);
    if (activeOpt && prog.completed) {
      activeOpt.textContent = `✓ ${getLevelById(levelId).title}`;
    }
    const clearBadge = document.getElementById('wsClearBadge');
    clearBadge.textContent = prog.completed ? '✓ 已修復' : '● 進行中';
    clearBadge.className = prog.completed
      ? 'text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold'
      : 'text-xs font-mono px-2 py-0.5 rounded-lg bg-sky-950 text-sky-200 border border-sky-600 font-bold';

    const attBadge = document.getElementById('wsLevelAttemptsBadge');
    if (attBadge) attBadge.textContent = `嘗試: ${prog.attempts || 0} 次`;

    const fbBox = document.getElementById('learningFeedbackBox');
    const passBox = document.getElementById('passNextStepBox');
    const errBar = document.getElementById('errorLineHighlight');
    const focusErr = document.getElementById('focusMiniErrorBadge');
    const mobRetBtn = document.getElementById('btnMobReturnEditor');

    if (isSuccess) {
      fbBox.classList.add('hidden');
      if (passBox) {
        passBox.classList.remove('hidden');
        const secLevels = getAllLevelsForSector(db.currentSector, false);
        const uuid = db.session.studentUuid;
        const nextUnfinished = secLevels.find(l => l.id !== levelId && !(uuid && db.progress[`${uuid}_${l.id}`]?.completed));
        const nextBtn = document.getElementById('btnNextSectorLevel');
        if (nextBtn) {
          if (nextUnfinished) {
            nextBtn.classList.remove('hidden');
            nextBtn.dataset.nextLvlId = nextUnfinished.id;
            nextBtn.textContent = `▶ 下一關：${nextUnfinished.title}`;
          } else {
            nextBtn.classList.add('hidden');
          }
        }
        const chatBtn = document.getElementById('btnPassOpenChat');
        if (chatBtn) chatBtn.textContent = `💬 與${SECTORS[db.currentSector].heroine}聊聊`;
      }
      errBar.classList.add('hidden');
      focusErr.classList.add('hidden');
      if (mobRetBtn) mobRetBtn.textContent = '↩ 返回編輯器';
      document.getElementById('feedbackKeywordHint').textContent = '定位線索：全數測試通過，無異常行號';
      playSfx(980, 'triangle', 0.22);
      appendConsole(`${res.execStatus} (${res.latencyMs}ms) — 測試通過，進度與好感度已更新！`, 'ok');
      if (isFirstClear) {
        recentlyFixedSector = db.currentSector;
        launchConfetti();
        const prevCleared = Object.keys(db.progress).filter(k => db.progress[k]?.completed).length;
        if (prevCleared === 1) {
          showToast('🎉 你修復了第一個基建！小鎮能源開始恢復了！', 'success');
        } else {
          showToast(`關卡完成！${SECTORS[db.currentSector].name}進度已更新`, 'success');
        }
      } else {
        showToast(`測試成功 (${res.execStatus})`, 'success');
      }
    } else {
      if (passBox) passBox.classList.add('hidden');
      lastErrorLine = res.errorLine || 1;
      const activeFile = getLevelById(levelId)?.file || SECTORS[db.currentSector].file;
      const failedLayerMap = {
        FAIL_L1: 'L1 基礎結構測試',
        FAIL_L2: 'L2 進階邏輯測試',
        FAIL_L3: 'L3 完整輸出測試',
        CONCEPT_FAIL: 'L1 概念結構測試',
        TIMEOUT: '執行時間上限 (2000ms Watchdog)',
        RUNTIME_ERROR: '語法 / 執行期錯誤'
      };
      const failedTargetEl = document.getElementById('feedbackFailedTarget');
      if (failedTargetEl) {
        failedTargetEl.textContent = `失敗項目：${failedLayerMap[res.execStatus] || res.execStatus} ｜ 檔案：${activeFile} ｜ 建議檢查：第 ${lastErrorLine} 行`;
      }
      document.getElementById('errorLineNumLabel').textContent = lastErrorLine;
      if (mobRetBtn) mobRetBtn.textContent = `↩ 返回編輯器並跳至第 ${lastErrorLine} 行`;
      document.getElementById('feedbackErrorReason').textContent = res.userErrorSummary;
      document.getElementById('feedbackKeywordHint').textContent = `定位線索：${res.errorKeywordHint || `可能與第 ${lastErrorLine} 行附近的邏輯有關`}`;
      document.getElementById('feedbackSuggestion').textContent = res.learningSuggestion || '請參考左側漸進式提示系統逐步排查。';
      fbBox.classList.remove('hidden');
      errBar.classList.remove('hidden');
      focusErr.textContent = `✕ ${res.execStatus} · 第 ${lastErrorLine} 行`;
      focusErr.classList.remove('hidden');
      updateCursorAndLineHighlight();
      playSfx(240, 'sawtooth', 0.16);
      appendConsole(`${res.execStatus} (${res.latencyMs}ms) — ${res.userErrorSummary}`, 'err');
      showToast(`測試失敗 (${res.execStatus})`, 'error');
    }
    updateAuthBadges();
    if (window.innerWidth < 1024) {
      setMobileTab('test');
    }

    syncResultToMySQL({
      student_uuid: db.session.studentUuid,
      level_code: levelId,
      submitted_code: code,
      passed_l1: res.passedL1,
      passed_l2: res.passedL2,
      passed_l3: res.passedL3,
      exec_status: res.execStatus,
      latency_ms: res.latencyMs,
      hint_depth_used: db.hintDepth,
      affection_score: aff.score,
      affection_tier: aff.tier
    });
  } catch (err) {
    appendConsole(`系統執行錯誤：${err.message}`, 'err');
    showToast('評測過程發生異常', 'error');
  } finally {
    isSubmitting = false;
    if (runBtn) runBtn.disabled = false;
    if (runSpinner) runSpinner.classList.add('hidden');
    if (runLabel) runLabel.textContent = '▶ 執行測試';
  }
}

function renderWorkspaceMode(mode) {
  wsMode = mode;
  const vn = document.getElementById('wsVnPanel');
  const resizer = document.getElementById('wsResizer');
  const rightArea = document.getElementById('wsRightArea');
  const edPane = document.getElementById('wsEditorPane');
  const testPane = document.getElementById('wsTestPane');
  const storyStrip = document.getElementById('storyModeCompactStrip');
  const focusStrip = document.getElementById('focusModeMiniStrip');
  const avatarBox = document.getElementById('wsAvatarBox');

  document.querySelectorAll('.ws-mode-btn').forEach(btn => {
    btn.className = btn.dataset.wsMode === mode
      ? 'ws-mode-btn px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold transition'
      : 'ws-mode-btn px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition';
  });

  if (window.innerWidth < 1024) return;

  if (mode === 'focus') {
    vn.classList.add('lg:hidden');
    vn.classList.remove('lg:flex');
    resizer.classList.add('lg:hidden');
    resizer.classList.remove('lg:flex');
    resizer.setAttribute('aria-hidden', 'true');
    resizer.setAttribute('tabindex', '-1');
    rightArea.classList.remove('hidden');
    storyStrip.classList.add('hidden');
    storyStrip.classList.remove('flex');
    edPane.classList.remove('hidden');
    edPane.classList.add('flex');
    testPane.classList.remove('hidden');
    testPane.classList.add('flex');
    focusStrip.classList.remove('hidden');
  } else if (mode === 'story') {
    vn.classList.remove('lg:hidden');
    vn.classList.add('lg:flex');
    vn.style.flexBasis = '72%';
    resizer.classList.add('lg:hidden');
    resizer.classList.remove('lg:flex');
    resizer.setAttribute('aria-hidden', 'true');
    resizer.setAttribute('tabindex', '-1');
    rightArea.classList.remove('hidden');
    edPane.classList.add('hidden');
    edPane.classList.remove('flex');
    testPane.classList.add('hidden');
    testPane.classList.remove('flex');
    focusStrip.classList.add('hidden');
    storyStrip.classList.remove('hidden');
    storyStrip.classList.add('flex');
    avatarBox.classList.add('sm:w-44', 'sm:h-44');
  } else {
    const pct = Math.max(25, Math.min(70, Number(db.savedSplitPct) || 42));
    vn.classList.remove('lg:hidden');
    vn.classList.add('lg:flex');
    vn.style.flexBasis = `${pct}%`;
    resizer.classList.remove('lg:hidden');
    resizer.classList.add('lg:flex');
    resizer.removeAttribute('aria-hidden');
    resizer.setAttribute('tabindex', '0');
    resizer.setAttribute('aria-valuenow', String(pct));
    rightArea.classList.remove('hidden');
    storyStrip.classList.add('hidden');
    storyStrip.classList.remove('flex');
    focusStrip.classList.add('hidden');
    edPane.classList.remove('hidden');
    edPane.classList.add('flex');
    testPane.classList.remove('hidden');
    testPane.classList.add('flex');
    avatarBox.classList.remove('sm:w-44', 'sm:h-44');
  }
}

function setWorkspaceMode(mode) {
  wsMode = mode;
  db.savedWsMode = mode;
  saveState();
  renderWorkspaceMode(mode);
}

function setMobileTab(tab, focusTab = false) {
  mobileActiveTab = tab;
  document.querySelectorAll('.mob-tab-btn').forEach(btn => {
    const active = btn.dataset.mobileTab === tab;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.setAttribute('tabindex', active ? '0' : '-1');
    btn.className = active
      ? 'mob-tab-btn min-h-[42px] py-2 border-b-2 border-orange-500 text-orange-300 font-bold bg-slate-900/80 flex items-center justify-center gap-1.5 transition'
      : 'mob-tab-btn min-h-[42px] py-2 border-b-2 border-transparent text-slate-300 font-bold flex items-center justify-center gap-1.5 transition';
    if (focusTab && active) btn.focus();
  });

  if (window.innerWidth >= 1024) return;

  const vn = document.getElementById('wsVnPanel');
  const rightArea = document.getElementById('wsRightArea');
  const edPane = document.getElementById('wsEditorPane');
  const testPane = document.getElementById('wsTestPane');

  vn.setAttribute('role', 'tabpanel');
  vn.setAttribute('aria-labelledby', 'mobTabBtn_story');
  edPane.setAttribute('role', 'tabpanel');
  edPane.setAttribute('aria-labelledby', 'mobTabBtn_editor');
  testPane.setAttribute('role', 'tabpanel');
  testPane.setAttribute('aria-labelledby', 'mobTabBtn_test');

  if (tab === 'story') {
    vn.classList.remove('hidden');
    vn.classList.add('flex', 'flex-1');
    vn.inert = false;
    vn.removeAttribute('aria-hidden');
    rightArea.classList.add('hidden');
    edPane.inert = true;
    testPane.inert = true;
  } else if (tab === 'editor') {
    vn.classList.add('hidden');
    vn.classList.remove('flex', 'flex-1');
    vn.inert = true;
    vn.setAttribute('aria-hidden', 'true');
    rightArea.classList.remove('hidden');
    edPane.classList.remove('hidden');
    edPane.classList.add('flex');
    edPane.inert = false;
    edPane.removeAttribute('aria-hidden');
    testPane.classList.add('hidden');
    testPane.classList.remove('flex', 'flex-1');
    testPane.inert = true;
    testPane.setAttribute('aria-hidden', 'true');
  } else {
    vn.classList.add('hidden');
    vn.classList.remove('flex', 'flex-1');
    vn.inert = true;
    vn.setAttribute('aria-hidden', 'true');
    rightArea.classList.remove('hidden');
    edPane.classList.add('hidden');
    edPane.classList.remove('flex');
    edPane.inert = true;
    edPane.setAttribute('aria-hidden', 'true');
    testPane.classList.remove('hidden');
    testPane.classList.add('flex', 'flex-1');
    testPane.inert = false;
    testPane.removeAttribute('aria-hidden');
  }
}

function applyResponsiveLayout() {
  const vn = document.getElementById('wsVnPanel');
  const rightArea = document.getElementById('wsRightArea');
  const edPane = document.getElementById('wsEditorPane');
  const testPane = document.getElementById('wsTestPane');
  const resizer = document.getElementById('wsResizer');
  if (window.innerWidth >= 1024) {
    [vn, edPane, testPane].forEach(el => {
      if (!el) return;
      el.removeAttribute('role');
      el.removeAttribute('aria-labelledby');
      el.removeAttribute('aria-hidden');
      el.inert = false;
    });
    rightArea.classList.remove('hidden');
    edPane.classList.remove('hidden');
    edPane.classList.add('flex');
    testPane.classList.remove('hidden', 'flex-1');
    testPane.classList.add('flex');
    renderWorkspaceMode(wsMode);
  } else {
    if (resizer) {
      resizer.setAttribute('aria-hidden', 'true');
      resizer.setAttribute('tabindex', '-1');
    }
    setMobileTab(mobileActiveTab);
  }
}

async function enterWorkspace(sectorId = 'farm') {
  if (!(await requireDatabaseReady())) return;
  ensureStudentSession();
  document.getElementById('titleScreen').classList.add('hidden');
  stopParticles();
  document.getElementById('gameWorkspace').classList.remove('hidden');
  if (!db.onboardingDismissed) {
    db.onboardingStep = 1;
    document.getElementById('onboardingText').innerHTML = '💡 <strong>新手引導 (1/3)：</strong>閱讀角色遇到的基建問題，準備修正程式碼。';
    document.getElementById('onboardingBanner').classList.remove('hidden');
  }
  loadSector(sectorId);
  applyResponsiveLayout();
}

/* =========================================================================
 * 8. SAVE / LOAD WITH CONFIRMATION & JSON PREVIEW VALIDATION
 * ========================================================================= */
function renderSaveSlots() {
  if (!Array.isArray(db.saveSlots)) db.saveSlots = [null, null, null, null];
  const container = document.getElementById('saveSlotsContainer');
  container.innerHTML = '';
  let used = 0;

  const stats = getOverallProgressStats();
  const modeLabelEl = document.getElementById('saveModalStorageMode');
  if (modeLabelEl) {
    modeLabelEl.textContent = dbBackendReady ? '☁ MySQL 資料庫 (127.0.0.1)' : '⚠ 資料庫未連線';
    modeLabelEl.className = dbBackendReady ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold';
  }
  document.getElementById('saveCurLocation').textContent = `${SECTORS[db.currentSector].name} · ${getLevelById(db.currentLevelId).title}`;
  document.getElementById('saveLastTime').textContent = formatRelativeTime(db.lastSavedAt);
  document.getElementById('saveCurProgress').textContent = `${stats.cleared}/${stats.total} 關 (${stats.pct}%)`;

  db.saveSlots.forEach((slot, idx) => {
    const div = document.createElement('div');
    if (slot) {
      used++;
      div.className = 'p-3.5 rounded-2xl bg-slate-950 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3';
      div.innerHTML = `
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">SLOT 0${idx + 1}</span>
            <span class="text-white font-bold">${slot.label}</span>
            <span class="text-emerald-400">${slot.progressSummary || `${slot.clearedCount || 0}/4 區`}</span>
          </div>
          <div class="text-xs text-slate-400">身分: ${slot.studentUuid || 'Guest'} · 儲存時間: ${slot.savedAt}</div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button data-req-overwrite="${idx}" class="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600">覆蓋</button>
          <button data-confirm-overwrite="${idx}" class="hidden min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold">確認覆蓋？</button>
          <button data-load-slot="${idx}" class="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">讀取 ▶</button>
          <button data-req-del="${idx}" aria-label="刪除 SLOT 0${idx + 1}" class="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-rose-300">✕</button>
          <button data-confirm-del="${idx}" class="hidden min-h-[40px] px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold">確認刪除？</button>
        </div>
      `;
    } else {
      div.className = 'p-3.5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-700 flex items-center justify-between gap-2';
      div.innerHTML = `
        <span class="text-slate-300">[SLOT 0${idx + 1}] 空白存檔槽位</span>
        <button data-write-empty="${idx}" class="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold">+ 寫入目前進度</button>
      `;
    }
    container.appendChild(div);
  });

  document.getElementById('titleSlotsCount').textContent = `[${used}/4]`;

  container.querySelectorAll('[data-write-empty]').forEach(b => b.addEventListener('click', () => saveToSlot(Number(b.dataset.writeEmpty))));
  container.querySelectorAll('[data-req-overwrite]').forEach(b => b.addEventListener('click', () => {
    const i = b.dataset.reqOverwrite;
    const cBtn = container.querySelector(`[data-confirm-overwrite="${i}"]`);
    cBtn.classList.remove('hidden');
    setTimeout(() => cBtn.classList.add('hidden'), 3500);
  }));
  container.querySelectorAll('[data-confirm-overwrite]').forEach(b => b.addEventListener('click', () => saveToSlot(Number(b.dataset.confirmOverwrite))));
  container.querySelectorAll('[data-load-slot]').forEach(b => b.addEventListener('click', () => loadFromSlot(Number(b.dataset.loadSlot))));
  container.querySelectorAll('[data-req-del]').forEach(b => b.addEventListener('click', () => {
    const i = b.dataset.reqDel;
    const cBtn = container.querySelector(`[data-confirm-del="${i}"]`);
    cBtn.classList.remove('hidden');
    setTimeout(() => cBtn.classList.add('hidden'), 3500);
  }));
  container.querySelectorAll('[data-confirm-del]').forEach(b => b.addEventListener('click', async () => {
    const slotIdx = Number(b.dataset.confirmDel);
    if (dbBackendReady && db.session.studentUuid) {
      await fetch('api/save_slots.php', {
        method: 'POST',
        headers: buildAuthJsonHeaders(),
        body: JSON.stringify({ action: 'delete', student_uuid: db.session.studentUuid, slot_index: slotIdx })
      }).catch(() => {});
    }
    db.saveSlots[slotIdx] = null;
    renderSaveSlots();
    showToast('已從資料庫刪除該存檔槽位', 'info');
  }));
}

async function saveToSlot(idx) {
  if (!(await requireDatabaseReady())) return;
  flushDraftNow();
  const uuid = ensureStudentSession();
  const stats = getOverallProgressStats();
  const curLvl = getLevelById(db.currentLevelId);
  const slotData = {
    savedAt: new Date().toLocaleString('zh-HK', { hour12: false }),
    studentUuid: uuid,
    currentSector: db.currentSector,
    currentLevelId: db.currentLevelId,
    progressSummary: `${stats.cleared}/${stats.total} 關 (${stats.pct}%)`,
    label: `${SECTORS[db.currentSector].name} · ${curLvl.title}`,
    payload: {
      session: JSON.parse(JSON.stringify(db.session)),
      progress: JSON.parse(JSON.stringify(db.progress)),
      affection: JSON.parse(JSON.stringify(db.affection)),
      drafts: JSON.parse(JSON.stringify(db.drafts || {}))
    }
  };
  if (dbBackendReady) {
    try {
      const resp = await fetch('api/save_slots.php', {
        method: 'POST',
        headers: buildAuthJsonHeaders(),
        body: JSON.stringify({ action: 'save', student_uuid: uuid, slot_index: idx, ...slotData })
      });
      const res = await resp.json();
      if (!resp.ok || !res.ok) throw new Error(res.error || 'DB_SAVE_FAIL');
      slotData.savedAt = res.savedAt || slotData.savedAt;
    } catch (e) {
      showToast('寫入資料庫存檔失敗，請確認 MySQL 連線狀態', 'error');
      return;
    }
  }
  db.saveSlots[idx] = slotData;
  renderSaveSlots();
  playSfx(780, 'triangle', 0.12);
  showToast(`已寫入 MySQL 資料庫：SLOT 0${idx + 1}`, 'success');
}

async function loadFromSlot(idx) {
  if (!(await requireDatabaseReady())) return;
  let slot = db.saveSlots[idx];
  if (!slot || !slot.payload) return;
  if (dbBackendReady && db.session.studentUuid) {
    try {
      const resp = await fetch('api/save_slots.php', {
        method: 'POST',
        headers: buildAuthJsonHeaders(),
        body: JSON.stringify({ action: 'load', student_uuid: db.session.studentUuid, slot_index: idx })
      });
      const res = await resp.json();
      if (!resp.ok || !res.ok) throw new Error(res.error || 'DB_LOAD_FAIL');
      slot = {
        ...slot,
        currentSector: res.currentSector,
        currentLevelId: res.currentLevelId,
        payload: res.snapshot
      };
    } catch (e) {
      showToast('從資料庫讀取存檔失敗', 'error');
      return;
    }
  }
  db.session = JSON.parse(JSON.stringify(slot.payload.session || db.session));
  db.progress = JSON.parse(JSON.stringify(slot.payload.progress || {}));
  db.affection = JSON.parse(JSON.stringify(slot.payload.affection || {}));
  db.drafts = JSON.parse(JSON.stringify(slot.payload.drafts || {}));
  db.currentSector = slot.currentSector || 'farm';
  db.currentLevelId = slot.currentLevelId || `${db.currentSector}_1`;
  updateAuthBadges();
  closeModal('modalSaveLoad');
  enterWorkspace(db.currentSector);
  playSfx(880, 'triangle', 0.15);
  showToast(`已從資料庫讀取：SLOT 0${idx + 1}`, 'success');
}

function exportProgressJson() {
  flushDraftNow();
  const data = {
    version: 'v2.6',
    dataVersion: CURRENT_DATA_VERSION,
    exportedAt: new Date().toISOString(),
    session: db.session,
    progress: db.progress,
    affection: db.affection,
    drafts: db.drafts || {},
    saveSlots: db.saveSlots || [],
    customLevels: db.customLevels || []
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sourcetown_progress_${db.session.studentUuid || 'guest'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('已匯出進度備份檔 (.json)', 'success');
}

function previewImportProgressJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!isPlainObject(parsed) || !isPlainObject(parsed.progress) || !isPlainObject(parsed.affection)) {
        throw new Error('缺少必要的 progress 或 affection 物件結構');
      }
      if (parsed.drafts !== undefined && !isPlainObject(parsed.drafts)) {
        throw new Error('drafts 欄位格式無效');
      }
      if (parsed.saveSlots !== undefined && !Array.isArray(parsed.saveSlots)) {
        throw new Error('saveSlots 欄位格式無效');
      }
      const ver = parsed.version || '未知版本';
      if (!['v2.3', 'v2.4', 'v2.5', 'v2.6'].includes(ver)) {
        throw new Error(`不支援的存檔版本 (${ver})，僅支援 v2.3–v2.6`);
      }
      pendingImportData = migrateState(parsed);
      const completedKeys = Object.values(parsed.progress).filter(v => v && v.completed).length;
      document.getElementById('importPreviewDetails').innerHTML = `
        <div><strong>檔案版本：</strong>${ver} · <strong>匯出時間：</strong>${parsed.exportedAt || '未標記'}</div>
        <div><strong>學生識別碼：</strong>${parsed.session?.studentUuid || 'Guest'} · <strong>已完成紀錄數：</strong>${completedKeys} 筆</div>
      `;
      document.getElementById('importPreviewBox').classList.remove('hidden');
    } catch (err) {
      pendingImportData = null;
      document.getElementById('importPreviewBox').classList.add('hidden');
      showToast(`匯入驗證失敗：${err.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

/* =========================================================================
 * 9. MAP, CHARACTER CHAT & ADMIN MODALS
 * ========================================================================= */
let selectedMapSector = 'farm';

function renderTownMap() {
  const uuid = db.session.studentUuid;
  Object.keys(SECTORS).forEach(s => {
    const secLevels = getAllLevelsForSector(s, false);
    const clearedLvls = uuid ? secLevels.filter(l => db.progress[`${uuid}_${l.id}`]?.completed).length : 0;
    const attemptsSum = uuid ? secLevels.reduce((acc, l) => acc + (db.progress[`${uuid}_${l.id}`]?.attempts || 0), 0) : 0;
    const hasDraft = uuid && secLevels.some(l => {
      const d = db.drafts && db.drafts[`${uuid}_${l.id}`];
      return d !== undefined && d !== l.starter;
    });
    const done = secLevels.length > 0 && clearedLvls === secLevels.length;
    const inProg = !done && (clearedLvls > 0 || attemptsSum > 0 || hasDraft);
    const aff = (uuid && db.affection[`${uuid}_${s}`]) || { score: 0, tier: 1 };

    const box = document.getElementById(`mapBox_${s}`);
    const line = document.getElementById(`mapLine_${s}`);
    const statusText = document.getElementById(`mapStatus_${s}`);
    const metaText = document.getElementById(`mapMeta_${s}`);
    const dot = document.getElementById(`mapDot_${s}`);
    const beacon = document.getElementById(`mapBeacon_${s}`);
    const node = document.getElementById(`mapNode_${s}`);

    if (metaText) metaText.textContent = `好感 ${aff.score}% · ${clearedLvls}/${secLevels.length} 關`;
    if (node) {
      node.classList.toggle('node-just-fixed', recentlyFixedSector === s && done);
    }

    if (box && line && statusText) {
      if (done) {
        box.setAttribute('stroke', '#34d399');
        line.setAttribute('stroke', '#34d399');
        line.setAttribute('class', 'conduit-fixed');
        if (dot) dot.setAttribute('fill', '#34d399');
        if (beacon) beacon.setAttribute('stroke', '#34d399');
        statusText.setAttribute('fill', '#34d399');
        statusText.textContent = '✓ 已修復';
      } else if (inProg) {
        box.setAttribute('stroke', '#38bdf8');
        line.setAttribute('stroke', '#f97316');
        line.setAttribute('class', 'conduit-fault');
        if (dot) dot.setAttribute('fill', '#38bdf8');
        if (beacon) beacon.setAttribute('stroke', '#f97316');
        statusText.setAttribute('fill', '#7dd3fc');
        statusText.textContent = '● 進行中';
      } else {
        box.setAttribute('stroke', '#f97316');
        line.setAttribute('stroke', '#f97316');
        line.setAttribute('class', 'conduit-fault');
        if (dot) dot.setAttribute('fill', '#f97316');
        if (beacon) beacon.setAttribute('stroke', '#f97316');
        statusText.setAttribute('fill', '#fb923c');
        statusText.textContent = '○ 尚未開始';
      }
    }
  });
  recentlyFixedSector = null;
  selectMapNode(selectedMapSector);
}

function selectMapNode(sectorId) {
  selectedMapSector = sectorId;
  const sec = SECTORS[sectorId];
  const uuid = db.session.studentUuid;
  const key = `${uuid}_${sectorId}`;
  const secLevels = getAllLevelsForSector(sectorId, false);
  const clearedLvls = uuid ? secLevels.filter(l => db.progress[`${uuid}_${l.id}`]?.completed).length : 0;
  const attemptsSum = uuid ? secLevels.reduce((acc, l) => acc + (db.progress[`${uuid}_${l.id}`]?.attempts || 0), 0) : 0;
  const done = secLevels.length > 0 && clearedLvls === secLevels.length;
  const inProg = !done && (clearedLvls > 0 || attemptsSum > 0);
  const nextLvl = secLevels.find(l => !(uuid && db.progress[`${uuid}_${l.id}`]?.completed)) || secLevels[0];
  const aff = (uuid && db.affection[key]) || { score: 0, tier: 1 };

  document.getElementById('mapDetailLang').textContent = `${sec.lang} (${sec.mode})`;
  document.getElementById('mapDetailTitle').textContent = `${sec.name} · ${sec.heroine}`;
  document.getElementById('mapDetailLocation').textContent = sec.location;
  document.getElementById('mapDetailMetaphor').textContent = sec.metaphor;
  document.getElementById('mapDetailStatus').textContent = done ? '✓ 已修復' : (inProg ? '● 進行中' : '○ 尚未開始');
  document.getElementById('mapDetailStatus').className = done
    ? 'font-mono text-sm text-emerald-400 font-bold'
    : (inProg ? 'font-mono text-sm text-sky-300 font-bold' : 'font-mono text-sm text-orange-300 font-bold');
  document.getElementById('mapDetailLevelProgress').textContent = `目前進度：${clearedLvls} / ${secLevels.length} 關`;
  document.getElementById('mapDetailNextLevel').textContent = done ? '狀態：全數關卡已通關' : `下一關：${nextLvl.title}`;
  document.getElementById('mapDetailAff').textContent = `${aff.score}% (Tier ${aff.tier})`;
  document.getElementById('mapDetailAffBar').style.width = `${aff.score}%`;

  const teleportBtn = document.getElementById('btnMapTeleport');
  if (teleportBtn) {
    teleportBtn.textContent = done ? '🔄 重新挑戰 →' : (inProg ? '▶ 繼續修復 →' : '▶ 前往修復 →');
  }

  const draftVal = uuid && db.drafts && db.drafts[`${uuid}_${secLevels[0].id}`];
  const hasDraft = draftVal !== undefined && draftVal !== secLevels[0].starter;
  document.getElementById('mapDetailDraftStatus').textContent = hasDraft ? '草稿：已修改保存' : '草稿：尚未修改';

  Object.keys(SECTORS).forEach(s => {
    const node = document.getElementById(`mapNode_${s}`);
    const box = document.getElementById(`mapBox_${s}`);
    const line = document.getElementById(`mapLine_${s}`);
    const sLevels = getAllLevelsForSector(s, false);
    const sCleared = uuid ? sLevels.filter(l => db.progress[`${uuid}_${l.id}`]?.completed).length : 0;
    const sDone = sLevels.length > 0 && sCleared === sLevels.length;
    const isSel = s === sectorId;

    if (box) {
      box.setAttribute('fill', isSel ? '#1e293b' : '#0f172a');
      box.setAttribute('stroke', isSel ? '#38bdf8' : (sDone ? '#34d399' : '#f97316'));
      box.setAttribute('stroke-width', isSel ? '3.4' : '2.4');
    }
    if (node) {
      node.setAttribute('filter', isSel ? 'url(#selectedNodeGlow)' : 'url(#elevShadow)');
    }
    if (line) {
      line.setAttribute('stroke-width', isSel ? '5' : '2.6');
      line.setAttribute('opacity', isSel ? '1' : '0.45');
      if (isSel) {
        line.setAttribute('stroke', '#38bdf8');
        line.removeAttribute('class');
      } else {
        line.setAttribute('stroke', sDone ? '#34d399' : '#f97316');
        line.setAttribute('class', sDone ? 'conduit-fixed' : 'conduit-fault');
      }
    }
  });
}

const CHAR_PROFILES = {
  farm: {
    fullName: '蘇曉 (Su Xiao)',
    role: '生態農場數據員 · 21歲',
    bio: '抱著筆電踩在溫室泥田裡的樂天少女，極度討厭冗長的樣板程式碼，信奉「三行能搞定就別寫三十行」。',
    greetings: [
      '「哈啊……找我有什麼事嗎？如果是來幫忙整理腳本的話我倒是很歡迎喔。」',
      '「呀！前輩來了！溫室的哈密瓜快熟了，要邊吃邊聊嗎？」',
      '「嘿嘿，不管你拋出什麼問題，我都會好好接住的，儘管說吧！」'
    ],
    replies: {
      code: '「Python 講究的是優雅與直覺！把複雜的條件判斷整理乾淨，心情也會跟著變好呢。」',
      turing: '「聽老一輩說，1978 年圖靈博士把最後一份氣象分析模型留在農場溫室後就不見了……」',
      default: '「嗯嗯，等之後接上後端 LLM API，我就能跟你聊更多關於生態農場的日常囉！」'
    }
  },
  market: {
    fullName: '夏海 (Xia Hai)',
    role: '海濱咖啡廳店長 · 22歲',
    bio: '海濱市集的情報中心與活力擔當，擅長處理各種非同步事件與突發狀況。',
    greetings: [
      '「歡迎光臨海濱咖啡廳～！想點杯拿鐵還是聊聊市集近況呢？」',
      '「前輩！今天港口的海風超舒服，順便幫我看看這段事件監聽器嘛！」',
      '「面對你我才不會設什麼 Promise Timeout 呢，隨時想找我聊都可以！」'
    ],
    replies: {
      code: '「JavaScript 最迷人的地方就是非同步與事件驅動！記得做好防抖，不然收銀台會大塞車喔。」',
      turing: '「咖啡廳牆上那台舊式收銀機就是圖靈博士當年改裝的，到現在還在跑呢！」',
      default: '「收到你的訊息啦！之後接入聊天 API 後，我就可以即時回覆你每一個想法了～！」'
    }
  },
  admin: {
    fullName: '林靜 (Lin Jing)',
    role: '鎮公所秘書兼檔案管理員 · 23歲',
    bio: '一絲不苟的市政中心管理者，堅信嚴謹的物件導向封裝與存取修飾詞是維持源泉鎮秩序的最後防線。',
    greetings: [
      '「臨時管理員同志，請問有什麼公務需要協調嗎？請按規章說明。」',
      '「辛苦了。桌上這杯黑咖啡是順便幫你泡的，有空的話就坐下來聊聊吧。」',
      '「對你而言，我這裡不需要任何 private 權限鎖，隨時歡迎你推門進來。」'
    ],
    replies: {
      code: '「Java 的強型別與封裝看似繁瑣，卻能確保大型系統在四十年後依然穩健。」',
      turing: '「檔案館最深處鎖著 1978 年圖靈博士留下的核心排程手冊，只有修復鐘樓後才能解密。」',
      default: '「已記錄你的對話請求。待後端 LLM API 串接完成，我們將能進行更深入的邏輯討論。」'
    }
  },
  industrial: {
    fullName: '鐵嵐 (Tie Lan)',
    role: '舊水電廠及鐘樓維修技師 · 23歲',
    bio: '穿著深色工裝褲、寡言硬核的底層工程師，信奉「自己部機自己救」，對記憶體管理與指標位址有著近乎偏執的執著。',
    greetings: [
      '「……找我有事？機房裡很吵，長話短說。」',
      '「哦，是你啊。過來坐，剛好我在整理這份 1978 年的中斷向量表。」',
      '「這顆心臟的指標早就交給你託管了……想聊什麼就說吧。」'
    ],
    replies: {
      code: '「C++ 沒有自動垃圾回收，每個指標與記憶體配置都要自己負責，就像這座水庫一樣。」',
      turing: '「這座渦輪機房的銅線是圖靈博士親手焊接的，當時到底發生了什麼事……我也還在查。」',
      default: '「……收到。等以後聊天 API 接通了，再跟你仔細講解底層硬體架構。」'
    }
  }
};

let activeChatSector = 'farm';
let isChatRequestInFlight = false;
const MAX_SHORT_TERM_CHAT_HISTORY = 10;
const chatHistoryBySector = { farm: [], market: [], admin: [], industrial: [] };

function pushChatHistory(sectorId, role, content) {
  if (!chatHistoryBySector[sectorId]) chatHistoryBySector[sectorId] = [];
  if (role !== 'user' && role !== 'assistant') return;
  const clean = String(content || '').trim();
  if (!clean) return;
  chatHistoryBySector[sectorId].push({ role, content: clean });
  if (chatHistoryBySector[sectorId].length > MAX_SHORT_TERM_CHAT_HISTORY) {
    chatHistoryBySector[sectorId] = chatHistoryBySector[sectorId].slice(-MAX_SHORT_TERM_CHAT_HISTORY);
  }
}

function setChatModeUI(modeText, isAi, noticeText = '') {
  const badge = document.getElementById('chatModeBadge');
  const notice = document.getElementById('chatStatusNotice');
  const pill = document.getElementById('chatLiveStatusPill');
  if (badge) {
    badge.textContent = modeText;
    badge.className = isAi ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold';
  }
  if (pill) {
    pill.textContent = isAi ? '● AI 即時連線' : '◐ 離線劇本模式';
    pill.className = isAi
      ? 'px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-700/70 text-emerald-300 font-mono text-[11px]'
      : 'px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-700/70 text-amber-300 font-mono text-[11px]';
  }
  if (notice) {
    if (noticeText) {
      notice.textContent = noticeText;
      notice.classList.remove('hidden');
    } else {
      notice.textContent = '';
      notice.classList.add('hidden');
    }
  }
}

function openCharacterChatModal(sectorId) {
  const sec = SECTORS[sectorId];
  const prof = CHAR_PROFILES[sectorId];
  const uuid = db.session.studentUuid;
  const aff = (uuid && db.affection[`${uuid}_${sectorId}`]) || { score: 0, tier: 1 };
  activeChatSector = sectorId;
  isChatRequestInFlight = false;
  setChatModeUI('AI Reply (就緒)', true, '');
  const sendBtn = document.getElementById('btnSendChat');
  const inputEl = document.getElementById('chatInputField');
  if (sendBtn) sendBtn.disabled = false;
  if (inputEl) inputEl.disabled = false;
  if (db.unreadDialogueSectors && db.unreadDialogueSectors[sectorId]) {
    delete db.unreadDialogueSectors[sectorId];
    if (dbBackendReady && uuid) {
      fetch('api/sync.php', {
        method: 'POST',
        headers: buildAuthJsonHeaders(),
        body: JSON.stringify({ action: 'mark_dialogue_read', student_uuid: uuid, sector_id: sectorId })
      }).catch(() => {});
    }
    refreshTitleCards();
  }

  document.getElementById('chatModalLangBadge').textContent = sec.lang;
  document.getElementById('chatModalTitle').textContent = `${sec.heroine} · 角色設定與對話空間`;
  document.getElementById('chatModalSvg').innerHTML = sec.svg;
  document.getElementById('chatModalName').textContent = prof.fullName;
  document.getElementById('chatModalRole').textContent = prof.role;
  document.getElementById('chatModalBio').textContent = prof.bio;
  document.getElementById('chatModalAffText').textContent = `${aff.score}% (Tier ${aff.tier})`;
  document.getElementById('chatModalAffBar').style.width = `${aff.score}%`;

  document.querySelectorAll('.quick-chat-btn').forEach(b => {
    b.disabled = false;
    b.textContent = b.dataset.origLabel || b.textContent;
    b.classList.remove('opacity-50', 'cursor-not-allowed');
  });
  const counterEl = document.getElementById('chatCharCounter');
  if (counterEl) counterEl.textContent = '0 / 4000';
  const box = document.getElementById('chatMessagesBox');
  box.innerHTML = '';
  appendChatBubble('character', sec.heroine, prof.greetings[aff.tier - 1], { sourceLabel: '角色問候' });
  const hist = chatHistoryBySector[sectorId] || [];
  hist.forEach(item => {
    if (item.role === 'user') {
      appendChatBubble('user', '你 (臨時管理員)', item.content);
    } else {
      appendChatBubble('character', sec.heroine, item.content, { sourceLabel: 'AI Reply', isAi: true });
    }
  });
  openModal('modalCharChat');
}

function appendChatBubble(sender, name, text, meta = {}) {
  const box = document.getElementById('chatMessagesBox');
  const wrap = document.createElement('div');
  wrap.className = (sender === 'user' ? 'flex justify-end' : 'flex justify-start') + ' chat-bubble-enter';

  const bubble = document.createElement('div');
  bubble.className = sender === 'user'
    ? 'max-w-[84%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-orange-600 to-amber-600 text-white shadow-sm'
    : 'max-w-[84%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-slate-800/95 border border-slate-700/90 text-slate-100 font-serif shadow-sm';

  const headerEl = document.createElement('div');
  headerEl.className = 'flex items-center flex-wrap gap-1.5 text-xs font-mono opacity-80 mb-1';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = String(name ?? '');
  headerEl.appendChild(nameSpan);

  if (sender !== 'user' && meta && meta.emotion && EMOTION_LABELS[meta.emotion]) {
    const emoSpan = document.createElement('span');
    emoSpan.className = 'px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[11px] text-orange-300';
    emoSpan.textContent = EMOTION_LABELS[meta.emotion];
    headerEl.appendChild(emoSpan);
  }

  if (sender !== 'user' && meta && meta.sourceLabel) {
    const srcSpan = document.createElement('span');
    srcSpan.className = meta.isAi
      ? 'px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-700/70 text-[10px] text-emerald-300'
      : 'px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-700/70 text-[10px] text-amber-300';
    srcSpan.textContent = String(meta.sourceLabel);
    headerEl.appendChild(srcSpan);
  }

  const timeSpan = document.createElement('span');
  timeSpan.className = 'ml-auto text-[10px] opacity-60';
  timeSpan.textContent = new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', hour12: false });
  headerEl.appendChild(timeSpan);

  const bodyEl = document.createElement('div');
  bodyEl.className = 'whitespace-pre-wrap break-words leading-relaxed';
  bodyEl.textContent = String(text ?? '');

  bubble.appendChild(headerEl);
  bubble.appendChild(bodyEl);
  wrap.appendChild(bubble);
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
}

function buildOfflineCharacterReply(sectorId, text) {
  const prof = CHAR_PROFILES[sectorId];
  if (/程式|代碼|code|邏輯|語言|理念/i.test(text)) return prof.replies.code;
  if (/1978|圖靈|歷史|過去|博士/i.test(text)) return prof.replies.turing;
  return prof.replies.default;
}

function appendChatTypingIndicator(name) {
  const box = document.getElementById('chatMessagesBox');
  const wrap = document.createElement('div');
  wrap.id = 'chatTypingIndicator';
  wrap.className = 'flex justify-start';
  const bubble = document.createElement('div');
  bubble.className = 'px-3.5 py-2 rounded-2xl rounded-bl-sm bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono animate-pulse';
  bubble.textContent = `${name} 正在輸入中...`;
  wrap.appendChild(bubble);
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
  return wrap;
}

async function sendCharacterChatMessage(presetText = null) {
  if (isChatRequestInFlight) return;
  const input = document.getElementById('chatInputField');
  const sendBtn = document.getElementById('btnSendChat');
  const text = (presetText || input.value).trim();
  if (!text) return;
  if (!presetText) input.value = '';

  const targetSector = activeChatSector;
  const sec = SECTORS[targetSector];
  const historySnapshot = (chatHistoryBySector[targetSector] || []).slice(-MAX_SHORT_TERM_CHAT_HISTORY);

  appendChatBubble('user', '你 (臨時管理員)', text);
  playSfx(720);

  isChatRequestInFlight = true;
  if (sendBtn) sendBtn.disabled = true;
  if (input) input.disabled = true;
  const typingEl = appendChatTypingIndicator(sec.heroine);

  const FALLBACK_CODES = new Set([
    'AI_DISABLED', 'AI_NOT_CONFIGURED', 'AI_RATE_LIMITED',
    'AI_DAILY_REQUEST_QUOTA_EXCEEDED', 'AI_DAILY_TOKEN_QUOTA_EXCEEDED',
    'AI_PROVIDER_BAD_RESPONSE', 'AI_PROVIDER_TIMEOUT', 'AI_PROVIDER_UNAVAILABLE',
    'DB_UNAVAILABLE', 'AI_STORAGE_NOT_READY'
  ]);

  try {
    const resp = await fetch('api/ai.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': db.session.csrfToken || ''
      },
      body: JSON.stringify({
        action: 'chat',
        intent: 'character_chat',
        sector_id: targetSector,
        message: text,
        history: historySnapshot
      })
    });

    const data = await resp.json().catch(() => null);
    if (typingEl && typingEl.parentNode) typingEl.remove();

    // Session 失效、權限錯誤或 CSRF 錯誤不可隱藏成普通離線回覆
    if (resp.status === 401 || resp.status === 403 || (data && ['AI_SESSION_REQUIRED', 'AI_CSRF_INVALID', 'AI_FORBIDDEN', 'AI_ORIGIN_FORBIDDEN'].includes(data.error))) {
      const errMsg = (data && data.msg) ? data.msg : 'Session 或安全驗證失效，請重新整理頁面。';
      setChatModeUI('安全驗證失敗', false, errMsg);
      appendChatBubble('character', '系統提示', errMsg, { sourceLabel: 'Auth/CSRF Error', isAi: false });
      return;
    }

    if (resp.ok && data && data.ok && typeof data.reply === 'string' && data.reply.trim() !== '') {
      pushChatHistory(targetSector, 'user', text);
      pushChatHistory(targetSector, 'assistant', data.reply);
      if (activeChatSector === targetSector) {
        setChatModeUI('AI Reply (即時對話)', true, '');
        appendChatBubble('character', sec.heroine, data.reply, {
          emotion: data.emotion || null,
          sourceLabel: 'AI Reply',
          isAi: true
        });
        playSfx(540, 'triangle', 0.08);
      }
      return;
    }

    const errCode = data && data.error ? data.error : 'AI_PROVIDER_BAD_RESPONSE';
    if (FALLBACK_CODES.has(errCode) || resp.status >= 500 || resp.status === 429) {
      const offlineReply = buildOfflineCharacterReply(targetSector, text);
      const reason = (data && data.msg) ? data.msg : 'AI 服務暫時無法使用';
      if (activeChatSector === targetSector) {
        setChatModeUI('Offline Reply (離線劇本)', false, `已切換離線模式：${reason}`);
        appendChatBubble('character', sec.heroine, offlineReply, {
          sourceLabel: 'Offline Reply',
          isAi: false
        });
        playSfx(540, 'triangle', 0.08);
      }
      return;
    }

    const generalErr = (data && data.msg) ? data.msg : 'AI 對話請求失敗';
    if (activeChatSector === targetSector) {
      setChatModeUI('AI 請求異常', false, generalErr);
      appendChatBubble('character', '系統提示', generalErr, { sourceLabel: 'Error', isAi: false });
    }
  } catch (err) {
    if (typingEl && typingEl.parentNode) typingEl.remove();
    const offlineReply = buildOfflineCharacterReply(targetSector, text);
    if (activeChatSector === targetSector) {
      setChatModeUI('Offline Reply (網路離線)', false, '無法連線至伺服器，已切換離線劇本');
      appendChatBubble('character', sec.heroine, offlineReply, {
        sourceLabel: 'Offline Reply',
        isAi: false
      });
      playSfx(540, 'triangle', 0.08);
    }
  } finally {
    isChatRequestInFlight = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.disabled = false;
  }
}

function renderOfflineScriptsPreview(sectorId) {
  document.querySelectorAll('.preview-sec-btn').forEach(b => {
    b.className = b.dataset.previewSector === sectorId
      ? 'preview-sec-btn min-h-[40px] px-3 py-1.5 rounded-xl bg-orange-950 border border-orange-500 text-orange-300'
      : 'preview-sec-btn min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200';
  });
  const grid = document.getElementById('offlineScriptsGrid');
  grid.innerHTML = '';
  [1, 2, 3].forEach(tier => {
    ['PASS', 'FAIL'].forEach(ev => {
      const [text, emo] = OFFLINE_SCRIPTS[sectorId][tier][ev];
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1';
      const head = document.createElement('div');
      head.className = 'flex justify-between font-mono text-xs';
      const leftSpan = document.createElement('span');
      leftSpan.className = 'text-orange-300';
      leftSpan.textContent = `Tier ${tier} · ${ev}`;
      const rightSpan = document.createElement('span');
      rightSpan.className = 'text-slate-300';
      rightSpan.textContent = EMOTION_LABELS[emo] || emo;
      head.appendChild(leftSpan);
      head.appendChild(rightSpan);
      const bodyP = document.createElement('p');
      bodyP.className = 'text-slate-100 font-serif text-sm leading-relaxed';
      bodyP.textContent = text;
      card.appendChild(head);
      card.appendChild(bodyP);
      grid.appendChild(card);
    });
  });
}

function renderAdminDashboard() {
  const logs = db.auditLogs.filter(l => l.status !== 'SYSTEM_ERROR');
  const learners = new Set(logs.map(l => l.uuid));
  const firstByLearner = {};
  logs.forEach(l => {
    const k = `${l.uuid}_${l.sector}`;
    if (!firstByLearner[k]) firstByLearner[k] = l;
  });
  const firstList = Object.values(firstByLearner);
  const rtList = firstList.filter(l => l.mode === 'runtime');
  const cpList = firstList.filter(l => l.mode === 'concept_simulation');

  const rtRate = rtList.length ? ((rtList.filter(l => l.status === 'PASS').length / rtList.length) * 100).toFixed(1) : '0.0';
  const cpRate = cpList.length ? ((cpList.filter(l => l.status === 'CONCEPT_PASS').length / cpList.length) * 100).toFixed(1) : '0.0';
  const avgHint = logs.length ? (logs.reduce((s, l) => s + l.hintDepth, 0) / logs.length).toFixed(2) : '0.00';

  document.getElementById('anlLearners').textContent = learners.size;
  document.getElementById('anlRuntimeRate').textContent = `${rtRate}%`;
  document.getElementById('anlConceptRate').textContent = `${cpRate}%`;
  document.getElementById('anlHintDepth').textContent = avgHint;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(l => !l.timestamp || l.timestamp >= todayStart.getTime());
  const todayPass = todayLogs.filter(l => l.status.includes('PASS')).length;
  const todayRate = todayLogs.length ? ((todayPass / todayLogs.length) * 100).toFixed(1) : '0.0';
  const failCounts = {};
  logs.filter(l => !l.status.includes('PASS')).forEach(l => {
    const label = `${l.sector} · ${l.levelTitle}`;
    failCounts[label] = (failCounts[label] || 0) + 1;
  });
  const topFail = Object.entries(failCounts).sort((a, b) => b[1] - a[1])[0];
  const elTodayCount = document.getElementById('anlTodayCount');
  const elTodayRate = document.getElementById('anlTodayPassRate');
  const elTopFail = document.getElementById('anlTopFailLevel');
  if (elTodayCount) elTodayCount.textContent = `${todayLogs.length} 筆`;
  if (elTodayRate) elTodayRate.textContent = `${todayRate}%`;
  if (elTopFail) elTopFail.textContent = topFail ? `${topFail[0]} (${topFail[1]}次)` : '尚無';

  const secFilter = document.getElementById('filterAuditSector').value;
  const stFilter = document.getElementById('filterAuditStatus').value;
  const rangeFilterEl = document.getElementById('filterAuditRange');
  const rangeFilter = rangeFilterEl ? rangeFilterEl.value : 'ALL';
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const filtered = db.auditLogs.slice().reverse().filter(l => {
    if (secFilter !== 'ALL' && l.sector !== secFilter) return false;
    if (stFilter === 'PASS' && !l.status.includes('PASS')) return false;
    if (stFilter === 'FAIL' && l.status.includes('PASS')) return false;
    if (rangeFilter === 'TODAY' && l.timestamp && l.timestamp < startOfToday.getTime()) return false;
    if (rangeFilter === '7D' && l.timestamp && (now - l.timestamp > 7 * 86400 * 1000)) return false;
    return true;
  });

  const tbody = document.getElementById('adminAuditBody');
  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-300 font-mono">尚無符合條件的提交紀錄，請先執行關卡測試或調整篩選條件。</td></tr>';
    return;
  }
  filtered.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-2.5 text-slate-300">${l.time}</td>
      <td class="p-2.5"><button type="button" data-inspect-uuid="${l.uuid}" class="font-bold text-sky-300 hover:text-sky-200 underline underline-offset-2 text-left">${l.uuid}</button></td>
      <td class="p-2.5">${l.sector} <span class="text-slate-400">(${l.mode})</span></td>
      <td class="p-2.5">${l.l1} / ${l.l2 === null ? 'NULL' : l.l2} / ${l.l3 === null ? 'NULL' : l.l3}</td>
      <td class="p-2.5 font-bold ${l.status.includes('PASS') ? 'text-emerald-400' : 'text-rose-400'}">${l.status}</td>
      <td class="p-2.5 text-amber-300">${l.hiddenDetail}</td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-inspect-uuid]').forEach(btn => {
    btn.addEventListener('click', () => openStudentTimelineDrawer(btn.dataset.inspectUuid));
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function openStudentTimelineDrawer(studentUuid) {
  const drawer = document.getElementById('adminTimelineDrawer');
  const titleEl = document.getElementById('adminTimelineTitle');
  const bodyEl = document.getElementById('adminTimelineBody');
  if (!drawer || !titleEl || !bodyEl) return;

  titleEl.textContent = `🔍 學生除錯歷程時間軸：${studentUuid}`;
  drawer.classList.remove('hidden');
  bodyEl.innerHTML = '<div class="text-slate-300">載入歷程資料中...</div>';

  let items = [];
  if (dbBackendReady) {
    try {
      const resp = await fetch(`api/admin_student_timeline.php?student_uuid=${encodeURIComponent(studentUuid)}`, { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        if (data.ok && Array.isArray(data.timeline)) {
          items = data.timeline.map(t => ({
            time: t.created_at,
            sector: t.sector_name,
            levelTitle: t.level_title,
            status: t.exec_status,
            hintDepth: t.hint_depth_used,
            submittedCode: t.submitted_code
          }));
        }
      }
    } catch (_) {}
  }
  if (items.length === 0) {
    items = db.auditLogs.filter(l => l.uuid === studentUuid);
  }
  if (items.length === 0) {
    bodyEl.innerHTML = '<div class="text-slate-300">目前尚無該生的提交歷程紀錄。</div>';
    return;
  }

  bodyEl.innerHTML = '';
  items.forEach((it, idx) => {
    const pass = String(it.status || '').includes('PASS');
    const card = document.createElement('div');
    card.className = `p-3 rounded-xl bg-slate-900 border ${pass ? 'border-emerald-700/60' : 'border-rose-700/60'} space-y-1.5`;
    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span class="font-bold text-white">#${idx + 1} · ${it.sector} · ${it.levelTitle}</span>
        <div class="flex items-center gap-2">
          <span class="text-slate-300">提示層數: ${it.hintDepth || 0}</span>
          <span class="px-2 py-0.5 rounded font-bold ${pass ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}">${it.status}</span>
          <span class="text-slate-400">${it.time}</span>
        </div>
      </div>
      ${it.submittedCode ? `<details ${idx === items.length - 1 ? 'open' : ''} class="pt-1"><summary class="cursor-pointer text-[11px] text-sky-300 hover:text-sky-200 select-none">檢視提交程式碼 (${it.submittedCode.split('\n').length} 行)</summary><pre class="mt-1.5 p-2 rounded-lg bg-[#070a10] border border-slate-800 text-slate-200 overflow-x-auto text-[11px] leading-relaxed"><code>${escapeHtml(it.submittedCode)}</code></pre></details>` : '<div class="text-[11px] text-slate-400">（無程式碼快照）</div>'}
    `;
    bodyEl.appendChild(card);
  });
}

function renderAchievementsModal() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const unlocked = db.unlockedAchievements || {};
  ACHIEVEMENT_CATALOG.forEach(ach => {
    const ts = unlocked[ach.achievement_code];
    const isUnlocked = Boolean(ts);
    const card = document.createElement('div');
    card.className = isUnlocked
      ? 'p-4 rounded-2xl bg-emerald-950/35 border border-emerald-500/70 space-y-1.5'
      : 'p-4 rounded-2xl bg-slate-950 border border-slate-800 opacity-70 space-y-1.5';
    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-lg">${ach.icon_emoji}</span>
        <span class="px-2 py-0.5 rounded-lg font-mono text-[11px] ${isUnlocked ? 'bg-emerald-900 text-emerald-200 font-bold' : 'bg-slate-800 text-slate-400'}">${isUnlocked ? '✓ 已解鎖' : '🔒 未解鎖'}</span>
      </div>
      <div class="font-bold text-white text-sm">${ach.title}</div>
      <p class="text-slate-300 leading-relaxed">${ach.description}</p>
    `;
    grid.appendChild(card);
  });
}

function renderAdminLevels() {
  const listEl = document.getElementById('adminLevelsList');
  listEl.innerHTML = '';
  Object.keys(SECTORS).forEach(secId => {
    getAllLevelsForSector(secId, true).forEach(lvl => {
      const row = document.createElement('div');
      row.className = 'p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2';
      row.innerHTML = `
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 text-xs">${SECTORS[secId].name} (${SECTORS[secId].lang})</span>
            <span class="font-bold text-white">${lvl.title}</span>
            ${lvl.isActive === false ? '<span class="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-xs">已停用</span>' : ''}
          </div>
          <div class="text-xs text-slate-400">檔案: ${lvl.file} · 隱喻: ${lvl.metaphor}</div>
        </div>
        <div class="flex items-center gap-2">
          <button data-try-lvl="${lvl.id}" data-try-sec="${secId}" class="min-h-[38px] px-3 py-1 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-xs">測試</button>
          ${lvl.isBuiltin || lvl.isActive === false ? '' : `<button data-del-lvl="${lvl.id}" class="min-h-[38px] px-3 py-1 rounded-xl bg-rose-950 hover:bg-rose-800 text-rose-200 text-xs">刪除</button>`}
        </div>
      `;
      listEl.appendChild(row);
    });
  });

  listEl.querySelectorAll('[data-try-lvl]').forEach(b => b.addEventListener('click', () => {
    closeModal('modalAdminDash');
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameWorkspace').classList.remove('hidden');
    loadSector(b.dataset.trySec, b.dataset.tryLvl);
    applyResponsiveLayout();
  }));
  listEl.querySelectorAll('[data-del-lvl]').forEach(b => b.addEventListener('click', async () => {
    const lvlId = b.dataset.delLvl;
    let deleteMode = 'deleted';
    let serverMsg = '';

    if (dbBackendReady) {
      b.disabled = true;
      try {
        const resp = await fetch('api/admin_levels.php', {
          method: 'POST',
          headers: buildAuthJsonHeaders(),
          body: JSON.stringify({ action: 'delete', level_code: lvlId })
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.ok) {
          showToast(data.msg || `刪除失敗 (${resp.status})，請確認已登入教師帳號`, 'error');
          b.disabled = false;
          return;
        }
        deleteMode = data.mode || 'deleted';
        serverMsg = data.msg || '';
      } catch (err) {
        showToast('無法連線至 api/admin_levels.php，刪除未寫入資料庫', 'error');
        b.disabled = false;
        return;
      }
    }

    if (deleteMode === 'archived') {
      db.customLevels = (db.customLevels || []).map(l => l.id === lvlId ? { ...l, isActive: false } : l);
      if (Array.isArray(dbLevelsList)) {
        dbLevelsList = dbLevelsList.map(l => l.id === lvlId ? { ...l, isActive: false } : l);
      }
    } else {
      db.customLevels = (db.customLevels || []).filter(l => l.id !== lvlId);
      if (Array.isArray(dbLevelsList)) {
        dbLevelsList = dbLevelsList.filter(l => l.id !== lvlId);
      }
    }

    if (db.currentLevelId === lvlId) {
      db.currentLevelId = `${db.currentSector}_1`;
    }
    saveState();
    renderAdminLevels();
    refreshTitleCards();
    showToast(serverMsg || '已刪除自訂關卡', 'info');
  }));
}


async function renderAdminIssues() {
  const listEl = document.getElementById('adminIssuesList');
  if (!listEl) return;
  const statusFilter = document.getElementById('filterAdminIssueStatus')?.value || 'ALL';
  listEl.innerHTML = '<div class="p-4 text-center text-slate-400">載入問題回報中...</div>';

  let reports = [];
  if (dbBackendReady) {
    try {
      const resp = await fetch(`api/issue_reports.php?status=${encodeURIComponent(statusFilter)}`);
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.ok && Array.isArray(data.reports)) {
        reports = data.reports;
      } else {
        listEl.innerHTML = `<div class="p-4 rounded-xl bg-rose-950/40 border border-rose-700 text-rose-200">${escapeHtml(data.msg || '無法載入問題回報（請確認教師權限）')}</div>`;
        return;
      }
    } catch (_) {
      listEl.innerHTML = '<div class="p-4 rounded-xl bg-rose-950/40 border border-rose-700 text-rose-200">無法連線至 api/issue_reports.php</div>';
      return;
    }
  } else {
    reports = (db.issueReports || []).filter(r => statusFilter === 'ALL' || r.status === statusFilter);
  }

  if (reports.length === 0) {
    listEl.innerHTML = '<div class="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">目前沒有符合條件的問題回報紀錄。</div>';
    return;
  }

  const catLabels = {
    level_bug: '關卡題目/判題',
    story_bug: '劇情/好感度',
    ui_bug: '介面顯示',
    suggestion: '功能建議'
  };
  const statusStyles = {
    OPEN: 'bg-rose-950 text-rose-300 border-rose-700',
    IN_PROGRESS: 'bg-amber-950 text-amber-300 border-amber-700',
    RESOLVED: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    WONT_FIX: 'bg-slate-800 text-slate-300 border-slate-600'
  };

  listEl.innerHTML = '';
  reports.forEach(r => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2';
    const badgeCls = statusStyles[r.status] || statusStyles.OPEN;
    const loc = [r.sector_id, r.level_code].filter(Boolean).join(' / ') || '未指定';
    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2 py-0.5 rounded-lg border text-[11px] font-bold ${badgeCls}">${escapeHtml(r.status)}</span>
          <span class="px-2 py-0.5 rounded-lg bg-slate-800 text-sky-300 text-[11px]">${escapeHtml(catLabels[r.category] || r.category)}</span>
          <span class="font-bold text-white">${escapeHtml(r.title)}</span>
        </div>
        <span class="text-[11px] text-slate-400">${escapeHtml(r.student_uuid || 'guest')} · ${escapeHtml(r.created_at || '')}</span>
      </div>
      <div class="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(r.description)}</div>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
        <span class="text-slate-400">位置：${escapeHtml(loc)}</span>
        <div class="flex flex-wrap gap-1.5">
          <button data-issue-id="${r.report_id}" data-issue-status="IN_PROGRESS" class="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200">處理中</button>
          <button data-issue-id="${r.report_id}" data-issue-status="RESOLVED" class="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200">已解決</button>
          <button data-issue-id="${r.report_id}" data-issue-status="WONT_FIX" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">暫不處理</button>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll('[data-issue-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reportId = Number(btn.dataset.issueId);
      const nextStatus = btn.dataset.issueStatus;
      if (dbBackendReady) {
        try {
          const resp = await fetch('api/issue_reports.php', {
            method: 'POST',
            headers: buildAuthJsonHeaders(),
            body: JSON.stringify({ action: 'update_status', report_id: reportId, status: nextStatus })
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok || !data.ok) {
            showToast(data.msg || '狀態更新失敗', 'error');
            return;
          }
        } catch (_) {
          showToast('連線失敗，無法更新狀態', 'error');
          return;
        }
      } else {
        db.issueReports = (db.issueReports || []).map(x => Number(x.report_id) === reportId ? { ...x, status: nextStatus } : x);
        saveState();
      }
      showToast(`已將問題 #${reportId} 更新為 ${nextStatus}`, 'success');
      renderAdminIssues();
    });
  });
}

function renderAdminScripts() {
  let missing = 0;
  const list = document.getElementById('adminScriptsList');
  list.innerHTML = '';
  Object.keys(SECTORS).forEach(secId => {
    [1, 2, 3].forEach(tier => {
      ['PASS', 'FAIL'].forEach(ev => {
        const entry = OFFLINE_SCRIPTS[secId]?.[tier]?.[ev];
        if (!entry || !entry[0].trim() || !entry[1].trim()) missing++;
        const card = document.createElement('div');
        card.className = 'p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5';
        card.innerHTML = `
          <div class="flex justify-between text-xs">
            <span class="text-amber-300 font-bold">${SECTORS[secId].name} · Tier ${tier} · ${ev}</span>
            <span class="text-slate-400">${entry ? entry[1] : 'MISSING'}</span>
          </div>
          <input data-script-edit="${secId}|${tier}|${ev}" type="text" value="${entry ? entry[0].replace(/"/g, '&quot;') : ''}" class="w-full min-h-[38px] px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs outline-none focus:border-amber-500">
        `;
        list.appendChild(card);
      });
    });
  });
  document.getElementById('adminScriptsIntegrityMsg').textContent = missing === 0 ? '檢查結果：24 / 24 組合完整' : `警告：發現 ${missing} 筆缺漏或空白腳本！`;
  list.querySelectorAll('[data-script-edit]').forEach(inp => {
    inp.addEventListener('change', () => {
      const [secId, tier, ev] = inp.dataset.scriptEdit.split('|');
      OFFLINE_SCRIPTS[secId][Number(tier)][ev][0] = inp.value;
      showToast('已更新離線劇本台詞', 'success');
    });
  });
}

function exportAuditCsv() {
  const rows = [['Time', 'Learner_UUID', 'Sector', 'Mode', 'L1', 'L2', 'L3', 'Status', 'Hint_Depth', 'Hidden_Detail']];
  db.auditLogs.forEach(l => rows.push([l.time, l.uuid, l.sector, l.mode, l.l1, l.l2, l.l3, l.status, l.hintDepth, l.hiddenDetail]));
  const csv = rows.map(r => r.map(v => `"${String(v ?? 'NULL').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sourcetown_audit_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('已匯出審計日誌 CSV', 'success');
}

/* =========================================================================
 * 10. ACCESSIBLE MODAL FOCUS TRAP, BACKGROUND INERT & ESC HANDLER
 * ========================================================================= */
let activeModalId = null;
let lastTriggerElement = null;

function getFocusableInModal(modal) {
  return Array.from(modal.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => el.offsetParent !== null);
}

function openModal(id) {
  lastTriggerElement = document.activeElement;
  activeModalId = id;
  const modal = document.getElementById(id);
  const shell = document.getElementById('appShell');
  if (shell) {
    shell.setAttribute('aria-hidden', 'true');
    shell.inert = true;
  }
  modal.classList.remove('hidden');
  const focusable = getFocusableInModal(modal);
  if (focusable.length > 0) focusable[0].focus();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  if (activeModalId === id) activeModalId = null;
  const shell = document.getElementById('appShell');
  if (shell) {
    shell.removeAttribute('aria-hidden');
    shell.inert = false;
  }
  if (lastTriggerElement && typeof lastTriggerElement.focus === 'function') {
    lastTriggerElement.focus();
  }
}

/* =========================================================================
 * 11. INITIALIZATION & EVENT BINDINGS
 * ========================================================================= */
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  if (storageLoadError) {
    showToast(storageLoadError, 'error');
  }
  initParticles();
  updateAuthBadges();
  renderSaveSlots();
  checkXamppServerStatus();

  function syncSettingsUI() {
    const clean = !!db.cleanDisplayMode;
    document.body.classList.toggle('clean-display', clean);
    document.body.classList.toggle('reduce-motion', !!db.reduceMotion || clean);
    document.getElementById('wsMainContainer').classList.toggle('crt-effect', !!db.crtEnabled && !clean);

    document.body.classList.toggle('high-contrast', !!db.highContrastMode);
    const setBtn = (id, on) => {
      const b = document.getElementById(id);
      if (!b) return;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    };
    setBtn('btnSettingHighContrast', !!db.highContrastMode);
    setBtn('btnSettingClean', clean);
    setBtn('btnSettingBgm', bgmOn);
    setBtn('btnSettingCrt', db.crtEnabled && !clean);
    setBtn('btnSettingParticles', db.particlesEnabled && !clean);
    setBtn('btnSettingMotion', db.reduceMotion);
    setBtn('btnSettingSfx', db.sfxEnabled !== false);
    setBtn('btnSettingAutoSave', db.autoSaveDraft !== false);

    const localStEl = document.getElementById('settingsLocalStatus');
    const serverStEl = document.getElementById('settingsServerSyncStatus');
    if (localStEl) {
      localStEl.textContent = db.lastSavedAt ? `✓ 已暫存 (${formatRelativeSaveTime(db.lastSavedAt)})` : '✓ 已啟用';
    }
    if (serverStEl) {
      const qLen = Array.isArray(db.offlineSyncQueue) ? db.offlineSyncQueue.length : 0;
      if (!dbBackendReady) {
        serverStEl.textContent = '⚠ 未連線 MySQL（僅本地暫存）';
        serverStEl.className = 'text-amber-300 font-bold';
      } else if (qLen > 0) {
        serverStEl.textContent = `⏳ 同步待重試（離線佇列 ${qLen} 筆）`;
        serverStEl.className = 'text-rose-300 font-bold';
      } else {
        serverStEl.textContent = '✓ 已與 MySQL 同步';
        serverStEl.className = 'text-emerald-300 font-bold';
      }
    }

    const tabBtn = document.getElementById('btnSettingTabSize');
    if (tabBtn) tabBtn.textContent = `${Number(db.editorTabSize) === 2 ? 2 : 4} 空白`;

    const speedMap = { normal: '標準', fast: '快速', instant: '立即' };
    const speedBtn = document.getElementById('btnSettingDialogueSpeed');
    if (speedBtn) speedBtn.textContent = speedMap[db.dialogueSpeed || 'normal'] || '標準';

    const fsBtn = document.getElementById('btnSettingFullscreen');
    if (fsBtn) fsBtn.textContent = document.fullscreenElement ? '全螢幕中' : '視窗模式';

    const bindRangeSync = (id, valId, val, suffix) => {
      const rEl = document.getElementById(id);
      const vEl = document.getElementById(valId);
      if (rEl) rEl.value = String(val);
      if (vEl) vEl.textContent = suffix === 'sec' ? `${(val / 1000).toFixed(1)} 秒` : `${val}%`;
    };
    bindRangeSync('rangeSettingMasterVol', 'valSettingMasterVol', db.volumeMaster ?? 100, '%');
    bindRangeSync('rangeSettingBgmVol', 'valSettingBgmVol', db.volumeBgm ?? 70, '%');
    bindRangeSync('rangeSettingSfxVol', 'valSettingSfxVol', db.volumeSfx ?? 90, '%');
    bindRangeSync('rangeSettingDlgOpacity', 'valSettingDlgOpacity', db.dialogueOpacity ?? 90, '%');
    bindRangeSync('rangeSettingAutoWait', 'valSettingAutoWait', db.autoPlayWaitMs ?? 2000, 'sec');

    const dlgBox = document.getElementById('storyDialogueBox') || document.getElementById('vnDialogueCard');
    if (dlgBox) dlgBox.style.opacity = String((db.dialogueOpacity ?? 90) / 100);

    const fontMap = { sm: ['13px', '20px', '13px (小)'], md: ['14px', '22px', '14px (中)'], lg: ['16px', '25px', '16px (大)'] };
    const [fz, lh, label] = fontMap[db.fontSizeTier] || fontMap.md;
    document.documentElement.style.setProperty('--editor-font-size', fz);
    document.documentElement.style.setProperty('--editor-line-height', lh);
    document.getElementById('btnSettingFont').textContent = label;
    updateCursorAndLineHighlight();
  }
  syncSettingsUI();

  // Settings Modal Triggers
  document.getElementById('btnOpenSettingsTitle')?.addEventListener('click', () => { try { syncSettingsUI(); } catch (e) { console.error(e); } openModal('modalSettings'); });
  document.getElementById('btnOpenSettingsWs')?.addEventListener('click', () => {
    document.getElementById('wsMoreDropdown')?.classList.add('hidden');
    try { syncSettingsUI(); } catch (e) { console.error(e); }
    openModal('modalSettings');
  });
  document.getElementById('btnSettingClean').addEventListener('click', () => {
    db.cleanDisplayMode = !db.cleanDisplayMode;
    initParticles(); saveState(); syncSettingsUI();
    showToast(db.cleanDisplayMode ? '已開啟簡潔顯示模式' : '已恢復標準視覺風格', 'info');
  });
  document.getElementById('btnSettingBgm').addEventListener('click', () => { toggleBgm(); syncSettingsUI(); });
  document.getElementById('btnSettingCrt').addEventListener('click', () => {
    db.crtEnabled = !db.crtEnabled;
    if (db.crtEnabled) db.cleanDisplayMode = false;
    saveState(); syncSettingsUI();
  });
  document.getElementById('btnSettingParticles').addEventListener('click', () => {
    db.particlesEnabled = !db.particlesEnabled;
    if (db.particlesEnabled) db.cleanDisplayMode = false;
    initParticles(); saveState(); syncSettingsUI();
  });
  document.getElementById('btnSettingMotion').addEventListener('click', () => {
    db.reduceMotion = !db.reduceMotion;
    initParticles(); saveState(); syncSettingsUI();
  });

  const cycleFontSize = (delta) => {
    const order = ['sm', 'md', 'lg'];
    const cur = order.indexOf(db.fontSizeTier || 'md');
    const next = Math.max(0, Math.min(order.length - 1, cur + delta));
    db.fontSizeTier = order[next];
    saveState(); syncSettingsUI();
    showToast(`編輯器字體：${document.getElementById('btnSettingFont').textContent}`, 'info');
  };
  document.getElementById('btnSettingFont').addEventListener('click', () => {
    const order = ['sm', 'md', 'lg'];
    db.fontSizeTier = order[(order.indexOf(db.fontSizeTier || 'md') + 1) % 3];
    saveState(); syncSettingsUI();
  });
  document.getElementById('btnSettingSfx')?.addEventListener('click', () => {
    db.sfxEnabled = db.sfxEnabled === false;
    saveState(); syncSettingsUI();
    if (db.sfxEnabled) playSfx(660, 'sine', 0.08);
  });
  document.getElementById('btnSettingTabSize')?.addEventListener('click', () => {
    db.editorTabSize = Number(db.editorTabSize) === 2 ? 4 : 2;
    saveState(); syncSettingsUI();
    showToast(`Tab 縮排已切換為 ${db.editorTabSize} 個空白`, 'info');
  });
  document.getElementById('btnSettingAutoSave')?.addEventListener('click', () => {
    db.autoSaveDraft = db.autoSaveDraft === false;
    saveState(); syncSettingsUI();
    showToast(db.autoSaveDraft ? '已開啟自動儲存草稿' : '已關閉自動儲存草稿', 'info');
  });
  document.getElementById('btnSettingDialogueSpeed')?.addEventListener('click', () => {
    const order = ['normal', 'fast', 'instant'];
    db.dialogueSpeed = order[(order.indexOf(db.dialogueSpeed || 'normal') + 1) % 3];
    saveState(); syncSettingsUI();
  });
  document.getElementById('btnOpenIssueReportFromSettings')?.addEventListener('click', () => {
    closeModal('modalSettings');
    const badge = document.getElementById('issueReportContextBadge');
    const inTitle = !document.getElementById('titleScreen')?.classList.contains('hidden');
    if (badge) {
      if (inTitle) {
        badge.textContent = '目前位置：首頁大廳 / 系統設定';
      } else {
        const secName = SECTORS[db.currentSector]?.name || db.currentSector;
        const lvlObj = getLevelById(db.currentLevelId);
        badge.textContent = `目前位置：${secName} · ${lvlObj?.title || db.currentLevelId}`;
      }
    }
    openModal('modalIssueReport');
  });
  document.querySelectorAll('[data-settings-tab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const target = tabBtn.dataset.settingsTab;
      document.querySelectorAll('[data-settings-tab]').forEach(b => {
        const active = b.dataset.settingsTab === target;
        b.className = active
          ? 'settings-tab-btn min-h-[42px] px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-left transition'
          : 'settings-tab-btn min-h-[42px] px-3 py-2 rounded-xl bg-slate-900/60 border border-transparent text-slate-300 hover:text-white text-left transition';
      });
      document.querySelectorAll('.settings-panel').forEach(p => {
        p.classList.toggle('hidden', p.id !== `settingsPanel_${target}`);
      });
    });
  });

  document.getElementById('btnSettingFullscreen')?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      showToast('瀏覽器不支援或已拒絕全螢幕切換', 'warn');
    }
    syncSettingsUI();
  });

  const wireRange = (id, key) => {
    document.getElementById(id)?.addEventListener('input', (e) => {
      db[key] = Number(e.target.value);
      saveState();
      syncSettingsUI();
    });
  };
  wireRange('rangeSettingMasterVol', 'volumeMaster');
  wireRange('rangeSettingBgmVol', 'volumeBgm');
  wireRange('rangeSettingSfxVol', 'volumeSfx');
  wireRange('rangeSettingDlgOpacity', 'dialogueOpacity');
  wireRange('rangeSettingAutoWait', 'autoPlayWaitMs');

  document.getElementById('btnTestSfx')?.addEventListener('click', () => {
    playSfx(660, 'sine', 0.12, 'sfx');
  });

  document.getElementById('btnSettingHighContrast')?.addEventListener('click', () => {
    db.highContrastMode = !db.highContrastMode;
    saveState();
    syncSettingsUI();
    showToast(db.highContrastMode ? '已開啟高對比度顯示模式' : '已關閉高對比度顯示模式', 'info');
  });

  document.getElementById('btnToggleQuestBrief')?.addEventListener('click', () => {
    const drawer = document.getElementById('editorQuestBriefDrawer');
    const btn = document.getElementById('btnToggleQuestBrief');
    const arrow = document.getElementById('questBriefArrow');
    if (!drawer || !btn) return;
    const willHide = !drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', willHide);
    btn.setAttribute('aria-expanded', willHide ? 'false' : 'true');
    if (arrow) arrow.textContent = willHide ? '▶ 展開' : '▼ 收合';
  });
  document.getElementById('btnQuestBriefHint')?.addEventListener('click', () => {
    document.getElementById('btnRequestHint')?.click();
  });
  document.getElementById('btnQuestBriefToTest')?.addEventListener('click', () => {
    if (window.innerWidth < 1024) setMobileTab('test');
    else document.getElementById('wsTestPane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('btnSettingResetUi')?.addEventListener('click', () => {
    document.getElementById('resetSettingsConfirmBox')?.classList.remove('hidden');
  });
  document.getElementById('btnCancelResetSettings')?.addEventListener('click', () => {
    document.getElementById('resetSettingsConfirmBox')?.classList.add('hidden');
  });
  document.getElementById('btnConfirmResetSettings')?.addEventListener('click', () => {
    db.cleanDisplayMode = false;
    db.crtEnabled = false;
    db.highContrastMode = false;
    db.particlesEnabled = window.innerWidth >= 1024;
    db.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    db.fontSizeTier = 'md';
    db.sfxEnabled = true;
    db.editorTabSize = 4;
    db.autoSaveDraft = true;
    db.dialogueSpeed = 'normal';
    db.volumeMaster = 100;
    db.volumeBgm = 70;
    db.volumeSfx = 90;
    db.dialogueOpacity = 90;
    db.autoPlayWaitMs = 2000;
    document.getElementById('resetSettingsConfirmBox')?.classList.add('hidden');
    initParticles();
    saveState();
    syncSettingsUI();
    showToast('已恢復預設系統與顯示設定', 'success');
  });
  document.getElementById('btnFontDecrease').addEventListener('click', () => cycleFontSize(-1));
  document.getElementById('btnFontIncrease').addEventListener('click', () => cycleFontSize(1));

  // Header & Editor Dropdown Menus (WAI-ARIA Menu Keyboard Navigation)
  const wsMoreBtn = document.getElementById('btnWsMoreMenu');
  const wsMoreDrop = document.getElementById('wsMoreDropdown');
  const edMoreBtn = document.getElementById('btnEditorMore');
  const edMoreDrop = document.getElementById('editorMoreMenu');

  function getMenuItems(menuEl) {
    return Array.from(menuEl.querySelectorAll('[role="menuitem"]:not([disabled])')).filter(el => el.offsetParent !== null);
  }

  function closeMenu(btnEl, menuEl, restoreFocus = false) {
    if (!menuEl.classList.contains('hidden')) {
      menuEl.classList.add('hidden');
      btnEl.setAttribute('aria-expanded', 'false');
      if (restoreFocus) btnEl.focus();
    }
  }

  function openMenu(btnEl, menuEl, otherPairs = [], focusLast = false) {
    otherPairs.forEach(([oBtn, oMenu]) => closeMenu(oBtn, oMenu, false));
    menuEl.classList.remove('hidden');
    btnEl.setAttribute('aria-expanded', 'true');
    const items = getMenuItems(menuEl);
    if (items.length > 0) {
      (focusLast ? items[items.length - 1] : items[0]).focus();
    }
  }

  function setupAccessibleMenu(btnEl, menuEl, otherPairs) {
    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menuEl.classList.contains('hidden')) {
        openMenu(btnEl, menuEl, otherPairs, false);
      } else {
        closeMenu(btnEl, menuEl, false);
      }
    });

    btnEl.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu(btnEl, menuEl, otherPairs, false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu(btnEl, menuEl, otherPairs, true);
      } else if (e.key === 'Escape') {
        closeMenu(btnEl, menuEl, true);
      }
    });

    menuEl.addEventListener('keydown', (e) => {
      if (e.target.closest('#resetConfirmPanel')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          closeMenu(btnEl, menuEl, true);
        }
        return;
      }
      const items = getMenuItems(menuEl);
      if (items.length === 0) return;
      const curIdx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(curIdx + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(curIdx - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(btnEl, menuEl, true);
      } else if (e.key === 'Tab') {
        closeMenu(btnEl, menuEl, false);
      }
    });
  }

  setupAccessibleMenu(wsMoreBtn, wsMoreDrop, [[edMoreBtn, edMoreDrop]]);
  setupAccessibleMenu(edMoreBtn, edMoreDrop, [[wsMoreBtn, wsMoreDrop]]);

  document.addEventListener('click', (e) => {
    if (!wsMoreDrop.contains(e.target) && e.target !== wsMoreBtn) {
      closeMenu(wsMoreBtn, wsMoreDrop, false);
    }
    if (!edMoreDrop.contains(e.target) && e.target !== edMoreBtn) {
      closeMenu(edMoreBtn, edMoreDrop, false);
    }
  });

  // Title Screen Actions
  document.getElementById('btnStartGame').addEventListener('click', async () => {
    if (!(await requireDatabaseReady())) return;
    ensureStudentSession();
    const uuid = db.session.studentUuid;
    let targetSec = SECTORS[db.currentSector] ? db.currentSector : 'farm';
    const curLvl = db.currentLevelId || `${targetSec}_1`;
    if (uuid && db.progress[`${uuid}_${curLvl}`]?.completed) {
      const nextSec = Object.keys(SECTORS).find(s =>
        getAllLevelsForSector(s, false).some(l => !db.progress[`${uuid}_${l.id}`]?.completed)
      );
      if (nextSec) targetSec = nextSec;
    }
    selectedMapSector = targetSec;
    renderTownMap();
    openModal('modalTownMap');
  });
  const btnRetryDb = document.getElementById('btnRetryDbConnect');
  if (btnRetryDb) {
    btnRetryDb.addEventListener('click', async () => {
      await checkXamppServerStatus();
      if (dbBackendReady) showToast('☁ 已成功連線至 MySQL 資料庫！', 'success');
    });
  }
  document.getElementById('btnBackToTitle').addEventListener('click', () => {
    flushDraftNow();
    document.getElementById('wsEditorPane').classList.remove('ws-fullscreen');
    document.getElementById('gameWorkspace').classList.add('hidden');
    document.getElementById('titleScreen').classList.remove('hidden');
    refreshTitleCards();
    initParticles();
  });

  document.querySelectorAll('.char-chat-btn').forEach(b => b.addEventListener('click', () => openCharacterChatModal(b.dataset.chatSector)));
  document.querySelectorAll('.char-play-btn').forEach(b => b.addEventListener('click', () => enterWorkspace(b.dataset.playSector)));
  document.getElementById('btnSendChat').addEventListener('click', () => sendCharacterChatMessage());
  document.getElementById('chatInputField').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendCharacterChatMessage(); }
  });
  document.querySelectorAll('.quick-chat-btn').forEach(btn => {
    btn.dataset.origLabel = btn.textContent;
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = `✓ 本回合已問過 · ${btn.dataset.origLabel.replace(/^[^\s]+\s/, '')}`;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      sendCharacterChatMessage(btn.dataset.quickChat);
    });
  });
  document.getElementById('btnResetQuickChat').addEventListener('click', () => {
    document.querySelectorAll('.quick-chat-btn').forEach(b => {
      b.disabled = false;
      b.textContent = b.dataset.origLabel || b.textContent;
      b.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    showToast('快捷問題已重置', 'info');
  });

  // Workspace Navigation & Modes
  document.querySelectorAll('.ws-tab').forEach(b => b.addEventListener('click', () => loadSector(b.dataset.wsSector)));
  document.getElementById('wsLevelSelect').addEventListener('change', (e) => loadSector(db.currentSector, e.target.value));
  document.querySelectorAll('.ws-mode-btn').forEach(b => b.addEventListener('click', () => setWorkspaceMode(b.dataset.wsMode)));
  document.getElementById('btnStoryReturnCoding').addEventListener('click', () => setWorkspaceMode('standard'));
  document.getElementById('btnFocusExpandStory').addEventListener('click', () => setWorkspaceMode('standard'));
  document.getElementById('btnMobReturnEditor').addEventListener('click', () => {
    if (!document.getElementById('learningFeedbackBox').classList.contains('hidden')) {
      jumpToEditorLine(lastErrorLine);
    } else {
      setMobileTab('editor');
    }
  });
  const mobTabOrder = ['story', 'editor', 'test'];
  document.querySelectorAll('.mob-tab-btn').forEach(b => {
    b.addEventListener('click', () => setMobileTab(b.dataset.mobileTab, false));
    b.addEventListener('keydown', (e) => {
      const curIdx = mobTabOrder.indexOf(b.dataset.mobileTab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setMobileTab(mobTabOrder[(curIdx + 1) % mobTabOrder.length], true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setMobileTab(mobTabOrder[(curIdx - 1 + mobTabOrder.length) % mobTabOrder.length], true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setMobileTab(mobTabOrder[0], true);
      } else if (e.key === 'End') {
        e.preventDefault();
        setMobileTab(mobTabOrder[mobTabOrder.length - 1], true);
      }
    });
  });

  // Level 1 Visual Stepper Click-to-Scroll & Highlight Accordion
  document.querySelectorAll('.step-node-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.stepFocus;
      const body = document.getElementById(`accBodyL${idx}`);
      const card = document.getElementById(`accItemL${idx}`);
      const toggleBtn = document.querySelector(`[data-acc-target="accBodyL${idx}"]`);
      if (body && body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        const arrow = toggleBtn?.querySelector('.acc-arrow');
        if (arrow) arrow.textContent = '▲';
      }
      if (card) {
        card.scrollIntoView({ behavior: db.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        card.classList.add('acc-flash-ring');
        setTimeout(() => card.classList.remove('acc-flash-ring'), 900);
      }
    });
  });

  // Level 2 Accordion Toggle
  document.querySelectorAll('.acc-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.accTarget);
      const arrow = btn.querySelector('.acc-arrow');
      if (!target) return;
      const isHidden = target.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
      if (arrow) arrow.textContent = isHidden ? '▼' : '▲';
    });
  });

  // Level 3 Technical Info & Console Toggle
  document.getElementById('btnToggleTechConsole').addEventListener('click', () => {
    const drawer = document.getElementById('techConsoleDrawer');
    const arrow = document.getElementById('techConsoleArrow');
    const isHidden = drawer.classList.toggle('hidden');
    document.getElementById('btnToggleTechConsole').setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    arrow.textContent = isHidden ? '▶ 展開' : '▼ 收合';
  });
  document.getElementById('btnClearConsole').addEventListener('click', () => {
    document.getElementById('wsConsole').innerHTML = '';
  });

  // Draggable Resizer Handle (Pointer Events + Keyboard Support)
  const resizer = document.getElementById('wsResizer');
  const vnPanel = document.getElementById('wsVnPanel');
  let isResizing = false;
  let activePointerId = null;

  function applySplitPercentage(pct, persist = false) {
    const clamped = Number(Math.max(25, Math.min(70, pct)).toFixed(1));
    vnPanel.style.flexBasis = `${clamped}%`;
    db.savedSplitPct = clamped;
    resizer.setAttribute('aria-valuenow', String(clamped));
    if (persist) saveState();
  }

  resizer.addEventListener('pointerdown', (e) => {
    if (window.innerWidth < 1024) return;
    isResizing = true;
    activePointerId = e.pointerId;
    if (resizer.setPointerCapture) {
      try { resizer.setPointerCapture(e.pointerId); } catch (_) {}
    }
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  });
  resizer.addEventListener('pointermove', (e) => {
    if (!isResizing || (activePointerId !== null && e.pointerId !== activePointerId)) return;
    const container = document.getElementById('wsMainContainer');
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    applySplitPercentage(pct, false);
  });
  function stopResizing() {
    if (isResizing) {
      isResizing = false;
      activePointerId = null;
      document.body.style.cursor = '';
      saveState();
    }
  }
  resizer.addEventListener('pointerup', stopResizing);
  resizer.addEventListener('pointercancel', stopResizing);
  resizer.addEventListener('keydown', (e) => {
    if (window.innerWidth < 1024) return;
    const step = e.shiftKey ? 5 : 2;
    const cur = Number(db.savedSplitPct) || 42;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      applySplitPercentage(cur - step, true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      applySplitPercentage(cur + step, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      applySplitPercentage(25, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      applySplitPercentage(70, true);
    }
  });

  // Progressive 3-Step Onboarding Banner
  const onboardingSteps = [
    '💡 <strong>新手引導 (1/3)：</strong>閱讀角色遇到的基建問題，準備修正程式碼。',
    '💡 <strong>新手引導 (2/3)：</strong>在編輯器修改關鍵邏輯（可點 🔍 搜尋或使用縮排）。',
    '💡 <strong>新手引導 (3/3)：</strong>點擊「▶ 執行測試」查看三層結果與角色回饋！'
  ];
  document.getElementById('btnNextOnboarding').addEventListener('click', () => {
    db.onboardingStep = (db.onboardingStep || 1) + 1;
    if (db.onboardingStep > 3) {
      db.onboardingDismissed = true;
      document.getElementById('onboardingBanner').classList.add('hidden');
      saveState();
    } else {
      document.getElementById('onboardingText').innerHTML = onboardingSteps[db.onboardingStep - 1];
    }
  });
  document.getElementById('btnDismissOnboarding').addEventListener('click', () => {
    db.onboardingDismissed = true;
    document.getElementById('onboardingBanner').classList.add('hidden');
    saveState();
  });

  // Dialogue Navigation & Affection Info
  document.getElementById('btnPrevDialogue').addEventListener('click', () => {
    if (dialogueIdx > 0) { dialogueIdx--; renderDialogueStep(); }
  });
  document.getElementById('btnNextDialogue').addEventListener('click', () => {
    if (dialogueIdx < dialogueHistory.length - 1) { dialogueIdx++; renderDialogueStep(); }
  });
  document.getElementById('wsAffTier').addEventListener('click', () => {
    showToast('好感度階級：0–34% Tier 1 (警戒) · 35–69% Tier 2 (信賴) · 70–100% Tier 3 (心動)', 'info');
  });
  const btnQuickChatWs = document.getElementById('btnWsQuickChat');
  if (btnQuickChatWs) {
    btnQuickChatWs.addEventListener('click', () => openCharacterChatModal(db.currentSector));
  }

  document.getElementById('btnJumpToErrorLine').addEventListener('click', () => jumpToEditorLine(lastErrorLine));
  const btnNextSecLvl = document.getElementById('btnNextSectorLevel');
  if (btnNextSecLvl) {
    btnNextSecLvl.addEventListener('click', () => {
      if (btnNextSecLvl.dataset.nextLvlId) loadSector(db.currentSector, btnNextSecLvl.dataset.nextLvlId);
    });
  }
  const btnPassMap = document.getElementById('btnPassOpenMap');
  if (btnPassMap) {
    btnPassMap.addEventListener('click', () => {
      selectedMapSector = db.currentSector;
      renderTownMap();
      openModal('modalTownMap');
    });
  }
  const btnPassChat = document.getElementById('btnPassOpenChat');
  if (btnPassChat) {
    btnPassChat.addEventListener('click', () => openCharacterChatModal(db.currentSector));
  }

  // Editor Enhancements
  const editor = document.getElementById('codeEditorInput');
  editor.addEventListener('input', () => {
    updateSyntaxAndGutter();
    scheduleDraftSave(editor.value);
  });
  editor.addEventListener('scroll', () => {
    document.getElementById('codeHighlightPre').scrollTop = editor.scrollTop;
    document.getElementById('codeHighlightPre').scrollLeft = editor.scrollLeft;
    document.getElementById('wsLineGutter').scrollTop = editor.scrollTop;
    updateCursorAndLineHighlight();
  });
  editor.addEventListener('click', updateCursorAndLineHighlight);
  editor.addEventListener('keyup', updateCursorAndLineHighlight);

  function insertAtCursor(str, cursorOffset = str.length) {
    const s = editor.selectionStart;
    const e = editor.selectionEnd;
    editor.value = editor.value.substring(0, s) + str + editor.value.substring(e);
    editor.selectionStart = editor.selectionEnd = s + cursorOffset;
    editor.focus();
    updateSyntaxAndGutter();
    scheduleDraftSave(editor.value);
  }

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const tabSpaces = Number(db.editorTabSize) === 2 ? '  ' : '    ';
      insertAtCursor(tabSpaces, tabSpaces.length);
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      const s = editor.selectionStart;
      const before = editor.value.substring(0, s);
      const curLine = before.split('\n').pop() || '';
      const indentMatch = curLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';
      if (/[:{]\s*$/.test(curLine.trim())) indent += '    ';
      if (indent.length > 0) {
        e.preventDefault();
        insertAtCursor('\n' + indent, 1 + indent.length);
      }
    } else if (['(', '{', '[', '"', "'"].includes(e.key) && editor.selectionStart === editor.selectionEnd) {
      const pairs = { '(': '()', '{': '{}', '[': '[]', '"': '""', "'": "''" };
      e.preventDefault();
      insertAtCursor(pairs[e.key], 1);
    }
  });

  document.getElementById('btnInsertTabMobile').addEventListener('click', () => insertAtCursor('    ', 4));
  document.querySelectorAll('.touch-char-btn').forEach(b => b.addEventListener('click', () => {
    const ch = b.dataset.insertChar;
    insertAtCursor(ch, ch.length === 2 ? 1 : ch.length);
  }));

  document.getElementById('btnCopyCode').addEventListener('click', async () => {
    const text = editor.value;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('複製成功：程式碼已複製至剪貼簿', 'success');
        return;
      } catch (_) {
        // Fallback to execCommand below
      }
    }
    const prevStart = editor.selectionStart;
    const prevEnd = editor.selectionEnd;
    let copiedOk = false;
    try {
      editor.focus();
      editor.select();
      copiedOk = document.execCommand('copy') === true;
    } catch (_) {
      copiedOk = false;
    } finally {
      try { editor.setSelectionRange(prevStart, prevEnd); } catch (_) {}
    }
    if (copiedOk) {
      showToast('複製成功：程式碼已複製至剪貼簿', 'success');
    } else {
      showToast('複製失敗：瀏覽器不允許自動複製，請手動選取程式碼並按 Ctrl+C', 'error');
    }
  });

  document.getElementById('btnFullscreenEditor').addEventListener('click', () => {
    const edPane = document.getElementById('wsEditorPane');
    const full = edPane.classList.toggle('ws-fullscreen');
    document.getElementById('btnFullscreenEditor').textContent = full ? '✕' : '⛶';
  });

  const searchBar = document.getElementById('editorSearchBar');
  const findInp = document.getElementById('findInput');
  document.getElementById('btnToggleSearch').addEventListener('click', () => {
    const hidden = searchBar.classList.toggle('hidden');
    if (!hidden) {
      findInp.focus();
      findInp.select();
      updateSearchMatchCounter();
    }
  });
  findInp.addEventListener('input', updateSearchMatchCounter);
  findInp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigateSearch(e.shiftKey ? -1 : 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      document.getElementById('btnCloseSearch').click();
    }
  });
  document.getElementById('btnCloseSearch').addEventListener('click', () => {
    searchBar.classList.add('hidden');
    findInp.value = '';
    updateSearchMatchCounter();
    editor.focus();
  });
  document.getElementById('btnFindPrev').addEventListener('click', () => navigateSearch(-1));
  document.getElementById('btnFindNext').addEventListener('click', () => navigateSearch(1));
  document.getElementById('btnReplaceOne').addEventListener('click', () => {
    const q = findInp.value;
    const rep = document.getElementById('replaceInput').value;
    if (!q) return;
    const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    if (selected === q) {
      insertAtCursor(rep, rep.length);
      updateSearchMatchCounter();
      showToast('已取代 1 處相符項目', 'success');
    } else {
      document.getElementById('btnFindNext').click();
    }
  });
  document.getElementById('btnReplaceAll').addEventListener('click', () => {
    const q = findInp.value;
    const rep = document.getElementById('replaceInput').value;
    if (!q) return;
    const parts = editor.value.split(q);
    const count = parts.length - 1;
    if (count === 0) {
      showToast('找不到可取代的相符字串', 'warn');
      return;
    }
    editor.value = parts.join(rep);
    updateSyntaxAndGutter();
    scheduleDraftSave(editor.value);
    updateSearchMatchCounter();
    showToast(`已完成全部取代（共取代 ${count} 處）`, 'success');
  });

  document.getElementById('btnRunDebug').addEventListener('click', handleRunSubmission);
  document.getElementById('btnResetCode').addEventListener('click', () => {
    document.getElementById('resetConfirmPanel').classList.remove('hidden');
  });
  document.getElementById('btnCancelResetCode').addEventListener('click', () => {
    document.getElementById('resetConfirmPanel').classList.add('hidden');
  });
  document.getElementById('btnConfirmResetCode').addEventListener('click', () => {
    document.getElementById('resetConfirmPanel').classList.add('hidden');
    edMoreDrop.classList.add('hidden');
    editor.value = getLevelById(db.currentLevelId).starter;
    if (db.session.studentUuid && db.drafts) {
      delete db.drafts[`${db.session.studentUuid}_${db.currentLevelId}`];
      saveState();
    }
    updateSyntaxAndGutter();
    resetEvaluationCards();
    showToast('已重設為關卡初始代碼', 'info');
  });

  function revealNextHint() {
    if (db.hintDepth < 3) db.hintDepth += 1;
    updateHintBtnLabel();
    const lvlObj = getLevelById(db.currentLevelId);
    const allHints = lvlObj.hints || SECTORS[db.currentSector].hints;
    const listEl = document.getElementById('hintDrawerList');
    if (listEl) {
      listEl.innerHTML = '';
      for (let i = 0; i < db.hintDepth; i++) {
        const [title, body] = allHints[i] || ['提示', '請檢查核心邏輯'];
        const item = document.createElement('div');
        item.className = i === db.hintDepth - 1
          ? 'p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/60 space-y-1'
          : 'p-2 rounded-lg bg-slate-900/70 border border-slate-800 space-y-0.5 opacity-85';
        item.innerHTML = `<div class="font-bold text-amber-300 font-mono">第 ${i + 1} 層：${title}</div><p class="text-xs sm:text-sm leading-relaxed text-slate-100">${escapeHtml(body)}</p>`;
        listEl.appendChild(item);
      }
    }
    document.getElementById('hintDrawer').classList.remove('hidden');
  }
  document.getElementById('btnRequestHint').addEventListener('click', () => {
    if (db.hintDepth === 0) {
      document.getElementById('hintConfirmBox').classList.remove('hidden');
      return;
    }
    revealNextHint();
  });
  document.getElementById('btnCancelHintConfirm').addEventListener('click', () => document.getElementById('hintConfirmBox').classList.add('hidden'));
  document.getElementById('btnAcceptHintConfirm').addEventListener('click', () => {
    document.getElementById('hintConfirmBox').classList.add('hidden');
    revealNextHint();
  });

  document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.closeModal)));
  document.getElementById('btnTownCompleteBadge').addEventListener('click', () => openModal('modalTownEnding'));
  document.getElementById('btnOpenAuthTitle').addEventListener('click', () => openModal('modalAuth'));
  document.getElementById('btnWsAuth').addEventListener('click', () => {
    wsMoreDrop.classList.add('hidden');
    openModal('modalAuth');
  });
  document.getElementById('btnOpenMapWs').addEventListener('click', () => {
    wsMoreDrop.classList.add('hidden');
    selectedMapSector = db.currentSector;
    renderTownMap();
    openModal('modalTownMap');
  });
  document.querySelectorAll('.map-node').forEach(node => {
    node.addEventListener('click', () => { playSfx(620); selectMapNode(node.dataset.mapSector); });
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMapNode(node.dataset.mapSector); } });
  });
  document.getElementById('btnMapTeleport').addEventListener('click', () => {
    closeModal('modalTownMap');
    enterWorkspace(selectedMapSector);
  });

  document.getElementById('btnOpenSaveLoadTitle').addEventListener('click', () => { renderSaveSlots(); openModal('modalSaveLoad'); });
  document.getElementById('btnOpenSaveLoadWs').addEventListener('click', () => {
    wsMoreDrop.classList.add('hidden');
    renderSaveSlots();
    openModal('modalSaveLoad');
  });
  document.getElementById('btnExportProgressJson').addEventListener('click', exportProgressJson);
  document.getElementById('inputImportProgressJson').addEventListener('change', (e) => {
    previewImportProgressJson(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btnCancelImport').addEventListener('click', () => {
    pendingImportData = null;
    document.getElementById('importPreviewBox').classList.add('hidden');
  });
  document.getElementById('btnConfirmImport').addEventListener('click', () => {
    if (!pendingImportData) return;
    db = migrateState(pendingImportData);
    wsMode = db.savedWsMode || 'standard';
    pendingImportData = null;
    document.getElementById('importPreviewBox').classList.add('hidden');
    saveState();
    updateAuthBadges();
    renderSaveSlots();
    if (!document.getElementById('gameWorkspace').classList.contains('hidden')) loadSector(db.currentSector);
    showToast('已成功匯入備份存檔！', 'success');
  });

  document.getElementById('btnOpenWorldLore').addEventListener('click', () => openModal('modalLore'));
  document.getElementById('btnOpenHeroines').addEventListener('click', () => { renderOfflineScriptsPreview('farm'); openModal('modalHeroines'); });
  const btnOpenAch = document.getElementById('btnOpenAchievements');
  if (btnOpenAch) {
    btnOpenAch.addEventListener('click', () => { renderAchievementsModal(); openModal('modalAchievements'); });
  }
  const btnCloseTimeline = document.getElementById('btnCloseTimelineDrawer');
  if (btnCloseTimeline) {
    btnCloseTimeline.addEventListener('click', () => {
      document.getElementById('adminTimelineDrawer')?.classList.add('hidden');
    });
  }
  document.querySelectorAll('.preview-sec-btn').forEach(b => b.addEventListener('click', () => renderOfflineScriptsPreview(b.dataset.previewSector)));

  document.getElementById('tabAuthStudent').addEventListener('click', () => {
    document.getElementById('panelAuthStudent').classList.remove('hidden');
    document.getElementById('panelAuthAdmin').classList.add('hidden');
    document.getElementById('tabAuthStudent').className = 'min-h-[44px] py-2.5 border-b-2 border-orange-500 text-orange-300 font-bold';
    document.getElementById('tabAuthAdmin').className = 'min-h-[44px] py-2.5 border-b-2 border-transparent text-slate-300';
  });
  document.getElementById('tabAuthAdmin').addEventListener('click', () => {
    document.getElementById('panelAuthAdmin').classList.remove('hidden');
    document.getElementById('panelAuthStudent').classList.add('hidden');
    document.getElementById('tabAuthAdmin').className = 'min-h-[44px] py-2.5 border-b-2 border-amber-500 text-amber-300 font-bold';
    document.getElementById('tabAuthStudent').className = 'min-h-[44px] py-2.5 border-b-2 border-transparent text-slate-300';
  });
  document.getElementById('btnIssueGuestSession').addEventListener('click', async () => {
    if (dbBackendReady) {
      await syncSessionWithDatabase();
    }
    ensureStudentSession();
    closeModal('modalAuth');
  });
  document.getElementById('btnLogoutSession').addEventListener('click', async () => {
    if (dbBackendReady) {
      try { await fetch('api/session.php', { method: 'DELETE', headers: buildAuthJsonHeaders() }); } catch (_) {}
    }
    db.session = { role: 'guest', studentUuid: null, adminFailCount: 0, lockedUntil: 0 };
    saveState(); updateAuthBadges(); closeModal('modalAuth');
    showToast('已登出並清除工作階段', 'info');
  });


  document.getElementById('btnAdminLoginSubmit').addEventListener('click', async () => {
    if (Date.now() < (db.session.lockedUntil || 0)) {
      const waitSec = Math.ceil((db.session.lockedUntil - Date.now()) / 1000);
      showToast(`429 RATE_LIMITED：嘗試次數過多，請 ${waitSec} 秒後再試`, 'error');
      return;
    }
    const u = document.getElementById('adminUserInput').value.trim();
    const p = document.getElementById('adminPassInput').value.trim();

    if (dbBackendReady) {
      try {
        const resp = await fetch('api/admin_login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await resp.json();
        if (resp.ok && data.ok) {
          db.session.role = 'admin';
          db.session.adminFailCount = 0;
          db.session.lockedUntil = 0;
          db.session.studentUuid = data.student_uuid;
          if (data.csrf_token) db.session.csrfToken = data.csrf_token;
          await bootstrapFromDatabase();
          saveState(); updateAuthBadges(); closeModal('modalAuth');
          renderAdminDashboard(); openModal('modalAdminDash');
          showToast(`教師後台登入成功（MySQL 驗證：${data.display_name || u}）`, 'success');
          return;
        }
        if (resp.status === 429) {
          db.session.lockedUntil = Date.now() + ((data.retry_after || 60) * 1000);
        }
        const guideEl = document.getElementById('adminNoTeacherGuide');
        if (guideEl) guideEl.classList.toggle('hidden', data.error !== 'NO_TEACHER_ACCOUNT');
        showToast(`${resp.status} ${data.error || 'AUTH_FAILED'}：${data.msg || '驗證失敗'}`, 'error');
        return;
      } catch (err) {
        showToast('無法連線至 api/admin_login.php，請確認 Apache 與 MySQL 狀態', 'error');
        return;
      }
    }

    showToast('目前無法連線至 MySQL 資料庫，請先啟動 XAMPP MySQL 後再登入教師後台', 'error');
  });

  function switchAdminTab(tab) {
    const tabs = {
      analytics: ['tabAdminAnalytics', 'panelAdminAnalytics'],
      levels: ['tabAdminLevels', 'panelAdminLevels'],
      scripts: ['tabAdminScripts', 'panelAdminScripts'],
      stories: ['tabAdminStories', 'panelAdminStories'],
      issues: ['tabAdminIssues', 'panelAdminIssues']
    };
    Object.entries(tabs).forEach(([k, [tId, pId]]) => {
      const active = k === tab;
      const tEl = document.getElementById(tId);
      const pEl = document.getElementById(pId);
      if (tEl) tEl.className = active ? 'min-h-[44px] py-3 border-b-2 border-amber-500 text-amber-300 font-bold transition' : 'min-h-[44px] py-3 border-b-2 border-transparent text-slate-300 hover:text-white transition';
      if (pEl) pEl.classList.toggle('hidden', !active);
    });
    if (tab === 'levels') renderAdminLevels();
    if (tab === 'scripts') renderAdminScripts();
    if (tab === 'stories' && typeof renderAdminStories === 'function') renderAdminStories();
    if (tab === 'issues') renderAdminIssues();
  }
  document.getElementById('tabAdminAnalytics').addEventListener('click', () => switchAdminTab('analytics'));
  document.getElementById('tabAdminLevels').addEventListener('click', () => switchAdminTab('levels'));
  document.getElementById('tabAdminScripts').addEventListener('click', () => switchAdminTab('scripts'));
  const tabStoriesBtn = document.getElementById('tabAdminStories');
  if (tabStoriesBtn) tabStoriesBtn.addEventListener('click', () => switchAdminTab('stories'));
  const tabIssuesBtn = document.getElementById('tabAdminIssues');
  if (tabIssuesBtn) tabIssuesBtn.addEventListener('click', () => switchAdminTab('issues'));
  const filterIssuesEl = document.getElementById('filterAdminIssueStatus');
  if (filterIssuesEl) filterIssuesEl.addEventListener('change', renderAdminIssues);
  const refreshIssuesEl = document.getElementById('btnRefreshAdminIssues');
  if (refreshIssuesEl) refreshIssuesEl.addEventListener('click', renderAdminIssues);

  const btnOpenIssueWs = document.getElementById('btnOpenIssueReportWs');
  if (btnOpenIssueWs) {
    btnOpenIssueWs.addEventListener('click', () => {
      wsMoreDrop.classList.add('hidden');
      const badge = document.getElementById('issueReportContextBadge');
      const secName = SECTORS[db.currentSector]?.name || db.currentSector;
      const lvlObj = getLevelById(db.currentLevelId);
      if (badge) badge.textContent = `目前位置：${secName} · ${lvlObj?.title || db.currentLevelId}`;
      openModal('modalIssueReport');
    });
  }

  const btnSubmitIssue = document.getElementById('btnSubmitIssueReport');
  if (btnSubmitIssue) {
    btnSubmitIssue.addEventListener('click', async () => {
      const category = document.getElementById('issueReportCategory')?.value || 'level_bug';
      const title = (document.getElementById('issueReportTitle')?.value || '').trim();
      const description = (document.getElementById('issueReportDesc')?.value || '').trim();
      if (!title || !description) {
        showToast('請填寫問題標題與詳細描述', 'error');
        return;
      }
      const payload = {
        action: 'create',
        category,
        sector_id: db.currentSector || null,
        level_code: db.currentLevelId || null,
        title,
        description,
        client_meta: {
          wsMode,
          lang: navigator.language || '',
          viewport: `${window.innerWidth}x${window.innerHeight}`
        }
      };

      if (dbBackendReady) {
        btnSubmitIssue.disabled = true;
        try {
          if (!db.session.studentUuid) await syncSessionWithDatabase();
          const resp = await fetch('api/issue_reports.php', {
            method: 'POST',
            headers: buildAuthJsonHeaders(),
            body: JSON.stringify(payload)
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok || !data.ok) {
            showToast(data.msg || `問題回報送出失敗 (${resp.status})`, 'error');
            btnSubmitIssue.disabled = false;
            return;
          }
          showToast(`問題回報已送出（編號 #${data.report_id}）`, 'success');
        } catch (_) {
          showToast('無法連線至伺服器，已改存於本地紀錄', 'error');
        } finally {
          btnSubmitIssue.disabled = false;
        }
      } else {
        if (!Array.isArray(db.issueReports)) db.issueReports = [];
        db.issueReports.unshift({
          report_id: Date.now(),
          student_uuid: db.session.studentUuid || 'offline_guest',
          ...payload,
          status: 'OPEN',
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
        saveState();
        showToast('離線模式：問題回報已暫存於本地瀏覽器', 'info');
      }

      document.getElementById('issueReportTitle').value = '';
      document.getElementById('issueReportDesc').value = '';
      closeModal('modalIssueReport');
    });
  }
  document.getElementById('btnVerify24Scripts').addEventListener('click', () => { renderAdminScripts(); showToast('已完成 24 條劇本完整性校驗', 'success'); });
  document.getElementById('btnAdminStep1').addEventListener('click', () => {
    document.getElementById('adminStep1Fields').classList.remove('hidden');
    document.getElementById('adminStep2Fields').classList.add('hidden');
    document.getElementById('btnAdminStep1').className = 'min-h-[36px] px-2.5 py-1 rounded-xl bg-emerald-700 text-white font-bold';
    document.getElementById('btnAdminStep2').className = 'min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200';
  });
  document.getElementById('btnAdminStep2').addEventListener('click', () => {
    document.getElementById('adminStep2Fields').classList.remove('hidden');
    document.getElementById('adminStep1Fields').classList.add('hidden');
    document.getElementById('btnAdminStep2').className = 'min-h-[36px] px-2.5 py-1 rounded-xl bg-emerald-700 text-white font-bold';
    document.getElementById('btnAdminStep1').className = 'min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200';
  });
  document.getElementById('btnOpenAnalyticsTitle').addEventListener('click', () => { renderAdminDashboard(); openModal('modalAdminDash'); });
  document.getElementById('btnWsAdminDash').addEventListener('click', () => { renderAdminDashboard(); openModal('modalAdminDash'); });
  document.getElementById('filterAuditSector').addEventListener('change', renderAdminDashboard);
  document.getElementById('filterAuditStatus').addEventListener('change', renderAdminDashboard);
  const rangeSel = document.getElementById('filterAuditRange');
  if (rangeSel) rangeSel.addEventListener('change', renderAdminDashboard);
  document.getElementById('btnExportAuditCsv').addEventListener('click', exportAuditCsv);

  document.getElementById('btnCreateNewLevel').addEventListener('click', () => {
    const sectorId = document.getElementById('newLvlSector').value;
    const title = document.getElementById('newLvlTitle').value.trim();
    const file = document.getElementById('newLvlFile').value.trim() || 'custom_task.code';
    const metaphor = document.getElementById('newLvlMetaphor').value.trim() || '自訂邏輯修復';
    const requiredToken = document.getElementById('newLvlRequiredToken').value.trim();
    const starter = document.getElementById('newLvlStarter').value.trim();
    const expectedStdout = document.getElementById('newLvlExpectedStdout').value.trim();
    const passPattern = document.getElementById('newLvlPassPattern').value.trim();
    const hintText = document.getElementById('newLvlHint').value.trim() || '請檢查必要邏輯與輸出格式。';
    if (!title || !starter) {
      showToast('請填寫關卡標題與初始代碼！', 'error');
      return;
    }
    if (!Array.isArray(db.customLevels)) db.customLevels = [];
    const newLvl = {
      id: `custom_${Date.now()}`, sectorId, title, file, metaphor, starter, requiredToken, passPattern, expectedStdout,
      hints: [['方向提示', hintText], ['關鍵概念', `請確認程式包含「${requiredToken || passPattern || '正確邏輯'}」。`], ['結構提示', `確保符合條件「${passPattern || expectedStdout}」。`]],
      isBuiltin: false, isActive: true
    };
    db.customLevels.push(newLvl);
    if (Array.isArray(dbLevelsList) && dbLevelsList.length > 0) {
      dbLevelsList.push(newLvl);
    }
    if (dbBackendReady) {
      fetch('api/admin_levels.php', {
        method: 'POST',
        headers: buildAuthJsonHeaders(),
        body: JSON.stringify({ action: 'create', ...newLvl })
      }).catch(() => {});
    }
    saveState(); renderAdminLevels(); refreshTitleCards();
    document.getElementById('newLvlTitle').value = '';
    document.getElementById('newLvlStarter').value = '';
    showToast(`已成功新增關卡「${title}」！`, 'success');
  });

  // Global Keyboard Navigation & Modal Focus Trap
  window.addEventListener('keydown', (e) => {
    if (activeModalId) {
      const modal = document.getElementById(activeModalId);
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal(activeModalId);
        return;
      }
      if (e.key === 'Tab' && modal) {
        const focusable = getFocusableInModal(modal);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !modal.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modal.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      if (!wsMoreDrop.classList.contains('hidden')) {
        closeMenu(wsMoreBtn, wsMoreDrop, true);
        return;
      }
      if (!edMoreDrop.classList.contains('hidden')) {
        closeMenu(edMoreBtn, edMoreDrop, true);
        return;
      }
      const edPane = document.getElementById('wsEditorPane');
      if (edPane.classList.contains('ws-fullscreen')) {
        edPane.classList.remove('ws-fullscreen');
        document.getElementById('btnFullscreenEditor').textContent = '⛶';
        return;
      }
    }

    if (!document.getElementById('gameWorkspace').classList.contains('hidden')) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunSubmission();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchBar.classList.remove('hidden');
        findInp.focus();
        updateSearchMatchCounter();
      }
    }
  });
});

/* =========================================================================
 * 10. V3.1 GAL GAME STORY PLAYER & STORY CMS ADMIN UI
 * ========================================================================= */
const STORY_SPEAKERS = {
  farm: { name: '蘇曉', role: '生態農場數據員', svgSector: 'farm' },
  market: { name: '夏海', role: '海濱咖啡廳店長', svgSector: 'market' },
  admin: { name: '林靜', role: '鎮公所秘書長', svgSector: 'admin' },
  industrial: { name: '鐵嵐', role: '水電廠技師', svgSector: 'industrial' },
  npc_bean: { name: '小豆', role: '見習報時員 (10歲)', svgSector: 'admin' },
  npc_chan: { name: '陳伯', role: '退休雜貨舖老闆', svgSector: 'common' },
  npc_fu: { name: '阿福叔', role: '資深老農夫', svgSector: 'farm' },
  npc_keung: { name: '水產強哥', role: '漁獲批發商', svgSector: 'market' },
  npc_zhou: { name: '周師傅', role: '退休老電工', svgSector: 'industrial' },
  source_0: { name: 'Source-0 OS', role: '1978 核心主機', svgSector: 'common' },
  narrator: { name: '旁白', role: '源泉鎮記事', svgSector: 'common' },
  player: { name: '你 (臨時管理員)', role: '系統工程師', svgSector: 'common' }
};

const DEFAULT_STORY_NODES = [
  {
    node_code: 'ch1_bus_prologue',
    story_code: 'source_town_v5',
    chapter: 1,
    sector_id: 'common',
    event_type: 'prologue',
    title: '巴士站的重逢與 Source-0 警報',
    sort_order: 10,
    is_active: true,
    scene: { scene_code: 'bus_stop_dusk', location_name: '源泉鎮 · 長途巴士站', time_of_day: 'dusk' },
    dialogues: [
      { line_id: 'L1', speaker_id: 'narrator', emotion: 'neutral', text: '黃昏把源泉鎮染成橘紅與深紫，手機訊號格在踏下巴士的瞬間歸零。' },
      { line_id: 'L2', speaker_id: 'npc_chan', emotion: 'neutral', text: '返嚟啦細路！大城市做電腦做到面青青，返到源泉鎮就啱晒——咦，鎮公所個警報燈點解無端端閃紅光？' },
      { line_id: 'L3', speaker_id: 'source_0', emotion: 'neutral', text: '偵測到管理員權限吻合……1978 隔離計時器已屆滿，四大基建導管同步異常，請立即進行除錯。' }
    ],
    choices: [
      { choice_code: 'go_square', label: '跟陳伯前往鎮公所紀念廣場', next_node_code: 'ch1_bell_100_trigger', affection_delta: null }
    ]
  },
  {
    node_code: 'ch1_bell_100_trigger',
    story_code: 'source_town_v5',
    chapter: 1,
    sector_id: 'common',
    event_type: 'npc_trigger',
    title: '第 100 下鐘聲與 1978 銅鑰匙',
    sort_order: 20,
    is_active: true,
    scene: { scene_code: 'town_square_dusk', location_name: '源泉鎮 · 鎮公所前紀念廣場', time_of_day: 'dusk' },
    dialogues: [
      { line_id: 'L1', speaker_id: 'npc_bean', emotion: 'neutral', text: '大哥哥！你剛剛聽到嗎？大鐘樓剛才敲了整整一百下，比平常多了一聲！' },
      { line_id: 'L2', speaker_id: 'npc_chan', emotion: 'neutral', text: '鎮上大人都唔記得原因……但 1978 年圖靈博士上巴士前將呢把銅鑰匙交畀我，話四十八年後會有返鄉工程師嚟解開。' }
    ],
    choices: [
      { choice_code: 'inspect_farm', label: '先去生態農場幫蘇曉檢查乾旱警報', next_node_code: 'ch2_farm_care', affection_delta: { sector_id: 'farm', delta: 5 } },
      { choice_code: 'jump_truth', label: '檢視 1978 核心真相預覽（第四章）', next_node_code: 'ch4_truth_1978_convergence', affection_delta: null }
    ]
  },
  {
    node_code: 'ch2_farm_care',
    story_code: 'source_town_v5',
    chapter: 2,
    sector_id: 'farm',
    event_type: 'care',
    title: '溫室裡的熱薑茶與微氣候異常',
    sort_order: 30,
    is_active: true,
    scene: { scene_code: 'farm_greenhouse', location_name: '生態農場 · 第 2 號溫室', time_of_day: 'night' },
    dialogues: [
      { line_id: 'L1', speaker_id: 'farm', emotion: 'helpful_smile', text: '喂，成晚對住個終端機唔飲水會中暑㗎！呢杯熱薑茶同哈密瓜放你隔離，唔准將大城市嘅 Burnout 帶返嚟。' },
      { line_id: 'L2', speaker_id: 'farm', emotion: 'anxious_point', text: '不過講真……我昨晚跑完圖靈博士留低嘅微氣候模型，佢預測出一個好唔合理嘅四十八年災害週期，Source-0 係咪收埋咗啲嘢？' }
    ],
    choices: [
      { choice_code: 'to_truth_from_farm', label: '帶住這份微氣候數據前往核心機房', next_node_code: 'ch4_truth_1978_convergence', affection_delta: { sector_id: 'farm', delta: 5 } }
    ]
  },
  {
    node_code: 'ch4_truth_1978_convergence',
    story_code: 'source_town_v5',
    chapter: 4,
    sector_id: 'common',
    event_type: 'truth_1978',
    title: '《1978 核心真相篇》孤島隔離協議',
    sort_order: 40,
    is_active: true,
    scene: { scene_code: 'source0_core_room', location_name: '鎮公所地底 · Source-0 核心機房', time_of_day: 'midnight' },
    dialogues: [
      { line_id: 'L1', speaker_id: 'admin', emotion: 'strict_nod', text: '四份 1978 年密鑰已經透過 Java 權限驗證解封。原來當年並非系統故障，而是外部商業演算法試圖強制抹除小鎮的容錯空間。' },
      { line_id: 'L2', speaker_id: 'industrial', emotion: 'stoic_nod', text: '周師傅講得啱，圖靈博士當年親手焊接保護迴路切斷外網，係為咗用 48 年本地循環保護源泉鎮。' },
      { line_id: 'L3', speaker_id: 'source_0', emotion: 'neutral', text: 'Warning: The town is not a machine. Do not optimize humanity away.' }
    ],
    choices: []
  }
];

let storyNodesState = JSON.parse(JSON.stringify(DEFAULT_STORY_NODES));
const storyPlayerState = {
  activeNodeCode: 'ch1_bus_prologue',
  lineIndex: 0,
  typewriterTimer: null,
  isTyping: false,
  collectedEvidences: new Set(),
  flags: new Set()
};
let cmsEditingNodeCode = null;

function updateStoryEvidenceBadges() {
  const count = storyPlayerState.collectedEvidences.size;
  const tEl = document.getElementById('titleEvidenceCount');
  const mEl = document.getElementById('storyEvidenceBadge');
  if (tEl) tEl.textContent = `證據 ${count}/4`;
  if (mEl) mEl.textContent = `1978 證據 ${count}/4`;
}

function renderStoryNodeStrip() {
  const strip = document.getElementById('storyNodeListStrip');
  if (!strip) return;
  strip.innerHTML = '';
  storyNodesState.filter(n => n.is_active !== false).forEach(node => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isCurrent = node.node_code === storyPlayerState.activeNodeCode;
    btn.className = isCurrent
      ? 'px-2 py-0.5 rounded-lg bg-orange-600 text-white font-mono text-[11px] font-bold'
      : 'px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]';
    btn.textContent = `Ch.${node.chapter} ${node.title.slice(0, 8)}`;
    btn.addEventListener('click', () => playStoryNode(node.node_code));
    strip.appendChild(btn);
  });
}

function renderStoryLine(instant = false) {
  const node = storyNodesState.find(n => n.node_code === storyPlayerState.activeNodeCode) || storyNodesState[0];
  if (!node || !node.dialogues || node.dialogues.length === 0) return;

  const lines = node.dialogues;
  const idx = Math.max(0, Math.min(storyPlayerState.lineIndex, lines.length - 1));
  storyPlayerState.lineIndex = idx;
  const line = lines[idx];

  const sp = STORY_SPEAKERS[line.speaker_id] || { name: line.speaker_id, svgSector: 'common' };
  document.getElementById('storySpeakerName').textContent = sp.name;
  const emoText = line.emotion === 'neutral' ? '😐 平靜' : (EMOTION_LABELS[line.emotion] || line.emotion);
  document.getElementById('storyEmotionBadge').textContent = emoText;

  const avatarEl = document.getElementById('storySpeakerAvatar');
  if (SECTORS[sp.svgSector] && SECTORS[sp.svgSector].svg) {
    avatarEl.innerHTML = SECTORS[sp.svgSector].svg;
  } else {
    avatarEl.innerHTML = '<svg viewBox="0 0 100 100" class="w-full h-full fill-current text-orange-300"><circle cx="50" cy="36" r="20" opacity="0.9"/><path d="M22 88 C22 65, 35 58, 50 58 C65 58, 78 65, 78 88 Z" opacity="0.8"/></svg>';
  }

  document.getElementById('storyLineProgress').textContent = `對話 ${idx + 1} / ${lines.length}`;
  document.getElementById('btnStoryPrevLine').disabled = idx === 0;

  const box = document.getElementById('storyDialogueBox');
  if (storyPlayerState.typewriterTimer) {
    clearInterval(storyPlayerState.typewriterTimer);
    storyPlayerState.typewriterTimer = null;
  }

  box.style.opacity = String((db.dialogueOpacity ?? 90) / 100);
  const fullText = String(line.text || '');
  const speedPref = db.dialogueSpeed || 'normal';
  const reduceMotion = document.body.classList.contains('reduce-motion') || instant || speedPref === 'instant';
  if (reduceMotion) {
    box.textContent = fullText;
    storyPlayerState.isTyping = false;
  } else {
    const stepChars = speedPref === 'fast' ? 3 : 2;
    const stepMs = speedPref === 'fast' ? 10 : 22;
    box.textContent = '';
    storyPlayerState.isTyping = true;
    let pos = 0;
    storyPlayerState.typewriterTimer = setInterval(() => {
      pos += stepChars;
      box.textContent = fullText.slice(0, pos);
      if (pos >= fullText.length) {
        clearInterval(storyPlayerState.typewriterTimer);
        storyPlayerState.typewriterTimer = null;
        storyPlayerState.isTyping = false;
      }
    }, stepMs);
  }

  const choicesBox = document.getElementById('storyChoicesBox');
  choicesBox.innerHTML = '';
  const isLastLine = idx === lines.length - 1;
  const choices = Array.isArray(node.choices) ? node.choices : [];
  if (isLastLine && choices.length > 0) {
    choicesBox.classList.remove('hidden');
    choices.slice(0, 4).forEach(ch => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-orange-950/80 border border-orange-500/50 text-left text-xs font-mono text-orange-200 transition';
      btn.textContent = `▸ ${ch.label}`;
      btn.addEventListener('click', () => {
        if (ch.next_node_code) {
          playStoryNode(ch.next_node_code);
        } else {
          closeModal('modalStoryPlayer');
        }
      });
      choicesBox.appendChild(btn);
    });
    document.getElementById('btnStoryNextLine').textContent = '請選擇分支';
    document.getElementById('btnStoryNextLine').disabled = true;
  } else {
    choicesBox.classList.add('hidden');
    document.getElementById('btnStoryNextLine').disabled = false;
    document.getElementById('btnStoryNextLine').textContent = isLastLine ? '完成章節 ✓' : '繼續 →';
  }
}

function playStoryNode(nodeCode) {
  const node = storyNodesState.find(n => n.node_code === nodeCode) || storyNodesState[0];
  if (!node) return;
  storyPlayerState.activeNodeCode = node.node_code;
  storyPlayerState.lineIndex = 0;
  document.getElementById('storyChapterBadge').textContent = `CH.${node.chapter} · ${node.event_type}`;
  document.getElementById('storyPlayerTitle').textContent = node.title;
  const tod = node.scene?.time_of_day || 'dusk';
  document.getElementById('storyPlayerLocation').textContent = `${node.scene?.location_name || '源泉鎮'} (${tod})`;
  const stageEl = document.getElementById('storyStageBg');
  if (stageEl) {
    stageEl.className = `relative flex-1 min-h-[220px] sm:min-h-[260px] story-sky-${tod} p-5 flex flex-col justify-end overflow-hidden transition-colors duration-500`;
  }
  updateStoryEvidenceBadges();
  renderStoryNodeStrip();
  renderStoryLine(false);
  openModal('modalStoryPlayer');
}

function renderAdminStories() {
  const listEl = document.getElementById('cmsNodeList');
  if (!listEl) return;
  const chFilter = document.getElementById('cmsFilterChapter')?.value || 'ALL';
  const secFilter = document.getElementById('cmsFilterSector')?.value || 'ALL';

  const filtered = storyNodesState
    .filter(n => (chFilter === 'ALL' || String(n.chapter) === chFilter) && (secFilter === 'ALL' || n.sector_id === secFilter))
    .sort((a, b) => (a.chapter - b.chapter) || ((a.sort_order || 0) - (b.sort_order || 0)));

  listEl.innerHTML = '';
  filtered.forEach(node => {
    const card = document.createElement('button');
    card.type = 'button';
    const selected = node.node_code === cmsEditingNodeCode;
    card.className = selected
      ? 'w-full text-left p-3 rounded-xl bg-amber-950/60 border border-amber-500 space-y-1 transition'
      : 'w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 space-y-1 transition';

    const top = document.createElement('div');
    top.className = 'flex items-center justify-between gap-2';
    const badge = document.createElement('span');
    badge.className = 'text-[11px] font-bold text-orange-300';
    badge.textContent = `Ch.${node.chapter} · ${node.sector_id} · ${node.event_type}`;
    const status = document.createElement('span');
    status.className = node.is_active !== false ? 'text-[10px] text-emerald-300' : 'text-[10px] text-slate-500';
    status.textContent = node.is_active !== false ? '● 啟用' : '○ 停用';
    top.appendChild(badge);
    top.appendChild(status);

    const titleDiv = document.createElement('div');
    titleDiv.className = 'text-xs font-bold text-white truncate';
    titleDiv.textContent = node.title;

    const codeDiv = document.createElement('div');
    codeDiv.className = 'text-[10px] text-slate-400';
    codeDiv.textContent = `${node.node_code} (${(node.dialogues || []).length} 句)`;

    card.appendChild(top);
    card.appendChild(titleDiv);
    card.appendChild(codeDiv);
    card.addEventListener('click', () => loadStoryNodeIntoEditor(node.node_code));
    listEl.appendChild(card);
  });

  if (!cmsEditingNodeCode && filtered.length > 0) {
    loadStoryNodeIntoEditor(filtered[0].node_code);
  }
}

function addCmsDialogueRow(line = { speaker_id: 'farm', emotion: 'neutral', text: '' }) {
  const box = document.getElementById('cmsDialogueLines');
  if (!box) return;
  const row = document.createElement('div');
  row.className = 'cms-dialogue-row p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5';

  const top = document.createElement('div');
  top.className = 'flex items-center gap-1.5';

  const spSel = document.createElement('select');
  spSel.className = 'cms-line-speaker min-h-[32px] px-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]';
  Object.entries(STORY_SPEAKERS).forEach(([id, info]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = info.name;
    if (id === line.speaker_id) opt.selected = true;
    spSel.appendChild(opt);
  });

  const emoSel = document.createElement('select');
  emoSel.className = 'cms-line-emotion flex-1 min-h-[32px] px-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]';
  const neutralOpt = document.createElement('option');
  neutralOpt.value = 'neutral';
  neutralOpt.textContent = 'neutral (平靜)';
  emoSel.appendChild(neutralOpt);
  Object.entries(EMOTION_LABELS).forEach(([k, label]) => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = `${k} (${label})`;
    if (k === line.emotion) opt.selected = true;
    emoSel.appendChild(opt);
  });

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'min-h-[32px] px-2 rounded-lg bg-rose-950 text-rose-300 text-[11px]';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', () => row.remove());

  top.appendChild(spSel);
  top.appendChild(emoSel);
  top.appendChild(delBtn);

  const txt = document.createElement('textarea');
  txt.rows = 2;
  txt.className = 'cms-line-text w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs';
  txt.placeholder = '輸入角色對話台詞...';
  txt.value = line.text || '';

  row.appendChild(top);
  row.appendChild(txt);
  box.appendChild(row);
}

function addCmsChoiceRow(choice = { choice_code: '', label: '', next_node_code: '' }) {
  const box = document.getElementById('cmsChoicesList');
  if (!box) return;
  if (box.querySelectorAll('.cms-choice-row').length >= 4) {
    showToast('單一節點最多支援 4 個選項分支', 'info');
    return;
  }
  const row = document.createElement('div');
  row.className = 'cms-choice-row grid grid-cols-12 gap-1.5 items-center p-2 rounded-xl bg-slate-900 border border-slate-800';

  const lblInp = document.createElement('input');
  lblInp.type = 'text';
  lblInp.className = 'cms-choice-label col-span-6 min-h-[32px] px-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]';
  lblInp.placeholder = '選項顯示文字';
  lblInp.value = choice.label || '';

  const nextInp = document.createElement('input');
  nextInp.type = 'text';
  nextInp.className = 'cms-choice-next col-span-5 min-h-[32px] px-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]';
  nextInp.placeholder = '跳轉 node_code';
  nextInp.value = choice.next_node_code || '';

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'col-span-1 min-h-[32px] rounded-lg bg-rose-950 text-rose-300 text-[11px]';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', () => row.remove());

  row.appendChild(lblInp);
  row.appendChild(nextInp);
  row.appendChild(delBtn);
  box.appendChild(row);
}

function loadStoryNodeIntoEditor(nodeCode) {
  const node = storyNodesState.find(n => n.node_code === nodeCode);
  if (!node) return;
  cmsEditingNodeCode = node.node_code;
  document.getElementById('cmsEditorHeading').textContent = `編輯故事節點：${node.node_code}`;
  document.getElementById('cmsNodeCode').value = node.node_code;
  document.getElementById('cmsNodeTitle').value = node.title;
  document.getElementById('cmsChapter').value = String(node.chapter);
  document.getElementById('cmsSector').value = node.sector_id;
  document.getElementById('cmsEventType').value = node.event_type;
  document.getElementById('cmsSortOrder').value = String(node.sort_order || 10);
  document.getElementById('cmsSceneLocation').value = node.scene?.location_name || '';
  document.getElementById('cmsTimeOfDay').value = node.scene?.time_of_day || 'dusk';
  document.getElementById('cmsIsActive').checked = node.is_active !== false;

  const dBox = document.getElementById('cmsDialogueLines');
  dBox.innerHTML = '';
  (node.dialogues || []).forEach(l => addCmsDialogueRow(l));

  const cBox = document.getElementById('cmsChoicesList');
  cBox.innerHTML = '';
  (node.choices || []).forEach(c => addCmsChoiceRow(c));

  renderAdminStories();
}

function saveCmsStoryNode() {
  const code = document.getElementById('cmsNodeCode').value.trim();
  const title = document.getElementById('cmsNodeTitle').value.trim();
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(code)) {
    document.getElementById('cmsValidationBadge').textContent = 'node_code 格式錯誤';
    showToast('node_code 必須為小寫英文/數字/底線 (snake_case)', 'error');
    return;
  }
  if (!title) {
    showToast('請輸入節點標題', 'error');
    return;
  }

  const dialogues = [];
  document.querySelectorAll('#cmsDialogueLines .cms-dialogue-row').forEach((row, idx) => {
    const text = row.querySelector('.cms-line-text').value.trim();
    if (!text) return;
    dialogues.push({
      line_id: `L${idx + 1}`,
      speaker_id: row.querySelector('.cms-line-speaker').value,
      emotion: row.querySelector('.cms-line-emotion').value,
      text
    });
  });
  if (dialogues.length === 0) {
    showToast('至少需要 1 句對話台詞', 'error');
    return;
  }

  const choices = [];
  document.querySelectorAll('#cmsChoicesList .cms-choice-row').forEach((row, idx) => {
    const label = row.querySelector('.cms-choice-label').value.trim();
    const nextCode = row.querySelector('.cms-choice-next').value.trim();
    if (!label) return;
    choices.push({
      choice_code: `${code}_c${idx + 1}`,
      label,
      next_node_code: nextCode || null,
      affection_delta: null
    });
  });

  const updated = {
    node_code: code,
    story_code: 'source_town_v5',
    chapter: Number(document.getElementById('cmsChapter').value) || 1,
    sector_id: document.getElementById('cmsSector').value,
    event_type: document.getElementById('cmsEventType').value,
    title,
    sort_order: Number(document.getElementById('cmsSortOrder').value) || 10,
    is_active: document.getElementById('cmsIsActive').checked,
    scene: {
      scene_code: `${code}_scene`,
      location_name: document.getElementById('cmsSceneLocation').value.trim() || '源泉鎮',
      time_of_day: document.getElementById('cmsTimeOfDay').value
    },
    dialogues,
    choices
  };

  const existingIdx = storyNodesState.findIndex(n => n.node_code === code);
  if (existingIdx >= 0) {
    storyNodesState[existingIdx] = updated;
  } else {
    storyNodesState.push(updated);
  }
  cmsEditingNodeCode = code;
  document.getElementById('cmsValidationBadge').textContent = 'Schema Valid ✓';
  renderAdminStories();
  showToast(`已儲存故事節點「${title}」（可在模擬器立即試跑）`, 'success');
}

(function bindStoryAndCmsEvents() {
  const btnHub = document.getElementById('btnOpenStoryHub');
  if (btnHub) btnHub.addEventListener('click', () => playStoryNode(storyPlayerState.activeNodeCode));

  const dBox = document.getElementById('storyDialogueBox');
  if (dBox) dBox.addEventListener('click', () => {
    if (storyPlayerState.isTyping) renderStoryLine(true);
  });

  const btnPrev = document.getElementById('btnStoryPrevLine');
  if (btnPrev) btnPrev.addEventListener('click', () => {
    if (storyPlayerState.lineIndex > 0) {
      storyPlayerState.lineIndex--;
      renderStoryLine(false);
    }
  });

  const storyModalEl = document.getElementById('modalStoryPlayer');
  if (storyModalEl) {
    storyModalEl.addEventListener('keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      document.getElementById('btnStoryNextLine')?.click();
    });
  }

  const btnNext = document.getElementById('btnStoryNextLine');
  if (btnNext) btnNext.addEventListener('click', () => {
    if (storyPlayerState.isTyping) {
      renderStoryLine(true);
      return;
    }
    const node = storyNodesState.find(n => n.node_code === storyPlayerState.activeNodeCode);
    if (!node) return;
    if (storyPlayerState.lineIndex < node.dialogues.length - 1) {
      storyPlayerState.lineIndex++;
      renderStoryLine(false);
    } else {
      closeModal('modalStoryPlayer');
      showToast(`已完成劇情「${node.title}」`, 'success');
    }
  });

  const fCh = document.getElementById('cmsFilterChapter');
  const fSec = document.getElementById('cmsFilterSector');
  if (fCh) fCh.addEventListener('change', renderAdminStories);
  if (fSec) fSec.addEventListener('change', renderAdminStories);

  const btnAddLine = document.getElementById('btnCmsAddLine');
  if (btnAddLine) btnAddLine.addEventListener('click', () => addCmsDialogueRow());

  const btnAddChoice = document.getElementById('btnCmsAddChoice');
  if (btnAddChoice) btnAddChoice.addEventListener('click', () => addCmsChoiceRow());

  const btnNewNode = document.getElementById('btnCmsNewNode');
  if (btnNewNode) btnNewNode.addEventListener('click', () => {
    cmsEditingNodeCode = null;
    const newCode = `custom_story_${Date.now().toString().slice(-5)}`;
    document.getElementById('cmsEditorHeading').textContent = '新增故事節點';
    document.getElementById('cmsNodeCode').value = newCode;
    document.getElementById('cmsNodeTitle').value = '自訂源泉鎮支線事件';
    document.getElementById('cmsChapter').value = '2';
    document.getElementById('cmsSector').value = 'farm';
    document.getElementById('cmsEventType').value = 'care';
    document.getElementById('cmsSortOrder').value = '99';
    document.getElementById('cmsSceneLocation').value = '源泉鎮 · 自訂場景';
    document.getElementById('cmsTimeOfDay').value = 'afternoon';
    document.getElementById('cmsIsActive').checked = true;
    document.getElementById('cmsDialogueLines').innerHTML = '';
    addCmsDialogueRow({ speaker_id: 'farm', emotion: 'happy_wink', text: '' });
    document.getElementById('cmsChoicesList').innerHTML = '';
  });

  const btnSave = document.getElementById('btnCmsSaveNode');
  if (btnSave) btnSave.addEventListener('click', saveCmsStoryNode);

  const btnPreview = document.getElementById('btnCmsPreviewFlow');
  if (btnPreview) btnPreview.addEventListener('click', () => {
    const target = cmsEditingNodeCode || storyNodesState[0]?.node_code;
    if (target) playStoryNode(target);
  });

  const btnDel = document.getElementById('btnCmsDeleteNode');
  if (btnDel) btnDel.addEventListener('click', () => {
    if (!cmsEditingNodeCode) return;
    const target = storyNodesState.find(n => n.node_code === cmsEditingNodeCode);
    if (!target) return;
    target.is_active = !target.is_active;
    renderAdminStories();
    showToast(`已將「${target.title}」設為${target.is_active ? '啟用' : '停用'}`, 'info');
  });
})();

(function bindChatModalUxHelpers() {
  const inp = document.getElementById('chatInputField');
  const counter = document.getElementById('chatCharCounter');
  if (inp && counter) {
    inp.addEventListener('input', () => {
      counter.textContent = `${inp.value.length} / 4000`;
    });
  }
  const btnClear = document.getElementById('btnClearChatHistory');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      chatHistoryBySector[activeChatSector] = [];
      openCharacterChatModal(activeChatSector);
      showToast('已清空目前角色的短期對話紀錄', 'info');
    });
  }
})();
