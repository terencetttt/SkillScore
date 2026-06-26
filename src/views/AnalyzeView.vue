# Copy AnalyzeView.vue artifact first, then:
[System.IO.File]::WriteAllText(".\src\views\AnalyzeView.vue", (Get-Clipboard -Raw), $e)