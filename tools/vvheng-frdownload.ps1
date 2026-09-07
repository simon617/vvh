# Download_PDF_Reports_ENG.ps1
# Script to download PDF financial reports (English version) from Vision Values Holdings Limited
# Based on the actual links from the English financial_report.asp page
# Destination: C:\temp\zh

# Set error handling
$ErrorActionPreference = "Stop"

# Define the destination folder
$DestinationFolder = "C:\temp\eng"

# Create the destination folder if it doesn't exist
if (!(Test-Path -Path $DestinationFolder)) {
    New-Item -ItemType Directory -Path $DestinationFolder -Force | Out-Null
    Write-Host "Created folder: $DestinationFolder" -ForegroundColor Green
}

# Define the report data - Using ACTUAL links from the English HTML page
$reportData = @(
    @{Date="October 2026"; Name="Annual Report 2026"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2026_eng.pdf"}
    @{Date="March 2026"; Name="Interim Report 2025/2026"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2025-26e.pdf"}
    @{Date="October 2025"; Name="Annual Report 2025"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2025_eng.pdf"}
    @{Date="March 2025"; Name="Interim Report 2024/2025"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2024-25e.pdf"}
    @{Date="October 2024"; Name="Annual Report 2024"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2024_eng.pdf"}
    @{Date="March 2024"; Name="Interim Report 2023/2024"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2023-24e.pdf"}
    @{Date="October 2023"; Name="Annual Report 2023"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2023_eng.pdf"}
    @{Date="March 2023"; Name="Interim Report 2022/2023"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2022-23e.pdf"}
    @{Date="October 2022"; Name="Annual Report 2022"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2022_eng.pdf"}
    @{Date="March 2022"; Name="Interim Report 2021/2022"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2021-22e.pdf"}
    @{Date="October 2021"; Name="Annual Report 2021"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2021_eng.pdf"}
    @{Date="March 2021"; Name="Interim Report 2020/2021"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2020-21e.pdf"}
    @{Date="October 2020"; Name="Annual Report 2020"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2020_eng.pdf"}
    @{Date="March 2020"; Name="Interim Report 2019/2020"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2019-20e.pdf"}
    @{Date="October 2019"; Name="Annual Report 2019"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2019_eng.pdf"}
    @{Date="March 2019"; Name="Interim Report 2018/2019"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2018-19e.pdf"}
    @{Date="October 2018"; Name="Annual Report 2018"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2018_eng.pdf"}
    @{Date="March 2018"; Name="Interim Report 2017/2018"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2017-18e.pdf"}
    @{Date="October 2017"; Name="Annual Report 2017"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2017_eng.pdf"}
    @{Date="March 2017"; Name="Interim Report 2016/2017"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2016-17e.pdf"}
    @{Date="October 2016"; Name="Annual Report 2016"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2016_eng.pdf"}
    @{Date="March 2016"; Name="Interim Report 2015/2016"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2015-16e.pdf"}
    @{Date="October 2015"; Name="Annual Report 2015"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2015_eng.pdf"}
    @{Date="March 2015"; Name="Interim Report 2014/2015"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2014-15e.pdf"}
    @{Date="October 2014"; Name="Annual Report 2014"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2014_eng.pdf"}
    @{Date="March 2014"; Name="Interim Report 2013/2014"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2013-14e.pdf"}
    @{Date="October 2013"; Name="Annual Report 2013"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2013_eng.pdf"}
    @{Date="March 2013"; Name="Interim Report 2012/2013"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2012-13e.pdf"}
    @{Date="October 2012"; Name="Annual Report 2012"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2012_eng.pdf"}
    @{Date="March 2012"; Name="Interim Report 2011/2012"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2011-12e.pdf"}
    @{Date="October 2011"; Name="Annual Report 2011"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2011_eng.pdf"}
    @{Date="March 2011"; Name="Interim Report 2010/2011"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2010-11e.pdf"}
    @{Date="October 2010"; Name="Annual Report 2010"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2010_E00862.pdf"}
    @{Date="March 2010"; Name="Interim Report 2009/2010"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/2009-10-E00862.pdf"}
    @{Date="October 2009"; Name="Annual Report 2009"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ar_2009_E00862.pdf"}
    @{Date="March 2009"; Name="Interim Report 2008/2009"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/2008-09-E00862.pdf"}
    @{Date="October 2008"; Name="Annual Report 2008"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/an2008e.pdf"}
    @{Date="March 2008"; Name="Interim Report 2007/2008"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/ir2007-08e.pdf"}
    @{Date="October 2007"; Name="Annual Report 2007"; Url="https://www.visionvalues.com.hk/eng/pdf/financial_report/an2007e.pdf"}
)

# Initialize counters
$total = $reportData.Count
$successCount = 0
$failCount = 0
$failedFiles = @()
$notFoundFiles = @()

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  Starting download of $total PDF files (English)..." -ForegroundColor Cyan
Write-Host "  Destination: $DestinationFolder" -ForegroundColor Cyan
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
        Write-Host "[$counter/$total] [SKIP] $reportName - File already exists" -ForegroundColor Yellow
        $successCount++
        continue
    }
    
    Write-Host "[$counter/$total] [DOWNLOAD] $reportName ..." -ForegroundColor White
    
    try {
        # Download the file
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $webClient.DownloadFile($url, $filePath)
        $webClient.Dispose()
        
        # Check if file was downloaded successfully
        if ((Get-Item $filePath).Length -gt 0) {
            $fileSize = [math]::Round((Get-Item $filePath).Length / 1KB, 1)
            Write-Host "  [OK] Downloaded: $filename ($fileSize KB)" -ForegroundColor Green
            $successCount++
        } else {
            Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
            throw "File is empty"
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "404") {
            Write-Host "  [404] File not found: $filename" -ForegroundColor Magenta
            $notFoundFiles += "$reportName - $url"
        } else {
            Write-Host "  [FAIL] Failed to download: $filename" -ForegroundColor Red
            Write-Host "    Error: $errorMsg" -ForegroundColor Red
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
Write-Host "  DOWNLOAD SUMMARY (English Reports)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Total files: $total" -ForegroundColor White
Write-Host "Successfully downloaded: $successCount" -ForegroundColor Green
Write-Host "Not Found (404): $($notFoundFiles.Count)" -ForegroundColor Magenta
Write-Host "Failed (other errors): $failCount" -ForegroundColor Red
Write-Host "Destination folder: $DestinationFolder" -ForegroundColor White
Write-Host "=====================================================`n" -ForegroundColor Cyan

if ($notFoundFiles.Count -gt 0) {
    Write-Host "Files not found (404):" -ForegroundColor Magenta
    foreach ($file in $notFoundFiles) {
        Write-Host "  - $file" -ForegroundColor Magenta
    }
}

if ($failedFiles.Count -gt 0) {
    Write-Host "`nFailed downloads:" -ForegroundColor Red
    foreach ($failed in $failedFiles) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

# Open the folder in File Explorer
if ($successCount -gt 0) {
    Write-Host "`nOpening destination folder in File Explorer..." -ForegroundColor Yellow
    Start-Process explorer.exe $DestinationFolder
}