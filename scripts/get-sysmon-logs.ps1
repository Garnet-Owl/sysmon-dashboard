# Get the script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$publicDir = Join-Path $projectRoot "public"
$jsonPath = Join-Path $publicDir "sysmon-logs.json"

Write-Host "Script Directory: $scriptDir"
Write-Host "Project Root: $projectRoot"
Write-Host "Public Directory: $publicDir"
Write-Host "JSON Path: $jsonPath"

try {
    # Create public directory if it doesn't exist
    if (-not (Test-Path $publicDir)) {
        Write-Host "Creating public directory..."
        New-Item -ItemType Directory -Path $publicDir -Force
    }

    # Create sample data ARRAY
    $sampleData = @(
        @{
            timestamp = [System.DateTime]::UtcNow.ToString('o')
            eventId = 1
            processId = "1234"
            image = "C:\Windows\System32\notepad.exe"
            targetFilename = "C:\Users\Example\Documents\test.txt"
            destinationIp = "192.168.1.1"
            sourceIp = "192.168.1.100"
            destinationHostname = "example.com"
            queryName = "www.example.com"
        },
        @{
            timestamp = [System.DateTime]::UtcNow.AddMinutes(-30).ToString('o')
            eventId = 2
            processId = "5678"
            image = "C:\Program Files\Mozilla Firefox\firefox.exe"
            destinationIp = "192.168.1.2"
            sourceIp = "192.168.1.100"
            destinationHostname = "google.com"
            queryName = "www.google.com"
        },
        @{
            timestamp = [System.DateTime]::UtcNow.AddHours(-1).ToString('o')
            eventId = 3
            processId = "9012"
            image = "C:\Program Files\Microsoft Office\Office16\OUTLOOK.EXE"
            destinationIp = "192.168.1.3"
            sourceIp = "192.168.1.100"
            destinationHostname = "outlook.com"
            queryName = "outlook.office365.com"
        }
    )

    # Convert to JSON (no need for extra array wrapping since $sampleData is already an array)
    $jsonContent = $sampleData | ConvertTo-Json -Depth 10
    Write-Host "Generated JSON content:"
    Write-Host $jsonContent

    # Write to file
    Write-Host "Writing to file: $jsonPath"
    Set-Content -Path $jsonPath -Value $jsonContent -Force -NoNewline
    
    if (Test-Path $jsonPath) {
        Write-Host "File created successfully"
        Write-Host "File contents:"
        Get-Content $jsonPath
    } else {
        Write-Error "File was not created!"
    }

} catch {
    Write-Error "An error occurred:"
    Write-Error $_.Exception.Message
    Write-Error $_.ScriptStackTrace
    exit 1
}