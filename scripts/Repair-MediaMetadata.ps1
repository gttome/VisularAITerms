param(
  [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
. (Join-Path $ProjectRoot 'scripts\lib\Media-Metadata.ps1')

function Set-JsonProperty($Object, [string]$Name, $Value) {
  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) {
    $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    return $true
  }
  $old = $prop.Value
  if ($old -is [double] -or $Value -is [double]) {
    if ([Math]::Abs(([double]$old) - ([double]$Value)) -gt 0.01) { $prop.Value = $Value; return $true }
  } elseif ($old -ne $Value) {
    $prop.Value = $Value
    return $true
  }
  return $false
}

function Test-LocalMediaPath([string]$Value) {
  return ($Value -and $Value -notmatch '^[a-zA-Z][a-zA-Z0-9+.-]*://')
}

function Repair-ConceptTree([string]$Root, [string]$Label) {
  if (-not (Test-Path $Root)) { return [pscustomobject]@{Files=0;Changed=0;Values=0;Failures=@()} }
  $files = @(Get-ChildItem -LiteralPath $Root -Directory | ForEach-Object { Join-Path $_.FullName 'concept.json' } | Where-Object { Test-Path $_ })
  $changedFiles = 0
  $valueCount = 0
  $failures = New-Object System.Collections.Generic.List[string]

  foreach ($file in $files) {
    $concept = Get-Content -Raw -LiteralPath $file | ConvertFrom-Json
    $changed = $false
    foreach ($item in @($concept.media)) {
      if (-not (Test-LocalMediaPath ([string]$item.src))) { continue }
      $source = [IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $file) ([string]$item.src)))
      if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { continue }
      if ($item.type -eq 'video' -or $item.type -eq 'audio') {
        $duration = Get-MediaDurationSeconds $source
        if ($null -ne $duration -and $duration -gt 0) {
          if (Set-JsonProperty $item 'durationSeconds' $duration) { $changed = $true; $valueCount++ }
        } elseif ([IO.Path]::GetExtension($source).ToLowerInvariant() -in @('.mp4','.m4a','.wav')) {
          $failures.Add("$($concept.id)/$($item.id): could not determine duration")
        }
      } elseif ($item.type -eq 'pdf') {
        $pages = Get-PdfPageCount $source
        if ($null -ne $pages -and $pages -gt 0) {
          if (Set-JsonProperty $item 'pages' ([int]$pages)) { $changed = $true; $valueCount++ }
        } else {
          $failures.Add("$($concept.id)/$($item.id): could not determine PDF page count")
        }
      }
    }
    if ($changed) {
      [IO.File]::WriteAllText($file, ($concept | ConvertTo-Json -Depth 30), (New-Object Text.UTF8Encoding($false)))
      $changedFiles++
      if (-not $Quiet) { Write-Host ("[UPDATED] $Label\" + $concept.id) -ForegroundColor Green }
    }
  }
  return [pscustomobject]@{Files=$files.Count;Changed=$changedFiles;Values=$valueCount;Failures=@($failures)}
}

$content = Repair-ConceptTree (Join-Path $ProjectRoot 'content\concepts') 'content'
$dist = Repair-ConceptTree (Join-Path $ProjectRoot 'dist\data\concepts') 'dist'
$failures = @($content.Failures) + @($dist.Failures)

if (-not $Quiet) {
  Write-Host ''
  Write-Host 'Media metadata repair summary' -ForegroundColor Cyan
  Write-Host "Content concepts scanned: $($content.Files); changed: $($content.Changed); values written: $($content.Values)"
  Write-Host "Dist concepts scanned:    $($dist.Files); changed: $($dist.Changed); values written: $($dist.Values)"
}

if ($failures.Count -gt 0) {
  Write-Host ''
  Write-Host 'Metadata could not be derived for:' -ForegroundColor Red
  foreach ($failure in $failures | Select-Object -Unique) { Write-Host ('  - ' + $failure) -ForegroundColor Red }
  exit 1
}

if (-not $Quiet) { Write-Host 'Media metadata repair: PASS' -ForegroundColor Green }
exit 0
