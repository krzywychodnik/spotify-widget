param (
    [string]$Mode = "dev"
)

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$toolchainPath = "$PSScriptRoot\.toolchain\llvm-mingw-20261020-ucrt-x86_64\bin"
$env:PATH = "$toolchainPath;C:\Program Files\nodejs;$env:USERPROFILE\.cargo\bin;$env:PATH"

Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Starting Spotify Floating Mini-Player (Tauri v2)       " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

if ($Mode -eq "build") {
    npm.cmd run tauri build
} else {
    npm.cmd run tauri dev
}
