const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PImage = require('pureimage');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const app = express();
const PORT = process.env.PORT || 3000;

// Variables para control de recursos
let fontLoaded = false;
let fontObj = null;
let bgLoaded = false;
let bgBitmap = null;

// Carga de la fuente Roboto-Bold local desde el proyecto
async function ensureFont() {
  if (fontLoaded) return fontObj;

  const localFontPath = path.join(__dirname, 'Roboto-Bold.ttf');
  console.log('Cargando fuente Roboto-Bold local desde:', localFontPath);
  
  try {
    if (!fs.existsSync(localFontPath)) {
      throw new Error('No se encontró el archivo Roboto-Bold.ttf en la raíz del proyecto.');
    }

    fontObj = PImage.registerFont(localFontPath, 'Roboto');
    fontObj.loadSync();
    fontLoaded = true;
    console.log('Fuente Roboto cargada correctamente de forma local.');
    return fontObj;
  } catch (error) {
    console.error('Error al inicializar la fuente local:', error.message);
    throw error;
  }
}

// Carga de la imagen de fondo local
async function ensureBackground() {
  if (bgLoaded) return bgBitmap;

  const localBgPath = path.join(__dirname, 'banner.png');
  console.log('Cargando imagen de fondo local desde:', localBgPath);
  
  try {
    if (!fs.existsSync(localBgPath)) {
      throw new Error('No se encontró el archivo banner.png en la raíz del proyecto.');
    }
    const stream = fs.createReadStream(localBgPath);
    bgBitmap = await PImage.decodePNGFromStream(stream);
    bgLoaded = true;
    console.log('Imagen de fondo cargada correctamente.');
    return bgBitmap;
  } catch (error) {
    console.error('Error al inicializar la imagen de fondo local:', error.message);
    throw error;
  }
}

// Función auxiliar para dibujar rectángulos con bordes redondeados en Canvas
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Generador de GIF animado de cuenta regresiva
async function generateTimerGif(targetDateStr, gifWidth = 640) {
  await ensureFont();
  await ensureBackground();

  const targetDate = new Date(targetDateStr).getTime();
  
  // Forzamos el aspect ratio 9:1 del banner
  const width = Math.max(320, Math.min(gifWidth, 1440));
  const height = Math.round(width / 9);

  // Escala relativa al diseño de referencia (1440px de ancho)
  const S = width / 1440;

  // Parámetros de dimensionamiento escalados
  const box_w = 53 * S;
  const box_h = 80 * S;
  const box_radius = 8 * S;
  const box_gap = 4 * S;
  const group_gap = 18 * S;
  
  const digit_size = 48 * S;
  const label_size = 14 * S;
  const sep_size = 36 * S;

  const label_y = 42 * S;
  const box_y = 48 * S;
  const digit_y = 106 * S;
  const sep_y = 103 * S;

  // Calculamos el ancho total del temporizador para centrarlo horizontalmente
  // Un grupo: 2 cajas de dígitos y 1 box_gap
  const oneGroupW = 2 * box_w + box_gap;
  // Ancho estimado para separadores ":"
  const sepW = 8 * S; 
  const totalTimerW = 4 * oneGroupW + 3 * group_gap + 3 * sepW;
  const startX = (width - totalTimerW) / 2;

  // Creamos el codificador de GIF de gifenc
  const encoder = new GIFEncoder();
  
  // Generaremos 15 fotogramas (15 segundos de animación, ideal para mantener el archivo liviano)
  const framesCount = 15;

  for (let f = 0; f < framesCount; f++) {
    // Calculamos el tiempo proyectado para este fotograma en particular
    const now = Date.now() + (f * 1000);
    const diff = targetDate - now;

    // Inicializamos el lienzo virtual con pureimage
    const canvas = PImage.make(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Dibujar el fondo del banner utilizando la imagen de fondo cargada en memoria
    ctx.drawImage(bgBitmap, 0, 0, width, height);

    // 2. Calcular los valores de tiempo correspondientes
    let days = 0, hours = 0, mins = 0, secs = 0;
    const isExpired = diff <= 0;

    if (isExpired) {
      // 3. Si expiró, dibujar texto de finalización en el centro
      ctx.fillStyle = '#ffffff';
      const expiredTextSize = 26 * S;
      ctx.font = `${Math.round(expiredTextSize)}px 'Roboto'`;
      
      const textMsg = '¡Arrancó el Mundial!';
      // Estimación del ancho de caracteres
      const textW = textMsg.length * (expiredTextSize * 0.50);
      const textX = (width - textW) / 2;
      const textY = height / 2 + (expiredTextSize * 0.35); // Centrado vertical
      
      ctx.fillText(textMsg, textX, textY);
    } else {
      // 2b. Calcular valores si no ha expirado
      days  = Math.floor(diff / 86400000);
      hours = Math.floor((diff % 86400000) / 3600000);
      mins  = Math.floor((diff % 3600000)  / 60000);
      secs  = Math.floor((diff % 60000)    / 1000);

      const units = [
        { label: 'Días', val: String(days).padStart(2, '0') },
        { label: 'Horas', val: String(hours).padStart(2, '0') },
        { label: 'Minutos', val: String(mins).padStart(2, '0') },
        { label: 'Segundos', val: String(secs).padStart(2, '0') }
      ];

      // 3. Dibujar las cajas y el texto de forma alinedada
      let curX = startX;

      for (let i = 0; i < 4; i++) {
        const u = units[i];

        // Dibujar etiqueta arriba
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.round(label_size)}px 'Roboto'`;
        // Centrar texto del label arriba de la caja (estimamos el ancho de caracteres de Roboto)
        const labelW = u.label.length * (label_size * 0.55);
        const labelOffset = Math.max(0, (oneGroupW - labelW) / 2);
        ctx.fillText(u.label, curX + labelOffset, label_y);

        // Dibujar cajas de dígitos individuales (#333333 con bordes redondeados)
        ctx.fillStyle = '#333333';
        
        // Dígito 0
        drawRoundedRect(ctx, curX, box_y, box_w, box_h, box_radius);
        // Dígito 1
        drawRoundedRect(ctx, curX + box_w + box_gap, box_y, box_w, box_h, box_radius);

        // Dibujar los números dentro de las cajas
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.round(digit_size)}px 'Roboto'`;
        
        // Dígito 0 text (centrado)
        ctx.fillText(u.val.charAt(0), curX + (box_w - (digit_size * 0.55)) / 2 + 1, digit_y);
        // Dígito 1 text (centrado)
        ctx.fillText(u.val.charAt(1), curX + box_w + box_gap + (box_w - (digit_size * 0.55)) / 2 + 1, digit_y);

        curX += oneGroupW;

        // Puntos separadores de tiempo (:)
        if (i < 3) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.round(sep_size)}px 'Roboto'`;
          // Centrar vertical y horizontalmente
          ctx.fillText(':', curX + (group_gap - sepW) / 2, sep_y);
          curX += group_gap;
        }
      }
    }

    // 4. Codificar fotograma en el GIF animado
    const pixelBuffer = canvas.data;
    
    // gifenc requiere cuantizar la paleta de colores para cada frame
    const palette = quantize(pixelBuffer, 256);
    const index = applyPalette(pixelBuffer, palette);

    encoder.writeFrame(index, width, height, {
      palette: palette,
      delay: 1000 // 1 segundo por frame
    });
  }

  encoder.finish();
  return Buffer.from(encoder.bytes());
}

// Ruta principal para servir el GIF dinámico
app.get('/api/countdown', async (req, res) => {
  const targetDateStr = req.query.end || '2026-06-11T19:00:00Z';
  const width = parseInt(req.query.w, 10) || 640; // Default: 640px para optimizar consumo y rendimiento (338KB vs 1MB)

  try {
    const gifBuffer = await generateTimerGif(targetDateStr, width);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.setHeader('Content-Type', 'image/gif');
    res.send(gifBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando el contador.');
  }
});

// Página demo para visualización en el navegador
app.get('/', (req, res) => {
  const target = req.query.end || new Date(Date.now() + 86400000 * 7).toISOString();
  
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Email Countdown Preview</title>
      <style>
        body { background: #111111; color: white; font-family: sans-serif; text-align: center; padding: 50px; }
        .preview-box { background: #222; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        h1 { font-size: 1.5rem; margin-bottom: 20px; color: #4dadf7; }
        img { border: 2px solid #333; border-radius: 5px; }
        p { color: #888; font-size: 0.9rem; margin-top: 15px; }
        code { background: #000; padding: 4px 8px; border-radius: 4px; color: #ff8787; font-family: monospace; }
      </style>
    </head>
    <body>
      <h1>⏱️ Generador de Cuenta Regresiva para Email</h1>
      <div class="preview-box">
        <img src="/api/countdown?end=${encodeURIComponent(target)}" alt="Email Countdown Timer" />
        <p>Esta es una imagen GIF dinámica generada en tiempo real.</p>
        <p>Código para insertar en tu email HTML:</p>
        <code>&lt;img src="https://email-timer-serverless.vercel.app/api/countdown?end=${target}" alt="Contador" /&gt;</code>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor local corriendo en http://localhost:${PORT}`);
});
