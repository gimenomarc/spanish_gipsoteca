# Instrucciones para Remover el Archivo ZIP Grande del Historial de Git

El archivo `images/Fotos web-20260107T161024Z-1-001.zip` (254 MB) está en el historial de git y excede el límite de GitHub.

## Solución Rápida (Recomendada)

### Opción 1: Usar git filter-repo (Más fácil y seguro)

1. **Instalar git-filter-repo** (si no lo tienes):
   ```bash
   pip install git-filter-repo
   ```

2. **Remover el archivo del historial**:
   ```bash
   cd C:\Users\gimen\Documents\spanish_gipsoteca
   git filter-repo --path "images/Fotos web-20260107T161024Z-1-001.zip" --invert-paths --force
   ```

3. **Forzar push** (⚠️ ADVERTENCIA: Esto reescribe el historial):
   ```bash
   git push origin --force --all
   ```

### Opción 2: Usar git filter-branch

1. **Hacer commit de cambios pendientes primero**:
   ```bash
   cd C:\Users\gimen\Documents\spanish_gipsoteca
   git add .gitignore
   git commit -m "Agregar .gitignore para excluir imágenes"
   ```

2. **Remover el archivo del historial**:
   ```bash
   $env:FILTER_BRANCH_SQUELCH_WARNING=1
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch 'images/Fotos web-20260107T161024Z-1-001.zip'" --prune-empty --tag-name-filter cat -- --all
   ```

3. **Limpiar referencias**:
   ```bash
   git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. **Forzar push**:
   ```bash
   git push origin --force --all
   ```

## Verificación del .gitignore

Asegúrate de que el `.gitignore` en la raíz del repositorio incluya:

```
images/
**/images/
*.zip
*.ZIP
```

## Nota Importante

⚠️ **ADVERTENCIA**: Forzar push reescribe el historial. Si otros desarrolladores tienen clones del repositorio, necesitarán hacer:
```bash
git fetch origin
git reset --hard origin/main
```
