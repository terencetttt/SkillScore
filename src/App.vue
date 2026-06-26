# Copy App.vue artifact first, then:
[System.IO.File]::WriteAllText(".\src\App.vue", (Get-Clipboard -Raw), $e)