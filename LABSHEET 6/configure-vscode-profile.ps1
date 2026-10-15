param(
    [string]$ProfileDirectory = (Join-Path $env:APPDATA "Code\User")
)

$ErrorActionPreference = "Stop"
$settingsPath = Join-Path $ProfileDirectory "settings.json"
$keybindingsPath = Join-Path $ProfileDirectory "keybindings.json"

if (-not (Test-Path $ProfileDirectory)) {
    New-Item -ItemType Directory -Path $ProfileDirectory -Force | Out-Null
}

function ConvertFrom-Jsonc {
    param([string]$Content)

    $commentFree = [System.Text.StringBuilder]::new()
    $inString = $false
    $escaped = $false
    $inLineComment = $false
    $inBlockComment = $false

    for ($index = 0; $index -lt $Content.Length; $index++) {
        $character = $Content[$index]
        $nextCharacter = if ($index + 1 -lt $Content.Length) { $Content[$index + 1] } else { [char]0 }

        if ($inLineComment) {
            if ($character -eq "`r" -or $character -eq "`n") {
                [void]$commentFree.Append($character)
                $inLineComment = $false
            }
            continue
        }
        if ($inBlockComment) {
            if ($character -eq '*' -and $nextCharacter -eq '/') {
                $inBlockComment = $false
                $index++
            } elseif ($character -eq "`r" -or $character -eq "`n") {
                [void]$commentFree.Append($character)
            }
            continue
        }
        if ($inString) {
            [void]$commentFree.Append($character)
            if ($escaped) {
                $escaped = $false
            } elseif ($character -eq '\') {
                $escaped = $true
            } elseif ($character -eq '"') {
                $inString = $false
            }
            continue
        }
        if ($character -eq '"') {
            $inString = $true
            [void]$commentFree.Append($character)
        } elseif ($character -eq '/' -and $nextCharacter -eq '/') {
            $inLineComment = $true
            $index++
        } elseif ($character -eq '/' -and $nextCharacter -eq '*') {
            $inBlockComment = $true
            $index++
        } else {
            [void]$commentFree.Append($character)
        }
    }

    $withoutTrailingCommas = [System.Text.StringBuilder]::new()
    $normalized = $commentFree.ToString()
    $inString = $false
    $escaped = $false
    for ($index = 0; $index -lt $normalized.Length; $index++) {
        $character = $normalized[$index]
        if ($inString) {
            [void]$withoutTrailingCommas.Append($character)
            if ($escaped) {
                $escaped = $false
            } elseif ($character -eq '\') {
                $escaped = $true
            } elseif ($character -eq '"') {
                $inString = $false
            }
            continue
        }
        if ($character -eq '"') {
            $inString = $true
            [void]$withoutTrailingCommas.Append($character)
        } elseif ($character -eq ',') {
            $lookahead = $index + 1
            while ($lookahead -lt $normalized.Length -and [char]::IsWhiteSpace($normalized[$lookahead])) {
                $lookahead++
            }
            if ($lookahead -ge $normalized.Length -or ($normalized[$lookahead] -ne '}' -and $normalized[$lookahead] -ne ']')) {
                [void]$withoutTrailingCommas.Append($character)
            }
        } else {
            [void]$withoutTrailingCommas.Append($character)
        }
    }

    return ConvertFrom-Json -InputObject $withoutTrailingCommas.ToString()
}

function Read-JsonFile {
    param([string]$Path, [object]$DefaultValue)

    if (-not (Test-Path $Path)) {
        return $DefaultValue
    }

    try {
        $parsedJson = ConvertFrom-Jsonc -Content (Get-Content -Path $Path -Raw)
        return ,$parsedJson
    } catch {
        throw "Cannot parse existing JSON file '$Path'. No profile files were changed. $($_.Exception.Message)"
    }
}

function Backup-ProfileFile {
    param([string]$Path)

    if (Test-Path $Path) {
        $backupPath = "$Path.bak.$(Get-Date -Format 'yyyyMMddHHmmssfff')"
        Copy-Item -Path $Path -Destination $backupPath
        Write-Host "Backup created: $backupPath"
    }
}

$settingsToApply = [ordered]@{
    "[python]" = @{
        "editor.defaultFormatter" = "ms-python.black-formatter"
        "editor.formatOnSave" = $true
        "editor.codeActionsOnSave" = @{ "source.organizeImports" = "explicit" }
    }
    "python.defaultInterpreterPath" = '${workspaceFolder}\.venv\Scripts\python.exe'
    "black-formatter.args" = @("--line-length=79")
    "ruff.lineLength" = 79
    "editor.rulers" = @(79)
}

$settings = Read-JsonFile -Path $settingsPath -DefaultValue ([pscustomobject]@{})
$pythonSettings = $settingsToApply["[python]"]
if ($settings.PSObject.Properties.Name -contains "[python]" -and $null -ne $settings.'[python]') {
    $pythonSettings = $settings.'[python]'
}
foreach ($pythonSettingName in $settingsToApply["[python]"].Keys) {
    $pythonSettings | Add-Member -MemberType NoteProperty -Name $pythonSettingName -Value $settingsToApply["[python]"][$pythonSettingName] -Force
}
$settings | Add-Member -MemberType NoteProperty -Name "[python]" -Value $pythonSettings -Force

foreach ($settingName in $settingsToApply.Keys | Where-Object { $_ -ne "[python]" }) {
    $settings | Add-Member -MemberType NoteProperty -Name $settingName -Value $settingsToApply[$settingName] -Force
}

$keybindings = Read-JsonFile -Path $keybindingsPath -DefaultValue @()
if ($null -eq $keybindings) {
    $keybindings = @()
} elseif ($keybindings -isnot [System.Array]) {
    $keybindings = @($keybindings)
}
$newBinding = [pscustomobject]@{
    key = "ctrl+alt+l"
    command = "editor.action.formatDocument"
    when = "editorTextFocus && editorLangId == python"
}
$mergedKeybindings = @($keybindings | Where-Object {
    -not ($_.key -eq $newBinding.key -and $_.command -eq $newBinding.command -and $_.when -eq $newBinding.when)
}) + @($newBinding)

Backup-ProfileFile -Path $settingsPath
Backup-ProfileFile -Path $keybindingsPath
$settings | ConvertTo-Json -Depth 20 | Set-Content -Path $settingsPath -Encoding UTF8
ConvertTo-Json -InputObject $mergedKeybindings -Depth 20 | Set-Content -Path $keybindingsPath -Encoding UTF8

Write-Host "PEP 8 profile settings and Ctrl+Alt+L Python formatting shortcut configured in $ProfileDirectory"