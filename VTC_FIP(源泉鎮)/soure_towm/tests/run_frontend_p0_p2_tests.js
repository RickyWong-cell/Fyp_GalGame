// 《源泉鎮 Source Town》前端核心邏輯、DOM 一致性與後端安全靜態回歸測試
// 執行方式：node tests/run_frontend_p0_p2_tests.js

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
const appCode = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const cssCode = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
const sqlCode = fs.readFileSync(path.join(rootDir, 'source_town_complete.sql'), 'utf8');

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`PASS: ${name}`);
}

// Extract pure helper functions from app.js
const stripMatch = appCode.match(/function stripCodeComments[\s\S]*?\n\}/);
const safeEvalMatch = appCode.match(/function safeEvalPythonMoistureCond[\s\S]*?\n\}/);
assert(stripMatch && safeEvalMatch, '無法從 app.js 擷取 stripCodeComments 或 safeEvalPythonMoistureCond');

const { stripCodeComments, safeEvalPythonMoistureCond } = new Function(
  `${stripMatch[0]}\n${safeEvalMatch[0]}\nreturn { stripCodeComments, safeEvalPythonMoistureCond };`
)();

// 1. P0-03 安全解析器測試
test('P0-03: 主執行緒不存在 new Function("moisture", ...)', () => {
  assert(!appCode.includes("new Function('moisture'"));
  assert.strictEqual((appCode.match(/new Function\(/g) || []).length, 1);
});

test('P0-03: safeEvalPythonMoistureCond 邊界與連鎖比較測試', () => {
  assert.strictEqual(safeEvalPythonMoistureCond('moisture < 40', 18), true);
  assert.strictEqual(safeEvalPythonMoistureCond('moisture < 40', 39), true);
  assert.strictEqual(safeEvalPythonMoistureCond('moisture < 40', 40), false);
  assert.strictEqual(safeEvalPythonMoistureCond('moisture < 40', 60), false);
  assert.strictEqual(safeEvalPythonMoistureCond('0 <= moisture < 40', 18), true);
  assert.strictEqual(safeEvalPythonMoistureCond('0 <= moisture < 40', 40), false);
});

test('P0-03: safeEvalPythonMoistureCond 拒絕 XSS / 程式碼注入', () => {
  for (const payload of ['alert(1) or moisture < 40', 'process.exit(1)', 'moisture < 40; alert(1)', 'globalThis.x = 1']) {
    assert.throws(() => safeEvalPythonMoistureCond(payload, 18));
  }
});

// 2. P0-04 ~ P0-06 四語言評測邏輯測試
test('P0-04: stripCodeComments 移除註解並保留字串常值', () => {
  const jsOut = stripCodeComments('const s = "// keep"; // >= 30\n/* nullptr */', 'market');
  assert(jsOut.includes('"// keep"') && !jsOut.includes('>= 30') && !jsOut.includes('nullptr'));
  const pyOut = stripCodeComments('s = "# keep"\n# for r in readings:', 'farm');
  assert(pyOut.includes('"# keep"') && !pyOut.includes('for r in readings'));
});

test('P0-05: C++ industrial_2 強制要求 int*& buf、delete[] buf; 與 buf = nullptr;', () => {
  const check = (c) => {
    const s = stripCodeComments(c, 'industrial');
    return /void\s+release_buffer\s*\(\s*int\s*\*\s*&\s*buf\s*\)/.test(s)
      && /delete\s*\[\s*\]\s*buf\s*;/.test(s)
      && /\bbuf\s*=\s*nullptr\s*;/.test(s);
  };
  assert.strictEqual(check('void release_buffer(int*& buf) {\n delete[] buf;\n buf = nullptr;\n}'), true);
  assert.strictEqual(check('void release_buffer(int* buf) {\n delete[] buf;\n buf = nullptr;\n}'), false);
  assert.strictEqual(check('void release_buffer(int*& buf) {\n delete[] buf;\n // buf = nullptr;\n}'), false);
});

test('P0-06: Java admin_2 強制要求 getOrDefault(key, 0)', () => {
  const check = (c) => {
    const s = stripCodeComments(c, 'admin');
    return /\bclass\s+ArchiveIndex\b/.test(s) && /\.getOrDefault\s*\(\s*key\s*,\s*0\s*\)/.test(s);
  };
  assert.strictEqual(check('public class ArchiveIndex { int f(HashMap<String,Integer> m, String k){ return m.getOrDefault(key, 0); } }'), true);
  assert.strictEqual(check('public class ArchiveIndex { int f(HashMap<String,Integer> m, String k){ return m.getOrDefault(key, null); } }'), false);
});

// 3. DOM ID 與設定/問題回報一致性測試
test('UI/DOM: 系統設定五分頁與問題回報關鍵 DOM ID 均存在於 index.html', () => {
  const requiredIds = [
    'modalSettings', 'settingsPanel_system', 'settingsPanel_text', 'settingsPanel_sound',
    'settingsPanel_shortcut', 'settingsPanel_support', 'btnSettingFullscreen', 'btnSettingSfx',
    'btnSettingTabSize', 'btnSettingAutoSave', 'btnSettingDialogueSpeed', 'rangeSettingMasterVol',
    'rangeSettingBgmVol', 'rangeSettingSfxVol', 'rangeSettingDlgOpacity', 'rangeSettingAutoWait',
    'btnOpenIssueReportFromSettings', 'modalIssueReport', 'btnOpenIssueReportWs',
    'btnSubmitIssueReport', 'tabAdminIssues', 'panelAdminIssues', 'adminIssuesList'
  ];
  for (const id of requiredIds) {
    assert(htmlCode.includes(`id="${id}"`), `index.html 缺少 id="${id}"`);
  }
});

test('P2-02: styles.css 包含無障礙 focus-visible 與 reduce-motion 規則', () => {
  assert(cssCode.includes(':focus-visible'));
  assert(cssCode.includes('.reduce-motion'));
});

// 4. SQL 與後端 API 安全規則靜態驗證
test('SQL: source_town_complete.sql 包含 issue_reports 與修正後的 industrial_2', () => {
  assert(sqlCode.includes('CREATE TABLE `issue_reports`'));
  assert(sqlCode.includes('void release_buffer(int*& buf)'));
});

test('Backend Security: 所有寫入型 PHP API 均具備 CSRF 與同源驗證', () => {
  for (const rel of ['api/sync.php', 'api/save_slots.php', 'api/admin_levels.php', 'api/issue_reports.php']) {
    const src = fs.readFileSync(path.join(rootDir, rel), 'utf8');
    assert(src.includes('requireAuthenticatedCsrf('), `${rel} 缺少 requireAuthenticatedCsrf`);
  }
  const sess = fs.readFileSync(path.join(rootDir, 'api/session.php'), 'utf8');
  assert(sess.includes('assertSameOriginRequest()') && sess.includes('verifyCsrfToken('));
  const prov = fs.readFileSync(path.join(rootDir, 'api/ai/src/Provider/OpenAiCompatibleProvider.php'), 'utf8');
  assert(prov.includes('json_fallback'));
});

console.log(`\nALL ${passed} FRONTEND & SECURITY REGRESSION TESTS PASSED.`);
