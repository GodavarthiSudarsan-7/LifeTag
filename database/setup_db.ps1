# ==========================================================
# LifeTag - Database Initializer for lifetag_db
# ==========================================================
param(
    [string]$Password = $env:MYSQL_PWD
)

if (-not $Password) {
    $Password = "Sudu@61069"
}

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$env:MYSQL_PWD = $Password

Write-Host "Initializing lifetag_db in MySQL 8.0..." -ForegroundColor Cyan

$files = @(
    "database\01_schema.sql",
    "database\02_views.sql",
    "database\03_triggers.sql",
    "database\04_procedures.sql",
    "database\05_functions.sql",
    "database\06_sample_data.sql"
)

foreach ($f in $files) {
    Write-Host "-> Executing $f..." -ForegroundColor Yellow
    Get-Content $f -Raw | & $mysql -u root --default-character-set=utf8mb4
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR running $f" -ForegroundColor Red
        exit 1
    }
}

Write-Host "-> Running verification queries..." -ForegroundColor Green
& $mysql -u root -D lifetag_db -e "
SHOW TABLES;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_profiles FROM user_profiles;
SELECT COUNT(*) AS total_tags FROM qr_tags;
SELECT COUNT(*) AS total_contacts FROM emergency_contacts;
"

Write-Host "lifetag_db initialized successfully!" -ForegroundColor Green
$env:MYSQL_PWD = $null
