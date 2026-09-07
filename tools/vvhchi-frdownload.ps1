# Download_PDF_Reports.ps1
# Script to download PDF financial reports from Vision Values Holdings Limited
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

# Define the CSV data using arrays instead of CSV with Chinese headers
$reportData = @(
    @{Date="2026年10月"; Name="2026年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2026_chi.pdf"}
    @{Date="2026年3月"; Name="2025/2026中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2025-26c.pdf"}
    @{Date="2025年10月"; Name="2025年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2025_chi.pdf"}
    @{Date="2025年3月"; Name="2024/2025中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2024-25c.pdf"}
    @{Date="2024年10月"; Name="2024年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2024_chi.pdf"}
    @{Date="2024年3月"; Name="2023/2024中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2023-24c.pdf"}
    @{Date="2023年10月"; Name="2023年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2023_chi.pdf"}
    @{Date="2023年3月"; Name="2022/2023中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2022-23c.pdf"}
    @{Date="2022年10月"; Name="2022年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2022_chi.pdf"}
    @{Date="2022年3月"; Name="2021/2022中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2021-22c.pdf"}
    @{Date="2021年10月"; Name="2021年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2021_chi.pdf"}
    @{Date="2021年3月"; Name="2020/2021中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2020-21c.pdf"}
    @{Date="2020年10月"; Name="2020年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2020_chi.pdf"}
    @{Date="2020年3月"; Name="2019/2020中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2019-20c.pdf"}
    @{Date="2019年10月"; Name="2019年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2019_chi.pdf"}
    @{Date="2019年3月"; Name="2018/2019中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2018-19c.pdf"}
    @{Date="2018年10月"; Name="2018年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2018_chi.pdf"}
    @{Date="2018年3月"; Name="2017/2018中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2017-18c.pdf"}
    @{Date="2017年10月"; Name="2017年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2017_chi.pdf"}
    @{Date="2017年3月"; Name="2016/2017中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2016-17c.pdf"}
    @{Date="2016年10月"; Name="2016年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2016_chi.pdf"}
    @{Date="2016年3月"; Name="2015/2016中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2015-16c.pdf"}
    @{Date="2015年10月"; Name="2015年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2015_chi.pdf"}
    @{Date="2015年3月"; Name="2014/2015中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2014-15c.pdf"}
    @{Date="2014年10月"; Name="2014年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2014_chi.pdf"}
    @{Date="2014年3月"; Name="2013/2014中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2013-14c.pdf"}
    @{Date="2013年10月"; Name="2013年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2013_chi.pdf"}
    @{Date="2013年3月"; Name="2012/2013中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2012-13c.pdf"}
    @{Date="2012年10月"; Name="2012年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2012_chi.pdf"}
    @{Date="2012年3月"; Name="2011/2012中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2011-12c.pdf"}
    @{Date="2011年10月"; Name="2011年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar_2011_chi.pdf"}
    @{Date="2011年3月"; Name="2010/2011中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2010-11c.pdf"}
    @{Date="2010年10月"; Name="2010年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar2010_C00862.pdf"}
    @{Date="2010年3月"; Name="2009/2010中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/2009-10-C00862.pdf"}
    @{Date="2009年10月"; Name="2009年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ar2009_C00862.pdf"}
    @{Date="2009年3月"; Name="2008/2009中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/2008-09-C00862.pdf"}
    @{Date="2008年10月"; Name="2008年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/an2008c.pdf"}
    @{Date="2008年3月"; Name="2007/2008中期報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/ir2007-08c.pdf"}
    @{Date="2007年10月"; Name="2007年度全年報告"; Url="https://www.visionvalues.com.hk/chi/pdf/financial_report/an2007c.pdf"}
)

# Initialize counters
$total = $reportData.Count
$successCount = 0
$failCount = 0
$failedFiles = @()

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  Starting download of $total PDF files..." -ForegroundColor Cyan
Write-Host "  Destination: $DestinationFolder" -ForegroundColor Cyan
Write-Host "=====================================================`n" -ForegroundColor Cyan

# Download each file
foreach ($report in $reportData) {
    $reportName = $report.Name
    $url = $report.Url
    
    # Extract filename from URL
    $filename = [System.IO.Path]::GetFileName($url)
    $filePath = Join-Path -Path $DestinationFolder -ChildPath $filename
    
    # Check if file already exists
    if (Test-Path -Path $filePath) {
        Write-Host "[SKIP] $reportName - File already exists: $filename" -ForegroundColor Yellow
        $successCount++
        continue
    }
    
    Write-Host "[DOWNLOAD] $reportName ..." -ForegroundColor White
    
    try {
        # Download the file with progress display
        $webClient = New-Object System.Net.WebClient
        
        # Add a user agent to avoid being blocked
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        # Download the file
        $webClient.DownloadFile($url, $filePath)
        $webClient.Dispose()
        
        # Check if file was downloaded successfully (has content)
        if ((Get-Item $filePath).Length -gt 0) {
            Write-Host "  [OK] Downloaded: $filename" -ForegroundColor Green
            $successCount++
        } else {
            # Remove empty file
            Remove-Item -Path $filePath -Force
            throw "File is empty"
        }
    }
    catch {
        Write-Host "  [FAIL] Failed to download: $filename" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
        $failedFiles += "$reportName - $url"
        
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
Write-Host "  DOWNLOAD SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Total files: $total" -ForegroundColor White
Write-Host "Successfully downloaded: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Destination folder: $DestinationFolder" -ForegroundColor White
Write-Host "=====================================================`n" -ForegroundColor Cyan

if ($failedFiles.Count -gt 0) {
    Write-Host "Failed downloads:" -ForegroundColor Red
    foreach ($failed in $failedFiles) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

# Open the folder in File Explorer
if ($successCount -gt 0) {
    Write-Host "`nOpening destination folder in File Explorer..." -ForegroundColor Yellow
    Start-Process explorer.exe $DestinationFolder
}