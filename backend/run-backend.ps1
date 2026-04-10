$venvPath = Join-Path $PSScriptRoot "..\.venv\Scripts\Activate.ps1"
if (-Not (Test-Path $venvPath)) {
    Write-Error "Virtual environment activation script not found: $venvPath"
    exit 1
}

Write-Host "Activating virtual environment: $venvPath"
& $venvPath

Write-Host "Running backend app.py"
python "$PSScriptRoot\app.py"
