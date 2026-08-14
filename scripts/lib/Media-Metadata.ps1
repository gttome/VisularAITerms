Set-StrictMode -Version 2.0

function Read-UInt32BE([System.IO.BinaryReader]$Reader) {
  $bytes = $Reader.ReadBytes(4)
  if ($bytes.Length -ne 4) { throw 'Unexpected end of file while reading UInt32.' }
  [Array]::Reverse($bytes)
  return [BitConverter]::ToUInt32($bytes, 0)
}

function Read-UInt64BE([System.IO.BinaryReader]$Reader) {
  $bytes = $Reader.ReadBytes(8)
  if ($bytes.Length -ne 8) { throw 'Unexpected end of file while reading UInt64.' }
  [Array]::Reverse($bytes)
  return [BitConverter]::ToUInt64($bytes, 0)
}

function Read-FourCC([System.IO.BinaryReader]$Reader) {
  $bytes = $Reader.ReadBytes(4)
  if ($bytes.Length -ne 4) { throw 'Unexpected end of file while reading box type.' }
  return [Text.Encoding]::ASCII.GetString($bytes)
}

function Read-IsoBoxHeader([System.IO.BinaryReader]$Reader, [long]$Limit) {
  [long]$start = $Reader.BaseStream.Position
  if (($Limit - $start) -lt 8) { return $null }
  [UInt64]$size = Read-UInt32BE $Reader
  $type = Read-FourCC $Reader
  [long]$headerSize = 8
  if ($size -eq 1) {
    $size = Read-UInt64BE $Reader
    $headerSize = 16
  } elseif ($size -eq 0) {
    $size = [UInt64]($Limit - $start)
  }
  if ($size -lt [UInt64]$headerSize) { throw "Invalid ISO media box '$type'." }
  [UInt64]$endUnsigned = [UInt64]$start + $size
  if ($endUnsigned -gt [UInt64]$Limit) { throw "ISO media box '$type' extends beyond the file boundary." }
  return [pscustomobject]@{
    Type = $type
    Start = $start
    ContentStart = $start + $headerSize
    End = [long]$endUnsigned
  }
}

function Get-IsoBmffDurationSeconds([string]$Path) {
  $stream = [IO.File]::OpenRead($Path)
  try {
    $reader = New-Object IO.BinaryReader($stream)
    try {
      [long]$fileEnd = $stream.Length
      while (($stream.Position + 8) -le $fileEnd) {
        $rootBox = Read-IsoBoxHeader $reader $fileEnd
        if ($null -eq $rootBox) { break }
        if ($rootBox.Type -eq 'moov') {
          $stream.Position = $rootBox.ContentStart
          while (($stream.Position + 8) -le $rootBox.End) {
            $child = Read-IsoBoxHeader $reader $rootBox.End
            if ($null -eq $child) { break }
            if ($child.Type -eq 'mvhd') {
              $stream.Position = $child.ContentStart
              $version = $reader.ReadByte()
              [void]$reader.ReadBytes(3) # flags
              if ($version -eq 1) {
                [void](Read-UInt64BE $reader) # creation time
                [void](Read-UInt64BE $reader) # modification time
                [UInt32]$timescale = Read-UInt32BE $reader
                [UInt64]$duration = Read-UInt64BE $reader
              } else {
                [void](Read-UInt32BE $reader) # creation time
                [void](Read-UInt32BE $reader) # modification time
                [UInt32]$timescale = Read-UInt32BE $reader
                [UInt64]$duration = Read-UInt32BE $reader
              }
              if ($timescale -gt 0 -and $duration -gt 0) {
                return [Math]::Round(([double]$duration / [double]$timescale), 2)
              }
              return $null
            }
            $stream.Position = $child.End
          }
        }
        $stream.Position = $rootBox.End
      }
    } finally {
      $reader.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
  return $null
}

function Get-WavDurationSeconds([string]$Path) {
  $stream = [IO.File]::OpenRead($Path)
  try {
    $reader = New-Object IO.BinaryReader($stream)
    try {
      if ([Text.Encoding]::ASCII.GetString($reader.ReadBytes(4)) -ne 'RIFF') { return $null }
      [void]$reader.ReadUInt32()
      if ([Text.Encoding]::ASCII.GetString($reader.ReadBytes(4)) -ne 'WAVE') { return $null }
      $byteRate = 0L
      $dataSize = 0L
      while (($stream.Position + 8) -le $stream.Length) {
        $chunk = [Text.Encoding]::ASCII.GetString($reader.ReadBytes(4))
        [UInt32]$size = $reader.ReadUInt32()
        [long]$dataStart = $stream.Position
        if ($chunk -eq 'fmt ' -and $size -ge 16) {
          [void]$reader.ReadUInt16(); [void]$reader.ReadUInt16(); [void]$reader.ReadUInt32()
          $byteRate = [long]$reader.ReadUInt32()
        } elseif ($chunk -eq 'data') {
          $dataSize = [long]$size
        }
        $next = $dataStart + [long]$size
        if (($size % 2) -eq 1) { $next++ }
        if ($next -gt $stream.Length) { break }
        $stream.Position = $next
        if ($byteRate -gt 0 -and $dataSize -gt 0) { break }
      }
      if ($byteRate -gt 0 -and $dataSize -gt 0) { return [Math]::Round(([double]$dataSize / [double]$byteRate), 2) }
    } finally { $reader.Dispose() }
  } finally { $stream.Dispose() }
  return $null
}

function Get-MediaDurationSeconds([string]$Path) {
  $ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
  if ($null -ne $ffprobe) {
    try {
      $ffprobeExe = [string]$ffprobe.Path
      $out = & $ffprobeExe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $Path 2>$null
      $value = 0.0
      if ([double]::TryParse(([string]$out).Trim(), [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$value) -and $value -gt 0) {
        return [Math]::Round($value, 2)
      }
    } catch {}
  }
  $ext = [IO.Path]::GetExtension($Path).ToLowerInvariant()
  try {
    if ($ext -in @('.mp4','.m4a','.mov','.m4v')) { return Get-IsoBmffDurationSeconds $Path }
    if ($ext -eq '.wav') { return Get-WavDurationSeconds $Path }
  } catch {}
  return $null
}

function Get-PdfPageCount([string]$Path) {
  $pdfinfo = Get-Command pdfinfo -ErrorAction SilentlyContinue
  if ($null -ne $pdfinfo) {
    try {
      $pdfinfoExe = [string]$pdfinfo.Path
      $out = & $pdfinfoExe $Path 2>$null
      $match = [regex]::Match(($out -join "`n"), '(?m)^Pages:\s+(\d+)\s*$')
      if ($match.Success) { return [int]$match.Groups[1].Value }
    } catch {}
  }

  try {
    $bytes = [IO.File]::ReadAllBytes($Path)
    $latin1 = [Text.Encoding]::GetEncoding(28591).GetString($bytes)
    $pageTreeCounts = New-Object System.Collections.Generic.List[int]
    foreach ($objectMatch in [regex]::Matches($latin1, '(?s)\b\d+\s+\d+\s+obj\b(.*?)endobj')) {
      $body = $objectMatch.Groups[1].Value
      if ($body -match '/Type\s*/Pages\b') {
        $countMatch = [regex]::Match($body, '/Count\s+(\d+)\b')
        if ($countMatch.Success) { $pageTreeCounts.Add([int]$countMatch.Groups[1].Value) }
      }
    }
    if ($pageTreeCounts.Count -gt 0) { return ($pageTreeCounts | Measure-Object -Maximum).Maximum }
    $pageMatches = [regex]::Matches($latin1, '/Type\s*/Page(?!s)\b')
    if ($pageMatches.Count -gt 0) { return [int]$pageMatches.Count }
  } catch {}
  return $null
}

function Get-ConceptMediaMetadata([string]$MediaPath, [string]$Type) {
  switch ($Type) {
    'video' { return [ordered]@{ durationSeconds = (Get-MediaDurationSeconds $MediaPath) } }
    'audio' { return [ordered]@{ durationSeconds = (Get-MediaDurationSeconds $MediaPath) } }
    'pdf'   { return [ordered]@{ pages = (Get-PdfPageCount $MediaPath) } }
    default { return [ordered]@{} }
  }
}
