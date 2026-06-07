# Servidor de Cuenta Regresiva para Email (Email Countdown Timer)

Este proyecto te permite generar imágenes GIF animadas de cuenta regresiva en tiempo real para insertarlas directamente en tus campañas de email marketing (Newsletters, etc.) utilizando código **100% puro de Node.js (JavaScript)**, sin dependencias nativas complejas.

---

## 🧐 ¿Por qué no se puede hacer con HTML/JS tradicional o Google Apps Script?

1. **Sin JavaScript en Emails**: Los clientes de correo (Gmail, Outlook, Apple Mail, etc.) bloquean la ejecución de JavaScript por seguridad. Por lo tanto, no se puede meter un contador interactivo clásico.
2. **Sin animaciones complejas**: CSS Keyframes y transiciones no tienen soporte estable en la mayoría de clientes de correo.
3. **Limitación de Google Apps Script (GAS)**: 
   * **GAS Web Apps** siempre devuelven una redirección HTTP 302 redirigiendo el tráfico a una URL temporal en `googleusercontent.com`. Los clientes de correo bloquean estas redirecciones en las etiquetas `<img>` o guardan en caché agresivamente la respuesta, lo que hace que la imagen no cargue o nunca se actualice.
   * GAS no cuenta con motores nativos de renderizado gráfico de imágenes (como Canvas) para compilar GIFs cuadro por cuadro de forma rápida.

### 💡 La solución estándar de la industria:
Cargar una **imagen GIF dinámica** alojada en un servidor externo. Al abrir el correo, el cliente hace una petición HTTP al servidor, el cual calcula el tiempo restante en ese instante exacto, dibuja 30 fotogramas (uno por cada segundo) y transmite el GIF animado resultante.

---

## 🚀 Cómo probarlo localmente

1. Abre tu terminal y ve a la carpeta del proyecto:
   ```bash
   cd C:\Users\catorres\Documents\CONTADOR\email-timer-serverless
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
4. Abre tu navegador e ingresa a:
   [http://localhost:3000](http://localhost:3000)
   * Verás la interfaz gráfica de previsualización del contador.
   * Puedes cambiar la fecha objetivo agregando la query `?end=YYYY-MM-DDTHH:MM:SSZ` a la URL. Por ejemplo:
     `http://localhost:3000/?end=2026-06-12T17:30:00Z`

---

## 🌐 Cómo subirlo gratis a internet (Vercel)

Vercel te permite hospedar esta función serverless de manera 100% gratuita y sin servidores fijos que mantener.

1. Instala el CLI de Vercel (si no lo tienes):
   ```bash
   npm install -g vercel
   ```
2. Ejecuta el comando de deploy dentro de esta carpeta:
   ```bash
   vercel
   ```
3. Sigue los pasos de configuración rápidos (iniciar sesión, dar permisos, etc.).
4. Vercel te dará una URL pública (ej. `https://email-timer-serverless-xxx.vercel.app`).
5. **Listo para tu Email**: Inserta el contador en tu plantilla HTML de correo usando la URL de tu proyecto en Vercel:
   ```html
   <img src="https://tu-proyecto.vercel.app/api/countdown?end=2026-06-11T17:30:00Z" alt="Contador Mundial" width="320" height="80" />
   ```

---

## 🛠️ Detalles de la Implementación (Código)
* **`pureimage`**: Una librería de dibujo que emula la API del Canvas de HTML5 en Node.js, implementada enteramente en JavaScript, evitando problemas de compilación local en Windows.
* **`gifenc`**: Un encoder de GIF ultra-rápido y liviano en JS puro para compilar la animación sin herramientas externas.
* **Headers No-Cache**: El servidor envía las cabeceras HTTP necesarias para evitar que Gmail y otros clientes guarden el GIF en caché (ej. `Cache-Control: no-store, no-cache...`), forzando a que la imagen se recalcule y actualice cada vez que el usuario abra o recargue el correo.
