param(
    [switch]$Yes,
    [switch]$Check
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Resolve-Bun {
    return Get-Command bun -ErrorAction SilentlyContinue
}

if (-not (Resolve-Bun)) {
    if ($Check) {
        Write-Output "status: not-ready"
        Write-Output "missing[1]: bun"
        Write-Output "help[1]: Run ``powershell -ExecutionPolicy Bypass -File .\setup.ps1``"
        exit 1
    }

    if (-not $Yes) {
        $reply = Read-Host "Bun is absent. Install the stable release for this user? [y/N]"
        if ($reply -notmatch '^(?i:y|yes)$') {
            Write-Output "status: cancelled"
            exit 1
        }
    }

    powershell -Command "irm bun.sh/install.ps1 | iex"
    $env:BUN_INSTALL = if ($env:BUN_INSTALL) { $env:BUN_INSTALL } else { Join-Path $HOME ".bun" }
    $env:Path = "$(Join-Path $env:BUN_INSTALL 'bin');$env:Path"
}

if (-not (Resolve-Bun)) {
    Write-Output "error: Bun was installed but is not on PATH"
    Write-Output "help[1]: Add ``%USERPROFILE%\.bun\bin`` to PATH, then rerun with ``-Check``"
    exit 1
}

Push-Location $ScriptDir
try {
    if (-not $Check) {
        bun install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } else {
        $required = @(
            (Join-Path $ScriptDir "node_modules/commander/package.json"),
            (Join-Path $ScriptDir "node_modules/.bin/tsc"),
            (Join-Path $ScriptDir "node_modules/.poteto-mode-tools-install-key")
        )
        if ($required.Where({ -not (Test-Path $_) }).Count -gt 0) {
            Write-Output "status: not-ready"
            Write-Output "error: locked dependencies are not installed"
            Write-Output "help[1]: Run ``.\setup.ps1``"
            exit 1
        }
        $expectedKey = bun --no-install -e 'import { createHash } from "node:crypto"; import { readFileSync } from "node:fs"; process.stdout.write(createHash("sha256").update(readFileSync("package.json")).update("\0").update(readFileSync("bun.lock")).digest("hex"))'
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        $actualKey = (Get-Content -Raw (Join-Path $ScriptDir "node_modules/.poteto-mode-tools-install-key")).Trim()
        if ($actualKey -ne $expectedKey) {
            Write-Output "status: not-ready"
            Write-Output "error: installed dependencies do not match package.json and bun.lock"
            Write-Output "help[1]: Run ``.\setup.ps1``"
            exit 1
        }
    }
    bun --no-install test orch watch-pr
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    bun --no-install run typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    if ($Check) {
        bun --no-install -e 'await import("./orch/store.ts"); await import("./watch-pr/cli.ts")'
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } else {
        bun --no-install orch/orch.ts --help | Out-Null
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        bun --no-install watch-pr/watch-pr --help | Out-Null
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
} finally {
    Pop-Location
}

Write-Output "status: ready"
Write-Output "runtime: bun $(bun --version)"
Write-Output "checks: tests=passed typecheck=passed modules=passed"
Write-Output "help[2]:"
Write-Output "  Run ``.\setup.ps1 -Check`` after upgrading Bun"
Write-Output "  Read ``..\references\runtime-setup.md`` for host integration"
