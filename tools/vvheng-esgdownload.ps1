# Download_ESG_Reports_ENG.ps1
# Script to download ESG (Environmental, Social and Governance) Reports from Vision Values Holdings Limited
# Based on the actual links from the environment.asp page
# Destination: C:\temp\eng

# Set error handling
$ErrorActionPreference = "Stop"

# Define the destination folder
$DestinationFolder = "C:\temp\eng"

# Create the destination folder if it doesn't exist
if (!(Test-Path -Path $DestinationFolder)) {
    New-Item -ItemType Directory -Path $DestinationFolder -Force | Out-Null
    Write-Host "Created folder: $DestinationFolder" -ForegroundColor Green
}

# Define the ESG report data - Using ACTUAL links from the environment.asp HTML page
$reportData = @(
    @{Date="October 2025"; Name="ESG Report 2025"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2025.pdf"}
    @{Date="October 2024"; Name="ESG Report 2024"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2024.pdf"}
    @{Date="October 2023"; Name="ESG Report 2023"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2023.pdf"}
    @{Date="December 2022"; Name="ESG Report 2022"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2022.pdf"}
    @{Date="December 2021"; Name="ESG Report 2021"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2021.pdf"}
    @{Date="December 2020"; Name="ESG Report 2020"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2020.pdf"}
    @{Date="December 2019"; Name="ESG Report 2019"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/e_ESG Report 2019.pdf"}
    @{Date="December 2018"; Name="ESG Report 2018"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/E-ESG Report 2018-v4.pdf"}
    @{Date="November 2017"; Name="ESG Report 2017"; Url="https://www.visionvalues.com.hk/eng/pdf/environment/LTN20171127265.pdf"}
)

# Initialize counters
$total = $reportData.Count
$successCount = 0
$failCount = 0
$failedFiles = @()
$notFoundFiles = @()

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  Starting download of $total ESG Report PDF files..." -ForegroundColor Cyan
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
Write-Host "  DOWNLOAD SUMMARY (ESG Reports)" -ForegroundColor Cyan
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
#if ($successCount -gt 0) {
#    Write-Host "`nOpening destination folder in File Explorer..." -ForegroundColor Yellow
#    Start-Process explorer.exe $DestinationFolder
#}