param(
  [string]$SourceRef = "jfolnaefnevkkpscpyxm",
  [string]$DestRef = "lfwgcagpwqkccywxhrzz",
  [string]$SourceRegion = "eu-west-1",
  [string]$DestRegion = "eu-central-1",
  [string]$DumpPath = ".\\autosav_only.dump"
)

$ErrorActionPreference = "Stop"

function Get-PgToolPath {
  param([string]$ToolName)

  $cmd = Get-Command $ToolName -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  $fallback = "C:\\Program Files\\PostgreSQL\\17\\bin\\$ToolName.exe"
  if (Test-Path $fallback) {
    return $fallback
  }

  throw "Impossible de trouver $ToolName. Installe PostgreSQL client tools ou ajoute-les au PATH."
}

$pgDump = Get-PgToolPath -ToolName "pg_dump"
$pgRestore = Get-PgToolPath -ToolName "pg_restore"

Write-Host "pg_dump: $pgDump"
Write-Host "pg_restore: $pgRestore"

$sourceHost = "aws-1-$SourceRegion.pooler.supabase.com"
$destHost = "aws-1-$DestRegion.pooler.supabase.com"
$sourceUser = "postgres.$SourceRef"
$destUser = "postgres.$DestRef"

$tables = @(
  'public."User"',
  'public."Category"',
  'public."ProductRequest"',
  'public."Offer"',
  'public."Shipment"',
  'public."Transaction"',
  'public."TransactionMessage"',
  'public."Dispute"',
  'public."NotificationLog"'
)

if (Test-Path $DumpPath) {
  Remove-Item -Force $DumpPath
}

$sourcePassword = Read-Host "Mot de passe SOURCE (swiftcolis)"
$env:PGPASSWORD = $sourcePassword
$env:PGSSLMODE = "require"

$dumpArgs = @(
  "--format=custom",
  "--no-owner",
  "--no-privileges",
  "--no-password",
  "--host", $sourceHost,
  "--port", "6543",
  "--username", $sourceUser,
  "--dbname", "postgres",
  "--file", $DumpPath
)

foreach ($table in $tables) {
  $dumpArgs += "--table=$table"
}

Write-Host "Export des tables AutoSAV depuis la source..."
& $pgDump @dumpArgs
if ($LASTEXITCODE -ne 0) {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue
  throw "Echec de pg_dump (code $LASTEXITCODE)."
}

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue

if (-not (Test-Path $DumpPath)) {
  throw "Le dump n'a pas ete cree: $DumpPath"
}

$dumpFile = Get-Item $DumpPath
if ($dumpFile.Length -le 0) {
  throw "Le dump est vide (0 octet): $DumpPath"
}

Write-Host "Dump cree: $($dumpFile.FullName)"
Write-Host "Taille: $($dumpFile.Length) octets"

$destPassword = Read-Host "Mot de passe DESTINATION (autosav)"
$env:PGPASSWORD = $destPassword
$env:PGSSLMODE = "require"

$restoreArgs = @(
  "--clean",
  "--if-exists",
  "--no-owner",
  "--no-privileges",
  "--no-password",
  "--host", $destHost,
  "--port", "6543",
  "--username", $destUser,
  "--dbname", "postgres",
  $DumpPath
)

Write-Host "Import dans la destination..."
& $pgRestore @restoreArgs
if ($LASTEXITCODE -ne 0) {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue
  throw "Echec de pg_restore (code $LASTEXITCODE)."
}

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue

Write-Host "Transfert termine avec succes."
Write-Host "Prochaine etape: executer scripts/autosav-verify-counts.sql sur SOURCE puis DEST et comparer les resultats."
