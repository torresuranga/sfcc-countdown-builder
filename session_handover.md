# Resumen de Entrega de Sesión (Session Handover)

**Proyecto**: SFCC Countdown Builder & Customizer  
**Repositorio**: [torresuranga/sfcc-countdown-builder](https://github.com/torresuranga/sfcc-countdown-builder)  
**Fecha de corte**: 7 de Junio de 2026  

Este documento consolida todo el contexto del proyecto, arquitectura técnica, decisiones de diseño y estado de despliegue para permitir retomar el desarrollo sin pérdida de continuidad en el futuro.

---

## 1. Ficha Técnica y Archivos Clave
* **Workspace Local**: `c:\Users\catorres\Documents\CONTADOR`
* **Constructor Web (Frontend)**: [demo/customizer.html](file:///c:/Users/catorres/Documents/CONTADOR/demo/customizer.html) (HTML, CSS y JS autocontenidos).
* **Servidor Local de Desarrollo**: Corriendo en `http://localhost:8080/demo/customizer.html` (Node `http-server`).
* **Enlace de Producción**: `https://torresuranga.github.io/sfcc-countdown-builder/demo/customizer.html` (GitHub Pages).

---

## 2. Configuración de Seguridad y Credenciales
Para mitigar riesgos al publicar el repositorio en modalidad **pública** en GitHub, añadimos un candado de acceso del lado del cliente:
* **Código de Acceso**: **`Solu2026`**
* **Constante en el código**: Variable `ACCESS_CODE` al principio del bloque `<script>`.
* **Persistencia**: Se almacena la autorización en `sessionStorage` para no volver a pedir la clave al recargar la pestaña del navegador activa. Se solicita de nuevo al abrir una pestaña incógnito o nueva ventana.

---

## 3. Estado de Funcionalidades (v1.6)
El customizador se encuentra en su versión estable **v1.6** con los siguientes módulos operativos:

1. **Presets de Campaña**:
   * *Mundial Dexter* (Default), *Hot Sale Naranja*, *Black Friday*, *Cyber Neon*.
   * Botón para restablecer toda la configuración y el `localStorage` a los valores de fábrica.
2. **Personalización en Tiempo Real**:
   * Modificación de textos, fechas límite (se convierten a ISO UTC automáticamente), UTMs de campaña, colores de reloj y etiquetas.
   * Carga de imágenes locales para previsualizar banners de fondo mediante `FileReader`.
3. **Simulador de Dispositivo**:
   * Controles para alternar la vista en anchos Desktop (100%), Tablet (768px) y Mobile (375px) dentro de un iframe aislado.
4. **Generador y Exportador de Código**:
   * Copiado al portapapeles con animación de éxito (1.8s) y descarga física del archivo `.html` modificado.
   * Resaltador de sintaxis HTML en tiempo real corregido (sin duplicación de etiquetas).
5. **Tema Claro / Oscuro**:
   * Switch en la cabecera para alternar estilos. En modo claro, los textos se tornan oscuros y legibles. La preferencia persiste en `localStorage`.
6. **Widget de Branding Dinámico (Cabecera)**:
   * Logo de **Solu** centrado. En modo oscuro, se coloca una pastilla blanca detrás del logo para hacer legible su texto azul marino; en modo claro, se vuelve transparente para evitar superposiciones.
7. **Simulador de Expiración**:
   * Switch "Simular Estado Expirado" que inyecta una fecha en el pasado (`1970-01-01`) para previsualizar al instante el texto fallback en el iframe sin alterar la fecha final del código exportable.

---

## 4. Estado del Repositorio Git
* **Estructura de Git**: Se configuró para seguir únicamente la carpeta `demo/` y los archivos de configuración asociados. 
* **Carpetas Locales Ignoradas** (mediante `.gitignore`):
  - `email-timer-serverless/`
  - `sfcc-component/`
  - `sfcc-content-asset/`
* **Rama Principal**: `main` (código commiteado y sincronizado al 100%).

---

## 5. Instrucciones para Continuar en el Futuro
1. **Correr Servidor Local**: Ejecutar `npx http-server -p 8080` en la raíz de `c:\Users\catorres\Documents\CONTADOR`.
2. **Modificar Clave**: Editar la constante `ACCESS_CODE` en [demo/customizer.html](file:///c:/Users/catorres/Documents/CONTADOR/demo/customizer.html).
3. **Cambiar Estilos del Componente Generado**: Las plantillas de código se generan dinámicamente mediante las funciones `generateCodeWithTitle(config)` y `generateCodeClean(config)` en el archivo HTML.
