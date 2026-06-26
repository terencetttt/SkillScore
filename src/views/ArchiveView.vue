# Copy ArchiveView.vue artifact first, then:
[System.IO.File]::WriteAllText(".\src\views\ArchiveView.vue", (Get-Clipboard -Raw), $e)