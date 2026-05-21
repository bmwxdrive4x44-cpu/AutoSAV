param(
  [int]$Port = 3000,
  [switch]$NoStart
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[dev-clean] $Message"
}

function Stop-ProcessByPort {
  param([int[]]$Ports)

  foreach ($p in $Ports) {
    try {
      $connections = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
      if (-not $connections) {
        Write-Step "Port $p deja libre"
        continue
      }

      $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
      foreach ($pid in $pids) {
        try {
          Stop-Process -Id $pid -Force -ErrorAction Stop
          Write-Step "Process $pid arrete (port $p)"
        } catch {
          Write-Step "Impossible d'arreter process $pid (port $p): $($_.Exception.Message)"
        }
      }
    } catch {
      Write-Step "Verification port $p ignoree: $($_.Exception.Message)"
    }
  }
}

Write-Step "Arret des process Node"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Step "Liberation des ports 3000, 3001, 3002"
Stop-ProcessByPort -Ports @(3000, 3001, 3002)

$nextPath = Join-Path (Get-Location) ".next"
if (Test-Path $nextPath) {
  Write-Step "Suppression de .next"
  try {
    Remove-Item -LiteralPath $nextPath -Recurse -Force -ErrorAction Stop
  } catch {
    Write-Step "Suppression .next en force (2e tentative)"
    Start-Sleep -Milliseconds 300
    Remove-Item -LiteralPath $nextPath -Recurse -Force -ErrorAction SilentlyContinue
  }
} else {
  Write-Step ".next absent"
}

if ($NoStart) {
  Write-Step "Nettoyage termine (NoStart actif)"
  exit 0
}

Write-Step "Lancement du serveur dev sur http://localhost:$Port"
$env:NEXT_DISABLE_WEBPACK_CACHE = "1"
$env:PORT = "$Port"

& npm.cmd run dev
