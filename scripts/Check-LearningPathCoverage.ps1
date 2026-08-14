param(
  [switch]$NoFail,
  [string]$ReportPath = ''
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$ConfigPath = Join-Path $ProjectRoot 'config\app.config.json'
$ConceptRoot = Join-Path $ProjectRoot 'content\concepts'
$PathRoot = Join-Path $ProjectRoot 'content\learning-paths'

if (-not (Test-Path $ConfigPath)) { throw "Missing config: $ConfigPath" }
$config = Get-Content -Raw -LiteralPath $ConfigPath | ConvertFrom-Json
$browseStatuses = @($config.catalog.browseStatuses | ForEach-Object { [string]$_ })

$concepts = @()
if (Test-Path $ConceptRoot) {
  foreach ($dir in @(Get-ChildItem -LiteralPath $ConceptRoot -Directory | Sort-Object Name)) {
    $file = Join-Path $dir.FullName 'concept.json'
    if (-not (Test-Path $file)) { continue }
    $c = Get-Content -Raw -LiteralPath $file | ConvertFrom-Json
    if ($browseStatuses -contains [string]$c.status) {
      $concepts += [pscustomobject]@{ id = [string]$c.id; title = [string]$c.title; status = [string]$c.status }
    }
  }
}

$covered = New-Object 'System.Collections.Generic.HashSet[string]'
$pathCount = 0
if (Test-Path $PathRoot) {
  foreach ($file in @(Get-ChildItem -LiteralPath $PathRoot -File -Filter '*.json' | Sort-Object Name)) {
    $lp = Get-Content -Raw -LiteralPath $file.FullName | ConvertFrom-Json
    $pathCount++
    foreach ($id in @($lp.concepts)) { if ($id) { [void]$covered.Add([string]$id) } }
  }
}

$unassigned = @($concepts | Where-Object { -not $covered.Contains($_.id) } | Sort-Object title)
$coveredCount = $concepts.Count - $unassigned.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('Visular AI Terms / Concepts - Learning Path Coverage')
$lines.Add(('Generated: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')))
$lines.Add(('Browsable concepts: ' + $concepts.Count))
$lines.Add(('Learning paths: ' + $pathCount))
$lines.Add(('Concepts represented in at least one path: ' + $coveredCount))
$lines.Add(('Unassigned concepts: ' + $unassigned.Count))
if ($unassigned.Count -gt 0) {
  $lines.Add('')
  $lines.Add('REVIEW REQUIRED')
  foreach ($c in $unassigned) { $lines.Add((' - ' + $c.title + ' [' + $c.id + ']')) }
  $lines.Add('')
  $lines.Add('Assign every browsable concept to at least one curated learning path before preparing a GitHub update.')
} else {
  $lines.Add('')
  $lines.Add('PASS - every browsable concept is represented in at least one learning path.')
}

if (-not $ReportPath) {
  $ReviewRoot = Join-Path $ProjectRoot 'learning-path-review'
  New-Item -ItemType Directory -Force -Path $ReviewRoot | Out-Null
  $ReportPath = Join-Path $ReviewRoot 'latest.txt'
}
$parent = Split-Path -Parent $ReportPath
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
[IO.File]::WriteAllLines($ReportPath, $lines, (New-Object Text.UTF8Encoding($false)))

foreach ($line in $lines) {
  if ($line -eq 'REVIEW REQUIRED') { Write-Host $line -ForegroundColor Yellow }
  elseif ($line -like 'PASS -*') { Write-Host $line -ForegroundColor Green }
  else { Write-Host $line }
}
Write-Host ('Coverage report: ' + $ReportPath)

if ($unassigned.Count -gt 0 -and -not $NoFail) { exit 1 }
exit 0
