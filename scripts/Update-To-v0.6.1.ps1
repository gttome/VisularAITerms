$ErrorActionPreference = 'Stop'
$ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$NewVersion = '0.6.1'
$OldVersion = '0.6.0'

function Write-Rule([string]$Text) {
  Write-Host ('=' * 60) -ForegroundColor DarkCyan
  if ($Text) { Write-Host (' ' + $Text) -ForegroundColor Cyan }
  Write-Host ('=' * 60) -ForegroundColor DarkCyan
}

Write-Rule 'VISULAR AI TERMS / CONCEPTS - v0.6.1 UPDATE'

$required = @('config\app.config.json','dist\index.html','scripts\Import-ConceptPackages.ps1','content\concepts')
foreach ($rel in $required) {
  if (-not (Test-Path (Join-Path $ProjectRoot $rel))) { throw "This update must be extracted into the root of an existing VisularAITerms v0.6.0 project. Missing: $rel" }
}

$configPath = Join-Path $ProjectRoot 'config\app.config.json'
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
if ([string]$config.application.version -ne $NewVersion) {
  throw "The v0.6.1 update files were not copied over the application correctly. config/app.config.json is version $($config.application.version), expected $NewVersion."
}

Write-Host '1. Repairing media duration/page metadata...' -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot 'scripts\Repair-MediaMetadata.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Media metadata repair failed.' }

Write-Host '2. Updating local runtime cache/version files...' -ForegroundColor Cyan
$oldStatic = Join-Path $ProjectRoot ("dist\static\" + $OldVersion)
$newStatic = Join-Path $ProjectRoot ("dist\static\" + $NewVersion)
if (-not (Test-Path $newStatic)) {
  if (-not (Test-Path $oldStatic)) { throw "Existing frontend cache folder was not found: dist\static\$OldVersion" }
  Copy-Item -LiteralPath $oldStatic -Destination $newStatic -Recurse
}

$distIndexPath = Join-Path $ProjectRoot 'dist\index.html'
$html = Get-Content -Raw -LiteralPath $distIndexPath
$html = $html.Replace("./static/$OldVersion/", "./static/$NewVersion/")
$html = $html.Replace("Application version $OldVersion", "Application version $NewVersion")
$html = $html.Replace(">v$OldVersion<", ">v$NewVersion<")
[IO.File]::WriteAllText($distIndexPath, $html, (New-Object Text.UTF8Encoding($false)))

$catalogPath = Join-Path $ProjectRoot 'dist\data\catalog.json'
if (Test-Path $catalogPath) {
  $catalog = Get-Content -Raw -LiteralPath $catalogPath | ConvertFrom-Json
  if ($null -ne $catalog.application) { $catalog.application.version = $NewVersion }
  $catalog.generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  [IO.File]::WriteAllText($catalogPath, ($catalog | ConvertTo-Json -Depth 30), (New-Object Text.UTF8Encoding($false)))
}

$statePath = Join-Path $ProjectRoot '.last-concept-import.json'
if (Test-Path $statePath) {
  $state = Get-Content -Raw -LiteralPath $statePath | ConvertFrom-Json
  if ($null -eq $state.PSObject.Properties['applicationVersion']) { $state | Add-Member -NotePropertyName applicationVersion -NotePropertyValue $NewVersion }
  else { $state.applicationVersion = $NewVersion }
  [IO.File]::WriteAllText($statePath, ($state | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding($false)))
}

Write-Host '3. Verifying button metadata...' -ForegroundColor Cyan
$problems = New-Object System.Collections.Generic.List[string]
$conceptFiles = @(Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'dist\data\concepts') -Directory | ForEach-Object { Join-Path $_.FullName 'concept.json' } | Where-Object { Test-Path $_ })
foreach ($file in $conceptFiles) {
  $concept = Get-Content -Raw -LiteralPath $file | ConvertFrom-Json
  foreach ($item in @($concept.media)) {
    if ($item.type -eq 'video' -or $item.type -eq 'audio') {
      $duration = 0.0
      try { $duration = [double]$item.durationSeconds } catch { $duration = 0.0 }
      if ($duration -le 0) { $problems.Add("$($concept.title) / $($item.displayLabel): duration missing") }
    }
    if ($item.type -eq 'pdf') {
      $pages = 0
      try { $pages = [int]$item.pages } catch { $pages = 0 }
      if ($pages -le 0) { $problems.Add("$($concept.title) / Presentation: page count missing") }
    }
  }
}
if ($problems.Count -gt 0) {
  Write-Host 'The update could not complete because some learning-choice metadata is still missing:' -ForegroundColor Red
  foreach ($problem in $problems) { Write-Host ('  - ' + $problem) -ForegroundColor Red }
  throw 'Metadata verification failed.'
}

$marker = Join-Path $ProjectRoot '.v0.6.1-update-complete'
[IO.File]::WriteAllText($marker, (Get-Date).ToString('o'), (New-Object Text.UTF8Encoding($false)))

Write-Host ''
Write-Rule 'UPDATE COMPLETE'
Write-Host 'Application version: v0.6.1' -ForegroundColor Green
Write-Host 'Existing imported concepts were repaired in place; no concept ZIP re-import is required.' -ForegroundColor Green
Write-Host 'Future imports will automatically include video duration, audio duration, and PDF page count.' -ForegroundColor Green
exit 0
