
# 测试 agy --print 重定向到文件
Remove-Item output.txt -ErrorAction SilentlyContinue
& agy --print "你好" > output.txt 2>&1
Write-Host "=== output.txt ==="
Get-Content output.txt -Raw
