# Script para corregir .gitignore y permitir hero-bg.jpg

$gitignorePath = Join-Path (Split-Path $PSScriptRoot -Parent) ".gitignore"

if (Test-Path $gitignorePath) {
    Write-Host "📝 Modificando .gitignore..." -ForegroundColor Yellow
    
    $content = Get-Content $gitignorePath -Raw
    
    # Eliminar la línea **/images/
    $content = $content -replace '\*\*/images/', ''
    
    # Añadir excepción para hero si no existe
    if ($content -notmatch '!app/public/images/hero/') {
        $content = $content -replace 'app/public/images/thumbnails/', "app/public/images/thumbnails/`n# Mantener hero - imágenes necesarias para el sitio (excepción)`n!app/public/images/hero/"
    }
    
    Set-Content -Path $gitignorePath -Value $content -NoNewline
    
    Write-Host "✅ .gitignore modificado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora ejecuta estos comandos desde la raíz del repositorio:" -ForegroundColor Cyan
    Write-Host "  git add .gitignore" -ForegroundColor White
    Write-Host "  git add app/public/images/hero/hero-bg.jpg" -ForegroundColor White
    Write-Host "  git commit -m 'Añadir imagen hero y corregir gitignore'" -ForegroundColor White
    Write-Host "  git push" -ForegroundColor White
} else {
    Write-Host "❌ No se encontró .gitignore en: $gitignorePath" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde la carpeta app/" -ForegroundColor Yellow
}
