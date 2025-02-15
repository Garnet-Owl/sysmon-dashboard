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

    # Try to get Sysmon logs, fall back to sample data if unauthorized
    $logs = @()
    try {
        $logs = Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -MaxEvents 100 -ErrorAction Stop |
            Select-Object TimeCreated, Id, Message |
            ForEach-Object {
                $eventXML = [xml]$_.ToXml()
                @{
                    timestamp = $_.TimeCreated.ToUniversalTime().ToString('o')
                    eventId = $_.Id
                    processId = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'ProcessId' } | Select-Object -ExpandProperty '#text'
                    image = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'Image' } | Select-Object -ExpandProperty '#text'
                    targetFilename = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'TargetFilename' } | Select-Object -ExpandProperty '#text'
                    destinationIp = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'DestinationIp' } | Select-Object -ExpandProperty '#text'
                    sourceIp = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'SourceIp' } | Select-Object -ExpandProperty '#text'
                    destinationHostname = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'DestinationHostname' } | Select-Object -ExpandProperty '#text'
                    queryName = $eventXML.Event.EventData.Data | Where-Object { $_.Name -eq 'QueryName' } | Select-Object -ExpandProperty '#text'
                }
            }
        Write-Host "Successfully retrieved Sysmon logs"
    }
    catch {
        Write-Host "Could not access Sysmon logs, using sample data"
        # Create sample data if we can't access Sysmon logs
        $logs = @(
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
    }

    # Convert to JSON and save
    $jsonContent = $logs | ConvertTo-Json -Depth 10
    Write-Host "Writing logs to: $jsonPath"
    Set-Content -Path $jsonPath -Value $jsonContent -Force

    Write-Host "Operation completed successfully"
    
    if (Test-Path $jsonPath) {
        Write-Host "Verified: File exists at $jsonPath"
    } else {
        Write-Error "File was not created at $jsonPath"
    }

} catch {
    Write-Error "An error occurred:"
    Write-Error $_.Exception.Message
    Write-Error $_.ScriptStackTrace
    exit 1
}