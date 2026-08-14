$ErrorActionPreference='Stop'
$ProjectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$StatePath=Join-Path $ProjectRoot '.last-concept-import.json'
$OutRoot=Join-Path $ProjectRoot 'github-update'
$CoverageScript=Join-Path $ProjectRoot 'scripts\Check-LearningPathCoverage.ps1'

if(-not(Test-Path $StatePath)){Write-Host 'No completed concept import was found.' -ForegroundColor Yellow;Write-Host 'Run 1-IMPORT-CONCEPTS.bat first.';exit 2}

Write-Host 'Checking Learning Path coverage before GitHub packaging...' -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $CoverageScript
if($LASTEXITCODE -ne 0){
  Write-Host ''
  Write-Host 'GitHub update NOT prepared.' -ForegroundColor Red
  Write-Host 'Every browsable concept must be represented in at least one curated Learning Path.' -ForegroundColor Yellow
  Write-Host 'Review learning-path-review\latest.txt, update the Learning Paths, then run this script again.'
  exit 3
}

$state=Get-Content -Raw -LiteralPath $StatePath|ConvertFrom-Json
$stamp=(Get-Date).ToString('yyyyMMdd-HHmmss')
$folder=Join-Path $OutRoot ('VisularAITerms_GitHub_Update_'+$stamp)
$repo=Join-Path $folder 'repository-root'
New-Item -ItemType Directory -Force -Path $repo|Out-Null

foreach($c in $state.concepts){
  $source=Join-Path $ProjectRoot ('content\concepts\'+$c.id)
  $target=Join-Path $repo ('content\concepts\'+$c.id)
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target)|Out-Null
  Copy-Item -LiteralPath $source -Destination $target -Recurse
}

# Learning Paths are tiny and are always included so the published site matches the locally accepted learning experience.
$pathSource=Join-Path $ProjectRoot 'content\learning-paths'
$pathTarget=Join-Path $repo 'content\learning-paths'
if(Test-Path $pathSource){
  New-Item -ItemType Directory -Force -Path $pathTarget|Out-Null
  foreach($file in @(Get-ChildItem -LiteralPath $pathSource -File -Filter '*.json')){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $pathTarget $file.Name) -Force}
}

# Include the v0.6.2 platform files required for TXT-backed concepts, media metadata,
# Learning Path coverage enforcement, and the one-click Windows workflow.
$coreFiles=@(
  'config\app.config.json',
  'content\schema\concept.schema.json',
  'content\schema\learning-path.schema.json',
  'scripts\lib\content-utils.mjs',
  'scripts\lib\Media-Metadata.ps1',
  'scripts\prepare-content.mjs',
  'scripts\validate-content.mjs',
  'scripts\generate-learning-paths.mjs',
  'scripts\build.mjs',
  'scripts\report-content.mjs',
  'scripts\helpers\Prepare-Media.ps1',
  'scripts\helpers\prepare_media.py',
  'scripts\import-concept.mjs',
  'scripts\Import-ConceptPackages.ps1',
  'scripts\Repair-MediaMetadata.ps1',
  'scripts\Sync-LearningPaths.ps1',
  'scripts\Check-LearningPathCoverage.ps1',
  'scripts\Prepare-GitHubUpdate.ps1',
  'src\index.html',
  'src\js\media\media-viewer.js',
  'src\js\concept\concept-view.js',
  'tests\unit\content-utils.test.mjs',
  'tests\unit\iteration5-import.test.mjs',
  'tests\unit\learning-path-coverage.test.mjs',
  'README.md','HANDOFF.md','CHANGELOG.md','RELEASE_NOTES_v0.6.2.md'
)
foreach($rel in $coreFiles){
  $source=Join-Path $ProjectRoot $rel
  if(Test-Path $source){
    $target=Join-Path $repo $rel
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target)|Out-Null
    Copy-Item -LiteralPath $source -Destination $target -Force
  }
}

$guide=@"
Visular AI Terms / Concepts - GitHub Update
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Application: v0.6.2

This folder preserves paths relative to the repository root.

Concepts included from the most recent import:
$((@($state.concepts|ForEach-Object{'- '+$_.title}) -join "`r`n"))

LEARNING PATH QUALITY GATE:
GitHub packaging only completes when every browsable concept is represented in at least one curated Learning Path. The complete content/learning-paths/ set is included in this update.

FIRST v0.6.2 GITHUB UPDATE:
Upload the contents of repository-root/ to the matching paths in the existing repository. GitHub Actions will rebuild dist/.

LATER CONTENT IMPORTS AFTER v0.6.2 IS ON GITHUB:
The package contains the most recently imported concept folders plus the complete small Learning Path definition set. Platform files are included only when needed by the current release.

Do not upload concept-import/, backups/, github-update/, learning-path-review/, or .last-concept-import.json.
"@
[IO.File]::WriteAllText((Join-Path $folder 'README-GITHUB-UPDATE.txt'),$guide,(New-Object Text.UTF8Encoding($false)))
$zipPath=$folder+'.zip'
if(Test-Path $zipPath){Remove-Item $zipPath -Force}

# Projects stored inside OneDrive-synchronized folders can be momentarily locked by
# the sync client immediately after files are created. Compress-Archive opens every
# source file and fails the whole package if even one file is temporarily locked.
# Stage a read-only copy under the local Windows TEMP directory, then compress there.
function Copy-FileWithRetry {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination,
    [int]$Attempts=12
  )
  $parent=Split-Path -Parent $Destination
  if($parent){New-Item -ItemType Directory -Force -Path $parent|Out-Null}
  for($attempt=1;$attempt -le $Attempts;$attempt++){
    try{
      [IO.File]::Copy($Source,$Destination,$true)
      return
    }catch [IO.IOException]{
      if($attempt -ge $Attempts){throw}
      Start-Sleep -Milliseconds ([Math]::Min(3000,250*$attempt))
    }catch [UnauthorizedAccessException]{
      if($attempt -ge $Attempts){throw}
      Start-Sleep -Milliseconds ([Math]::Min(3000,250*$attempt))
    }
  }
}

function Copy-TreeWithRetry {
  param(
    [Parameter(Mandatory=$true)][string]$SourceRoot,
    [Parameter(Mandatory=$true)][string]$DestinationRoot
  )
  New-Item -ItemType Directory -Force -Path $DestinationRoot|Out-Null
  $sourcePrefix=[IO.Path]::GetFullPath($SourceRoot).TrimEnd('\')+'\'
  foreach($dir in @(Get-ChildItem -LiteralPath $SourceRoot -Directory -Recurse)){
    $relative=$dir.FullName.Substring($sourcePrefix.Length)
    New-Item -ItemType Directory -Force -Path (Join-Path $DestinationRoot $relative)|Out-Null
  }
  foreach($file in @(Get-ChildItem -LiteralPath $SourceRoot -File -Recurse)){
    $relative=$file.FullName.Substring($sourcePrefix.Length)
    Copy-FileWithRetry -Source $file.FullName -Destination (Join-Path $DestinationRoot $relative)
  }
}

$tempRoot=Join-Path ([IO.Path]::GetTempPath()) ('VisularAITerms-GitHubPackage-'+[Guid]::NewGuid().ToString('N'))
$tempFolder=Join-Path $tempRoot (Split-Path -Leaf $folder)
$tempZip=Join-Path $tempRoot ((Split-Path -Leaf $folder)+'.zip')
try{
  Write-Host 'Staging GitHub package outside OneDrive...' -ForegroundColor Cyan
  Copy-TreeWithRetry -SourceRoot $folder -DestinationRoot $tempFolder
  Compress-Archive -Path (Join-Path $tempFolder '*') -DestinationPath $tempZip -CompressionLevel Optimal
  Copy-FileWithRetry -Source $tempZip -Destination $zipPath
}finally{
  if(Test-Path $tempRoot){Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue}
}

Write-Host 'GitHub update prepared.' -ForegroundColor Green
Write-Host "Folder: $folder"
Write-Host "ZIP:    $zipPath"
exit 0
