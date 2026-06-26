# Copy client.ts artifact first, then:
[System.IO.File]::WriteAllText(".\src\client.ts", (Get-Clipboard -Raw), $e)