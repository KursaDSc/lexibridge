$ErrorActionPreference = "Stop"

$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "LexiBridge Sozluk.lnk"
$RepoDir = Resolve-Path "$PSScriptRoot\.."
$IconPath = Join-Path $RepoDir "app_icon.ico"

Write-Host ">>> Updating Desktop Shortcut Icon..." -ForegroundColor Cyan
Write-Host "    Shortcut: $ShortcutPath"
Write-Host "    Icon:     $IconPath"

if (-not (Test-Path $IconPath)) {
    throw "Icon file not found at: $IconPath"
}

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

if (-not (Test-Path $ShortcutPath)) {
    # If shortcut doesn't exist, create a new one pointing to index.html or local server
    $Shortcut.TargetPath = (Join-Path $RepoDir "index.html")
    $Shortcut.WorkingDirectory = $RepoDir
    $Shortcut.Description = "LexiBridge - AI Destekli Felemenkçe Türkçe Sözlük"
}

$Shortcut.IconLocation = "$IconPath,0"
$Shortcut.Save()

Write-Host "  [OK] Successfully updated desktop shortcut with new LexiBridge icon!" -ForegroundColor Green

# Refresh Windows icon cache so the new icon appears immediately
try {
    $code = @"
using System;
using System.Runtime.InteropServices;
public class ShellRefresh {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
    public static void Refresh() {
        SHChangeNotify(0x08000000, 0x0000, IntPtr.Zero, IntPtr.Zero);
    }
}
"@
    Add-Type -TypeDefinition $code
    [ShellRefresh]::Refresh()
    Write-Host "  [OK] Notified Windows Shell to refresh desktop icon cache." -ForegroundColor Green
} catch {
    Write-Host "  [NOTE] Shell refresh notification skipped: $_" -ForegroundColor Yellow
}
