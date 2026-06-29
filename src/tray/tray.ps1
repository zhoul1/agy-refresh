param($ApiUrl = "http://localhost:6789")

Add-Type -AssemblyName System.Windows.Forms | Out-Null
Add-Type -AssemblyName System.Drawing | Out-Null

Add-Type -ReferencedAssemblies "System.Drawing", "System.Windows.Forms" @"
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

    $null = $m.Items.Add("Open Dashboard / 打开面板")
    $h = $m.Items[0]
    $h.Add_Click({ Start-Process $ApiUrl })

    $null = $m.Items.Add("Refresh Now / 刷新数据")
    $h = $m.Items[1]
    $h.Add_Click({ RefreshAll })

    $null = $m.Items.Add("Collect Now / 立刻采集")
    $h = $m.Items[2]
    $h.Add_Click({
        try { Invoke-WebRequest -Uri "$ApiUrl/api/monitor/collect-now" -Method POST -UseBasicParsing -TimeoutSec 15 | Out-Null } catch {}
    })

    $null =     $m.Items.Add("-")

    if ($Quota -and $Quota.credits) {
        $used = $Quota.credits.used
        $limit = $Quota.credits.limit
        $remain = if ($limit -gt 0) { $limit - $used } else { 0 }
        $null = $m.Items.Add("Credits: $used / $limit — $remain left")
        $m.Items[-1].Enabled = $false
    }

    if ($Quota -and $Quota.models -and $Quota.models.Count -gt 0) {
        $null = $m.Items.Add("-")
        $poolMap = @{}
        foreach ($mod in $Quota.models) {
            $pool = "Other"
            $lower = (($mod.id + " " + ($mod.display)) -replace "MODEL_PLACEHOLDER_", "").ToLower()
            if ($lower -match "gemini") { $pool = "Gemini" }
            elseif ($lower -match "claude") { $pool = "Claude" }
            elseif ($lower -match "gpt|oss") { $pool = "GPT" }
            
            if (-not $poolMap.ContainsKey($pool)) { $poolMap[$pool] = @{} }
            $name = if ($mod.display -and $mod.display.Length -gt 0) { $mod.display } else { $mod.id }
            $pct = if ($mod.usedPct -ne $null) { "$([math]::Round($mod.usedPct * 100, 1))%" } else { "?" }
            $sym = if ($mod.exhausted) { " X" } else { "" }
            $poolMap[$pool]["$name"] = "$pct$sym"
        }
        
        foreach ($pair in $poolMap.GetEnumerator()) {
            $null = $m.Items.Add("$($pair.Key) Pool:")
            $m.Items[-1].Enabled = $false
            foreach ($modelName in $pair.Value.Keys) {
                $null = $m.Items.Add("  $modelName — $($pair.Value[$modelName])")
                $m.Items[-1].Enabled = $false
            }
        }
    }

    $null = $m.Items.Add("-")
    if ($Status) {
        $ds = if ($Status.daemon.running) { "ON" } else { "OFF" }
        $ms = if ($Status.monitor.running) { "ON" } else { "OFF" }
        $null = $m.Items.Add("Scheduler: $ds | Monitor: $ms")
        $m.Items[-1].Enabled = $false
        if ($Status.quota.email) {
            $null = $m.Items.Add("Account: $($Status.quota.email)")
            $m.Items[-1].Enabled = $false
        }
    }

    $null = $m.Items.Add("-")
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
    $parts = @("AGy Refresh")
    
    if ($Quota -and $Quota.credits) {
        $used = $Quota.credits.used
        $limit = $Quota.credits.limit
        $parts += "Credits: $used/$limit"
    }
    
    if ($Quota -and $Quota.models -and $Quota.models.Count -gt 0) {
        $poolMap = @{}
        $poolResetMap = @{}
        foreach ($mod in $Quota.models) {
            $pool = "Other"
            $lower = (($mod.id + " " + ($mod.display)) -replace "MODEL_PLACEHOLDER_", "").ToLower()
            if ($lower -match "gemini") { $pool = "Gemini" }
            elseif ($lower -match "claude") { $pool = "Claude" }
            elseif ($lower -match "gpt|oss") { $pool = "GPT" }
            
            if (-not $poolMap.ContainsKey($pool)) {
                $poolMap[$pool] = @{ used = 0; limit = 0; count = 0 }
                $poolResetMap[$pool] = $null
            }
            $poolMap[$pool].count++
            if ($mod.usedPct -ne $null -and $mod.remainingPct -ne $null) {
                $poolMap[$pool].used = [math]::Round($mod.usedPct * 100, 1)
                $poolMap[$pool].limit = [math]::Round(($mod.usedPct + $mod.remainingPct) * 100, 1)
            }
            if ($mod.resetTime -and ($poolResetMap[$pool] -eq $null -or $mod.resetTime -lt $poolResetMap[$pool])) {
                $poolResetMap[$pool] = $mod.resetTime
            }
        }
        
        foreach ($pair in $poolMap.GetEnumerator()) {
            $pct = if ($pair.Value.limit -gt 0) { [math]::Round($pair.Value.used / $pair.Value.limit * 100, 1) } else { "?" }
            $resetStr = ""
            if ($poolResetMap[$pair.Key]) {
                $resetTime = [DateTimeOffset]::Parse($poolResetMap[$pair.Key]).LocalDateTime
                $resetStr = " (重置: $($resetTime.ToString('MM/dd HH:mm')))"
            }
            $parts += "$($pair.Key): ${pct}%$resetStr"
        }
    }
    
    if ($parts.Count -eq 1) { $parts += "No data" }
    return ($parts -join "`n")
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
        $lastOk = $true
    } catch {
        $tray.Text = "AGy Refresh — Offline"
        SetTrayIcon ([System.Drawing.Color]::Gray) $false
        $lastOk = $false
    }
})
$timer.Start()

Start-Sleep -Seconds 3
RefreshAll

[System.Windows.Forms.Application]::Run()
