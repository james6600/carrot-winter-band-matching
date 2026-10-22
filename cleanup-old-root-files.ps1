$patterns = @('page.tsx','route.ts','page (*).tsx','route (*).ts')
foreach ($pattern in $patterns) {
  Get-ChildItem -Path . -File -Filter $pattern -ErrorAction SilentlyContinue | Remove-Item -Force
}
Write-Host 'Old root-level duplicate page/route files removed.'
