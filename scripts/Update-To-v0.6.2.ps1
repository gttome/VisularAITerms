$ErrorActionPreference = 'Stop'
$ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$NewVersion = '0.6.2'
$OldVersion = '0.6.1'

function Write-Rule([string]$Text) {
  Write-Host ('=' * 60) -ForegroundColor DarkCyan
  if ($Text) { Write-Host (' ' + $Text) -ForegroundColor Cyan }
  Write-Host ('=' * 60) -ForegroundColor DarkCyan
}

Write-Rule 'VISULAR AI TERMS / CONCEPTS - v0.6.2 UPDATE'

$required = @('config\app.config.json','dist\index.html','content\concepts','content\learning-paths','scripts\Sync-LearningPaths.ps1','scripts\Check-LearningPathCoverage.ps1')
foreach ($rel in $required) {
  if (-not (Test-Path (Join-Path $ProjectRoot $rel))) { throw "This update must be extracted into the root of the existing VisularAITerms v0.6.1 project. Missing: $rel" }
}

$configPath = Join-Path $ProjectRoot 'config\app.config.json'
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
if ([string]$config.application.version -ne $NewVersion) {
  throw "The v0.6.2 update files were not copied over the application correctly. config/app.config.json is version $($config.application.version), expected $NewVersion."
}

Write-Host '1. Verifying the six imported engineering concepts...' -ForegroundColor Cyan
$requiredConcepts = @(
  'generative-ai-engineering-ecosystem',
  'prompt-engineering',
  'context-engineering',
  'harness-engineering',
  'loop-engineering',
  'graph-engineering'
)
foreach ($id in $requiredConcepts) {
  $conceptFile = Join-Path $ProjectRoot ("content\concepts\$id\concept.json")
  if (-not (Test-Path $conceptFile)) { throw "Expected imported concept is missing: $id. Apply this update to the v0.6.1 desktop copy where the six concepts were already imported." }
}
Write-Host 'All six imported concepts are present.' -ForegroundColor Green

Write-Host '2. Synchronizing the three curated Learning Paths...' -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot 'scripts\Sync-LearningPaths.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Learning Path synchronization failed.' }

Write-Host '3. Enforcing Learning Path coverage...' -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot 'scripts\Check-LearningPathCoverage.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Learning Path coverage verification failed.' }

Write-Host '4. Updating local runtime cache/version files...' -ForegroundColor Cyan
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

$marker = Join-Path $ProjectRoot '.v0.6.2-update-complete'
[IO.File]::WriteAllText($marker, (Get-Date).ToString('o'), (New-Object Text.UTF8Encoding($false)))

Write-Host ''
Write-Rule 'UPDATE COMPLETE'
Write-Host 'Application version: v0.6.2' -ForegroundColor Green
Write-Host 'Learning Paths: 3' -ForegroundColor Green
Write-Host 'Browsable concept coverage: 8 of 8 concepts represented' -ForegroundColor Green
Write-Host 'Future imports now report Learning Path coverage, and GitHub packaging blocks incomplete coverage.' -ForegroundColor Green
exit 0
