#!/usr/bin/env powershell
# Wall Aura Setup Script - Windows

param(
    [switch]$Install,
    [switch]$Dev,
    [switch]$Build,
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host "`n`n" -NoNewline
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $($Text.PadRight(46)) ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Text)
    Write-Host "▶ $Text" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

# Check Rust installation
function Check-Rust {
    Write-Step "Checking Rust installation..."
    $rustVersion = rustc --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Rust is installed: $rustVersion"
        return $true
    }
    else {
        Write-Error-Custom "Rust is not installed"
        Write-Host "Download Rust from: https://rustup.rs/" -ForegroundColor Yellow
        return $false
    }
}

# Check Node.js installation
function Check-Node {
    Write-Step "Checking Node.js installation..."
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js is installed: $nodeVersion"
        return $true
    }
    else {
        Write-Error-Custom "Node.js is not installed"
        Write-Host "Download Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    Check-Rust | Out-Null
    Check-Node | Out-Null
    
    Write-Step "Installing npm packages..."
    npm install
    
    Write-Step "Installing Tauri..."
    npm install -g @tauri-apps/cli
    
    Write-Success "Dependencies installed!"
}

# Development mode
function Start-Dev {
    Write-Header "Starting Development Mode"
    
    Write-Step "Launching Tauri development environment..."
    Write-Host "This will start the app with hot-reload enabled." -ForegroundColor Yellow
    Write-Host ""
    
    npm run tauri:dev
}

# Build production
function Build-Production {
    Write-Header "Building Production Release"
    
    Write-Step "Building React frontend..."
    npm run build
    
    Write-Step "Building Tauri application..."
    npm run tauri:build
    
    Write-Success "Build complete!"
    Write-Host ""
    Write-Host "Output location:" -ForegroundColor Yellow
    Write-Host "- Executable: ./src-tauri/target/release/wall-aura.exe" -ForegroundColor Cyan
    Write-Host "- Installers: ./src-tauri/target/release/bundle/" -ForegroundColor Cyan
}

# Clean build
function Clean-Build {
    Write-Header "Cleaning Build Artifacts"
    
    Write-Step "Cleaning Rust artifacts..."
    cargo clean
    
    Write-Step "Cleaning Node artifacts..."
    Remove-Item -Path "dist", "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Success "Clean complete!"
}

# Show help
function Show-Help {
    Write-Header "Wall Aura Setup"
    Write-Host @"
Usage: .\setup.ps1 [option]

Options:
  -Install    Install dependencies (npm packages, Rust, etc.)
  -Dev        Start development mode with hot-reload
  -Build      Build production executable
  -Clean      Clean all build artifacts

Examples:
  .\setup.ps1 -Install    # First time setup
  .\setup.ps1 -Dev        # Development
  .\setup.ps1 -Build      # Production build

Requirements:
  - Rust 1.70+        (https://rustup.rs/)
  - Node.js 18+       (https://nodejs.org/)
  - Windows 10+

First Time Setup:
  1. Install Rust and Node.js
  2. Run: .\setup.ps1 -Install
  3. Run: .\setup.ps1 -Dev
  4. Open browser to http://localhost:3000

"@
}

# Main
Write-Header "Wall Aura - Setup Script"

if ($Install) {
    Install-Dependencies
}
elseif ($Dev) {
    Start-Dev
}
elseif ($Build) {
    Build-Production
}
elseif ($Clean) {
    Clean-Build
}
else {
    Show-Help
}

Write-Host ""
