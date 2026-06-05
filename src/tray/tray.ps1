param($ApiUrl = "http://localhost:6789")

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
public class IconGen {
    [DllImport("user32.dll")]
    public static extern bool DestroyIcon(IntPtr h);
    public static Icon MakeIcon(Color c, bool crossed) {
        var bmp = new Bitmap(16, 16);
        using (var g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.Clear(Color.Transparent);
            using (var brush = new SolidBrush(c)) {
                g.FillEllipse(brush, 0, 0, 16, 16);
            }
            using (var pen = new Pen(Color.White, 2f)) {
                g.DrawEllipse(pen, 1, 1, 14, 14);
            }
            using (var font = new Font("Segoe UI", 7f, FontStyle.Bold)) {
                g.DrawString("A", font, Brushes.White, 3, 2);
            }
            if (crossed) {
                using (var pen = new Pen(Color.White, 2f)) {
                    g.DrawLine(pen, 2, 2, 14, 14);
                    g.DrawLine(pen, 14, 2, 2, 14);
                }
            }
        }
        IntPtr hicon = bmp.GetHicon();
        Icon icon = Icon.FromHandle(hicon);
        bmp.Dispose();
        return icon;
    }
    public static void FreeIcon(Icon icon) {
        if (icon != null) { DestroyIcon(icon.Handle); icon.Dispose(); }
    }
}
"@

$tray = New-Object System.Windows.Forms.NotifyIcon
$tray.Visible = $true
$tray.Text = "AGy Refresh — Loading..."

$lastIcon = $null

function SetTrayIcon($color, $crossed) {
    try {
        if ($lastIcon) { [IconGen]::FreeIcon($lastIcon); $lastIcon = $null }
        $lastIcon = [IconGen]::MakeIcon($color, $crossed)
        $tray.Icon = $lastIcon
    } catch {
        try { $tray.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("powershell.exe") } catch {}
    }
}

SetTrayIcon ([System.Drawing.Color]::Gray) $false

function BuildMenu($Status, $Quota) {
    $m = New-Object System.Windows.Forms.ContextMenuStrip

    $h = $m.Items.Add("Open Dashboard / 打开面板")
    $h.Add_Click({ Start-Process $ApiUrl })

    $h = $m.Items.Add("Refresh Now / 刷新数据")
    $h.Add_Click({ RefreshAll })

    $h = $m.Items.Add("Collect Now / 立刻采集")
    $h.Add_Click({
        try { Invoke-WebRequest -Uri "$ApiUrl/api/monitor/collect-now" -Method POST -UseBasicParsing -TimeoutSec 15 | Out-Null } catch {}
    })

    $m.Items.Add("-")

    if ($Quota -and $Quota.credits) {
        $used = $Quota.credits.used
        $limit = $Quota.credits.limit
        $pct = if ($limit -gt 0) { [math]::Round($used / $limit * 100, 1) } else { 0 }
        $remain = if ($limit -gt 0) { $limit - $used } else { 0 }
        $h = $m.Items.Add("Credits: $used / $limit — $remain left")
        $h.Enabled = $false
    }

    if ($Quota -and $Quota.models -and $Quota.models.Count -gt 0) {
        $m.Items.Add("-")
        $exhaustedCount = 0
        for ($i = 0; $i -lt [math]::Min($Quota.models.Count, 10); $i++) {
            $mod = $Quota.models[$i]
            $name = if ($mod.display -and $mod.display.Length -gt 0) { $mod.display } else { $mod.id }
            $pct = if ($mod.usedPct -ne $null) { "$($mod.usedPct)%" } else { "?" }
            $sym = if ($mod.exhausted) { " X" } else { "" }
            if ($mod.exhausted) { $exhaustedCount++ }
            $h = $m.Items.Add("$name — $pct$sym")
            $h.Enabled = $false
        }
        if ($Quota.models.Count -gt 10) {
            $h = $m.Items.Add("... +$($Quota.models.Count - 10) more / 更多")
            $h.Enabled = $false
        }
    }

    $m.Items.Add("-")
    if ($Status) {
        $ds = if ($Status.daemon.running) { "ON" } else { "OFF" }
        $ms = if ($Status.monitor.running) { "ON" } else { "OFF" }
        $h = $m.Items.Add("Scheduler: $ds | Monitor: $ms")
        $h.Enabled = $false
        if ($Status.quota.email) {
            $h = $m.Items.Add("Account: $($Status.quota.email)")
            $h.Enabled = $false
        }
    }

    $m.Items.Add("-")
    $h = $m.Items.Add("Exit / 退出")
    $h.Add_Click({
        $tray.Visible = $false
        if ($lastIcon) { [IconGen]::FreeIcon($lastIcon) }
        [System.Windows.Forms.Application]::Exit()
        Stop-Process $pid
    })

    return $m
}

function BuildTooltip($Status, $Quota) {
    $parts = @()
    if ($Quota -and $Quota.credits -and $Quota.credits.limit -gt 0) {
        $used = $Quota.credits.used
        $limit = $Quota.credits.limit
        $pct = [math]::Round($used / $limit * 100, 1)
        $remain = $limit - $used
        $parts += "$pct% used ($remain left)"
    }
    if ($Quota -and $Quota.models -and $Quota.models.Count -gt 0) {
        $exhausted = @($Quota.models | Where-Object { $_.exhausted })
        $parts += "$($Quota.models.Count) models"
        if ($exhausted.Count -gt 0) { $parts += "$($exhausted.Count) exhausted" }
    }
    if ($Status) {
        $ds = if ($Status.daemon.running) { "ON" } else { "OFF" }
        $ms = if ($Status.monitor.running) { "ON" } else { "OFF" }
        $parts += "D:$ds M:$ms"
    }
    if ($parts.Count -eq 0) { return "AGy Refresh — No data" }
    return "AGy Refresh`n$($parts -join ' | ')"
}

function GetUsageColor($usedPct, $hasExhausted) {
    if ($hasExhausted) { return [System.Drawing.Color]::Red }
    if ($usedPct -gt 80) { return [System.Drawing.Color]::OrangeRed }
    if ($usedPct -gt 50) { return [System.Drawing.Color]::Orange }
    return [System.Drawing.Color]::ForestGreen
}

function RefreshAll {
    try {
        $sr = Invoke-WebRequest -Uri "$ApiUrl/api/status" -UseBasicParsing -TimeoutSec 10
        $s = $sr.Content | ConvertFrom-Json
    } catch { $s = $null }

    try {
        $qr = Invoke-WebRequest -Uri "$ApiUrl/api/quota/latest" -UseBasicParsing -TimeoutSec 10
        $q = $qr.Content | ConvertFrom-Json
        if ($q -and $q.error) { $q = $null }
    } catch { $q = $null }

    $hasExhausted = $false
    $usedPct = 0
    if ($q -and $q.credits -and $q.credits.limit -gt 0) {
        $usedPct = $q.credits.used / $q.credits.limit * 100
    }
    if ($q -and $q.models) {
        foreach ($m in $q.models) { if ($m.exhausted) { $hasExhausted = $true; break } }
    }

    if ($s) {
        $color = GetUsageColor $usedPct $hasExhausted
        SetTrayIcon $color $hasExhausted
    } else {
        SetTrayIcon ([System.Drawing.Color]::Gray) $false
    }

    $tray.Text = BuildTooltip $s $q
    $tray.ContextMenuStrip = BuildMenu $s $q
}

$lastOk = $false
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 20000
$timer.Add_Tick({
    try {
        RefreshAll
        if (-not $lastOk) {
            $tray.ShowBalloonTip(3000, "AGy Refresh", "Connected / 已连接", [System.Windows.Forms.ToolTipIcon]::Info)
        }
        $lastOk = $true
    } catch {
        $tray.Text = "AGy Refresh — Offline"
        SetTrayIcon ([System.Drawing.Color]::Gray) $false
        if ($lastOk) {
            $tray.ShowBalloonTip(3000, "AGy Refresh", "Connection lost / 连接断开", [System.Windows.Forms.ToolTipIcon]::Warning)
        }
        $lastOk = $false
    }
})
$timer.Start()

Start-Sleep -Seconds 3
RefreshAll

$tray.ShowBalloonTip(3000, "AGy Refresh", "Running in system tray / 正在系统托盘运行", [System.Windows.Forms.ToolTipIcon]::Info)

[System.Windows.Forms.Application]::Run()
