# Source Town V3.0 — AI Configuration Guide

## 1. 設定檔位置與優先順序
1. 環境變數 `SOURCE_TOWN_AI_CONFIG` 指定的絕對路徑（若明確設定但檔案不存在，系統將 **Fail Closed**，不會降級）。
2. `D:\xampp\.source_town_ai.php`（位於 `htdocs` 外部，無法透過 HTTP 直接讀取）。
3. `api/ai/config.local.php`（由 `api/ai/.htaccess` 禁止 HTTP 存取，僅作本機備援）。

## 2. 伺服器端設定範例 (`D:\xampp\.source_town_ai.php`)
```php
<?php
return [
    'enabled' => true,
    'provider' => 'openai_compatible', // 'openai' | 'openai_compatible' | 'mock'
    'api_key' => 'sk-請填入伺服器端金鑰',
    'base_url' => 'https://api.openai.com/v1',
    'model' => 'gpt-4o-mini',
    'daily_request_quota' => 200,
    'daily_token_quota' => 200000,
    'max_requests_per_minute' => 12,
];
```

## 3. 安全注意事項
- 嚴禁將 `api_key` 寫入 `app.js`、`index.html` 或提交至版本庫。
- 未啟用或未設定金鑰時，系統維持 Fail Closed（回傳 `AI_DISABLED` / `AI_NOT_CONFIGURED`），前端會自動切換為 `Offline Reply` 並保留既有遊戲功能。
