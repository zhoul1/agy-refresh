param($ApiUrl = "http://localhost:6789")

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$iconData = @"
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+cGBwU0Mq4mPXIAAAINSURBVFjD
7Ze9ThRBFEbPnenZ3QEWAhGJhA0JkRZEjYQPYKKFnYHwABJfwsYXsPMRjOwMjbGxkUg0YaLBH2ID
kUV2d7rmWcyyO8zsLgux8SaV3Hvnq69vdTUVMcOBAwcO/NcQ3XcDIpKbmVNKJZGROgDgnDtw9HcF
UEqRc04BQEQAQBHBHZxz/6RCRJRSlFKq2+0qY4yq1+sAgE6no5RSqlarobVaLaWUUkop3Pf9g36I
CJRSBICqqqq01gQA8v19IiKllHLOCQCEECIiYowBADjnAEDS6/VijNFaKyEEWGtTVHMOABCRMUZr
rUNEtNZqMBgAACilVESMxhilNYYYsdaKiIAxBsw5JyJijJFSStJaQ0QYY0REMMZkjCGllJxzIiIE
gNZapdkUAJRSIiJgjImICM45Y4wQEQCA1hohIgCglJK0awCAUgqlFCGEpJSSUgIAYowAICKSMUZE
hLVWpZQSEREAQEopzjkiAgBQSomIiIhgjJGICMYYERGMMea9QkSEUgqEEBgjpZQYYwAA5xyklETE
GAMpJURMewEAoJRijEGMkYgot9YaY1JKKZfL4XK5nDjnAICUEiEEEQEAgHMOAJBSAgCklNJ1XQAA
Y4yICBFJKQUAiIi01pRzT0opVUoBAJRSjDEAQErJGGM45845B4BSCiICACCllL33MBHlnAMAxhhj
jKWUyDkHIsIYIyIYYwAAY4yM/4N/Bv4GpcCMhssV3+kAAAAASUVORK5CYII=
"@

Add-Type @"
using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
public class IconHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool DestroyIcon(IntPtr handle);
    public static Icon CreateIconFromBase64(string b64) {
        byte[] bytes = Convert.FromBase64String(b64);
        using (var ms = new MemoryStream(bytes)) {
            return new Icon(ms);
        }
    }
}
"@

$tray = New-Object System.Windows.Forms.NotifyIcon
try {
    $tray.Icon = [IconHelper]::CreateIconFromBase64($iconData)
} catch {
    $tray.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("powershell.exe")
}
$tray.Visible = $true
$tray.Text = "AGy Refresh — Loading..."

function BuildMenu {
    param($Status, $Quota)
    $m = New-Object System.Windows.Forms.ContextMenuStrip

    $h = $m.Items.Add("Open Dashboard / 打开面板")
    $h.Add_Click({ Start-Process $ApiUrl })

    $h = $m.Items.Add("Refresh Now / 刷新数据")
    $h.Add_Click({ RefreshAll })

    $h = $m.Items.Add("Collect Now / 立刻采集")
    $h.Add_Click({
        try { Invoke-WebRequest -Uri "$ApiUrl/api/monitor/collect-now" -Method POST -UseBasicParsing -TimeoutSec 15 | Out-Null }
        catch { }
    })

    $m.Items.Add("-")

    if ($Quota -and $Quota.credits) {
        $used = $Quota.credits.used
        $limit = $Quota.credits.limit
        $pct = if ($limit -gt 0) { [math]::Round($used / $limit * 100, 1) } else { 0 }
        $h = $m.Items.Add("Credits: $used / $limit ($pct%)")
        $h.Enabled = $false
    }
    if ($Quota -and $Quota.models -and $Quota.models.Count -gt 0) {
        $m.Items.Add("-")
        for ($i = 0; $i -lt [math]::Min($Quota.models.Count, 8); $i++) {
            $mod = $Quota.models[$i]
            $name = if ($mod.display -and $mod.display.Length -gt 0) { $mod.display } else { $mod.id }
            $pct = if ($mod.usedPct -ne $null) { "$($mod.usedPct)%" } else { "?" }
            $ico = if ($mod.exhausted) { "X" } else { "" }
            $label = "$name — $pct used$ico"
            $h = $m.Items.Add($label)
            $h.Enabled = $false
        }
        if ($Quota.models.Count -gt 8) {
            $h = $m.Items.Add("... +$($Quota.models.Count - 8) more / 更多")
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
        $parts += "Credits: $used / $limit"
    }
    if ($Quota -and $Quota.models -and $Quota.models.Count -gt 0) {
        $parts += "Models: $($Quota.models.Count)"
        $exhausted = @($Quota.models | Where-Object { $_.exhausted })
        if ($exhausted.Count -gt 0) { $parts += "Exhausted: $($exhausted.Count)" }
    }
    if ($Status) {
        $ds = if ($Status.daemon.running) { "ON" } else { "OFF" }
        $ms = if ($Status.monitor.running) { "ON" } else { "OFF" }
        $parts += "D:$ds M:$ms"
    }
    if ($parts.Count -eq 0) { return "AGy Refresh" }
    return "AGy Refresh`n$($parts -join ' | ')"
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

    $tray.Text = BuildTooltip $s $q
    $tray.ContextMenuStrip = BuildMenu $s $q
}

$lastOk = $false
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 20000
$timer.Add_Tick({
    try {
        RefreshAll
        $tray.Icon = [IconHelper]::CreateIconFromBase64($iconData)
        if (-not $lastOk) {
            $tray.ShowBalloonTip(3000, "AGy Refresh", "Connected / 已连接", [System.Windows.Forms.ToolTipIcon]::Info)
        }
        $lastOk = $true
    } catch {
        $tray.Text = "AGy Refresh — Offline"
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
