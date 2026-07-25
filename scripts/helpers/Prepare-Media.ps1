param(
  [Parameter(Mandatory=$true)][ValidateSet('image','docx')][string]$Mode,
  [Parameter(Mandatory=$true)][string]$Src,
  [string]$Web,
  [string]$Thumb,
  [string]$Out,
  [string]$Title = 'Concept briefing'
)
$ErrorActionPreference='Stop'
function Ensure-Parent([string]$File){$parent=Split-Path -Parent $File;if($parent -and -not (Test-Path $parent)){New-Item -ItemType Directory -Force -Path $parent|Out-Null}}
function Save-Jpeg([System.Drawing.Image]$Image,[string]$Target,[int]$MaxW,[int]$MaxH){
  $ratio=[Math]::Min($MaxW/$Image.Width,$MaxH/$Image.Height);$ratio=[Math]::Min(1.0,$ratio);$w=[Math]::Max(1,[int]($Image.Width*$ratio));$h=[Math]::Max(1,[int]($Image.Height*$ratio));
  $bmp=New-Object System.Drawing.Bitmap($w,$h);$g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic;$g.DrawImage($Image,0,0,$w,$h);Ensure-Parent $Target;$bmp.Save($Target,[System.Drawing.Imaging.ImageFormat]::Jpeg);$g.Dispose();$bmp.Dispose()
}
if($Mode -eq 'image'){
  if(-not $Web -or -not $Thumb){throw 'Web and Thumb outputs are required for image mode.'}
  Add-Type -AssemblyName System.Drawing
  $img=[System.Drawing.Image]::FromFile($Src);try{Save-Jpeg $img $Web 1600 1600;Save-Jpeg $img $Thumb 480 320}finally{$img.Dispose()};exit 0
}
if(-not $Out){throw 'Out is required for docx mode.'}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[System.IO.Compression.ZipFile]::OpenRead($Src)
try{$entry=$zip.GetEntry('word/document.xml');if(-not $entry){throw 'word/document.xml not found'};$reader=New-Object IO.StreamReader($entry.Open());try{[xml]$xml=$reader.ReadToEnd()}finally{$reader.Dispose()}}finally{$zip.Dispose()}
$ns=New-Object System.Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
function Enc([string]$Text){return [System.Net.WebUtility]::HtmlEncode($Text)}
$chunks=New-Object System.Collections.Generic.List[string];$inList=$false;$body=$xml.SelectSingleNode('//w:body',$ns)
foreach($child in $body.ChildNodes){
  if($child.LocalName -eq 'p'){$texts=$child.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText};$text=($texts -join '').Trim();if(-not $text){continue};$styleNode=$child.SelectSingleNode('./w:pPr/w:pStyle',$ns);$numNode=$child.SelectSingleNode('./w:pPr/w:numPr',$ns);$safe=Enc $text
    if($text.ToLower().Contains($Title.ToLower()) -and ($text -match '^[0-9]' -or $text -match '#1')){if($inList){$chunks.Add('</ul>');$inList=$false};$chunks.Add('<h2>'+ (Enc $Title) +'</h2>');continue}
    $prefixes=@('Plain-language definition:','Why it matters to senior leaders:','Why it matters to knowledge workers:','Practical organizational example:','Key opportunities:','Principal risks or limitations:','Common misconception:','What to monitor next:')
    $matched=$false;foreach($prefix in $prefixes){if($text.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)){if($inList){$chunks.Add('</ul>');$inList=$false};$rest=$text.Substring($prefix.Length).Trim();$chunks.Add('<h3>'+ (Enc $prefix.TrimEnd(':')) +'</h3><p>'+ (Enc $rest) +'</p>');$matched=$true;break}};if($matched){continue}
    if($numNode){if(-not $inList){$chunks.Add('<ul>');$inList=$true};$chunks.Add("<li>$safe</li>");continue}
    if($inList){$chunks.Add('</ul>');$inList=$false}
    $style='';if($styleNode){$style=$styleNode.GetAttribute('val','http://schemas.openxmlformats.org/wordprocessingml/2006/main')}
    if($style -match '^Heading([1-4])$'){$level=[Math]::Max(2,[Math]::Min(4,[int]$Matches[1]));$chunks.Add("<h$level>$safe</h$level>")}else{$chunks.Add("<p>$safe</p>")}
  } elseif($child.LocalName -eq 'tbl'){
    if($inList){$chunks.Add('</ul>');$inList=$false};$rows=New-Object System.Collections.Generic.List[string]
    foreach($tr in $child.SelectNodes('./w:tr',$ns)){$cells=New-Object System.Collections.Generic.List[string];foreach($tc in $tr.SelectNodes('./w:tc',$ns)){$parts=$tc.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText};$cells.Add('<td>'+(Enc (($parts -join ' ').Trim()))+'</td>')};if($cells.Count){$rows.Add('<tr>'+($cells -join '')+'</tr>')}}
    if($rows.Count){$chunks.Add('<table><tbody>'+($rows -join '')+'</tbody></table>')}
  }
}
if($inList){$chunks.Add('</ul>')}
Ensure-Parent $Out;$safeTitle=Enc $Title;$html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+$safeTitle+' - Briefing</title></head><body><article class="briefing-document">'+($chunks -join '')+'</article></body></html>'
[IO.File]::WriteAllText($Out,$html,(New-Object Text.UTF8Encoding($false)))
