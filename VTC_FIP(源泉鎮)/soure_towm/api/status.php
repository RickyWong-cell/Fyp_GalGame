<?php
// 《源泉鎮 Source Town》V2.6 XAMPP 環境與 MySQL 資料庫健康檢測 API
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$phpOk = true;
$pdoMysqlLoaded = extension_loaded('pdo_mysql');
$mysqlConnOk = false;
$schemaReady = false;
$diagnostic = null;

if ($pdoMysqlLoaded) {
    try {
        $pdo = getDbConnection();
        $res = $pdo->query('SELECT 1')->fetchColumn();
        $mysqlConnOk = ((int)$res === 1);
        if ($mysqlConnOk) {
            $tbl = $pdo->query("SHOW TABLES LIKE 'levels'")->fetchColumn();
            $schemaReady = ($tbl !== false);
            if (!$schemaReady) {
                $diagnostic = '已連線至 MySQL，但尚未匯入 source_town_xampp_mysql.sql 資料表';
            }
        }
    } catch (Throwable $e) {
        $mysqlConnOk = false;
        $diagnostic = '無法連線至 127.0.0.1 MySQL (source_town)，請確認 XAMPP MySQL 已啟動且已建立資料庫';
    }
} else {
    $diagnostic = 'PHP pdo_mysql 擴充套件未啟用';
}

$sqliteExtLoaded = extension_loaded('sqlite3') && class_exists('SQLite3');
$overallStatus = ($phpOk && $mysqlConnOk && $schemaReady) ? 'ok' : 'degraded';

$data = [
    'status' => $overallStatus,
    'project' => 'Source Town V2.6',
    'api_ok' => true,
    'php_ok' => $phpOk,
    'mysql_extension_loaded' => $pdoMysqlLoaded,
    'mysql_connection_ok' => $mysqlConnOk,
    'mysql_schema_ready' => $schemaReady,
    'sqlite3_extension_loaded' => $sqliteExtLoaded,
    'storage_mode' => ($mysqlConnOk && $schemaReady) ? 'mysql_database' : 'client_localstorage_fallback',
    'server_time' => date('c'),
    'timestamp' => time(),
];

if ($diagnostic !== null) {
    $data['diagnostic'] = $diagnostic;
}

sendJson($data, 200);
