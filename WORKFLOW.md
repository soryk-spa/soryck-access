# 🚀 Flujo de Trabajo de Git - SorykPass

## **Estructura de Ramas:**

### 📋 **Ramas Principales:**
- `main` - **PRODUCCIÓN** 🔴 (Solo código probado y aprobado)
- `staging` - **STAGING/QA** 🟡 (Para review antes de producción) 
- `develop` - **DESARROLLO** 🟢 (Integración de features)

### 🌿 **Ramas de Feature:**
- `feature/nombre-feature` - Para desarrollar nuevas funcionalidades
- `hotfix/descripcion` - Para arreglos urgentes en producción
- `bugfix/descripcion` - Para corrección de bugs

## **🔄 Flujo de Trabajo:**

### **1. Para Nuevas Features:**
```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Desarrollar...
git add .
git commit -m "feat: descripción de la feature"
git push origin feature/nueva-funcionalidad

# Pull Request: feature/nueva-funcionalidad → develop
```

### **2. Para Review y Testing:**
```bash
# Cuando develop esté listo para testing
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# Testing en staging environment
# Pull Request: staging → main (después de QA)
```

### **3. Para Hotfixes Urgentes:**
```bash
# Desde main para arreglos críticos
git checkout main  
git pull origin main
git checkout -b hotfix/descripcion-problema

# Arreglar el problema...
git add .
git commit -m "hotfix: descripción del arreglo"
git push origin hotfix/descripcion-problema

# Pull Request: hotfix → main (DIRECTO)
# Luego hacer merge a develop y staging también
```

## **📝 Convención de Commits:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `hotfix:` - Arreglo crítico en producción  
- `refactor:` - Refactoring de código
- `docs:` - Documentación
- `style:` - Cambios de formato/estilo
- `test:` - Pruebas
- `chore:` - Mantenimiento

## **🚨 Reglas Importantes:**

### **❌ NUNCA hacer:**
- Push directo a `main` sin Pull Request
- Merge features directamente a `main`  
- Saltarse el review en `staging`

### **✅ SIEMPRE hacer:**
- Pull Request para todos los merges a `main`
- Testing en `staging` antes de producción
- Review de código por otro desarrollador
- Verificar que no se rompan tests

## **🔧 Configurar Environment Variables:**

### **main (producción):**
- DATABASE_URL → Producción
- CLERK keys → Producción  
- APIs → Producción

### **staging:**  
- DATABASE_URL → Staging DB
- CLERK keys → Staging/Test
- APIs → Testing/Staging

### **develop:**
- DATABASE_URL → Development DB
- CLERK keys → Development
- APIs → Development

---

**🎯 Objetivo:** Zero downtime en producción, código siempre probado y revisado.