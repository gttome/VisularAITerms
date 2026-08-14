param(
  [string]$Inbox = (Join-Path $PSScriptRoot '..\concept-import')
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$Inbox = [System.IO.Path]::GetFullPath($Inbox)
$ContentRoot = Join-Path $ProjectRoot 'content\concepts'
$DistConceptRoot = Join-Path $ProjectRoot 'dist\data\concepts'
$CatalogPath = Join-Path $ProjectRoot 'dist\data\catalog.json'
$CategoriesPath = Join-Path $ProjectRoot 'content\config\categories.json'
$ConfigPath = Join-Path $ProjectRoot 'config\app.config.json'
$BackupRoot = Join-Path $ProjectRoot 'backups'
$ImportedArchiveRoot = Join-Path $Inbox 'imported'
$StatePath = Join-Path $ProjectRoot '.last-concept-import.json'
$HelperPath = Join-Path $ProjectRoot 'scripts\helpers\Prepare-Media.ps1'
$MetadataHelperPath = Join-Path $ProjectRoot 'scripts\lib\Media-Metadata.ps1'
$LearningPathRoot = Join-Path $ProjectRoot 'content\learning-paths'
$PlanPath = Join-Path $Inbox 'learning-path-plan.json'
$SyncLearningPathScript = Join-Path $ProjectRoot 'scripts\Sync-LearningPaths.ps1'
$CoverageScript = Join-Path $ProjectRoot 'scripts\Check-LearningPathCoverage.ps1'
. $MetadataHelperPath

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Write-Rule([string]$Text) {
  Write-Host ('=' * 60) -ForegroundColor DarkCyan
  if ($Text) { Write-Host (' ' + $Text) -ForegroundColor Cyan }
  Write-Host ('=' * 60) -ForegroundColor DarkCyan
}
function New-Slug([string]$Value) {
  $normalized = $Value.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object Text.StringBuilder
  foreach ($ch in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) { [void]$builder.Append($ch) }
  }
  $clean = $builder.ToString().Normalize([Text.NormalizationForm]::FormC).ToLowerInvariant()
  $clean = $clean -replace '&',' and '
  $clean = $clean -replace '[^a-z0-9]+','-'
  $clean = $clean.Trim('-') -replace '-{2,}','-'
  return $clean
}
function Get-FirstSentences([string]$Text, [int]$Max = 360) {
  $value = ([string]$Text).Trim()
  if ($value.Length -le $Max) { return $value }
  $matches = [regex]::Matches($value, '.+?(?:[.!?](?=\s|$)|$)')
  $result = ''
  foreach ($m in $matches) {
    $candidate = if ($result) { $result + ' ' + $m.Value.Trim() } else { $m.Value.Trim() }
    if ($candidate.Length -gt $Max -and $result) { break }
    $result = $candidate
    if ($result.Length -ge [Math]::Min(180,$Max)) { break }
  }
  if ($result) { return $result }
  return $value.Substring(0,$Max).TrimEnd() + '…'
}
function Get-Section([string]$Text, [string]$Label) {
  $pattern = '(?im)^' + [regex]::Escape($Label) + '\s*(.+)$'
  $match = [regex]::Match($Text,$pattern)
  if ($match.Success) { return $match.Groups[1].Value.Trim() }
  return ''
}
function Split-SemicolonList([string]$Text) {
  $items = @()
  foreach ($item in ([string]$Text -split ';')) {
    $clean = $item.Trim().TrimEnd('.')
    if ($clean) { $items += $clean }
  }
  return @($items)
}
function Get-FirstUsefulParagraph([string]$Text, [string]$Title) {
  $labels = @('Plain-language definition:','Why it matters to senior leaders:','Why it matters to knowledge workers:','Practical organizational example:','Key opportunities:','Principal risks or limitations:','Common misconception:','What to monitor next:')
  foreach ($raw in ($Text -split "`r?`n")) {
    $line = $raw.Trim()
    if (-not $line) { continue }
    if ($line -eq $Title -or $line -match '^#?\d+\s+[—-]' -or $line -eq 'Comparative Framework' -or $line -match '^Type\s+Classification' -or $line -match '^Dimension\s+') { continue }
    $isLabel = $false
    foreach ($label in $labels) { if ($line.StartsWith($label,[StringComparison]::OrdinalIgnoreCase)) { $isLabel=$true; break } }
    if ($isLabel) { continue }
    if ($line -match "`t") { continue }
    if ($line.Length -ge 80) { return $line }
  }
  return ''
}
function Get-Classification([string]$Text, [string]$Title) {
  $type = '';$classification='';$score=$null;$confidence=''
  $lines = @($Text -split "`r?`n")
  for ($i=0; $i -lt $lines.Count-1; $i++) {
    if ($lines[$i] -match '^Type\s+Classification\s+Total Score\s+Confidence\s+Evidence') {
      $parts = @($lines[$i+1] -split "`t")
      if ($parts.Count -ge 4) {
        $type=$parts[0].Trim();$classification=$parts[1].Trim();
        $n=0;if([int]::TryParse($parts[2].Trim(),[ref]$n)){$score=$n}
        $confidence=$parts[3].Trim()
      }
      break
    }
  }
  if (-not $type) {
    if ($Title -match 'Ecosystem') { $type='Generative AI engineering framework' }
    elseif ($Title -match 'Engineering') { $type='AI engineering discipline' }
    else { $type='Generative AI concept' }
  }
  $horizon=@()
  if ($classification -match 'Foundational') {$horizon += 'foundational'}
  if ($classification -match 'Current') {$horizon += 'current'}
  if ($classification -match 'Emerging') {$horizon += 'emerging'}
  if (-not $horizon.Count) {$horizon=@('current','emerging')}
  $obj=[ordered]@{type=$type;horizon=$horizon}
  if ($null -ne $score) {$obj.score=$score}
  if ($confidence) {$obj.confidence=$confidence.ToLowerInvariant()}
  return $obj
}
function Get-Categories([string]$Title, [string]$Text) {
  $haystack = ($Title + ' ' + $Text).ToLowerInvariant()
  $cats = New-Object System.Collections.Generic.List[string]
  if ($haystack -match 'prompt engineering') {$cats.Add('prompt-engineering')}
  if ($haystack -match 'agent|agentic|loop engineering|graph engineering|harness engineering') {$cats.Add('ai-agents')}
  if ($haystack -match 'harness|runtime|control plane|infrastructure|sandbox') {$cats.Add('ai-infrastructure')}
  if ($haystack -match 'context|retrieval|memory|rag') {$cats.Add('data-rag')}
  if ($haystack -match 'architecture|graph|topology|model') {$cats.Add('models-architecture')}
  if ($haystack -match 'govern|risk|permission|security') {$cats.Add('ai-governance-risk')}
  if ($cats.Count -eq 0 -or $haystack -match 'generative ai|engineering ecosystem') {$cats.Add('generative-ai')}
  return @($cats | Select-Object -Unique)
}
function Get-Keywords([string]$Title, [string]$Definition) {
  $result = New-Object System.Collections.Generic.List[string]
  foreach ($token in (($Title.ToLowerInvariant() -split '[^a-z0-9]+') + @('generative ai','engineering'))) {
    $v=$token.Trim(); if ($v.Length -gt 2 -and -not $result.Contains($v)) {$result.Add($v)}
  }
  foreach ($candidate in @('agents','agentic','context','prompt','graph','loop','harness','runtime','memory','retrieval','orchestration','tools','permissions')) {
    if ($Definition.ToLowerInvariant().Contains($candidate) -and -not $result.Contains($candidate)) {$result.Add($candidate)}
  }
  return @($result)
}
function Test-SafeZip([string]$ZipPath) {
  $zip=[System.IO.Compression.ZipFile]::OpenRead($ZipPath)
  try {
    foreach ($entry in $zip.Entries) {
      $name=[string]$entry.FullName
      if ([IO.Path]::IsPathRooted($name) -or $name -match '(^|[\\/])\.\.([\\/]|$)') { throw "Unsafe ZIP path: $name" }
    }
  } finally {$zip.Dispose()}
}
function Select-Asset($Files, [string[]]$Extensions, [string]$Title, [string]$Label, [bool]$Required=$true) {
  $matches=@($Files | Where-Object { $Extensions -contains $_.Extension.ToLowerInvariant() })
  if ($matches.Count -eq 0) { if($Required){throw "Missing required $Label file."}; return $null }
  $exact=@($matches | Where-Object { [IO.Path]::GetFileNameWithoutExtension($_.Name).Equals($Title,[StringComparison]::OrdinalIgnoreCase) })
  if ($exact.Count -ge 1) { return $exact[0] }
  if ($matches.Count -eq 1) { return $matches[0] }
  throw "Multiple $Label files were found and none exactly matches the concept name '$Title'."
}
function Test-Asset([IO.FileInfo]$File, [string]$Kind) {
  if ($File.Length -le 0) { throw "$Kind file is empty: $($File.Name)" }
  $stream=[IO.File]::OpenRead($File.FullName)
  try {
    $buffer=New-Object byte[] 16; $read=$stream.Read($buffer,0,$buffer.Length)
    if ($Kind -eq 'image') {
      $ext=$File.Extension.ToLowerInvariant()
      if ($ext -eq '.png' -and -not ($read -ge 8 -and $buffer[0]-eq 137 -and $buffer[1]-eq 80 -and $buffer[2]-eq 78 -and $buffer[3]-eq 71)) {throw "Invalid PNG header: $($File.Name)"}
      if (($ext -eq '.jpg' -or $ext -eq '.jpeg') -and -not ($read -ge 2 -and $buffer[0]-eq 255 -and $buffer[1]-eq 216)) {throw "Invalid JPEG header: $($File.Name)"}
    } elseif ($Kind -eq 'pdf') {
      $head=[Text.Encoding]::ASCII.GetString($buffer,0,[Math]::Min($read,5)); if (-not $head.StartsWith('%PDF')) {throw "Invalid PDF header: $($File.Name)"}
    } elseif ($Kind -eq 'video' -or $Kind -eq 'audio') {
      if ($read -lt 8 -or [Text.Encoding]::ASCII.GetString($buffer,4,4) -ne 'ftyp') {throw "Invalid MP4/M4A container header: $($File.Name)"}
    }
  } finally {$stream.Dispose()}
  if ($Kind -eq 'docx') {
    $doc=[System.IO.Compression.ZipFile]::OpenRead($File.FullName);try{if($null -eq $doc.GetEntry('word/document.xml')){throw "Invalid DOCX package: $($File.Name)"}}finally{$doc.Dispose()}
  }
}
function New-PosterSvg([string]$Title,[string]$Target) {
  $safe=[System.Net.WebUtility]::HtmlEncode($Title)
  $svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#f5f7fb"/><circle cx="640" cy="285" r="92" fill="#171fa5"/><path d="M615 235 L615 335 L695 285 Z" fill="white"/><text x="640" y="445" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="42" font-weight="700" fill="#172033">'+$safe+'</text><text x="640" y="505" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="28" fill="#171fa5">Visular AI Terms / Concepts</text></svg>'
  [IO.File]::WriteAllText($Target,$svg,(New-Object Text.UTF8Encoding($false)))
}
function Get-Mime([string]$Extension) {
  switch ($Extension.ToLowerInvariant()) {
    '.png' {'image/png'} '.jpg' {'image/jpeg'} '.jpeg' {'image/jpeg'} '.webp' {'image/webp'}
    '.mp4' {'video/mp4'} '.m4a' {'audio/mp4'} '.mp3' {'audio/mpeg'} '.wav' {'audio/wav'}
    '.pdf' {'application/pdf'} '.docx' {'application/vnd.openxmlformats-officedocument.wordprocessingml.document'} '.txt' {'text/plain'}
    default {'application/octet-stream'}
  }
}
function Copy-And-PreparePackage([IO.FileInfo]$ZipFile,[string]$StageRoot) {
  $title=[IO.Path]::GetFileNameWithoutExtension($ZipFile.Name).Trim()
  $id=New-Slug $title
  if (-not $id) { throw "Unable to create concept ID from ZIP: $($ZipFile.Name)" }
  if (Test-Path (Join-Path $ContentRoot $id)) { throw "Concept already exists: $title ($id). This importer never overwrites an existing concept." }
  Test-SafeZip $ZipFile.FullName
  $extract=Join-Path $StageRoot ('extract-' + $id)
  [System.IO.Compression.ZipFile]::ExtractToDirectory($ZipFile.FullName,$extract)
  $files=@(Get-ChildItem -LiteralPath $extract -Recurse -File)
  $image=Select-Asset $files @('.png','.jpg','.jpeg','.webp') $title 'image'
  $video=Select-Asset $files @('.mp4') $title 'MP4 video'
  $audio=Select-Asset $files @('.m4a','.mp3','.wav') $title 'audio'
  $pdf=Select-Asset $files @('.pdf') $title 'PDF'
  $text=Select-Asset $files @('.txt') $title 'TXT briefing' $false
  $docx=Select-Asset $files @('.docx') $title 'DOCX briefing' $false
  if ($null -eq $text -and $null -eq $docx) { throw 'Missing required briefing: supply one TXT or DOCX file.' }
  $brief=if($null -ne $text){$text}else{$docx}
  Test-Asset $image 'image';Test-Asset $video 'video';Test-Asset $audio 'audio';Test-Asset $pdf 'pdf';Test-Asset $brief ($(if($brief.Extension -eq '.docx'){'docx'}else{'text'}))
  if ($brief.Extension -eq '.txt') {
    $sourceText=[IO.File]::ReadAllText($brief.FullName)
    if ($sourceText.Trim().Length -lt 100) { throw 'TXT briefing is too short to create a usable concept.' }
  } else { $sourceText='' }

  $conceptDir=Join-Path $StageRoot ('concept-' + $id)
  $mediaDir=Join-Path $conceptDir 'media';$derivedDir=Join-Path $conceptDir 'derived'
  New-Item -ItemType Directory -Force -Path $mediaDir,$derivedDir | Out-Null
  $imageName='infographic'+$image.Extension.ToLowerInvariant();$videoName='explainer-video.mp4';$audioName='audio-overview'+$audio.Extension.ToLowerInvariant();$pdfName='presentation.pdf';$briefName='briefing'+$brief.Extension.ToLowerInvariant()
  Copy-Item -LiteralPath $image.FullName -Destination (Join-Path $mediaDir $imageName)
  Copy-Item -LiteralPath $video.FullName -Destination (Join-Path $mediaDir $videoName)
  Copy-Item -LiteralPath $audio.FullName -Destination (Join-Path $mediaDir $audioName)
  Copy-Item -LiteralPath $pdf.FullName -Destination (Join-Path $mediaDir $pdfName)
  Copy-Item -LiteralPath $brief.FullName -Destination (Join-Path $mediaDir $briefName)

  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $HelperPath -Mode image -Src (Join-Path $mediaDir $imageName) -Web (Join-Path $derivedDir 'infographic-1600.jpg') -Thumb (Join-Path $derivedDir 'infographic-thumbnail.jpg')
  if ($LASTEXITCODE -ne 0) { throw 'Image derivative generation failed.' }
  $briefMode=if($brief.Extension -eq '.docx'){'docx'}else{'text'}
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $HelperPath -Mode $briefMode -Src (Join-Path $mediaDir $briefName) -Out (Join-Path $derivedDir 'briefing.html') -Title $title
  if ($LASTEXITCODE -ne 0) { throw 'Readable briefing generation failed.' }
  New-PosterSvg $title (Join-Path $derivedDir 'video-poster.svg')

  if ($brief.Extension -eq '.docx') {
    # Extract plain paragraph text for metadata without requiring Word.
    $z=[System.IO.Compression.ZipFile]::OpenRead($brief.FullName)
    try {$entry=$z.GetEntry('word/document.xml');$reader=New-Object IO.StreamReader($entry.Open());try{[xml]$xml=$reader.ReadToEnd()}finally{$reader.Dispose()}}finally{$z.Dispose()}
    $ns=New-Object Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
    $paragraphs=@();foreach($p in $xml.SelectNodes('//w:body/w:p',$ns)){$parts=$p.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText};$value=($parts -join '').Trim();if($value){$paragraphs+=$value}}
    $sourceText=$paragraphs -join "`r`n"
  }

  $definition=Get-Section $sourceText 'Plain-language definition:'
  if (-not $definition) {$definition=Get-FirstUsefulParagraph $sourceText $title}
  if (-not $definition) {$definition="$title is a generative AI concept described in the supplied briefing."}
  $executive=Get-Section $sourceText 'Why it matters to senior leaders:'
  $worker=Get-Section $sourceText 'Why it matters to knowledge workers:'
  $example=Get-Section $sourceText 'Practical organizational example:'
  $opportunityText=Get-Section $sourceText 'Key opportunities:'
  $riskText=Get-Section $sourceText 'Principal risks or limitations:'
  $misconception=Get-Section $sourceText 'Common misconception:'
  $monitor=Get-Section $sourceText 'What to monitor next:'
  $architectureTest=Get-Section $sourceText 'Architecture test:'
  $summary=Get-FirstSentences $definition 360
  $simple=Get-FirstSentences $definition 260
  $keyTakeaway=if($architectureTest){Get-FirstSentences $architectureTest 320}else{$summary}
  $primaryRisk=if($riskText){Get-FirstSentences $riskText 320}else{''}
  if (-not $executive -and $architectureTest) {$executive=$architectureTest}
  if (-not $worker -and $architectureTest) {$worker=$architectureTest}
  $opportunities=Split-SemicolonList $opportunityText
  $risks=Split-SemicolonList $riskText
  $classification=Get-Classification $sourceText $title
  $categories=Get-Categories $title $sourceText
  $keywords=Get-Keywords $title $definition
  $today=(Get-Date).ToString('yyyy-MM-dd')
  $nextReview=(Get-Date).AddDays(90).ToString('yyyy-MM-dd')
  $imgAlt=if($title -eq 'Generative AI Engineering Ecosystem'){'Infographic comparing Prompt, Context, Harness, Loop, and Graph Engineering as complementary layers in the Generative AI Engineering Ecosystem.'}else{"Infographic overview of $title, including its definition, organizational relevance, opportunities, risks, and monitoring considerations."}

  $imagePath=Join-Path $mediaDir $imageName;$videoPath=Join-Path $mediaDir $videoName;$audioPath=Join-Path $mediaDir $audioName;$pdfPath=Join-Path $mediaDir $pdfName;$briefPath=Join-Path $mediaDir $briefName
  $imageSize=(Get-Item $imagePath).Length;$videoSize=(Get-Item $videoPath).Length;$audioSize=(Get-Item $audioPath).Length;$pdfSize=(Get-Item $pdfPath).Length;$briefSize=(Get-Item $briefPath).Length
  $videoDuration=Get-MediaDurationSeconds $videoPath
  $audioDuration=Get-MediaDurationSeconds $audioPath
  $pdfPages=Get-PdfPageCount $pdfPath
  if ($null -eq $videoDuration -or $videoDuration -le 0) { throw "Unable to determine MP4 duration for $($video.Name)." }
  if ($null -eq $audioDuration -or $audioDuration -le 0) { throw "Unable to determine audio duration for $($audio.Name). Use M4A/WAV or install ffprobe if using another supported audio format." }
  if ($null -eq $pdfPages -or $pdfPages -le 0) { throw "Unable to determine PDF page count for $($pdf.Name)." }
  $media=@(
    [ordered]@{id='infographic';type='image';label='Infographic';src="./media/$imageName";webSrc='./derived/infographic-1600.jpg';thumbnail='./derived/infographic-thumbnail.jpg';mime=(Get-Mime $image.Extension);alt=$imgAlt;displayLabel='Infographic';accessibility=[ordered]@{status='complete';alt=$imgAlt};sizeBytes=$imageSize},
    [ordered]@{id='video';type='video';label='Video';src="./media/$videoName";mime='video/mp4';poster='./derived/video-poster.svg';displayLabel='Watch video';durationSeconds=$videoDuration;accessibility=[ordered]@{status='needs-remediation';captions=$null;transcript=$null};sizeBytes=$videoSize},
    [ordered]@{id='audio';type='audio';label='Audio';src="./media/$audioName";mime=(Get-Mime $audio.Extension);displayLabel='Listen';durationSeconds=$audioDuration;accessibility=[ordered]@{status='needs-remediation';transcript=$null};sizeBytes=$audioSize},
    [ordered]@{id='slides';type='pdf';label='Slides / PDF';src="./media/$pdfName";mime='application/pdf';displayLabel='Presentation';pages=$pdfPages;accessibility=[ordered]@{status='alternative-provided';sourceTagged=$false;accessibleAlternative='./derived/briefing.html';alternativeLabel='The source PDF is treated as untagged unless separately verified. Use the readable concept briefing for equivalent concept-level text.'};sizeBytes=$pdfSize},
    [ordered]@{id='briefing';type=$(if($brief.Extension -eq '.docx'){'docx'}else{'text'});label='Read';src="./media/$briefName";mime=(Get-Mime $brief.Extension);webVersion='./derived/briefing.html';displayLabel='Read';accessibility=[ordered]@{status='complete';accessibleAlternative='./derived/briefing.html'};sizeBytes=$briefSize}
  )
  $examples=@();if($example){$examples+=,[ordered]@{title='Practical organizational example';audience='all';summary=$example}}
  $business=[ordered]@{}
  if($opportunityText){$business.potentialValue=$opportunityText}
  if($example){$business.operationalImpact=$example}
  if($riskText){$business.primaryRisk=$riskText}
  $concept=[ordered]@{
    schemaVersion=4;id=$id;title=$title;shortTitle=$title;summary=$summary;status='active';definition=$definition;
    audiences=[ordered]@{seniorLeaders=$executive;knowledgeWorkers=$worker};
    example=$example;opportunities=$opportunities;risks=$risks;misconception=$misconception;monitor=$monitor;
    classification=$classification;lastReviewed=$today;keywords=$keywords;media=$media;contentVersion='1.0-imported';reviewStatus='needs-review';aliases=@();categories=$categories;relatedConcepts=@();created=$today;lastUpdated=$today;
    review=[ordered]@{status='needs-review';reviewedDate=$today;nextReviewDate=$nextReview};
    simpleExplanation=$simple;executiveTakeaway=$executive;knowledgeWorkerTakeaway=$worker;keyTakeaway=$keyTakeaway;primaryRisk=$primaryRisk;examples=$examples;businessImpact=$business;questionsToAsk=@();relationships=@();prerequisites=@();learnNext=@();commonlyConfusedWith=@();comparisons=@();sources=@()
  }
  $manifest=@($Files | Where-Object {$_.Name -eq 'concept.json'} | Select-Object -First 1)
  if($manifest.Count -gt 0){
    try{$override=Get-Content -Raw -LiteralPath $manifest[0].FullName | ConvertFrom-Json}catch{throw "Optional concept.json is invalid JSON: $($_.Exception.Message)"}
    foreach($prop in $override.PSObject.Properties){if($prop.Name -notin @('id','title','schemaVersion','media')){$concept[$prop.Name]=$prop.Value}}
  }
  [IO.File]::WriteAllText((Join-Path $conceptDir 'concept.json'),($concept|ConvertTo-Json -Depth 20),(New-Object Text.UTF8Encoding($false)))
  $readme="# $title`r`n`r`nImported by the Visular AI Terms / Concepts batch importer from $($ZipFile.Name). Original source files are preserved in media/ under normalized web-safe names.`r`n"
  [IO.File]::WriteAllText((Join-Path $conceptDir 'README.md'),$readme,(New-Object Text.UTF8Encoding($false)))
  return [pscustomobject]@{Id=$id;Title=$title;Zip=$ZipFile;ConceptDir=$conceptDir;Concept=$concept}
}
function Get-Freshness([string]$Date,[int]$ReviewDays,[int]$StaleDays){
  if(-not $Date){return [pscustomobject]@{status='unknown';age=$null}}
  $d=[datetime]::MinValue;if(-not [datetime]::TryParseExact($Date,'yyyy-MM-dd',[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::AssumeUniversal,[ref]$d)){return [pscustomobject]@{status='unknown';age=$null}}
  $age=[Math]::Max(0,[int]((Get-Date).Date-$d.Date).TotalDays);$status=if($age -gt $StaleDays){'stale'}elseif($age -gt $ReviewDays){'review-recommended'}else{'current'}
  return [pscustomobject]@{status=$status;age=$age}
}
function New-CatalogEntry($Concept,$CategoryMap,$Config){
  $thumb='';$image=@($Concept.media|Where-Object{$_.type -eq 'image'}|Select-Object -First 1);if($image.Count){$raw=if($image[0].thumbnail){$image[0].thumbnail}elseif($image[0].webSrc){$image[0].webSrc}else{''};if($raw){$thumb='./data/concepts/'+$Concept.id+'/'+($raw -replace '^\./','')}}
  $labels=@();foreach($cat in @($Concept.categories)){if($CategoryMap.ContainsKey([string]$cat)){$labels += $CategoryMap[[string]$cat]}else{$labels += [string]$cat}}
  $fresh=Get-Freshness $Concept.lastReviewed ([int]$Config.contentFreshness.reviewRecommendedAfterDays) ([int]$Config.contentFreshness.staleAfterDays)
  return [ordered]@{id=$Concept.id;title=$Concept.title;shortTitle=$Concept.shortTitle;summary=$Concept.summary;definition=$Concept.definition;simpleExplanation=$Concept.simpleExplanation;status=$Concept.status;aliases=@($Concept.aliases);keywords=@($Concept.keywords);categories=@($Concept.categories);categoryLabels=$labels;classificationType=$Concept.classification.type;lastReviewed=$Concept.lastReviewed;reviewStatus=$Concept.reviewStatus;contentVersion=$Concept.contentVersion;freshnessStatus=$fresh.status;reviewAgeDays=$fresh.age;relatedConcepts=@($Concept.relatedConcepts);relationships=@($Concept.relationships);prerequisites=@($Concept.prerequisites);learnNext=@($Concept.learnNext);replacedBy=$null;created=$Concept.created;lastUpdated=$Concept.lastUpdated;thumbnail=$thumb;metadata="./data/concepts/$($Concept.id)/concept.json"}
}

Write-Rule 'VISULAR AI TERMS / CONCEPTS - CONCEPT IMPORTER'
if(-not(Test-Path $Inbox)){New-Item -ItemType Directory -Force -Path $Inbox|Out-Null}
$zips=@(Get-ChildItem -LiteralPath $Inbox -File -Filter '*.zip' | Sort-Object Name)
if($zips.Count -eq 0){Write-Host 'No ZIP files were found in concept-import.' -ForegroundColor Yellow;Write-Host 'Copy 1-n concept ZIPs into concept-import and run this script again.';exit 2}
Write-Host "Concept packages found: $($zips.Count)"
$stamp=(Get-Date).ToString('yyyyMMdd-HHmmss')
$stage=Join-Path ([IO.Path]::GetTempPath()) ('VisularAITerms-import-'+$stamp+'-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $stage|Out-Null
$prepared=@()
$plan=$null
$planPaths=@()
try{
  foreach($zip in $zips){
    try{$item=Copy-And-PreparePackage $zip $stage;$prepared+=$item;Write-Host ("[PASS] " + $item.Title) -ForegroundColor Green}
    catch{Write-Host ("[FAIL] " + [IO.Path]::GetFileNameWithoutExtension($zip.Name)) -ForegroundColor Red;Write-Host ('       '+$_.Exception.Message) -ForegroundColor Red;throw 'Validation failed. No application files were changed.'}
  }
  $ids=@($prepared|ForEach-Object{$_.Id});if(($ids|Select-Object -Unique).Count -ne $ids.Count){throw 'Two ZIP files resolve to the same concept ID. No application files were changed.'}
  $existingCatalog=Get-Content -Raw -LiteralPath $CatalogPath | ConvertFrom-Json
  $existingTitles=@($existingCatalog.concepts|ForEach-Object{$_.title.ToLowerInvariant()})
  foreach($item in $prepared){if($existingTitles -contains $item.Title.ToLowerInvariant()){throw "Concept title already exists in the catalog: $($item.Title)"}}

  # Optional batch learning-path plan. The plan is intentionally separate from concept ZIPs because
  # pedagogical sequencing is a curated release decision, not something the importer should invent.
  if(Test-Path $PlanPath){
    try{$plan=Get-Content -Raw -LiteralPath $PlanPath|ConvertFrom-Json}catch{throw "learning-path-plan.json is invalid JSON: $($_.Exception.Message)"}
    if([int]$plan.schemaVersion -ne 1){throw 'learning-path-plan.json schemaVersion must be 1.'}
    $planPaths=@($plan.learningPaths)
    if($planPaths.Count -eq 0){throw 'learning-path-plan.json must contain at least one learningPaths entry.'}
    $knownIds=New-Object 'System.Collections.Generic.HashSet[string]'
    foreach($c in @($existingCatalog.concepts)){[void]$knownIds.Add([string]$c.id)}
    foreach($id in $ids){[void]$knownIds.Add([string]$id)}
    $seenPlanIds=New-Object 'System.Collections.Generic.HashSet[string]'
    foreach($lp in $planPaths){
      $lpId=[string]$lp.id
      if($lpId -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$'){throw "Invalid learning path id in plan: $lpId"}
      if(-not $seenPlanIds.Add($lpId)){throw "Duplicate learning path id in plan: $lpId"}
      if([string]::IsNullOrWhiteSpace([string]$lp.title)){throw "$($lpId): learning path title is required."}
      if(([string]$lp.description).Trim().Length -lt 20){throw "$($lpId): learning path description must be at least 20 characters."}
      if(@('all','senior-leader','knowledge-worker') -notcontains [string]$lp.audience){throw "$($lpId): invalid learning path audience."}
      $refs=@($lp.concepts)
      if($refs.Count -lt 1){throw "$($lpId): learning path requires at least one concept."}
      if(($refs|Select-Object -Unique).Count -ne $refs.Count){throw "$($lpId): learning path contains duplicate concept IDs."}
      foreach($ref in $refs){if(-not $knownIds.Contains([string]$ref)){throw "$($lpId): learning path references missing concept $ref"}}
    }
    Write-Host ("Learning-path plan found: {0} path definition(s)." -f $planPaths.Count) -ForegroundColor Cyan
  } else {
    Write-Host 'No learning-path-plan.json supplied. Learning Path coverage will be checked after import.' -ForegroundColor DarkYellow
  }

  $backupDir=Join-Path $BackupRoot $stamp;New-Item -ItemType Directory -Force -Path $backupDir|Out-Null
  Copy-Item -LiteralPath $CatalogPath -Destination (Join-Path $backupDir 'catalog.json')
  $pathBackup=Join-Path $backupDir 'learning-paths'
  if(Test-Path $LearningPathRoot){Copy-Item -LiteralPath $LearningPathRoot -Destination $pathBackup -Recurse}
  $committed=@()
  try{
    foreach($item in $prepared){
      $contentTarget=Join-Path $ContentRoot $item.Id;$distTarget=Join-Path $DistConceptRoot $item.Id
      Copy-Item -LiteralPath $item.ConceptDir -Destination $contentTarget -Recurse
      Copy-Item -LiteralPath $item.ConceptDir -Destination $distTarget -Recurse
      $committed += $item.Id
    }
    $categories=Get-Content -Raw -LiteralPath $CategoriesPath|ConvertFrom-Json;$config=Get-Content -Raw -LiteralPath $ConfigPath|ConvertFrom-Json
    $categoryMap=@{};foreach($cat in $categories.categories){$categoryMap[[string]$cat.id]=[string]$cat.label}
    $entries=@($existingCatalog.concepts)
    foreach($item in $prepared){$entries += ,(New-CatalogEntry $item.Concept $categoryMap $config)}
    $entries=@($entries|Sort-Object title)
    $browse=@($config.catalog.browseStatuses)
    $catOut=@();foreach($cat in $categories.categories){$count=@($entries|Where-Object{($_.categories -contains $cat.id) -and ($browse -contains $_.status)}).Count;$catOut += ,[ordered]@{id=$cat.id;label=$cat.label;order=$cat.order;count=$count}}
    $catalog=[ordered]@{schemaVersion=4;application=$config.application;browseStatuses=$browse;generatedAt=(Get-Date).ToUniversalTime().ToString('o');categories=$catOut;concepts=$entries}
    [IO.File]::WriteAllText($CatalogPath,($catalog|ConvertTo-Json -Depth 20),(New-Object Text.UTF8Encoding($false)))

    if($plan){
      New-Item -ItemType Directory -Force -Path $LearningPathRoot|Out-Null
      foreach($lp in $planPaths){
        $normalized=[ordered]@{schemaVersion=1;id=[string]$lp.id;title=[string]$lp.title;description=[string]$lp.description;audience=[string]$lp.audience;concepts=@($lp.concepts|ForEach-Object{[string]$_})}
        $target=Join-Path $LearningPathRoot (([string]$lp.id)+'.json')
        [IO.File]::WriteAllText($target,($normalized|ConvertTo-Json -Depth 10),(New-Object Text.UTF8Encoding($false)))
      }
    }
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SyncLearningPathScript
    if($LASTEXITCODE -ne 0){throw 'Learning Path synchronization failed.'}

    $state=[ordered]@{schemaVersion=2;importedAt=(Get-Date).ToUniversalTime().ToString('o');applicationVersion=$config.application.version;concepts=@($prepared|ForEach-Object{[ordered]@{id=$_.Id;title=$_.Title;sourceZip=$_.Zip.Name}});learningPathPlanApplied=[bool]$plan;learningPaths=@($planPaths|ForEach-Object{[string]$_.id})}
    [IO.File]::WriteAllText($StatePath,($state|ConvertTo-Json -Depth 10),(New-Object Text.UTF8Encoding($false)))
  } catch {
    foreach($id in $committed){Remove-Item -LiteralPath (Join-Path $ContentRoot $id) -Recurse -Force -ErrorAction SilentlyContinue;Remove-Item -LiteralPath (Join-Path $DistConceptRoot $id) -Recurse -Force -ErrorAction SilentlyContinue}
    Copy-Item -LiteralPath (Join-Path $backupDir 'catalog.json') -Destination $CatalogPath -Force
    if(Test-Path $LearningPathRoot){Remove-Item -LiteralPath $LearningPathRoot -Recurse -Force}
    if(Test-Path $pathBackup){Copy-Item -LiteralPath $pathBackup -Destination $LearningPathRoot -Recurse}
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SyncLearningPathScript | Out-Null
    throw
  }
  $archive=Join-Path $ImportedArchiveRoot $stamp;New-Item -ItemType Directory -Force -Path $archive|Out-Null
  foreach($item in $prepared){Move-Item -LiteralPath $item.Zip.FullName -Destination (Join-Path $archive $item.Zip.Name)}
  if(Test-Path $PlanPath){Move-Item -LiteralPath $PlanPath -Destination (Join-Path $archive 'learning-path-plan.json')}

  Write-Host ''
  Write-Rule 'IMPORT COMPLETE'
  Write-Host ("Imported concepts: " + $prepared.Count) -ForegroundColor Green
  foreach($item in $prepared){Write-Host ('  + '+$item.Title)}
  Write-Host "Rollback snapshot: backups\$stamp"
  Write-Host "Processed ZIPs: concept-import\imported\$stamp"
  Write-Host ''
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $CoverageScript -NoFail
  if($LASTEXITCODE -ne 0){Write-Host 'Learning Path coverage check could not run.' -ForegroundColor Yellow}
  Write-Host ''
  Write-Host 'The local dist/ application is ready to test.' -ForegroundColor Green
  Write-Host 'GitHub packaging will be blocked if any browsable concept is still outside all Learning Paths.' -ForegroundColor Cyan
  exit 0
} catch {
  Write-Host ''
  Write-Rule 'IMPORT STOPPED'
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host 'The input ZIPs remain in concept-import unless the import completed successfully.'
  exit 1
} finally {
  Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
}
