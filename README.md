# NutriPatas 🐾

Sitio web demostrativo de una tienda de nutrición natural para mascotas.
Proyecto del curso **Modelamiento Predictivo de Datos**: las pantallas se diseñaron con Google Stitch y aquí se unificaron en un sitio navegable con HTML + CSS + JavaScript, publicable en GitHub Pages.

> Es una **demostración**: no hay servidor, no se cobra nada y los datos se guardan solo en el navegador de quien visita la página.

## Estructura de archivos

```
├── index.html            Inicio: mascota activa, promociones, categorías y productos recomendados
├── detalleproducto.html  Detalle de producto (se llena según ?id=...)
├── cliente.html          Perfil de la mascota (crear / editar)
├── pago.html             Carrito y proceso de pago
├── style.css             Estilos compartidos (columna tipo app, hojas inferiores, avisos)
├── script.js             Lógica compartida de todas las páginas
└── tailwind-config.js    Tema de diseño exportado de Stitch (colores, tipografías, espaciados)
```

Todos los archivos están en la raíz del repositorio, así que basta con subirlos tal cual.

## Qué se puede hacer en la demo

| Página | Funcionalidad |
|---|---|
| **Inicio** | Cambiar de mascota, buscar productos, filtrar por categoría, aplicar cupones desde los banners, añadir productos al carrito con un toque |
| **Detalle** | Galería deslizable, elegir formato y cantidad, plan de suscripción (-10%), favoritos, guía de porción según el peso de la mascota, productos relacionados |
| **Perfil de mascota** | Elegir especie, dieta (selección múltiple) y nivel de actividad, subir una foto, guardar varias mascotas |
| **Pago** | Editar cantidades, cupón, tipo de entrega (express, programada o suscripción), dirección, canje de puntos Huellitas Club, método de pago y confirmación del pedido |

Las recomendaciones de la portada cambian según las dietas de la mascota activa.

**Cupones para probar:** `HUELLITAS25` (-25% en productos BARF) y `BIENVENIDA` (envío gratis).

## Probar en el computador

Opción 1: abrir `index.html` con doble clic.

Opción 2 (recomendada), desde esta carpeta:

```bash
python -m http.server 8000
```

y entrar a <http://localhost:8000>.

## Publicar en GitHub Pages

1. Crear un repositorio y subir todos los archivos (`Add file → Upload files`).
2. En `Settings → Pages`, elegir `Deploy from a branch`, rama `main` y carpeta `/(root)`.
3. Esperar unos minutos: la dirección será `https://<usuario>.github.io/<repositorio>/`.

## Notas técnicas

- **Requiere internet:** Tailwind CSS (CDN), las tipografías de Google Fonts y las imágenes generadas por Stitch se cargan desde servidores externos.
- **Datos locales:** carrito, mascotas, puntos y pedidos se guardan en `localStorage`. Para empezar de cero: botón **Perfil → Restablecer datos de demostración**.
- **Pedido de ejemplo:** la primera vez, el carrito trae dos productos para que la página de pago no aparezca vacía.
- **Diseño tipo app móvil:** en pantallas grandes el sitio se muestra como una columna centrada de 480 px.
