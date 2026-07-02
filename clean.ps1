# Tour de ONE80 - Clean Everything
# Usage: .\clean.ps1

docker-compose down -v
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Write-Host "Cleaned!"
