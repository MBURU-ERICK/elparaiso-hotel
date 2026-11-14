[CmdletBinding()]
param(
    [string]$FrontendPath = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$BackendPath = "",
    [switch]$SkipFrontend
)
$ErrorActionPreference = "Stop"
$FrontendPath = (Resolve-Path -LiteralPath $FrontendPath).Path
if (-not $BackendPath) { $BackendPath = Join-Path (Split-Path $FrontendPath -Parent) "backend" }
$BackendPath = (Resolve-Path -LiteralPath $BackendPath).Path

function Invoke-Checked {
    param([string]$Program, [string[]]$Arguments)
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Release check failed: $Program $($Arguments -join ' ')" }
}

if (-not $SkipFrontend) {
    Push-Location $FrontendPath
    try {
        Get-Command npm.cmd -ErrorAction Stop | Out-Null
        Invoke-Checked -Program "npm.cmd" -Arguments @("run", "lint")
        Invoke-Checked -Program "npm.cmd" -Arguments @("test")
        Invoke-Checked -Program "npm.cmd" -Arguments @("run", "build")
        Invoke-Checked -Program "npm.cmd" -Arguments @("run", "check:seo")
    } finally { Pop-Location }
}
Push-Location $BackendPath
try {
    $Python = Join-Path $BackendPath "venv\Scripts\python.exe"
    if (-not (Test-Path -LiteralPath $Python)) { throw "Recreate the Windows venv from requirements.lock first." }
    if (-not (Test-Path -LiteralPath (Join-Path $BackendPath ".env"))) { throw "Create the private backend .env from the template first." }
    Invoke-Checked -Program $Python -Arguments @("-m", "pip", "check")
    Invoke-Checked -Program $Python -Arguments @("manage.py", "check", "--deploy", "--fail-level", "WARNING")
    Invoke-Checked -Program $Python -Arguments @("manage.py", "makemigrations", "--check", "--dry-run")
    Invoke-Checked -Program $Python -Arguments @("manage.py", "migrate", "--check")
} finally { Pop-Location }
Write-Output "Code/configuration checks passed. This did not install/start services, migrate data, send mail or deploy. Complete the live cutover checks in docs/WINDOWS-DEPLOYMENT.md."
