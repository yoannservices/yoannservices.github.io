$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$envFile = Join-Path $projectRoot ".env"
$backendProcess = $null
$frontendProcess = $null

function Stop-NexusProcess($process) {
    if ($null -ne $process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
}

function Test-PortAvailable([int]$port) {
    $listener = $null
    try {
        $listener = [System.Net.Sockets.TcpListener]::new(
            [System.Net.IPAddress]::Loopback,
            $port
        )
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        if ($null -ne $listener) {
            $listener.Stop()
        }
    }
}

try {
    $python = Get-Command python -ErrorAction SilentlyContinue
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($null -eq $python) {
        throw "Python est introuvable. Installe Python, puis relance NEXUS."
    }
    if ($null -eq $node) {
        throw "Node.js est introuvable. Installe Node.js, puis relance NEXUS."
    }
    if (-not (Test-Path $envFile)) {
        throw "Le fichier .env est manquant. Copie .env.example en .env et ajoute ta clé ANTHROPIC_API_KEY."
    }

    foreach ($line in Get-Content -LiteralPath $envFile) {
        $trimmedLine = $line.Trim()
        if (-not $trimmedLine -or $trimmedLine.StartsWith("#")) {
            continue
        }
        if ($trimmedLine -notmatch '^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
            continue
        }

        $name = $Matches[1]
        $value = $Matches[2].Trim()
        if ($value.Length -ge 2 -and
            (($value.StartsWith('"') -and $value.EndsWith('"')) -or
             ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }

    if ([string]::IsNullOrWhiteSpace($env:ANTHROPIC_API_KEY)) {
        throw "ANTHROPIC_API_KEY est vide dans .env. Ajoute ta clé Anthropic pour utiliser le chat."
    }

    $backendPort = 8000
    $frontendPort = 5173
    if ($env:BACKEND_PORT) {
        $backendPort = [int]$env:BACKEND_PORT
    }
    if ($env:FRONTEND_PORT) {
        $frontendPort = [int]$env:FRONTEND_PORT
    }
    if ($backendPort -lt 1 -or $backendPort -gt 65535 -or
        $frontendPort -lt 1 -or $frontendPort -gt 65535) {
        throw "Les ports BACKEND_PORT et FRONTEND_PORT doivent être compris entre 1 et 65535."
    }
    if (-not (Test-PortAvailable $backendPort)) {
        throw "Le port du backend ($backendPort) est déjà utilisé. Arrête l'autre serveur et réessaie."
    }
    if (-not (Test-PortAvailable $frontendPort)) {
        throw "Le port du frontend ($frontendPort) est déjà utilisé. Arrête l'autre serveur et réessaie."
    }

    $venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
    if (-not (Test-Path $venvPython)) {
        Write-Host "Installation de Python pour NEXUS (premier lancement)..."
        & $python.Source -m venv (Join-Path $backendDir ".venv")
        if ($LASTEXITCODE -ne 0) {
            throw "Impossible de préparer Python. Vérifie que Python est installé correctement."
        }
    }

    Write-Host "Vérification des dépendances Python..."
    & $venvPython -m pip install -q -r (Join-Path $backendDir "requirements.txt")
    if ($LASTEXITCODE -ne 0) {
        throw "Installation des dépendances Python échouée. Vérifie ta connexion Internet."
    }

    $packageMarker = Join-Path $frontendDir "node_modules\.package-lock.json"
    $packageJson = Join-Path $frontendDir "package.json"
    $packageLock = Join-Path $frontendDir "package-lock.json"
    if (-not (Test-Path $packageMarker) -or
        (Get-Item $packageJson).LastWriteTime -gt (Get-Item $packageMarker).LastWriteTime -or
        (Get-Item $packageLock).LastWriteTime -gt (Get-Item $packageMarker).LastWriteTime) {
        Write-Host "Installation des dépendances du site (premier lancement)..."
        Push-Location $frontendDir
        try {
            & npm.cmd ci --silent
            if ($LASTEXITCODE -ne 0) {
                throw "Installation du site échouée. Vérifie que Node.js est installé et ta connexion Internet."
            }
        }
        finally {
            Pop-Location
        }
    }

    $env:BACKEND_PORT = "$backendPort"
    $env:FRONTEND_PORT = "$frontendPort"

    Write-Host "Démarrage de NEXUS..."
    $backendProcess = Start-Process -FilePath $venvPython `
        -ArgumentList @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "$backendPort") `
        -WorkingDirectory $backendDir -PassThru -NoNewWindow

    $viteEntrypoint = Join-Path $frontendDir "node_modules\vite\bin\vite.js"
    $frontendProcess = Start-Process -FilePath $node.Source `
        -ArgumentList @("`"$viteEntrypoint`"", "--host", "127.0.0.1", "--port", "$frontendPort", "--strictPort") `
        -WorkingDirectory $frontendDir -PassThru -NoNewWindow

    $siteUrl = "http://localhost:$frontendPort"
    $healthUrl = "http://127.0.0.1:$backendPort/health"
    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 2
            $healthResponse = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200 -and $healthResponse.StatusCode -eq 200) {
                $ready = $true
                break
            }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }
    if (-not $ready) {
        throw "Le site n'a pas démarré à temps. Ferme cette fenêtre et réessaie."
    }

    Write-Host "NEXUS est ouvert dans ton navigateur : $siteUrl"
    Start-Process $siteUrl
    Write-Host "Garde cette fenêtre ouverte. Appuie sur Ctrl+C pour arrêter NEXUS."
    while (-not (Test-PortAvailable $backendPort) -and
           -not (Test-PortAvailable $frontendPort)) {
        Start-Sleep -Seconds 1
    }
    if ((Test-PortAvailable $backendPort) -or
        (Test-PortAvailable $frontendPort)) {
        throw "Un serveur s'est arrêté. Ferme cette fenêtre et relance NEXUS."
    }
}
catch {
    Write-Host ""
    Write-Host "NEXUS n'a pas pu démarrer : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Stop-NexusProcess $frontendProcess
    Stop-NexusProcess $backendProcess
}
