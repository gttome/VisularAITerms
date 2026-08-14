param(
  [string]$OutputPath = ''
)

$ErrorActionPreference='Stop'
$ProjectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$PathRoot=Join-Path $ProjectRoot 'content\learning-paths'
if(-not $OutputPath){$OutputPath=Join-Path $ProjectRoot 'dist\data\learning-paths.json'}
$items=@()
if(Test-Path $PathRoot){
  foreach($file in @(Get-ChildItem -LiteralPath $PathRoot -File -Filter '*.json' | Sort-Object Name)){
    $lp=Get-Content -Raw -LiteralPath $file.FullName | ConvertFrom-Json
    $items += ,$lp
  }
}
$items=@($items | Sort-Object title)
$payload=[ordered]@{schemaVersion=1;generatedAt=(Get-Date).ToUniversalTime().ToString('o');learningPaths=$items}
$parent=Split-Path -Parent $OutputPath
if($parent){New-Item -ItemType Directory -Force -Path $parent|Out-Null}
[IO.File]::WriteAllText($OutputPath,($payload|ConvertTo-Json -Depth 30),(New-Object Text.UTF8Encoding($false)))
Write-Host ("Learning paths synchronized: {0} path(s)." -f $items.Count) -ForegroundColor Green
exit 0
