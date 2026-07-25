param(
  [int]$Port = 4173,
  [string]$Root = (Join-Path $PSScriptRoot '..\dist')
)

$ErrorActionPreference = 'Stop'
$Root = [System.IO.Path]::GetFullPath($Root)
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.svg'='image/svg+xml';
  '.mp4'='video/mp4'; '.m4a'='audio/mp4'; '.mp3'='audio/mpeg'; '.wav'='audio/wav'; '.vtt'='text/vtt; charset=utf-8'; '.pdf'='application/pdf'; '.docx'='application/vnd.openxmlformats-officedocument.wordprocessingml.document'; '.txt'='text/plain; charset=utf-8'
}

function Write-Ascii([System.IO.Stream]$Stream, [string]$Text) {
  $bytes = [Text.Encoding]::ASCII.GetBytes($Text)
  $Stream.Write($bytes, 0, $bytes.Length)
}

function Write-SimpleResponse(
  [System.IO.Stream]$Stream,
  [string]$Method,
  [int]$StatusCode,
  [string]$StatusText,
  [string]$ContentType,
  [byte[]]$Body,
  [string[]]$ExtraHeaders = @()
) {
  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`n"
  foreach ($extra in $ExtraHeaders) { $header += "$extra`r`n" }
  $header += "Connection: close`r`n`r`n"
  Write-Ascii $Stream $header
  if ($Method -ne 'HEAD' -and $Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
}


function Test-ExpectedClientDisconnect([System.Exception]$Exception) {
  $current = $Exception
  while ($null -ne $current) {
    if ($current -is [System.Net.Sockets.SocketException]) {
      $code = $current.SocketErrorCode
      if ($code -in @([System.Net.Sockets.SocketError]::ConnectionReset,[System.Net.Sockets.SocketError]::ConnectionAborted,[System.Net.Sockets.SocketError]::Shutdown,[System.Net.Sockets.SocketError]::NotConnected)) { return $true }
    }
    if ($current -is [System.ObjectDisposedException]) { return $true }
    if ($current -is [System.IO.IOException]) {
      $message = [string]$current.Message
      if ($message -match 'transport connection|forcibly closed|aborted by the software|broken pipe|closed by the remote host') { return $true }
    }
    $current = $current.InnerException
  }
  return $false
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Visular AI Terms / Concepts v0.5.1" -ForegroundColor Cyan
Write-Host "Serving: $Root"
Write-Host "Open:    http://localhost:$Port/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

      $headers = @{}
      while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line -or $line -eq '') { break }
        $separator = $line.IndexOf(':')
        if ($separator -gt 0) {
          $name = $line.Substring(0, $separator).Trim().ToLowerInvariant()
          $value = $line.Substring($separator + 1).Trim()
          $headers[$name] = $value
        }
      }

      $parts = $requestLine.Split(' ')
      if ($parts.Length -lt 2) { continue }
      $method = $parts[0].ToUpperInvariant()
      $rawPath = $parts[1]

      if ($method -ne 'GET' -and $method -ne 'HEAD') {
        $body = [Text.Encoding]::UTF8.GetBytes('405 - Method not allowed')
        Write-SimpleResponse $stream $method 405 'Method Not Allowed' 'text/plain; charset=utf-8' $body @('Allow: GET, HEAD')
        $stream.Flush()
        continue
      }

      $urlPath = [Uri]::UnescapeDataString(($rawPath -split '\?')[0]).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($urlPath)) { $urlPath = 'index.html' }

      $relativePath = $urlPath -replace '/', [IO.Path]::DirectorySeparatorChar
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $relativePath))
      $insideRoot = $candidate.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)

      if (-not $insideRoot -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        $body = [Text.Encoding]::UTF8.GetBytes('404 - File not found')
        Write-SimpleResponse $stream $method 404 'Not Found' 'text/plain; charset=utf-8' $body @('Cache-Control: no-cache')
        $stream.Flush()
        continue
      }

      $file = Get-Item -LiteralPath $candidate
      [long]$length = $file.Length
      $ext = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }

      [long]$start = 0
      [long]$end = [Math]::Max(0, $length - 1)
      $isPartial = $false
      $rangeInvalid = $false

      if ($headers.ContainsKey('range') -and $headers['range'] -match '^bytes=(\d*)-(\d*)$') {
        $startText = $Matches[1]
        $endText = $Matches[2]

        if ($startText -eq '' -and $endText -eq '') {
          $rangeInvalid = $true
        } elseif ($startText -eq '') {
          [long]$suffixLength = [long]$endText
          if ($suffixLength -le 0) {
            $rangeInvalid = $true
          } else {
            $start = [Math]::Max([long]0, $length - $suffixLength)
            $end = [Math]::Max([long]0, $length - 1)
            $isPartial = $true
          }
        } else {
          $start = [long]$startText
          if ($endText -ne '') { $end = [Math]::Min([long]$endText, $length - 1) }
          else { $end = $length - 1 }
          if ($start -ge $length -or $start -gt $end) { $rangeInvalid = $true }
          else { $isPartial = $true }
        }
      }

      if ($rangeInvalid) {
        $header = "HTTP/1.1 416 Range Not Satisfiable`r`nContent-Range: bytes */$length`r`nAccept-Ranges: bytes`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
        Write-Ascii $stream $header
        $stream.Flush()
        continue
      }

      [long]$contentLength = if ($isPartial) { $end - $start + 1 } else { $length }
      $status = if ($isPartial) { '206 Partial Content' } else { '200 OK' }
      $header = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $contentLength`r`nAccept-Ranges: bytes`r`nCache-Control: no-cache`r`n"
      if ($isPartial) { $header += "Content-Range: bytes $start-$end/$length`r`n" }
      $header += "Connection: close`r`n`r`n"
      Write-Ascii $stream $header

      if ($method -ne 'HEAD' -and $contentLength -gt 0) {
        $fileStream = [System.IO.File]::Open($candidate, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
        try {
          if ($start -gt 0) { [void]$fileStream.Seek($start, [IO.SeekOrigin]::Begin) }
          $buffer = New-Object byte[] 65536
          [long]$remaining = $contentLength
          while ($remaining -gt 0) {
            $toRead = [int][Math]::Min([long]$buffer.Length, $remaining)
            $read = $fileStream.Read($buffer, 0, $toRead)
            if ($read -le 0) { break }
            $stream.Write($buffer, 0, $read)
            $remaining -= $read
          }
        } finally {
          $fileStream.Dispose()
        }
      }

      $stream.Flush()
    } catch {
      if (-not (Test-ExpectedClientDisconnect $_.Exception)) { Write-Warning $_.Exception.Message }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
