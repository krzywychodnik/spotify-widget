@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0.toolchain\llvm-mingw-20261020-ucrt-x86_64\bin;C:\Program Files\nodejs;%USERPROFILE%\.cargo\bin;%PATH%"

echo ========================================================
echo   Starting Spotify Floating Mini-Player (Tauri v2)
echo ========================================================

if "%1"=="build" (
  call npm.cmd run tauri build
) else (
  call npm.cmd run tauri dev
)
