# get-sysmon-logs.ps1
$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$publicDir = Join-Path $projectRoot "public"
$jsonPath = Join-Path $publicDir "sysmon-logs.json"

Write-Host "[PS] Starting Sysmon log collection using configured rules..."
Write-Host "[PS] Output Path: $jsonPath"

try {
    if (-not (Test-Path $publicDir)) {
        Write-Host "[PS] Creating public directory..."
        New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
    }

    Write-Host "[PS] Attempting to get Sysmon logs..."
    
    try {
        $events = Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -MaxEvents 1000 -ErrorAction Stop
        Write-Host "[PS] Retrieved $(($events | Measure-Object).Count) Sysmon events"
        
        $logs = $events | ForEach-Object {
            $eventXML = [xml]$_.ToXml()
            $eventData = $eventXML.Event.EventData.Data
            
            # Base event data
            $entry = @{
                timestamp = $_.TimeCreated.ToUniversalTime().ToString('o')
                eventId = $_.Id
                eventType = "unknown"
                processId = ($eventData | Where-Object { $_.Name -eq 'ProcessId' }).'#text'
                image = ($eventData | Where-Object { $_.Name -eq 'Image' }).'#text'
            }
            
            # Add event-specific data based on Sysmon config
            switch ($_.Id) {
                1 { # ProcessCreate
                    $entry.eventType = "process_create"
                    $entry.commandLine = ($eventData | Where-Object { $_.Name -eq 'CommandLine' }).'#text'
                    $entry.parentImage = ($eventData | Where-Object { $_.Name -eq 'ParentImage' }).'#text'
                    $entry.integrityLevel = ($eventData | Where-Object { $_.Name -eq 'IntegrityLevel' }).'#text'
                }
                3 { # NetworkConnect
                    $entry.eventType = "network_connect"
                    $entry.destinationIp = ($eventData | Where-Object { $_.Name -eq 'DestinationIp' }).'#text'
                    $entry.sourceIp = ($eventData | Where-Object { $_.Name -eq 'SourceIp' }).'#text'
                    $entry.destinationPort = ($eventData | Where-Object { $_.Name -eq 'DestinationPort' }).'#text'
                    $entry.protocol = ($eventData | Where-Object { $_.Name -eq 'Protocol' }).'#text'
                }
                11 { # FileCreate
                    $entry.eventType = "file_create"
                    $entry.targetFilename = ($eventData | Where-Object { $_.Name -eq 'TargetFilename' }).'#text'
                }
                22 { # DNSQuery
                    $entry.eventType = "dns_query"
                    $entry.queryName = ($eventData | Where-Object { $_.Name -eq 'QueryName' }).'#text'
                    $entry.queryStatus = ($eventData | Where-Object { $_.Name -eq 'QueryStatus' }).'#text'
                }
                13 { # RegistryEvent
                    $entry.eventType = "registry_event"
                    $entry.targetObject = ($eventData | Where-Object { $_.Name -eq 'TargetObject' }).'#text'
                    $entry.details = ($eventData | Where-Object { $_.Name -eq 'Details' }).'#text'
                }
                7 { # ImageLoad - for executable detection
                    $entry.eventType = "image_load"
                    $entry.imageLoaded = ($eventData | Where-Object { $_.Name -eq 'ImageLoaded' }).'#text'
                    $entry.hashes = ($eventData | Where-Object { $_.Name -eq 'Hashes' }).'#text'
                }
            }
            
            # Add event category based on config rules
            $entry.category = switch -Regex ($entry.image + $entry.commandLine) {
                "powershell|cmd|wscript|cscript|mshta|\.ps1|\.vbs|\.js|\.hta|\.bat|\.cmd" { "script_execution" }
                "msiexec|setup\.exe|install" { "installation" }
                "net\.exe|net1\.exe|user add|localgroup|usermod|useradd" { "user_management" }
                "icacls|cacls|xcacls|takeown|runas" { "permission_change" }
                "explorer\.exe|chrome\.exe|firefox\.exe|msedge\.exe|brave\.exe" { "user_application" }
                default { "other" }
            }
            
            $entry
        }
        
        Write-Host "[PS] Processed events by type:"
        $logs | Group-Object eventType | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Count) events"
        }
        
    } catch {
        Write-Host "[PS] Error accessing Sysmon logs: $($_.Exception.Message)"
        Write-Host "[PS] Checking Sysmon service status..."
        
        $sysmonService = Get-Service -Name Sysmon -ErrorAction SilentlyContinue
        if ($sysmonService) {
            Write-Host "[PS] Sysmon service status: $($sysmonService.Status)"
        } else {
            Write-Host "[PS] Sysmon service not found. Please verify installation."
        }
        throw
    }

    Write-Host "[PS] Writing logs to JSON..."
    $jsonContent = $logs | ConvertTo-Json -Depth 10
    Set-Content -Path $jsonPath -Value $jsonContent -Force
    
    Write-Host "[PS] Successfully wrote $(($logs | Measure-Object).Count) events to $jsonPath"
    if ($logs.Count -gt 0) {
        Write-Host "[PS] Sample event (first entry):"
        Write-Host ($logs[0] | ConvertTo-Json)
    }

} catch {
    Write-Error "[PS] Fatal error:"
    Write-Error $_.Exception.Message
    Write-Error $_.ScriptStackTrace
    exit 1
}