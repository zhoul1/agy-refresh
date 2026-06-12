param(
  [Parameter(Mandatory=$true)][string]$Executable,
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments
)

$exitCode = 1
$transcriptOutput = ""
$tempFile = [System.IO.Path]::GetTempFileName()
try {
  # Start-Transcript 可能因策略/权限失败，在此仅尝试
  $transcriptStarted = $false
  try {
    Start-Transcript -Path $tempFile -Force -ErrorAction Stop | Out-Null
    $transcriptStarted = $true
  } catch {
    # 转录失败仍继续执行命令
  }

  & $Executable $Arguments
  $exitCode = $LASTEXITCODE

  if ($transcriptStarted) {
    try { Stop-Transcript -ErrorAction Stop | Out-Null } catch {}
  }

  # 如果有转录内容则提取输出
  if ($transcriptStarted -and (Test-Path $tempFile)) {
    $raw = Get-Content $tempFile -Raw
    $lines = $raw -split '\r?\n'

    $asteriskLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match '^\*{5,}') {
        $asteriskLines += $i
      }
    }

    if ($asteriskLines.Count -ge 3) {
      $s = $asteriskLines[1] + 1
      $e = $asteriskLines[2] - 1
    } elseif ($asteriskLines.Count -eq 2) {
      $s = $asteriskLines[1] + 1
      $e = $lines.Count - 1
    } else {
      $s = 0; $e = -1
    }

    if ($s -le $e) {
      $transcriptOutput = $lines[$s..$e] -join [Environment]::NewLine
    }
  }
} catch {
  $host.UI.WriteErrorLine("capture-output.ps1 异常: $_")
} finally {
  if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
}

if ($transcriptOutput) {
  Write-Output $transcriptOutput
}
exit $exitCode
