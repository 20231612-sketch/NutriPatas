/* =========================================================
   NutriPatas - script.js
   Lógica compartida por todas las páginas (sitio demostrativo).

   Cómo está organizado:
     1. Utilidades
     2. Datos de demostración (catálogo, categorías, cupones)
     3. Estado guardado en el navegador (localStorage)
     4. Carrito y cálculo de totales
     5. Componentes compartidos (toast, hojas inferiores, buscador...)
     6. Páginas: Inicio, Detalle de producto, Perfil de mascota, Pago
     7. Arranque

   No hay servidor: todo se guarda en el navegador de quien visita la página.
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     1. UTILIDADES
     ======================================================= */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const money = n => '$' + round2(n).toFixed(2);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const bind = (name, value) => $$('[data-bind="' + name + '"]').forEach(el => { el.textContent = value; });
  const params = new URLSearchParams(location.search);
  const FILL1 = 'style="font-variation-settings:\'FILL\' 1;"';   // icono Material relleno

  /* Fechas en español (sin depender del idioma del navegador) */
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const addDays = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const dayChip = n => { const d = addDays(n); return (n === 1 ? 'Mañana' : DAYS[d.getDay()]) + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; };
  const longDate = n => { const d = addDays(n); return d.getDate() + ' de ' + MONTHS_LONG[d.getMonth()]; };

  /* Volver: si se llegó desde otra página del sitio, retrocede; si no, va al inicio */
  function goBack() {
    let internal = false;
    try { internal = document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { /* sin referrer */ }
    if (internal && history.length > 1) history.back(); else location.href = 'index.html';
  }

  /* =======================================================
     2. DATOS DE DEMOSTRACIÓN
     ======================================================= */
  /* Imágenes generadas con Google Stitch (alojadas por Google) */
  const IMG = {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZMQxiOatQJ4_hdNb-wTxQKr6L5UC1fmFk_It_SYHZxAwgf95wTj_We8mMBSRnAbM14GMK5wqH16wQE3PDDVHd8HHLTXQqqxljQmPNvzpAYjd9Glg1KMWK_0dRNc1CcXbxdhYwvXWTVhEUxhC0la7eiro5GGE2RjU8EBbDOi-wiPEtnegLxLhDJSKX1MHZ-YY2LyfPqzxiDJenVZyQyTSxMovCsa98C2qiA3Q0gk-J4FY6Qv0017I97A",
    user: "https://lh3.googleusercontent.com/aida-public/AB6AXuAusrjEpcYXczLb40LzJxidYe8Qqo7J9UG_goCYtoy8aBymHVeu6Xsk-G2aWKrSNaFGqCvBJq-wmKdVKtPCRmChL5XLqAWRX_VM5WCeozlmt8mKB8PPv26k-ltly5SM1XQhVGV3_K_k9IJMs3RIM7nFOjd-VRjprH0jX9fQgmxzg1zNut5cJzgh1HnNnxOTd8MmDf2AaBIbjbDYzhXdDL_SrMnlAJGl4EmNJCd-Cxg0LJxsCynAOkzEKA",
    rocky: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcptyW06Cw8mp88dTV4w9mGhiqplLrUtIZWwZ5l4018wKimPfDhT59nUAWjKjB-Q07gBxNW0f5JxiVuyb6PHDpxLqQCkZ4hEh7tWbjAp9veHJ_33HoTtVZSL6380xSPUJSeEuWp4LUojkAg7D7OIxwrkwU9oS35tTUvRZvkDpoKFPXWW1cgOMXh7fmcOaR72G1e85n_5WH_Zm71hZRkAOmFOZGDZ5WJBNsab3lsgg-ir6bp1GvCl9OqA",
    barfSalmonPavo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCT6dN5yX5y9UIII29g7rkq9nMl6saZjwbPNqXKFXbytoZxS21HEXRdcz_Yrfe1JQXUSAjNXIfkQfg0R9RPEcZCLTLlZoA0i4Uy0SlWJJGqeoO0LcqWtq_ueedogNTnIHalgXp3uD2IJk37WFq2MzT1_xas74HklDryV-p6wIoGwTP8ezqs-WMQrrNVB6mYShScLT-8ljzM5rQbVrQQWzAruXmSiatNFgHH8x88J0rojACJ628hPKHPwg",
    croqueta: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnKxVCmz7HLT2MmvJEt2gP_cRMxVPUWODaRqazB1cY_L6c3r9H8wULNssr2nQzIGeSoGloLjBbGRE9EiUQXsRI3fIHGu5BsrChuCw903eQmcYDgxEmHEtyVEgsKgpZBGRMScxN3ZUCfEFJXzuyVurvYXu2Sf-LwHMXQce0pyTPRnf17I2B2mdTkP5lP5JvfMmbiJdaKy_-JODRqqbBlQp05VmEnwpxIL6OhfdMvyjKol9E54VXmNZqLA",
    snackDental: "https://lh3.googleusercontent.com/aida-public/AB6AXuC003WJYiAL57x0niGvgTtymFyeTzfvDOgKmLF5uKG1B_TTDRkQ3EueldHp7xN4WEONE4XxUxOhNQSGDFvchPwboyHbpUTIA6iQxF3Ukp-Xc9xObz6j-VkULPmaeAmfk-P_P1UD5Rea8YTzY_oelHUsxNWh3KRGSFCK3ECxbIC-x5B4I-vLMs3yVNsoTeHdySM94yoKGN46tsAYihx7ok7V5s8Y7_33S9qHsqwI7S05lNNoWvcFS1Vdig",
    gal1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu4tROEC2u-2xLTpU0xjopO1WNwdYoivQL5SB41_FgPzxyE5LS13dDi3Y63IMv5fB9d7Uc4XeU-TEH_6btKs0hb2cpJn0F0IZARjv3Doi3CyK-sHFx2MAF0LKpVyRyG5fx7WPbNcaRaCSFUm1ACJzJJPJMDvSje858mZY2NWRHftCXsSxYObQ2LpYYX2GKlQmRNURVvdBdyXbeGlmppE7yqDfcXx801Q9fwTcLIutNhNcynvhXChhzzg",
    gal2: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYMYqkF_fWpO7155KZfPSNVlFFae1U48m-S_-CMWAaTU4vHuVPUbb0fGnAAa0ontQ-Ts4rMjK_TRHApEdituPbSv73wBVb3lfkGEYmaQ8qcUU0UqcLV4rUvJFPuc12NDFnWKBA18oC4LoyoL29ougA8L37S5chnerz5gzXSFPvgwOq0Pw3uKBEIeXZJS0gYhfESuFJ65k7Pri_7Xbr97IrDl6vsnGBPZryVwNGyqMfDfIX5uytf2nIFQ",
    gal3: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ8WvS13X_a9fNMj2zqQv8W_jz4Omno2W0een0wX1i2KIt56VXqHsR54JU6P6agpUFCEfuSxWqMTVZIgKTwcU7AbdpqAj0eONWPP8fdfxb0QuK2nZeGZaO4C32OwhLiCAikaaDIHkTS8Kl6S6Jn7HeP-5TQIW2OpNAnSqNAB00R8Tmw6UpeEQ32-pQpG8DLQNdh21O9lJfRBrsVAWmcZAdiBhdAAl1rrr3-Y4bbEs0BUa3lZiboxDHzg",
    ingSalmon: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPXuf-egjfmNjQoWIWeY64S5Btqu8EeAb4Z1PWQznFHx7tPgL2mhhPaiyRTofRl8k6skLoh27DOJtfobMQ7Bmmioi-lRwek6Bd07QUnTc4r0XsbRjtyTbQ5pGbCBUHGGS5yjAMlpjD5AZFRPxaFpSWvcN_vqz5eNOMPqijGE22qfzyLpkC7hIHjKpoPDBECJkGQZNBsdpaSjz108TVSnymg1Ervgjkh3pyt3JQWDDxk3DR_lkvbQpvrQ",
    ingBlueberry: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsqnaXrcySBCPx34h0S-yWTtQYjazxDLljllNTGh-5lAqbK2MOayEb_ItJsgR4Hzz0MmjAcMNFxDIJRLa1LiN6Hp1MwsqNICu1X_-ecwQa26gxxgaAnbEU9u2B6l51WX4KCNWGkVMVMnLtOzKlIrrpb2j23AJVYnsv3JLHcVS5jEJ1xKJjIWXwlZN_LL9Kp_jLM6WCkcqGcI0aTDUSMHZIkqDCKCJcbBbG71KWEklU1HqFdwMYGDR2Xw",
    ingCarrot: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-00ksfWKUj4W-x51z4IYTN_aIZ3Ii_Ls1Nxw0ih8hMyBQbxhlCi7SkLSWlFUlT1X04hivAcOWphm8UBhPTGMquSllF2bNjuDr3rVW_7EdwIY39ci0na6Zyy-NkaG-juPLy_4-iJqP6Qef6DcH8u6uivN-dMdqgZR0nVjYgnRcQq9LPK8RDUSmC4v9sXko3VGJdJnlR60dFKlU-01V5PxBh_V2pLM96xGCK9nd0r5DOShFNe1z3SOcxg",
    ingCoconut: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEboIPxJvo1IuyZhXbmBSK0jDh_gRTP3Z-ZK6v18veOupcwBR1TB7wdQ7x1JZZIfLbe1mfexrhQQrLVW2rou66aHjVJkVt_NjRjop8g6K3gi3hdlwy6SMAs02MAigC6BQclCvUkUaxN_XB16oM0T6ba3nuUk_6jD7zH6QLN4O5SdtuKybtKm3NQdlTqiKmT1pyX5UGQqqrHKnkAwD4wlJKG7dVL54hJ_JZboP0417beGSN5S3Wsq4adw",
    barfSalvaje: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVnza2hggpVnM9KaHcO1DxO5GJb67sWzTREKUON8bkYyjs3N5KIBLfVp0Y6ZfvXoYxk51Qit8BVboKoyGqUodpHyY2KmAPDGQn_L1kO9aBccliATRVOPPrbii4fRF7-LLi-ZNoxunaeED2WyhF6n6S5jCHuXBdaf2RrszzDeu-U82cpgb8e9D3WmWKnJfoPLPCYuuqlDLkGnHRa9-1zCize0PWK6xgowGOEfK3tUyHx9TMuMiL9aJIvg",
    snackDental2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCckk16wkOROVCPhEdSo9VPs_OC_V65Dv8JZwfPVqy2aCx4oD1nT6joAuJkcMSADxoTQb2n29n2vRm5qA_Zk72fl-lPwK9_B3GalFsOBiLRFIFJZBH1wR5sil870wEilGSzXKvL5o2JFQ1vWTl11i1B9Wa-f3y0Okw9VzJfi8SbnN5eEhuCMdvzjpmHuThbo9sc49vC7_T-dBlpC4p54dPMqxjo4UlcPDwQWZfvTjMu9elQQ6o4tEeBKw"
  };

  const CATEGORIES = {
    barf:        { label: 'BARF & Natural',   icon: 'restaurant' },
    snacks:      { label: 'Snacks & Premios', icon: 'cookie' },
    seco:        { label: 'Alimento Seco',    icon: 'grain' },
    humeda:      { label: 'Comida Húmeda',    icon: 'soup_kitchen' },
    suplementos: { label: 'Suplementos',      icon: 'medication' },
    ofertas:     { label: 'Ofertas Flash',    icon: 'local_fire_department' }
  };

  const LINES = {
    barf: 'NutriPatas Kitchen • Línea Fresca',
    seco: 'NutriPatas Pantry • Línea Seca',
    snacks: 'NutriPatas Treats • Premios',
    humeda: 'NutriPatas Kitchen • Línea Húmeda',
    suplementos: 'NutriPatas Wellness • Bienestar'
  };

  const DIETS = {
    croquetas: 'Croquetas', humeda: 'Húmeda', barf: 'BARF',
    hipoalergenica: 'Grain Free', senior: 'Senior', medicada: 'Medicada'
  };

  const SPECIES = {
    'Perro':   { plural: 'Perros',    icon: 'sound_detection_dog_barking' },
    'Gato':    { plural: 'Gatos',     icon: 'pets' },
    'Ave':     { plural: 'Aves',      icon: 'raven' },
    'Roedor':  { plural: 'Roedores',  icon: 'pets' },
    'Exótico': { plural: 'Exóticos',  icon: 'auto_awesome' }
  };

  const COUPONS = {
    HUELLITAS25: { title: '-25% en menús BARF', desc: 'Ingredientes 100% biológicos para una digestión feliz', icon: 'bolt' },
    BIENVENIDA:  { title: 'Envío GRATIS + Snack Dental', desc: 'En tu primera orden, sin mínimo de compra', icon: 'card_giftcard' }
  };

  const LEVELS = [{ name: 'Cachorro', min: 0 }, { name: 'Gourmet', min: 200 }, { name: 'Alfa', min: 600 }];
  const POINTS_COST = 50;        // puntos que se canjean...
  const POINTS_VALUE = 2.5;      // ...por este descuento en dólares
  const SUB_DISCOUNT = 0.10;     // descuento por suscripción
  const EXPRESS_FEE = 4.99;
  const MAX_QTY = 15;
  const DEFAULT_PRODUCT_ID = 'barf-fresco-salmon-arandanos';

  const ADDRESSES = {
    casa:    { label: 'Casa Principal', icon: 'home', line1: 'Av. Las Palmeras 450, Depto 302', line2: 'Miraflores, Lima • CP 15074' },
    oficina: { label: 'Oficina',        icon: 'business', line1: 'Av. Larco 1301, Piso 8', line2: 'Miraflores, Lima • CP 15074' }
  };

  const PAYMENTS = { card: 'Visa •••• 8821', wallet: 'Apple Pay / Google Wallet', cash: 'Efectivo contra entrega' };

  /* Catálogo: cada producto tiene uno o más formatos (peso / presentación) */
  const PRODUCTS = [
    {
      id: 'barf-fresco-salmon-arandanos',
      name: 'Menú BARF Fresco Salmón & Arándanos del Bosque',
      shortName: 'BARF Fresco Salmón & Arándanos',
      kind: '100% Crudo BARF', category: 'barf', diets: ['barf', 'hipoalergenica'],
      rating: 4.9, reviews: 240, bestseller: true,
      badge: { text: 'Más vendido', cls: 'bg-tertiary text-on-tertiary' },
      highlight: 'Más vendido para {plural}',
      tags: [['100% Orgánico', 'eco'], ['Sin Grano / Grain-Free', 'grain'], ['Rico en Omega 3 y 6', 'water_drop'], ['Apto Dieta BARF', 'pets']],
      formats: [
        { id: '1kg', label: '1 kg', suffix: '(Pack de inicio)', hint: 'Ideal para probar o cachorros', price: 14.99, cart: 'Pack de 1kg congelado' },
        { id: '3kg', label: '3 kg (Ahorro semanal)', badge: 'Popular', hint: '$12.83 / kg', price: 38.50, popular: true, cart: 'Porción de 3kg congelada' },
        { id: '10kg', label: '10 kg (Mega Pack Familiar)', badge: '-20%', hint: '$11.50 / kg • Congelado en porciones', price: 115.00, cart: 'Mega pack de 10kg congelado' }
      ],
      defaultFormat: '3kg',
      gallery: [IMG.gal1, IMG.gal2, IMG.gal3], icon: 'set_meal',
      ingredients: [
        ['Salmón del Atlántico', '65% base proteica', IMG.ingSalmon],
        ['Arándanos Silvestres', 'Antioxidantes clave', IMG.ingBlueberry],
        ['Zanahoria Ecológica', 'Fibra & Vitamina A', IMG.ingCarrot],
        ['Aceite de Coco Virgen', 'Salud de pelaje y piel', IMG.ingCoconut]
      ],
      nutrition: { protein: 16.5, fat: 9.2, fiber: 1.8, moisture: 68, kcal: 165 },
      portions: ['150g - 250g', '250g - 500g', '500g - 800g+']
    },
    {
      id: 'barf-salmon-pavo',
      name: 'BARF Salmón & Pavo Salvaje 1kg',
      kind: 'Línea BARF', category: 'barf', diets: ['barf', 'hipoalergenica'],
      rating: 4.9, reviews: 128,
      badge: { text: '-15%', cls: 'bg-primary-container text-on-primary-container' },
      highlight: 'Oferta de la semana',
      tags: [['Sin Granos', 'grain'], ['Omega 3', 'water_drop']],
      formats: [{ id: '1kg', label: '1 kg', price: 14.90, old: 17.50, cart: 'Bolsa de 1kg congelada' }],
      defaultFormat: '1kg',
      gallery: [IMG.barfSalmonPavo], icon: 'set_meal',
      ingredients: [
        ['Salmón salvaje', 'Fuente natural de Omega 3', 'set_meal'],
        ['Pavo magro', 'Proteína de fácil digestión', 'egg_alt'],
        ['Arándano rojo', 'Antioxidantes naturales', 'nutrition'],
        ['Calabacín', 'Fibra y minerales', 'eco']
      ],
      nutrition: { protein: 18, fat: 8.5, fiber: 1.5, moisture: 70, kcal: 158 },
      portions: ['150g - 250g', '250g - 500g', '500g - 800g+']
    },
    {
      id: 'croqueta-pato-batata',
      name: 'Croqueta Prensada Pato y Batata 3kg',
      kind: 'Prensado en Frío', category: 'seco', diets: ['croquetas', 'hipoalergenica'],
      rating: 4.8, reviews: 94,
      badge: { text: 'Recomendado', cls: 'bg-secondary text-on-secondary' },
      highlight: 'Recomendado por veterinarios',
      tags: [['100% Natural', 'eco'], ['Prensado en Frío', 'ac_unit']],
      formats: [
        { id: '3kg', label: '3 kg', price: 26.50, old: 29.90, cart: 'Bolsa de 3kg' },
        { id: '8kg', label: '8 kg (Ahorro mensual)', badge: 'Popular', hint: '$7.49 / kg', price: 59.90, popular: true, cart: 'Bolsa de 8kg' }
      ],
      defaultFormat: '3kg',
      gallery: [IMG.croqueta], icon: 'grain',
      ingredients: [
        ['Pato deshuesado', 'Proteína novel, ideal para sensibles', 'restaurant'],
        ['Batata', 'Carbohidrato de bajo índice glucémico', 'eco'],
        ['Linaza', 'Omega 3 de origen vegetal', 'grain'],
        ['Probióticos', 'Apoyo a la salud digestiva', 'health_and_safety']
      ],
      nutrition: { protein: 28, fat: 15, fiber: 3.5, moisture: 8, kcal: 385 },
      portions: ['80g - 150g', '150g - 300g', '300g - 450g+'],
      portionIntro: 'Ración diaria orientativa según el peso de tu mascota (repártela en 2 tomas):'
    },
    {
      id: 'snack-dental-espirulina',
      name: 'Snack Dental Masticable con Espirulina',
      kind: 'Cuidado Dental', category: 'snacks', diets: ['all'],
      rating: 5.0, reviews: 62,
      badge: { text: 'Dental care', cls: 'bg-tertiary text-on-tertiary' },
      highlight: 'Favorito en cuidado dental',
      tags: [['Hipoalergénico', 'spa'], ['Espirulina', 'eco']],
      formats: [
        { id: 'x7', label: 'Bolsa x 7 unidades', price: 7.99, cart: 'Bolsa x 7 unidades' },
        { id: 'x14', label: 'Bolsa x 14 unidades', badge: 'Mejor valor', hint: '$0.70 por snack', price: 9.80, popular: true, cart: 'Bolsa x 14 unidades' }
      ],
      defaultFormat: 'x7',
      gallery: [IMG.snackDental, IMG.snackDental2], icon: 'cookie',
      ingredients: [
        ['Espirulina', 'Antioxidante natural', 'eco'],
        ['Menta fresca', 'Aliento fresco', 'spa'],
        ['Perejil', 'Limpieza natural', 'nutrition'],
        ['Almidón de tapioca', 'Textura masticable sin gluten', 'grain']
      ],
      nutrition: { protein: 12, fat: 3, fiber: 6, moisture: 10, kcal: 310 },
      portions: ['1 snack', '1 - 2 snacks', '2 snacks'],
      portionIntro: 'Ofrece un snack al día como premio; no reemplaza la comida principal:'
    },
    {
      id: 'barf-salmon-salvaje',
      name: 'Menú BARF Salmón Salvaje',
      kind: 'Línea BARF', category: 'barf', diets: ['barf'],
      rating: 4.8, reviews: 87,
      badge: { text: 'Nuevo', cls: 'bg-secondary text-on-secondary' },
      highlight: 'Novedad de temporada',
      tags: [['Sin Conservantes', 'verified'], ['Cadena de frío', 'ac_unit']],
      formats: [
        { id: '3kg', label: '3 kg', hint: '$10.50 / kg', price: 31.50, cart: 'Porción de 3kg congelada' },
        { id: '6kg', label: '6 kg (Pack familiar)', badge: '-5%', hint: '$9.98 / kg', price: 59.90, cart: 'Porción de 6kg congelada' }
      ],
      defaultFormat: '3kg',
      gallery: [IMG.barfSalvaje], icon: 'set_meal',
      ingredients: [
        ['Salmón salvaje', 'Proteína premium', 'set_meal'],
        ['Zanahoria', 'Vitamina A', 'nutrition'],
        ['Espinaca', 'Hierro y fibra', 'eco'],
        ['Aceite de salmón', 'Piel y pelaje brillantes', 'water_drop']
      ],
      nutrition: { protein: 17, fat: 9.5, fiber: 1.7, moisture: 68, kcal: 168 },
      portions: ['150g - 250g', '250g - 500g', '500g - 800g+']
    },
    {
      id: 'aceite-coco-virgen',
      name: 'Aceite de Coco Virgen para Pelaje y Piel',
      shortName: 'Aceite de Coco Virgen',
      kind: 'Suplemento Natural', category: 'suplementos', diets: ['all'],
      rating: 4.7, reviews: 53,
      badge: { text: 'Natural', cls: 'bg-secondary text-on-secondary' },
      highlight: 'Favorito para el pelaje',
      tags: [['Prensado en Frío', 'ac_unit'], ['Orgánico', 'eco']],
      formats: [
        { id: '250ml', label: '250 ml', price: 12.90, cart: 'Frasco de 250ml' },
        { id: '500ml', label: '500 ml (Ahorro)', badge: 'Popular', hint: '$0.04 / ml', price: 21.90, popular: true, cart: 'Frasco de 500ml' }
      ],
      defaultFormat: '250ml',
      gallery: [IMG.ingCoconut], icon: 'water_drop',
      ingredients: [
        ['Coco orgánico', '100% prensado en frío', 'eco'],
        ['Ácido láurico', 'Apoyo al sistema inmune', 'health_and_safety']
      ],
      portions: ['¼ cucharadita', '½ cucharadita', '1 cucharadita'],
      portionIntro: 'Dosis diaria sugerida, mezclada con la comida, según el peso de tu mascota:'
    },
    {
      id: 'latas-pollo-caldo',
      name: 'Latas Gourmet Pollo & Caldo de Huesos',
      kind: 'Comida Húmeda', category: 'humeda', diets: ['humeda'],
      rating: 4.7, reviews: 77,
      badge: { text: '-10%', cls: 'bg-primary-container text-on-primary-container' },
      highlight: 'Hidratación extra',
      tags: [['Caldo de huesos', 'soup_kitchen'], ['Sin cereales', 'grain']],
      formats: [
        { id: 'x6', label: 'Pack x 6 latas (400 g)', price: 18.90, old: 21.00, cart: 'Pack x 6 latas' },
        { id: 'x12', label: 'Pack x 12 latas', badge: 'Popular', hint: '$2.91 por lata', price: 34.90, popular: true, cart: 'Pack x 12 latas' }
      ],
      defaultFormat: 'x6',
      gallery: [], icon: 'soup_kitchen',
      ingredients: [
        ['Pollo de corral', 'Proteína magra', 'egg_alt'],
        ['Caldo de huesos', 'Hidratación y articulaciones', 'soup_kitchen'],
        ['Calabaza', 'Digestión suave', 'eco']
      ],
      nutrition: { protein: 9, fat: 5, fiber: 0.8, moisture: 78, kcal: 95 },
      portions: ['½ lata', '1 - 1½ latas', '2 latas']
    },
    {
      id: 'condroprotector-senior',
      name: 'Condroprotector Masticable Senior',
      kind: 'Suplemento Articular', category: 'suplementos', diets: ['senior'],
      rating: 4.8, reviews: 41,
      badge: { text: 'Senior', cls: 'bg-tertiary text-on-tertiary' },
      highlight: 'Cuidado articular',
      tags: [['Glucosamina', 'medication'], ['Cúrcuma', 'eco']],
      formats: [
        { id: 'x30', label: 'Frasco x 30 masticables', price: 16.50, cart: 'Frasco x 30 masticables' },
        { id: 'x60', label: 'Frasco x 60 masticables', badge: 'Popular', hint: '$0.50 por masticable', price: 29.90, popular: true, cart: 'Frasco x 60 masticables' }
      ],
      defaultFormat: 'x30',
      gallery: [], icon: 'medication',
      ingredients: [
        ['Glucosamina', 'Soporte articular', 'medication'],
        ['Condroitina', 'Cartílago saludable', 'health_and_safety'],
        ['Cúrcuma', 'Antiinflamatorio natural', 'eco']
      ],
      portions: ['½ masticable', '1 masticable', '2 masticables'],
      portionIntro: 'Dosis diaria sugerida según el peso de tu mascota:'
    }
  ];

  const findProduct = id => PRODUCTS.find(p => p.id === id);
  const findFormat = (p, fid) => p.formats.find(f => f.id === fid) || p.formats[0];
  const defaultFormat = p => findFormat(p, p.defaultFormat);
  const productName = p => p.shortName || p.name;

  /* Productos de una categoría ("ofertas" = los que tienen precio tachado) */
  function productsByCategory(cat) {
    if (cat === 'ofertas') return PRODUCTS.filter(p => defaultFormat(p).old);
    return PRODUCTS.filter(p => p.category === cat);
  }

  /* Recomendados: los que más coinciden con las dietas de la mascota activa */
  function recommended(pet, n) {
    const diets = pet.diets || [];
    return PRODUCTS
      .map(p => {
        const overlap = p.diets.includes('all') ? 0.5 : p.diets.filter(d => diets.includes(d)).length;
        return { p, score: overlap * 2 + (p.bestseller ? 0.5 : 0) + p.rating / 10 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map(x => x.p);
  }

  /* =======================================================
     3. ESTADO (se guarda en localStorage)
     ======================================================= */
  const STORAGE_KEY = 'nutripatas.demo.v1';

  function defaultState() {
    return {
      v: 1,
      pets: [{
        id: 'rocky', name: 'Rocky', species: 'Perro', breed: 'Golden Retriever',
        age: '3 años', weight: '28 kg', activity: 'Activo', diets: ['barf', 'hipoalergenica'], photo: IMG.rocky
      }],
      activePetId: 'rocky',
      // Pedido de ejemplo para que el pago no aparezca vacío la primera vez
      cart: [{ pid: 'barf-salmon-salvaje', fid: '3kg', qty: 1 }, { pid: 'snack-dental-espirulina', fid: 'x14', qty: 1 }],
      favorites: [],
      coupon: null,
      points: 450,
      redeem: true,
      checkout: {
        delivery: 'recurring', freq: 15, dateIdx: 0, slot: '10-13', payment: 'card', addressId: 'casa',
        notes: 'Dejar en recepción con el conserje, timbrar en el 302 si es comida congelada.'
      },
      orders: []
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.v === 1 && Array.isArray(saved.pets) && saved.pets.length) {
        return Object.assign(base, saved, { checkout: Object.assign(base.checkout, saved.checkout) });
      }
    } catch (e) { /* almacenamiento no disponible o dañado: se usan los valores por defecto */ }
    return base;
  }

  const state = loadState();
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* modo privado: se ignora */ }
  }
  function resetDemo() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* nada */ }
    location.href = 'index.html';
  }

  /* ----- Mascotas ----- */
  const activePet = () => state.pets.find(p => p.id === state.activePetId) || state.pets[0];
  const petSubtitle = p => [p.breed || p.species, p.age, p.weight].filter(Boolean).join(' • ');
  function dietSummary(p) {
    const labels = (p.diets || []).map(d => DIETS[d]).filter(Boolean);
    if (!labels.length) return 'Sin dieta definida';
    return labels.slice(0, 2).join(' & ') + (labels.length > 2 ? ' +' + (labels.length - 2) : '');
  }
  function petAvatar(pet, size, iconPx) {
    if (pet.photo) {
      return '<img src="' + esc(pet.photo) + '" alt="' + esc(pet.name) + '" class="' + size + ' rounded-full object-cover shadow-sm flex-shrink-0">';
    }
    const sp = SPECIES[pet.species] || SPECIES['Perro'];
    return '<div class="' + size + ' rounded-full bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0 shadow-sm" role="img" aria-label="' + esc(pet.name) + '">' +
      '<span class="material-symbols-outlined text-[' + (iconPx || 24) + 'px]" ' + FILL1 + '>' + sp.icon + '</span></div>';
  }
  function setActivePet(id) {
    state.activePetId = id;
    save();
    bind('pet-name', activePet().name);
    if (typeof hooks.onPetChange === 'function') hooks.onPetChange(activePet());
  }
  const hooks = {};   // cada página registra aquí lo que debe actualizarse al cambiar de mascota

  /* ----- Puntos Huellitas Club ----- */
  function clubLevel(points) {
    let cur = LEVELS[0], next = null;
    LEVELS.forEach((l, i) => { if (points >= l.min) { cur = l; next = LEVELS[i + 1] || null; } });
    return { cur, next };
  }

  /* =======================================================
     4. CARRITO Y TOTALES
     ======================================================= */
  const Cart = {
    lines() {
      return state.cart.map(l => {
        const product = findProduct(l.pid);
        if (!product) return null;
        const format = findFormat(product, l.fid);
        return { product, format, qty: l.qty, total: round2(format.price * l.qty) };
      }).filter(Boolean);
    },
    count() { return this.lines().reduce((n, l) => n + l.qty, 0); },
    add(pid, fid, qty) {
      const line = state.cart.find(l => l.pid === pid && l.fid === fid);
      if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
      else state.cart.push({ pid, fid, qty: Math.min(MAX_QTY, qty) });
      save(); updateBadges();
    },
    setQty(pid, fid, qty) {
      const i = state.cart.findIndex(l => l.pid === pid && l.fid === fid);
      if (i < 0) return;
      if (qty <= 0) state.cart.splice(i, 1); else state.cart[i].qty = Math.min(MAX_QTY, qty);
      save(); updateBadges();
    }
  };

  function updateBadges() {
    const n = Cart.count();
    $$('[data-cart-badge]').forEach(el => { el.textContent = n; el.classList.toggle('hidden', n === 0); });
  }

  /* Totales del pedido (se recalculan cada vez que cambia algo) */
  function computeTotals() {
    const lines = Cart.lines();
    const c = state.checkout;
    const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
    const recurring = c.delivery === 'recurring';
    const subDiscount = recurring ? round2(subtotal * SUB_DISCOUNT) : 0;

    let couponDiscount = 0;
    if (state.coupon === 'HUELLITAS25') {
      const barf = lines.filter(l => l.product.category === 'barf').reduce((s, l) => s + l.total, 0);
      couponDiscount = round2(barf * 0.25);
    }
    const canRedeem = state.points >= POINTS_COST && subtotal > 0;
    const pointsDiscount = state.redeem && canRedeem ? POINTS_VALUE : 0;
    const shipping = c.delivery === 'express' && state.coupon !== 'BIENVENIDA' ? EXPRESS_FEE : 0;
    const total = round2(Math.max(0, subtotal - subDiscount - couponDiscount - pointsDiscount) + shipping);
    return { lines, subtotal, subDiscount, couponDiscount, pointsDiscount, shipping, total, canRedeem, items: Cart.count() };
  }

  /* =======================================================
     5. COMPONENTES COMPARTIDOS
     ======================================================= */

  /* ----- Toast (aviso temporal) ----- */
  let toastTimer;
  function toast(message, opts) {
    opts = opts || {};
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast bg-inverse-surface text-inverse-on-surface pl-4 pr-3 py-2.5 rounded-full shadow-lg flex items-center gap-2';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML =
      '<span class="material-symbols-outlined text-[18px] text-secondary-fixed">' + (opts.icon || 'check_circle') + '</span>' +
      '<span class="font-label-sm text-label-sm">' + esc(message) + '</span>' +
      (opts.href ? '<a href="' + esc(opts.href) + '" class="font-label-sm text-label-sm text-primary-fixed-dim underline underline-offset-2 ml-1 whitespace-nowrap">' + esc(opts.action) + '</a>' : '');
    requestAnimationFrame(() => el.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), opts.duration || 2600);
  }

  /* ----- Hoja inferior (modal deslizante) ----- */
  let sheetEl = null, sheetTrigger = null;

  function openSheet(html, opts) {
    opts = opts || {};
    closeSheet(true);
    sheetTrigger = document.activeElement;
    sheetEl = document.createElement('div');
    sheetEl.innerHTML =
      '<div class="sheet-backdrop" data-sheet-close></div>' +
      '<section class="sheet-panel bg-surface pb-safe ' + (opts.full ? 'is-full' : 'rounded-t-lg shadow-2xl') + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.label || 'Panel') + '" tabindex="-1">' +
      (opts.full ? '' : '<div class="mx-auto mt-2 h-1 w-10 rounded-full bg-outline-variant"></div>') + html + '</section>';
    const el = sheetEl;
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    const panel = $('.sheet-panel', el);
    el.addEventListener('click', e => { if (e.target.closest('[data-sheet-close]')) closeSheet(); });
    if (opts.onMount) opts.onMount(panel);
    requestAnimationFrame(() => {
      if (sheetEl !== el) return;   // se cerró antes de este frame
      $('.sheet-backdrop', el).classList.add('is-open');
      panel.classList.add('is-open');
      ($('[data-autofocus]', panel) || panel).focus({ preventScroll: true });
    });
    return panel;
  }

  function closeSheet(immediate) {
    if (!sheetEl) return;
    const el = sheetEl;
    sheetEl = null;
    document.body.style.overflow = '';
    if (immediate === true) { el.remove(); return; }
    $$('.is-open', el).forEach(n => n.classList.remove('is-open'));
    setTimeout(() => el.remove(), 300);
    if (sheetTrigger && document.contains(sheetTrigger)) sheetTrigger.focus({ preventScroll: true });
  }

  function sheetHeader(title, icon) {
    return '<div class="flex items-center justify-between px-margin-mobile pt-space-sm pb-space-sm">' +
      '<h2 class="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">' +
      '<span class="material-symbols-outlined text-primary text-[22px]">' + icon + '</span>' + esc(title) + '</h2>' +
      '<button type="button" data-sheet-close aria-label="Cerrar" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">' +
      '<span class="material-symbols-outlined text-[22px]">close</span></button></div>';
  }

  /* ----- Cupones ----- */
  function applyCoupon(code) {
    if (!COUPONS[code]) return false;
    state.coupon = code;
    save();
    return true;
  }

  function couponCard(code) {
    const cp = COUPONS[code];
    const on = state.coupon === code;
    return '<div class="flex items-center gap-3 p-3.5 rounded-lg bg-surface-container-lowest shadow-sm">' +
      '<div class="w-11 h-11 rounded-full ' + (on ? 'bg-secondary text-on-secondary' : 'bg-tertiary-fixed text-tertiary') + ' flex items-center justify-center flex-shrink-0">' +
      '<span class="material-symbols-outlined text-[22px]" ' + FILL1 + '>' + (on ? 'check' : cp.icon) + '</span></div>' +
      '<div class="min-w-0 flex-1"><p class="font-label-lg text-label-lg text-on-surface truncate">' + esc(cp.title) + '</p>' +
      '<p class="font-body-sm text-body-sm text-on-surface-variant clamp-2">' + esc(cp.desc) + '</p>' +
      '<p class="font-label-sm text-label-sm font-mono tracking-wider text-primary mt-0.5">' + code + '</p></div>' +
      '<button type="button" data-coupon-toggle="' + code + '" class="flex-shrink-0 px-3.5 py-2 rounded-full font-label-sm text-label-sm transition-all active:scale-95 ' +
      (on ? 'bg-surface-container text-on-surface' : 'bg-primary text-on-primary hover:bg-primary-container') + '">' + (on ? 'Quitar' : 'Aplicar') + '</button></div>';
  }

  /* ----- Hoja: Promos y Huellitas Club ----- */
  function openPromoSheet() {
    const lv = clubLevel(state.points);
    const pct = lv.next ? Math.min(100, Math.round((state.points - lv.cur.min) / (lv.next.min - lv.cur.min) * 100)) : 100;
    const html =
      sheetHeader('Promos y Huellitas Club', 'loyalty') +
      '<div class="px-margin-mobile pb-space-lg space-y-space-md">' +
        '<div class="rounded-lg p-4 bg-gradient-to-r from-tertiary-fixed via-tertiary-container/30 to-surface-container">' +
          '<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-bold">Nivel ' + lv.cur.name + '</span>' +
          '<span class="font-headline-sm text-headline-sm text-on-surface"><span class="font-extrabold text-tertiary">' + state.points + '</span> pts</span></div>' +
          '<div class="h-2 mt-3 rounded-full bg-surface-container-lowest/70 overflow-hidden"><div class="h-full rounded-full bg-tertiary" style="width:' + pct + '%"></div></div>' +
          '<p class="font-body-sm text-body-sm text-on-surface-variant mt-2">' +
          (lv.next ? 'Te faltan ' + (lv.next.min - state.points) + ' pts para el nivel ' + lv.next.name + '.' : '¡Has llegado al nivel máximo!') +
          ' Cada $1 de compra suma 1 punto. ' + POINTS_COST + ' pts = ' + money(POINTS_VALUE) + ' de descuento.</p>' +
        '</div>' +
        '<h3 class="font-headline-sm text-headline-sm text-on-surface">Cupones disponibles</h3>' +
        '<div class="space-y-3" id="coupon-list">' + Object.keys(COUPONS).map(couponCard).join('') + '</div>' +
        '<a href="pago.html" class="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all active:scale-95">' +
        '<span class="material-symbols-outlined text-[20px]">shopping_bag</span>Ir a mi carrito</a>' +
      '</div>';
    openSheet(html, {
      label: 'Promos y Huellitas Club',
      onMount(panel) {
        panel.addEventListener('click', e => {
          const btn = e.target.closest('[data-coupon-toggle]');
          if (!btn) return;
          const code = btn.dataset.couponToggle;
          if (state.coupon === code) { state.coupon = null; save(); toast('Cupón ' + code + ' quitado', { icon: 'sell' }); }
          else { applyCoupon(code); toast('Cupón ' + code + ' aplicado', { icon: 'sell' }); }
          $('#coupon-list', panel).innerHTML = Object.keys(COUPONS).map(couponCard).join('');
        });
      }
    });
  }

  /* ----- Hoja: cambiar de mascota ----- */
  function openPetSheet() {
    const rows = state.pets.map(p => {
      const active = p.id === state.activePetId;
      return '<div class="flex items-center gap-3 p-3 rounded-lg shadow-sm ' + (active ? 'bg-secondary-container/50 ring-2 ring-secondary' : 'bg-surface-container-lowest') + '">' +
        '<button type="button" data-pick-pet="' + esc(p.id) + '" class="flex flex-1 min-w-0 items-center gap-3 text-left">' +
          petAvatar(p, 'w-12 h-12', 24) +
          '<span class="min-w-0"><span class="block font-headline-sm text-headline-sm text-on-surface truncate">' + esc(p.name) + '</span>' +
          '<span class="block font-body-sm text-body-sm text-on-surface-variant truncate">' + esc(petSubtitle(p)) + '</span></span>' +
        '</button>' +
        (active ? '<span class="material-symbols-outlined text-secondary" ' + FILL1 + '>check_circle</span>' : '') +
        '<a href="cliente.html?id=' + encodeURIComponent(p.id) + '" aria-label="Editar a ' + esc(p.name) + '" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">' +
        '<span class="material-symbols-outlined text-[20px]">edit</span></a></div>';
    }).join('');
    const html =
      sheetHeader('¿Para quién compras hoy?', 'pets') +
      '<div class="px-margin-mobile pb-space-lg space-y-3">' + rows +
      '<a href="cliente.html?nuevo=1" class="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-fixed transition-all active:scale-95">' +
      '<span class="material-symbols-outlined text-[20px]">add_circle</span>Agregar otra mascota</a></div>';
    openSheet(html, {
      label: 'Cambiar de mascota',
      onMount(panel) {
        panel.addEventListener('click', e => {
          const btn = e.target.closest('[data-pick-pet]');
          if (!btn) return;
          setActivePet(btn.dataset.pickPet);
          closeSheet();
          toast('Ahora compras para ' + activePet().name, { icon: 'pets' });
        });
      }
    });
  }

  /* ----- Hoja: perfil de usuario ----- */
  function openProfileSheet() {
    const lv = clubLevel(state.points);
    const orders = state.orders.slice(0, 3).map(o =>
      '<li class="flex items-center justify-between py-2"><span class="font-body-md text-body-md text-on-surface">' + esc(o.id) +
      '<span class="text-on-surface-variant font-body-sm text-body-sm"> · ' + esc(o.pet) + '</span></span>' +
      '<span class="font-label-lg text-label-lg text-primary">' + money(o.total) + '</span></li>').join('');
    const link = (href, icon, text) =>
      '<a href="' + href + '" class="flex items-center gap-3 p-3.5 rounded-lg bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-colors">' +
      '<span class="material-symbols-outlined text-primary">' + icon + '</span>' +
      '<span class="font-label-lg text-label-lg text-on-surface flex-1">' + text + '</span>' +
      '<span class="material-symbols-outlined text-outline text-[20px]">chevron_right</span></a>';
    const html =
      sheetHeader('Mi perfil', 'person') +
      '<div class="px-margin-mobile pb-space-lg space-y-space-md">' +
        '<div class="flex items-center gap-3">' +
          '<img src="' + IMG.user + '" alt="Foto de perfil" class="w-16 h-16 rounded-full object-cover shadow-sm">' +
          '<div class="min-w-0"><p class="font-headline-sm text-headline-sm text-on-surface">Ana Torres</p>' +
          '<p class="font-body-sm text-body-sm text-on-surface-variant truncate">ana.torres@ejemplo.com</p>' +
          '<span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">' +
          '<span class="material-symbols-outlined text-[14px]" ' + FILL1 + '>stars</span>Nivel ' + lv.cur.name + ' · ' + state.points + ' pts</span></div>' +
        '</div>' +
        '<div class="space-y-2">' + link('cliente.html', 'pets', 'Mi mascota: ' + esc(activePet().name)) + link('pago.html', 'shopping_bag', 'Mi carrito (' + Cart.count() + ')') + '</div>' +
        '<div><h3 class="font-headline-sm text-headline-sm text-on-surface mb-1">Pedidos recientes</h3>' +
        (orders ? '<ul class="divide-y divide-surface-container-high">' + orders + '</ul>'
                : '<p class="font-body-sm text-body-sm text-on-surface-variant">Aún no has confirmado pedidos. ¡Prueba el flujo de compra!</p>') + '</div>' +
        '<button type="button" id="btn-reset-demo" class="w-full py-3 rounded-full bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">' +
        'Restablecer datos de demostración</button>' +
      '</div>';
    openSheet(html, {
      label: 'Mi perfil',
      onMount(panel) {
        $('#btn-reset-demo', panel).addEventListener('click', () => {
          if (confirm('Se borrarán tus mascotas, carrito y pedidos de esta demostración. ¿Continuar?')) resetDemo();
        });
      }
    });
  }

  /* ----- Hoja: buscador de productos ----- */
  function thumb(p, cls) {
    return p.gallery[0]
      ? '<img src="' + p.gallery[0] + '" alt="' + esc(productName(p)) + '" class="w-full h-full object-cover" loading="lazy">'
      : '<span class="material-symbols-outlined ' + (cls || 'text-[28px]') + ' text-secondary">' + p.icon + '</span>';
  }

  function openSearch() {
    const html =
      '<div class="px-margin-mobile pt-space-md pb-space-lg">' +
        '<div class="flex items-center gap-2">' +
          '<div class="relative flex-1"><span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[22px]">search</span>' +
          '<input id="search-input" data-autofocus type="search" autocomplete="off" placeholder="Busca BARF, snacks, croquetas..." aria-label="Buscar productos" ' +
          'class="w-full bg-surface-container-low text-on-surface rounded-full pl-11 pr-4 py-3 font-body-md text-body-md outline-none focus:bg-surface-container-lowest focus:shadow-sm transition-all"></div>' +
          '<button type="button" data-sheet-close class="px-3 py-2 font-label-lg text-label-lg text-primary">Cerrar</button>' +
        '</div>' +
        '<p id="search-title" class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mt-space-lg mb-space-sm"></p>' +
        '<div id="search-results" class="space-y-2"></div>' +
      '</div>';
    openSheet(html, {
      full: true,
      label: 'Buscar productos',
      onMount(panel) {
        const input = $('#search-input', panel), title = $('#search-title', panel), out = $('#search-results', panel);
        const row = p => {
          const f = defaultFormat(p);
          return '<a href="detalleproducto.html?id=' + p.id + '" class="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-colors">' +
            '<div class="w-14 h-14 rounded overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">' + thumb(p) + '</div>' +
            '<div class="min-w-0 flex-1"><p class="font-label-lg text-label-lg text-on-surface truncate">' + esc(productName(p)) + '</p>' +
            '<p class="font-body-sm text-body-sm text-on-surface-variant truncate">' + esc(CATEGORIES[p.category].label) + ' · ★ ' + p.rating.toFixed(1) + '</p></div>' +
            '<span class="font-headline-sm text-headline-sm text-primary font-extrabold">' + money(f.price) + '</span></a>';
        };
        const render = () => {
          const q = plain(input.value.trim());
          if (!q) {
            title.textContent = 'Populares';
            out.innerHTML = PRODUCTS.slice().sort((a, b) => b.reviews - a.reviews).slice(0, 5).map(row).join('');
            return;
          }
          const found = PRODUCTS.filter(p => plain([p.name, CATEGORIES[p.category].label, p.kind].concat(p.tags.map(t => t[0]), p.ingredients.map(i => i[0])).join(' ')).includes(q));
          title.textContent = found.length + (found.length === 1 ? ' resultado' : ' resultados');
          out.innerHTML = found.length ? found.map(row).join('')
            : '<div class="text-center py-10 text-on-surface-variant"><span class="material-symbols-outlined text-[40px] text-outline">search_off</span>' +
              '<p class="font-body-md text-body-md mt-2">No encontramos productos para "' + esc(input.value.trim()) + '".</p></div>';
        };
        input.addEventListener('input', render);
        render();
      }
    });
  }

  /* ----- Imagen rota: se reemplaza por un ícono para no dejar huecos ----- */
  function imageFallback(img) {
    if (img.dataset.failed) return;
    img.dataset.failed = '1';
    const ph = document.createElement('div');
    ph.className = img.className.replace(/object-\S+/g, '') + ' flex items-center justify-center bg-surface-container-high text-outline';
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', img.alt || 'Imagen no disponible');
    ph.innerHTML = '<span class="material-symbols-outlined text-[20px]">pets</span>';
    img.replaceWith(ph);
  }

  /* =======================================================
     6. PÁGINAS
     ======================================================= */

  /* ---------- Tarjeta de producto (Inicio) ---------- */
  function productCard(p) {
    const f = defaultFormat(p);
    const tagCls = ['bg-secondary-container/60 text-on-secondary-container', 'bg-tertiary-fixed/60 text-on-tertiary-fixed'];
    return '<article class="bg-surface-container-lowest rounded-lg p-3.5 shadow-sm flex gap-3.5 relative overflow-hidden transition-all hover:shadow-md">' +
      '<div class="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container flex items-center justify-center">' + thumb(p, 'text-[40px]') +
      '<span class="absolute top-1.5 left-1.5 ' + p.badge.cls + ' font-label-sm text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">' + esc(p.badge.text) + '</span></div>' +
      '<div class="flex flex-col justify-between min-w-0 flex-1"><div>' +
        '<div class="flex flex-wrap gap-1 mb-1">' + p.tags.slice(0, 2).map((t, i) =>
          '<span class="' + tagCls[i] + ' font-label-sm text-[10px] px-2 py-0.5 rounded-full">' + esc(t[0]) + '</span>').join('') + '</div>' +
        '<h4 class="font-headline-sm text-headline-sm text-on-surface line-clamp-1"><a href="detalleproducto.html?id=' + p.id + '" class="after:absolute after:inset-0">' + esc(p.name) + '</a></h4>' +
        '<div class="flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-[14px] text-tertiary" ' + FILL1 + '>star</span>' +
        '<span class="font-label-sm text-label-sm font-bold text-on-surface">' + p.rating.toFixed(1) + '</span>' +
        '<span class="font-body-sm text-body-sm text-on-surface-variant">(' + p.reviews + ')</span></div></div>' +
      '<div class="flex items-center justify-between pt-2"><div class="flex items-baseline gap-1.5">' +
        '<span class="font-headline-sm text-headline-sm text-primary font-extrabold">' + money(f.price) + '</span>' +
        (f.old ? '<span class="font-body-sm text-body-sm line-through text-on-surface-variant">' + money(f.old) + '</span>' : '') + '</div>' +
        '<button type="button" data-add-pid="' + p.id + '" aria-label="Añadir ' + esc(productName(p)) + ' al carrito" class="relative z-10 w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm hover:bg-primary hover:text-on-primary transition-all active:scale-90">' +
        '<span class="material-symbols-outlined text-[20px]">add</span></button></div></div></article>';
  }

  /* ---------- Página: Inicio ---------- */
  function initHome() {
    const list = $('#product-list');
    const catButtons = $$('[data-category]');
    let filter = null;

    function renderPet() {
      const pet = activePet();
      $('#pet-avatar').innerHTML = petAvatar(pet, 'w-12 h-12', 24) +
        '<div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center">' +
        '<span class="material-symbols-outlined text-[12px] text-on-secondary-container" ' + FILL1 + '>pets</span></div>';
      bind('pet-name', pet.name);
      bind('pet-diet', dietSummary(pet));
      bind('pet-meta', petSubtitle(pet));
    }

    function renderClub() {
      bind('club-points', state.points);
      bind('club-level', 'Nivel ' + clubLevel(state.points).cur.name);
    }

    function renderProducts() {
      const pet = activePet();
      const items = filter ? productsByCategory(filter) : recommended(pet, 3);
      if (filter) {
        bind('list-kicker', 'Categoría');
        bind('list-title', CATEGORIES[filter].label);
        bind('list-count', items.length + (items.length === 1 ? ' producto' : ' productos'));
      } else {
        bind('list-kicker', 'Fórmula a medida');
        bind('list-title', 'Especial para ' + pet.name);
        bind('list-count', items.length + ' opciones');
      }
      $('#btn-clear-filter').classList.toggle('hidden', !filter);
      list.innerHTML = items.map(productCard).join('') ||
        '<p class="text-center py-8 text-on-surface-variant font-body-md text-body-md">Pronto tendremos productos en esta categoría.</p>';
      catButtons.forEach(b => {
        const on = b.dataset.category === filter;
        b.setAttribute('aria-pressed', on);
        $('.cat-circle', b).classList.toggle('ring-4', on);
        $('.cat-circle', b).classList.toggle('ring-primary-container', on);
      });
    }

    function setFilter(cat, scroll) {
      filter = cat;
      renderProducts();
      if (scroll) $('#product-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hooks.onPetChange = () => { renderPet(); renderProducts(); };
    renderPet(); renderClub(); renderProducts();

    /* Categorías y "Ver catálogo" */
    catButtons.forEach(b => b.addEventListener('click', () => setFilter(filter === b.dataset.category ? null : b.dataset.category, true)));
    $('#btn-catalog').addEventListener('click', () => setFilter(null, true));
    $('#btn-clear-filter').addEventListener('click', () => setFilter(null, false));

    /* Añadir al carrito desde la tarjeta */
    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-add-pid]');
      if (!btn) return;
      const p = findProduct(btn.dataset.addPid);
      Cart.add(p.id, defaultFormat(p).id, 1);
      btn.classList.add('scale-75');
      setTimeout(() => btn.classList.remove('scale-75'), 180);
      toast('¡Añadido al cuenco de ' + activePet().name + '!', { href: 'pago.html', action: 'Ver carrito' });
    });

    /* Banners: cupones y copiar código */
    $$('[data-coupon]').forEach(b => b.addEventListener('click', () => {
      applyCoupon(b.dataset.coupon);
      toast('Cupón ' + b.dataset.coupon + ' aplicado a tu pedido', { icon: 'sell', href: 'pago.html', action: 'Ver carrito' });
    }));
    $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
      const code = b.dataset.copy;
      const done = () => toast('Código ' + code + ' copiado', { icon: 'content_copy' });
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done); else done();
    }));

    /* Puntos indicadores del carrusel de banners */
    const carousel = $('#promo-carousel'), dotsBox = $('#promo-dots');
    const slides = $$('.promo-slide', carousel);
    dotsBox.innerHTML = slides.map(() => '<div class="h-1.5 rounded-full transition-all"></div>').join('');
    const dots = Array.from(dotsBox.children);
    function paintDots() {
      let idx = 0, best = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - carousel.scrollLeft - 16); if (d < best) { best = d; idx = i; } });
      dots.forEach((d, i) => { d.className = 'h-1.5 rounded-full transition-all ' + (i === idx ? 'w-4 bg-primary' : 'w-1.5 bg-surface-container-highest'); });
    }
    carousel.addEventListener('scroll', paintDots, { passive: true });
    paintDots();
  }

  /* ---------- Página: Detalle de producto ---------- */
  const NUTRI_ROWS = [
    { key: 'protein',  label: 'Proteína Cruda Mínima',       scale: 30,  text: 'text-secondary',  bar: 'bg-secondary' },
    { key: 'fat',      label: 'Grasa Saludable (Omega 3/6)', scale: 20,  text: 'text-tertiary',   bar: 'bg-tertiary-container' },
    { key: 'fiber',    label: 'Fibra Dietética',             scale: 8,   text: 'text-on-surface', bar: 'bg-outline-variant' },
    { key: 'moisture', label: 'Humedad Natural de Origen',   scale: 100, text: 'text-primary',    bar: 'bg-primary-container' }
  ];
  const WEIGHT_BRACKETS = ['5 - 10 kg', '10 - 25 kg', '> 25 kg'];
  const weightKg = pet => { const m = String(pet.weight || '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
  const bracketOf = kg => kg == null ? -1 : kg <= 10 ? 0 : kg <= 25 ? 1 : 2;

  function initProduct() {
    const product = findProduct(params.get('id') || DEFAULT_PRODUCT_ID);
    if (!product) {
      $('#product-root').classList.add('hidden');
      $('#product-missing').classList.remove('hidden');
      return;
    }

    const pet = activePet();
    let format = defaultFormat(product), qty = 1, subscribed = false, freq = 15;
    document.title = productName(product) + ' | NutriPatas';

    /* --- Cabecera del producto --- */
    bind('pd-badge', product.highlight.replace('{plural}', (SPECIES[pet.species] || SPECIES['Perro']).plural));
    bind('pd-line', LINES[product.category]);
    bind('pd-kind', product.kind);
    bind('pd-title', product.name);
    bind('pd-rating', product.rating.toFixed(1));
    bind('pd-reviews', '(' + product.reviews + ' opiniones verificadas)');
    $('#pd-stars').innerHTML = [1, 2, 3, 4, 5].map(i => {
      const icon = product.rating >= i - 0.25 ? 'star' : product.rating >= i - 0.75 ? 'star_half' : 'star';
      const fill = product.rating >= i - 0.75 ? FILL1 : '';
      return '<span class="material-symbols-outlined text-[18px]" ' + fill + '>' + icon + '</span>';
    }).join('');

    /* --- Galería --- */
    const track = $('#gallery-track'), dotsBox = $('#gallery-dots');
    const slides = product.gallery.length ? product.gallery : [null];
    track.innerHTML = slides.map((src, i) => '<div class="w-full flex-shrink-0 snap-center relative aspect-square flex items-center justify-center">' +
      (src ? '<img class="w-full h-full object-cover" src="' + src + '" alt="' + esc(productName(product) + ' - imagen ' + (i + 1)) + '">'
           : '<span class="material-symbols-outlined text-[96px] text-secondary/50">' + product.icon + '</span>') + '</div>').join('');
    dotsBox.innerHTML = slides.length > 1 ? slides.map(() => '<button type="button" class="h-2 rounded-full transition-all duration-300"></button>').join('') : '';
    const dots = Array.from(dotsBox.children);
    const paintGallery = () => {
      const idx = Math.round(track.scrollLeft / track.offsetWidth) || 0;
      dots.forEach((d, i) => {
        d.className = 'h-2 rounded-full transition-all duration-300 ' + (i === idx ? 'w-6 bg-primary' : 'w-2 bg-surface-container-lowest/70 backdrop-blur-sm');
        d.setAttribute('aria-label', 'Ver imagen ' + (i + 1));
      });
    };
    track.addEventListener('scroll', paintGallery, { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => track.scrollTo({ left: i * track.offsetWidth, behavior: 'smooth' })));
    paintGallery();

    /* --- Favorito --- */
    const favBtn = $('#btn-favorite'), favIcon = $('#fav-icon');
    const paintFav = () => {
      const on = state.favorites.includes(product.id);
      favIcon.style.fontVariationSettings = "'FILL' " + (on ? 1 : 0);
      favIcon.classList.toggle('text-primary', on);
      favIcon.classList.toggle('text-on-surface', !on);
      favBtn.setAttribute('aria-pressed', on);
    };
    favBtn.addEventListener('click', () => {
      const i = state.favorites.indexOf(product.id);
      if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(product.id);
      save(); paintFav();
      toast(i >= 0 ? 'Quitado de favoritos' : 'Guardado en favoritos', { icon: i >= 0 ? 'heart_minus' : 'favorite' });
    });
    paintFav();

    /* --- Etiquetas (chips) --- */
    const chipCls = ['bg-secondary-container text-on-secondary-container', 'bg-primary-fixed text-on-primary-fixed', 'bg-tertiary-fixed text-on-tertiary-fixed', 'bg-surface-container-high text-secondary'];
    $('#pd-chips').innerHTML = product.tags.map((t, i) =>
      '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ' + chipCls[i % 4] + ' font-label-md text-label-md">' +
      '<span class="material-symbols-outlined text-[16px]">' + t[1] + '</span>' + esc(t[0]) + '</span>').join('');

    /* --- Selector de formato --- */
    const fmtBox = $('#format-selector');
    function renderFormats() {
      fmtBox.innerHTML = product.formats.map(f => {
        const sel = f.id === format.id;
        const badgeCls = /^-/.test(f.badge || '') ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold' : 'bg-secondary-fixed-dim text-on-secondary-fixed-variant';
        return '<button type="button" data-fid="' + f.id + '" aria-pressed="' + sel + '" class="w-full p-4 rounded-2xl ' + (sel ? 'bg-secondary-container/40' : 'bg-surface-container-low') + ' text-left transition-all duration-200 active:scale-[0.99] flex items-center justify-between shadow-sm">' +
          '<div class="flex items-center gap-3"><div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ' + (sel ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-surface') + '">' +
          '<span class="material-symbols-outlined text-[14px] ' + (sel ? '' : 'hidden') + '">check</span></div><div>' +
          '<div class="flex items-center gap-2 flex-wrap"><span class="font-label-lg text-label-lg text-on-surface">' + esc(f.label) + '</span>' +
          (f.suffix ? '<span class="font-body-sm text-body-sm text-outline font-normal">' + esc(f.suffix) + '</span>' : '') +
          (f.badge ? '<span class="px-2 py-0.5 rounded-full ' + badgeCls + ' font-label-sm text-label-sm">' + esc(f.badge) + '</span>' : '') + '</div>' +
          (f.hint ? '<div class="font-body-sm text-body-sm ' + (f.popular ? 'text-secondary font-medium' : 'text-outline') + '">' + esc(f.hint) + '</div>' : '') +
          '</div></div><div class="text-right flex-shrink-0">' +
          (f.old ? '<span class="block font-body-sm text-body-sm line-through text-outline">' + money(f.old) + '</span>' : '') +
          '<span class="font-headline-sm text-headline-sm text-on-surface">' + money(f.price) + '</span></div></button>';
      }).join('');
    }
    fmtBox.addEventListener('click', e => {
      const btn = e.target.closest('[data-fid]');
      if (!btn) return;
      format = findFormat(product, btn.dataset.fid);
      renderFormats(); updatePrice();
    });
    if (product.formats.length === 1) $('#format-head').classList.add('hidden');
    bind('pd-fit', 'Ideal para ' + pet.name + (pet.weight ? ' (' + pet.weight + ')' : ''));
    renderFormats();

    /* --- Cantidad, suscripción y precio total --- */
    function updatePrice() {
      const unit = subscribed ? format.price * (1 - SUB_DISCOUNT) : format.price;
      bind('pd-total', money(unit * qty));
    }
    $('#qty-minus').addEventListener('click', () => { if (qty > 1) { qty--; $('#qty-val').textContent = qty; updatePrice(); } });
    $('#qty-plus').addEventListener('click', () => { if (qty < MAX_QTY) { qty++; $('#qty-val').textContent = qty; updatePrice(); } });

    const subToggle = $('#subscription-toggle'), subThumb = $('#switch-thumb'), subFreq = $('#subscription-frequency');
    subToggle.addEventListener('click', () => {
      subscribed = !subscribed;
      subToggle.setAttribute('aria-checked', subscribed);
      subToggle.classList.toggle('bg-primary', subscribed);
      subToggle.classList.toggle('bg-surface-container-highest', !subscribed);
      subThumb.classList.toggle('translate-x-5', subscribed);
      subFreq.classList.toggle('hidden', !subscribed);
      updatePrice();
    });
    $$('input[name="freq"]').forEach(r => r.addEventListener('change', () => { freq = Number(r.value); }));

    /* --- Ingredientes --- */
    $('#ingredients-grid').innerHTML = product.ingredients.map(i => {
      const isImg = /^https?:/.test(i[2]);
      return '<div class="p-3 rounded-2xl bg-surface-container-low flex flex-col space-y-2">' +
        '<div class="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center">' +
        (isImg ? '<img class="w-full h-full object-cover" src="' + i[2] + '" alt="' + esc(i[0]) + '" loading="lazy">'
               : '<span class="material-symbols-outlined text-[40px] text-secondary">' + i[2] + '</span>') + '</div>' +
        '<div><span class="font-label-md text-label-md text-on-surface block truncate">' + esc(i[0]) + '</span>' +
        '<span class="font-body-sm text-body-sm text-outline block">' + esc(i[1]) + '</span></div></div>';
    }).join('');

    /* --- Acordeón: análisis nutricional --- */
    const nu = product.nutrition;
    if (nu) {
      $('#nutrition-bars').innerHTML = NUTRI_ROWS.map(r =>
        '<div><div class="flex justify-between font-body-sm text-body-sm mb-1"><span class="text-on-surface font-medium">' + r.label + '</span>' +
        '<span class="font-label-md text-label-md ' + r.text + ' font-bold">' + nu[r.key] + '%</span></div>' +
        '<div class="h-2 w-full bg-surface-container rounded-full overflow-hidden"><div class="h-full ' + r.bar + ' rounded-full" style="width:' + Math.min(100, Math.round(nu[r.key] / r.scale * 100)) + '%"></div></div></div>').join('');
      bind('pd-kcal', '* Energía metabolizable estimada: ' + nu.kcal + ' kcal / 100g. Sin conservadores, colorantes ni aditivos sintéticos.');
    } else {
      $('#acc-nutrition').classList.add('hidden');
    }

    /* --- Acordeón: porción diaria (resalta la que corresponde al peso de la mascota) --- */
    bind('pd-portion-intro', product.portionIntro || 'La ración recomendada equivale aproximadamente al 2% - 3% del peso corporal adulto de tu mascota por día:');
    const mine = bracketOf(weightKg(pet));
    $('#portion-grid').innerHTML = WEIGHT_BRACKETS.map((range, i) =>
      '<div class="p-2.5 rounded-2xl ' + (i === mine ? 'bg-primary-fixed ring-2 ring-primary' : 'bg-surface-container-low') + '">' +
      '<span class="font-label-sm text-label-sm text-outline block">' + range + '</span>' +
      '<span class="font-label-md text-label-md text-on-surface font-bold">' + product.portions[i] + '</span></div>').join('');
    bind('pd-portion-note', mine >= 0 ? 'Para ' + pet.name + ' (' + pet.weight + ') corresponde la porción resaltada.' : '');

    $$('[data-accordion]').forEach(btn => btn.addEventListener('click', () => {
      const body = $('#' + btn.dataset.accordion), open = body.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', open);
      $('.acc-icon', btn).classList.toggle('rotate-180', open);
    }));

    /* --- Productos relacionados --- */
    const related = PRODUCTS.filter(p => p.id !== product.id)
      .sort((a, b) => (b.category === product.category) - (a.category === product.category)).slice(0, 4);
    bind('pd-related-title', 'También le encantará a ' + pet.name);
    $('#related-list').innerHTML = related.map(p =>
      '<a href="detalleproducto.html?id=' + p.id + '" class="snap-start shrink-0 w-36 rounded-2xl bg-surface-container-lowest shadow-sm p-2.5 space-y-2 hover:shadow-md transition-shadow">' +
      '<div class="aspect-square rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center">' + thumb(p, 'text-[40px]') + '</div>' +
      '<p class="font-label-md text-label-md text-on-surface clamp-2 min-h-[2rem]">' + esc(productName(p)) + '</p>' +
      '<p class="font-headline-sm text-headline-sm text-primary font-extrabold">' + money(defaultFormat(p).price) + '</p></a>').join('');

    /* --- Añadir al carrito --- */
    const addBtn = $('#btn-add-cart');
    addBtn.addEventListener('click', () => {
      Cart.add(product.id, format.id, qty);
      if (subscribed) { state.checkout.delivery = 'recurring'; state.checkout.freq = freq; save(); }
      const original = addBtn.innerHTML;
      addBtn.classList.add('bg-secondary');
      addBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span><span>¡Añadido!</span>';
      setTimeout(() => { addBtn.classList.remove('bg-secondary'); addBtn.innerHTML = original; }, 1600);
      toast(qty + ' × ' + productName(product) + ' en tu carrito', { href: 'pago.html', action: 'Ver carrito' });
    });

    updatePrice();
  }

  /* ---------- Página: Perfil de mascota (cliente.html) ---------- */
  const ACTIVITY = {
    'Tranquilo': { adj: 'Tranquilo',   desc: 'Paseos cortos y descanso' },
    'Moderado':  { adj: 'Equilibrado', desc: 'Paseos diarios' },
    'Activo':    { adj: 'Enérgico',    desc: 'Paseos diarios y juegos' }
  };
  const normAge = v => { v = v.trim(); return /^\d+([.,]\d+)?$/.test(v) ? v + (Number(v.replace(',', '.')) === 1 ? ' año' : ' años') : v; };
  const normWeight = v => { v = v.trim(); return /^\d+([.,]\d+)?\s*(kg)?$/i.test(v) ? v.replace(/\s*kg$/i, '') + ' kg' : v; };

  function initPetForm() {
    const isNew = params.has('nuevo');
    const existing = isNew ? null : (state.pets.find(p => p.id === params.get('id')) || activePet());
    const pet = existing
      ? { name: existing.name, species: existing.species, breed: existing.breed, age: existing.age, weight: existing.weight, activity: existing.activity, diets: existing.diets.slice(), photo: existing.photo }
      : { name: '', species: 'Perro', breed: '', age: '', weight: '', activity: 'Moderado', diets: ['croquetas'], photo: null };

    const nameIn = $('#petNameInput'), breedIn = $('#petBreedInput'), ageIn = $('#petAgeInput'), weightIn = $('#petWeightInput');
    nameIn.value = pet.name; breedIn.value = pet.breed || ''; ageIn.value = pet.age; weightIn.value = pet.weight;

    $('#welcomeTag').textContent = existing ? 'Perfil de tu mascota' : '¡Bienvenido a NutriPatas!';

    /* Resumen que se actualiza mientras se escribe */
    function renderSummary() {
      const name = pet.name.trim() || 'Tu Mascota';
      const act = ACTIVITY[pet.activity];
      $('#summaryPetName').textContent = name;
      $('#summaryFooterName').textContent = name;
      $('#summaryInitial').textContent = (pet.name.trim().charAt(0) || '?').toUpperCase();
      $('#summaryPetMeta').textContent = (pet.breed.trim() || pet.species) + ' · ' + act.adj;
      const n = pet.diets.length;
      $('#summaryPlan').textContent = n === 0 ? 'Selecciona al menos una dieta' : (n === 1 ? 'Plan Único · 1 opción seleccionada' : 'Plan Mixto · ' + n + ' opciones seleccionadas');
      $('#activityLabel').textContent = pet.activity;
      $('#activityDesc').textContent = act.desc;
    }
    nameIn.addEventListener('input', () => { pet.name = nameIn.value; $('#nameError').classList.add('hidden'); renderSummary(); });
    breedIn.addEventListener('input', () => { pet.breed = breedIn.value; renderSummary(); });

    /* Nivel de actividad: cada toque cambia al siguiente */
    $('#activityBtn').addEventListener('click', () => {
      const keys = Object.keys(ACTIVITY);
      pet.activity = keys[(keys.indexOf(pet.activity) + 1) % keys.length];
      renderSummary();
    });

    /* Foto de la mascota (se reduce y queda solo en este navegador) */
    function renderAvatar() {
      $('#avatarBox').innerHTML = petAvatar({ name: pet.name || 'Mascota', species: pet.species, photo: pet.photo }, 'w-20 h-20', 36);
    }
    $('#avatarBtn').addEventListener('click', () => $('#photoInput').click());
    $('#photoInput').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !/^image\//.test(file.type)) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = 192, s = Math.min(img.width, img.height), cv = document.createElement('canvas');
          cv.width = cv.height = size;
          cv.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
          pet.photo = cv.toDataURL('image/jpeg', 0.82);
          renderAvatar();
          toast('Foto actualizada', { icon: 'photo_camera' });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    /* Especie */
    const speciesBtns = $$('.species-btn');
    function renderSpecies() {
      speciesBtns.forEach(b => {
        const on = b.dataset.species === pet.species;
        b.classList.toggle('bg-surface-container-lowest', on);
        b.classList.toggle('ring-2', on);
        b.classList.toggle('ring-primary', on);
        b.classList.toggle('shadow-md', on);
        b.classList.toggle('bg-surface-container-low', !on);
        b.setAttribute('aria-pressed', on);
        const circle = $('.species-circle', b);
        circle.classList.toggle('bg-primary-fixed', on);
        circle.classList.toggle('text-on-primary-fixed', on);
        circle.classList.toggle('bg-surface-container-high', !on);
        circle.classList.toggle('text-on-surface-variant', !on);
      });
    }
    speciesBtns.forEach(b => b.addEventListener('click', () => { pet.species = b.dataset.species; renderSpecies(); renderAvatar(); renderSummary(); }));

    /* Dietas (selección múltiple) */
    const dietCards = $$('.diet-card');
    function renderDiets() {
      dietCards.forEach(card => {
        const on = pet.diets.includes(card.dataset.diet);
        const box = $('.diet-checkbox', card);
        card.classList.toggle('ring-2', on);
        card.classList.toggle('ring-primary', on);
        card.setAttribute('aria-checked', on);
        box.classList.toggle('bg-primary', on);
        box.classList.toggle('text-on-primary', on);
        box.classList.toggle('shadow-sm', on);
        box.classList.toggle('bg-surface-container-high', !on);
        box.classList.toggle('text-transparent', !on);
      });
      renderSummary();
    }
    function toggleDiet(card) {
      const d = card.dataset.diet, i = pet.diets.indexOf(d);
      if (i >= 0) pet.diets.splice(i, 1); else pet.diets.push(d);
      renderDiets();
    }
    dietCards.forEach(card => {
      card.setAttribute('role', 'checkbox');
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', () => toggleDiet(card));
      card.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleDiet(card); } });
    });

    /* Eliminar (solo si ya existe y hay más de una mascota) */
    const delBtn = $('#deleteBtn');
    if (existing && state.pets.length > 1) {
      delBtn.classList.remove('hidden');
      delBtn.addEventListener('click', () => {
        if (!confirm('¿Eliminar el perfil de ' + existing.name + '?')) return;
        state.pets = state.pets.filter(p => p.id !== existing.id);
        if (state.activePetId === existing.id) state.activePetId = state.pets[0].id;
        save();
        location.href = 'index.html';
      });
    }

    /* Guardar */
    const submit = $('#submitBtn');
    submit.addEventListener('click', () => {
      if (!pet.name.trim()) {
        $('#nameError').classList.remove('hidden');
        nameIn.classList.remove('anim-shake'); void nameIn.offsetWidth; nameIn.classList.add('anim-shake');
        nameIn.focus();
        return;
      }
      if (!pet.diets.length) { toast('Elige al menos una dieta para personalizar el catálogo', { icon: 'info' }); return; }
      const data = {
        name: pet.name.trim(), species: pet.species, breed: pet.breed.trim(), age: normAge(ageIn.value), weight: normWeight(weightIn.value),
        activity: pet.activity, diets: pet.diets.slice(), photo: pet.photo
      };
      if (existing) Object.assign(existing, data);
      else { state.pets.push(Object.assign({ id: 'pet-' + Date.now().toString(36) }, data)); state.activePetId = state.pets[state.pets.length - 1].id; }
      if (existing) state.activePetId = existing.id;
      save();
      submit.disabled = true;
      submit.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Preparando el tazón de ' + esc(data.name) + '...</span>';
      setTimeout(() => {
        submit.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>¡Menú personalizado listo!</span>';
        setTimeout(() => { location.href = 'index.html'; }, 800);
      }, 900);
    });

    renderAvatar(); renderSpecies(); renderDiets();
  }

  /* ---------- Página: Pago ---------- */
  const SELECTED_CARD = ['bg-surface-container-low', 'ring-2', 'ring-primary'];

  function initCheckout() {
    const c = state.checkout;
    let editing = false;

    /* Aplica o quita el aspecto de "seleccionado" a una tarjeta */
    function mark(el, on) {
      SELECTED_CARD.forEach(cls => el.classList.toggle(cls, on));
      el.classList.toggle('bg-surface-container-lowest', !on);
    }

    function renderBanner(t) {
      const pet = activePet();
      $('#order-avatar').innerHTML = petAvatar(pet, 'w-12 h-12', 24);
      bind('pet-name', pet.name);
      bind('pet-detail', (c.delivery === 'recurring' ? 'Plan Nutricional Activo' : 'Pedido único') + ' • ' + (pet.breed || pet.species));
      bind('items-count', t.items + (t.items === 1 ? ' ítem' : ' ítems'));
    }

    function renderItems(t) {
      $('#btn-edit-items').textContent = editing ? 'Listo' : 'Modificar';
      $('#cart-items').innerHTML = t.lines.map(l => {
        const data = 'data-pid="' + l.product.id + '" data-fid="' + l.format.id + '"';
        const right = editing
          ? '<div class="flex items-center bg-surface-container rounded-full p-0.5">' +
            '<button type="button" ' + data + ' data-line="dec" aria-label="Disminuir cantidad" class="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">' + (l.qty === 1 ? 'delete' : 'remove') + '</span></button>' +
            '<span class="w-7 text-center font-label-lg text-label-lg">' + l.qty + '</span>' +
            '<button type="button" ' + data + ' data-line="inc" aria-label="Aumentar cantidad" class="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">add</span></button></div>'
          : '<span class="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">x' + l.qty + '</span>';
        return '<div class="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-between gap-space-sm">' +
          '<a href="detalleproducto.html?id=' + l.product.id + '" class="flex items-center gap-space-sm min-w-0">' +
          '<div class="w-16 h-16 rounded bg-surface-container overflow-hidden flex-shrink-0 flex items-center justify-center">' + thumb(l.product) + '</div>' +
          '<div class="flex flex-col min-w-0"><span class="font-label-lg text-label-lg text-on-surface truncate">' + esc(productName(l.product)) + '</span>' +
          '<span class="font-body-sm text-body-sm text-on-surface-variant">' + esc(l.format.cart || l.format.label) + '</span>' +
          '<span class="font-label-md text-label-md text-primary mt-0.5">' + money(l.total) + '</span></div></a>' +
          '<div class="flex-shrink-0 pr-space-xs">' + right + '</div></div>';
      }).join('');
    }

    function renderDelivery(t) {
      $$('.delivery-option').forEach(opt => {
        const on = opt.dataset.method === c.delivery;
        mark(opt, on);
        $('input[name="delivery_method"]', opt).checked = on;
        $('.check-indicator', opt).classList.toggle('invisible', !on);
        const sub = $('.delivery-sub', opt);
        if (sub) sub.classList.toggle('hidden', !on);
      });
      $('#date-chips').innerHTML = [1, 2, 3].map((n, i) =>
        '<button type="button" data-date="' + i + '" class="px-space-sm py-1.5 rounded-full ' + (i === c.dateIdx ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface') + ' font-label-md text-label-md whitespace-nowrap">' + dayChip(n) + '</button>').join('');
      $$('input[name="delivery_slot"]').forEach(r => { r.checked = r.value === c.slot; });
      $$('input[name="freq"]').forEach(r => { r.checked = Number(r.value) === c.freq; });
      bind('freq', c.freq);
      bind('next-delivery', longDate(1));
      bind('sub-saving', money(t.subtotal * SUB_DISCOUNT));
      bind('express-fee', c.delivery === 'express' && state.coupon === 'BIENVENIDA' ? 'Gratis' : '+' + money(EXPRESS_FEE));
    }

    function renderAddress() {
      const a = ADDRESSES[c.addressId] || ADDRESSES.casa;
      $('#addr-icon').textContent = a.icon;
      bind('addr-label', a.label);
      bind('addr-line1', a.line1);
      bind('addr-line2', a.line2);
      $('#map-preview').dataset.location = a.line1 + ', ' + a.line2;
    }

    function renderPoints(t) {
      const redeemed = state.redeem && t.canRedeem;
      bind('points-title', redeemed ? POINTS_COST + ' Huellitas Club canjeadas' : 'Canjea ' + POINTS_COST + ' Huellitas Club');
      bind('points-sub', redeemed ? 'Descuento aplicado de -' + money(POINTS_VALUE)
        : (state.points >= POINTS_COST ? 'Tienes ' + state.points + ' pts · ahorra ' + money(POINTS_VALUE) : 'Aún no tienes puntos suficientes'));
      const btn = $('#btn-points');
      btn.textContent = redeemed ? 'Quitar' : 'Canjear';
      btn.disabled = state.points < POINTS_COST;
      btn.classList.toggle('opacity-50', btn.disabled);
    }

    function renderPayment() {
      $$('.payment-option').forEach(opt => {
        const on = $('input', opt).value === c.payment;
        $('input', opt).checked = on;
        mark(opt, on);
        const dot = $('.pay-dot', opt);
        dot.classList.toggle('bg-primary', on);
        dot.classList.toggle('text-on-primary', on);
        dot.classList.toggle('bg-surface-container', !on);
        $('.pay-check', opt).classList.toggle('hidden', !on);
      });
    }

    function renderCoupon() {
      const input = $('#coupon-input'), btn = $('#coupon-btn'), msg = $('#coupon-msg');
      if (state.coupon) {
        input.value = state.coupon; input.readOnly = true;
        btn.textContent = 'Quitar';
        msg.className = 'font-body-sm text-body-sm text-secondary flex items-center gap-1';
        msg.innerHTML = '<span class="material-symbols-outlined text-[16px]" ' + FILL1 + '>check_circle</span>' + esc(COUPONS[state.coupon].title) + ' aplicado';
      } else {
        input.readOnly = false;
        btn.textContent = 'Aplicar';
        if (!msg.dataset.error) { msg.className = 'font-body-sm text-body-sm text-on-surface-variant'; msg.textContent = 'Prueba con HUELLITAS25 o BIENVENIDA.'; }
      }
    }

    function renderTotals(t) {
      const rows = [];
      rows.push(['Subtotal productos (' + t.items + ')', money(t.subtotal), '']);
      if (t.subDiscount) rows.push(['Descuento Suscripción (10%)', '-' + money(t.subDiscount), 'saving']);
      if (state.coupon === 'HUELLITAS25') rows.push(['Cupón HUELLITAS25 (-25% BARF)', t.couponDiscount ? '-' + money(t.couponDiscount) : 'Sin productos BARF', 'saving']);
      if (state.coupon === 'BIENVENIDA') rows.push(['Cupón BIENVENIDA · Snack Dental de regalo', '¡Incluido!', 'saving']);
      if (t.pointsDiscount) rows.push(['Puntos Huellitas Club (-' + POINTS_COST + ' pts)', '-' + money(t.pointsDiscount), 'saving']);
      rows.push(t.shipping ? ['Envío Express con refrigeración', money(t.shipping), ''] : ['Envío con refrigeración', '¡Gratis!', 'saving']);
      $('#breakdown-rows').innerHTML = rows.map(r =>
        '<div class="flex justify-between items-center py-1"><span class="font-body-md text-body-md ' + (r[2] ? 'text-secondary' : 'text-on-surface-variant') + '">' + esc(r[0]) + '</span>' +
        '<span class="font-label-lg text-label-lg ' + (r[2] ? 'text-secondary' : 'text-on-surface') + '">' + esc(r[1]) + '</span></div>').join('');
      bind('total', money(t.total));
    }

    function render() {
      const t = computeTotals();
      const empty = t.lines.length === 0;
      $('#empty-cart').classList.toggle('hidden', !empty);
      $('#checkout-content').classList.toggle('hidden', empty);
      if (empty) return;
      renderBanner(t); renderItems(t); renderDelivery(t); renderAddress(); renderPoints(t); renderPayment(); renderCoupon(); renderTotals(t);
    }
    hooks.onPetChange = render;

    /* --- Productos: editar cantidades --- */
    $('#btn-edit-items').addEventListener('click', () => { editing = !editing; render(); });
    $('#cart-items').addEventListener('click', e => {
      const btn = e.target.closest('[data-line]');
      if (!btn) return;
      const line = state.cart.find(l => l.pid === btn.dataset.pid && l.fid === btn.dataset.fid);
      if (!line) return;
      Cart.setQty(line.pid, line.fid, line.qty + (btn.dataset.line === 'inc' ? 1 : -1));
      if (!Cart.count()) editing = false;
      render();
    });

    /* --- Entrega --- */
    $$('input[name="delivery_method"]').forEach(r => r.addEventListener('change', () => { c.delivery = r.value; save(); render(); }));
    $('#date-chips').addEventListener('click', e => {
      const b = e.target.closest('[data-date]');
      if (b) { c.dateIdx = Number(b.dataset.date); save(); render(); }
    });
    $$('input[name="delivery_slot"]').forEach(r => r.addEventListener('change', () => { c.slot = r.value; save(); }));
    $$('input[name="freq"]').forEach(r => r.addEventListener('change', () => { c.freq = Number(r.value); save(); render(); }));

    /* --- Dirección --- */
    $('#btn-change-address').addEventListener('click', () => {
      const rows = Object.keys(ADDRESSES).map(id => {
        const a = ADDRESSES[id], on = id === c.addressId;
        return '<button type="button" data-addr="' + id + '" class="w-full flex items-center gap-3 p-3.5 rounded-lg text-left shadow-sm ' + (on ? 'bg-secondary-container/50 ring-2 ring-secondary' : 'bg-surface-container-lowest') + '">' +
          '<span class="material-symbols-outlined text-primary">' + a.icon + '</span><span class="flex-1 min-w-0"><span class="block font-label-lg text-label-lg text-on-surface">' + a.label + '</span>' +
          '<span class="block font-body-sm text-body-sm text-on-surface-variant truncate">' + a.line1 + ' · ' + a.line2 + '</span></span>' +
          (on ? '<span class="material-symbols-outlined text-secondary" ' + FILL1 + '>check_circle</span>' : '') + '</button>';
      }).join('');
      openSheet(sheetHeader('Dirección de entrega', 'location_on') + '<div class="px-margin-mobile pb-space-lg space-y-3">' + rows + '</div>', {
        label: 'Elegir dirección',
        onMount(panel) {
          panel.addEventListener('click', e => {
            const b = e.target.closest('[data-addr]');
            if (!b) return;
            c.addressId = b.dataset.addr; save(); closeSheet(); render();
            toast('Dirección actualizada', { icon: 'location_on' });
          });
        }
      });
    });
    const notes = $('#delivery-notes');
    notes.value = c.notes || '';
    notes.addEventListener('input', () => { c.notes = notes.value; save(); });

    /* --- Puntos, pago y cupón --- */
    $('#btn-points').addEventListener('click', () => { state.redeem = !(state.redeem && computeTotals().canRedeem); save(); render(); });
    $$('.payment-option input').forEach(r => r.addEventListener('change', () => { c.payment = r.value; save(); render(); }));
    $('#btn-new-card').addEventListener('click', () => toast('Demostración: aquí se agregaría una tarjeta nueva', { icon: 'info' }));

    $('#coupon-form').addEventListener('submit', e => {
      e.preventDefault();
      const msg = $('#coupon-msg'), input = $('#coupon-input');
      delete msg.dataset.error;
      if (state.coupon) { state.coupon = null; save(); input.value = ''; render(); return; }
      const code = input.value.trim().toUpperCase();
      if (!applyCoupon(code)) {
        msg.dataset.error = '1';
        msg.className = 'font-body-sm text-body-sm text-error flex items-center gap-1';
        msg.innerHTML = '<span class="material-symbols-outlined text-[16px]">error</span>' + (code ? 'El cupón "' + esc(code) + '" no es válido.' : 'Escribe un código de cupón.');
        input.classList.remove('anim-shake'); void input.offsetWidth; input.classList.add('anim-shake');
        return;
      }
      render();
    });

    /* --- Confirmar pedido --- */
    $('#btn-confirm').addEventListener('click', () => {
      const t = computeTotals();
      if (!t.lines.length) return;
      const btn = $('#btn-confirm');
      btn.disabled = true;
      btn.innerHTML = '<span class="flex items-center gap-space-xs mx-auto"><span class="material-symbols-outlined animate-spin text-[22px]">sync</span>Procesando pago...</span>';
      setTimeout(() => {
        const pet = activePet();
        const earned = Math.floor(t.total);
        const order = {
          id: 'NP-' + Math.floor(100000 + Math.random() * 900000),
          pet: pet.name, total: t.total, earned,
          eta: c.delivery === 'express' ? 'Hoy, en menos de 3 horas'
             : c.delivery === 'scheduled' ? dayChip(c.dateIdx + 1) + ' · ' + (c.slot === '10-13' ? '10:00 - 13:00 hrs' : '15:00 - 19:00 hrs')
             : longDate(1) + ' (luego cada ' + c.freq + ' días)',
          payment: PAYMENTS[c.payment], items: t.items
        };
        state.orders.unshift(order);
        state.orders = state.orders.slice(0, 10);
        state.points = state.points - (t.pointsDiscount ? POINTS_COST : 0) + earned;
        state.cart = [];
        state.coupon = null;
        save();
        showSuccess(order);
      }, 1100);
    });

    render();
  }

  function showSuccess(order) {
    const row = (icon, label, value) =>
      '<div class="flex items-start gap-3 py-2.5"><span class="material-symbols-outlined text-secondary text-[22px]">' + icon + '</span>' +
      '<div class="min-w-0"><p class="font-body-sm text-body-sm text-on-surface-variant">' + label + '</p><p class="font-label-lg text-label-lg text-on-surface">' + esc(value) + '</p></div></div>';
    const el = document.createElement('div');
    el.className = 'success-screen bg-surface px-margin-mobile pt-space-xl pb-space-xl';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Pedido confirmado');
    el.innerHTML =
      '<div class="flex flex-col items-center text-center pt-8">' +
        '<div class="anim-pop w-24 h-24 rounded-full bg-secondary-container text-secondary flex items-center justify-center shadow-md"><span class="material-symbols-outlined text-[56px]" ' + FILL1 + '>check_circle</span></div>' +
        '<h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-space-lg">¡Pedido confirmado!</h1>' +
        '<p class="font-body-md text-body-md text-on-surface-variant mt-1">El menú de <strong>' + esc(order.pet) + '</strong> ya está en preparación. 🐾</p>' +
        '<span class="mt-space-md px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg tracking-wider">' + order.id + '</span>' +
      '</div>' +
      '<div class="mt-space-lg rounded-xl bg-surface-container-low p-space-md divide-y divide-surface-container-high">' +
        row('local_shipping', 'Entrega estimada', order.eta) + row('credit_card', 'Método de pago', order.payment) +
        row('shopping_bag', 'Total pagado (' + order.items + (order.items === 1 ? ' ítem' : ' ítems') + ')', money(order.total)) +
        row('stars', 'Huellitas Club', '+' + order.earned + ' puntos sumados') +
      '</div>' +
      '<div class="mt-space-lg space-y-3">' +
        '<a href="index.html" class="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-lg active:scale-95 transition-all"><span class="material-symbols-outlined text-[20px]">home</span>Volver al inicio</a>' +
        '<p class="text-center font-body-sm text-body-sm text-on-surface-variant">Esta es una demostración: no se realizó ningún cobro real.</p>' +
      '</div>';
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    $('a', el).focus();
  }

  /* =======================================================
     7. ARRANQUE
     ======================================================= */
  const pages = { home: initHome, product: initProduct, pet: initPetForm, checkout: initCheckout };

  /* Acciones comunes disparadas con data-action="..." en cualquier página */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const handlers = {
      'back': goBack, 'open-pets': openPetSheet, 'open-profile': openProfileSheet,
      'open-promos': openPromoSheet, 'open-search': openSearch
    };
    const fn = handlers[t.dataset.action];
    if (fn) { e.preventDefault(); fn(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  document.addEventListener('error', e => { if (e.target && e.target.tagName === 'IMG') imageFallback(e.target); }, true);

  function start() {
    $$('img').forEach(img => { if (img.complete && img.naturalWidth === 0 && img.src) imageFallback(img); });
    const entry = pages[document.body.dataset.page];
    if (entry) entry();
    updateBadges();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
