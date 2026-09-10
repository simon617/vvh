# Download_ESG_Reports_CHI.ps1
# Script to download ESG (Environmental, Social and Governance) Reports (Chinese version) 
# from Vision Values Holdings Limited
# Based on the actual links from the Chinese environment.asp page
# Destination: C:\temp\zh

# Set error handling
$ErrorActionPreference = "Stop"

# Define the destination folder
$DestinationFolder = "C:\temp\zh"

# Create the destination folder if it doesn't exist
if (!(Test-Path -Path $DestinationFolder)) {
    New-Item -ItemType Directory -Path $DestinationFolder -Force | Out-Null
    Write-Host "Created folder: $DestinationFolder" -ForegroundColor Green
}

# Define the ESG report data - Using ACTUAL links from the Chinese environment.asp HTML page
$reportData = @(
    @{Date="2025年10月"; Name="2025年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2025.pdf"}
    @{Date="2024年10月"; Name="2024年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2024.pdf"}
    @{Date="2023年10月"; Name="2023年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2023.pdf"}
    @{Date="2022年12月"; Name="2022年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2022.pdf"}
    @{Date="2021年12月"; Name="2021年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2021.pdf"}
    @{Date="2020年12月"; Name="2020年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2020.pdf"}
    @{Date="2019年12月"; Name="2019年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/c_ESG Report 2019.pdf"}
    @{Date="2018年12月"; Name="2018年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/C-ESG Report 2018-v4.pdf"}
    @{Date="2017年11月"; Name="2017年度環境、社會及管治報告"; Url="https://www.visionvalues.com.hk/chi/pdf/environment/LTN20171127266_C.pdf"}
)

# Initialize counters
$total = $reportData.Count
$successCount = 0
$failCount = 0
$failedFiles = @()
$notFoundFiles = @()

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  開始下載 $total 份 ESG 報告 PDF 檔案..." -ForegroundColor Cyan
Write-Host "  目標資料夾: $DestinationFolder" -ForegroundColor Cyan
Write-Host "=====================================================`n" -ForegroundColor Cyan

# Download each file
$counter = 0
foreach ($report in $reportData) {
    $counter++
    $reportName = $report.Name
    $url = $report.Url
    
    # Extract filename from URL
    $filename = [System.IO.Path]::GetFileName($url)
    $filePath = Join-Path -Path $DestinationFolder -ChildPath $filename
    
    # Check if file already exists
    if (Test-Path -Path $filePath) {
        Write-Host "[$counter/$total] [略過] $reportName - 檔案已存在" -ForegroundColor Yellow
        $successCount++
        continue
    }
    
    Write-Host "[$counter/$total] [下載中] $reportName ..." -ForegroundColor White
    
    try {
        # Download the file
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $webClient.DownloadFile($url, $filePath)
        $webClient.Dispose()
        
        # Check if file was downloaded successfully
        if ((Get-Item $filePath).Length -gt 0) {
            $fileSize = [math]::Round((Get-Item $filePath).Length / 1KB, 1)
            Write-Host "  [成功] 已下載: $filename ($fileSize KB)" -ForegroundColor Green
            $successCount++
        } else {
            Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
            throw "檔案為空"
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "404") {
            Write-Host "  [404] 找不到檔案: $filename" -ForegroundColor Magenta
            $notFoundFiles += "$reportName - $url"
        } else {
            Write-Host "  [失敗] 下載失敗: $filename" -ForegroundColor Red
            Write-Host "    錯誤訊息: $errorMsg" -ForegroundColor Red
            $failCount++
            $failedFiles += "$reportName - $url"
        }
        
        # Remove any partial file
        if (Test-Path -Path $filePath) {
            Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Small delay to be respectful to the server
    Start-Sleep -Milliseconds 200
}

# Summary Report
Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  下載摘要 (ESG 報告 - 中文版)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "總檔案數: $total" -ForegroundColor White
Write-Host "成功下載: $successCount" -ForegroundColor Green
Write-Host "找不到 (404): $($notFoundFiles.Count)" -ForegroundColor Magenta
Write-Host "失敗 (其他錯誤): $failCount" -ForegroundColor Red
Write-Host "目標資料夾: $DestinationFolder" -ForegroundColor White
Write-Host "=====================================================`n" -ForegroundColor Cyan

if ($notFoundFiles.Count -gt 0) {
    Write-Host "找不到的檔案 (404):" -ForegroundColor Magenta
    foreach ($file in $notFoundFiles) {
        Write-Host "  - $file" -ForegroundColor Magenta
    }
}

if ($failedFiles.Count -gt 0) {
    Write-Host "`n下載失敗的檔案:" -ForegroundColor Red
    foreach ($failed in $failedFiles) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

# Open the folder in File Explorer
#if ($successCount -gt 0) {
#    Write-Host "`n正在開啟目標資料夾..." -ForegroundColor Yellow
#    Start-Process explorer.exe $DestinationFolder
#}