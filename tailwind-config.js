/* =========================================================
   NutriPatas - Tema de diseño (exportado de Google Stitch)
   Se carga justo después del CDN de Tailwind en cada página.
   Aquí viven la paleta de colores, tipografías y espaciados.
   ========================================================= */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#eff2ed", "tertiary-container": "#cc8143", "surface-tint": "#a33d23",
        "outline-variant": "#dec0b9", "surface-container-low": "#f1f4f0", "surface-container-lowest": "#ffffff",
        "tertiary-fixed-dim": "#ffb780", "inverse-surface": "#2d312e", "on-tertiary-container": "#472200",
        "on-error-container": "#93000a", "on-background": "#191c1a", "surface-container": "#ecefea",
        "on-surface": "#191c1a", "secondary-fixed-dim": "#a9d0ae", "primary": "#a33d23",
        "secondary-container": "#c2eac6", "primary-container": "#e76f51", "on-tertiary": "#ffffff",
        "secondary-fixed": "#c5ecc9", "on-error": "#ffffff", "primary-fixed": "#ffdad2",
        "on-primary-container": "#590f00", "tertiary": "#8e4e14", "on-secondary-fixed": "#00210c",
        "on-secondary": "#ffffff", "surface-container-high": "#e6e9e4", "tertiary-fixed": "#ffdcc4",
        "surface": "#f7faf5", "on-primary-fixed": "#3c0700", "error-container": "#ffdad6",
        "surface-container-highest": "#e0e3df", "secondary": "#44664a", "on-secondary-container": "#486b4e",
        "primary-fixed-dim": "#ffb4a2", "surface-variant": "#e0e3df", "surface-dim": "#d8dbd6",
        "on-surface-variant": "#57423d", "error": "#ba1a1a", "on-secondary-fixed-variant": "#2c4e34",
        "surface-bright": "#f7faf5", "on-tertiary-fixed-variant": "#6f3800", "on-primary-fixed-variant": "#83260e",
        "on-primary": "#ffffff", "background": "#f7faf5", "inverse-primary": "#ffb4a2", "outline": "#8a716c",
        "on-tertiary-fixed": "#2f1400"
      },
      borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
      spacing: {
        "space-xl": "2.25rem", "gutter": "1rem", "space-sm": "0.5rem", "margin-mobile": "1rem",
        "space-xs": "0.25rem", "space-lg": "1.5rem", "gutter-mobile": "0.75rem", "margin": "1.5rem",
        "space-md": "1rem"
      },
      screens: { "xs": "400px" },
      fontFamily: {
        "label-lg": ["Karla"], "display-lg": ["Bricolage Grotesque"], "headline-lg-mobile": ["Bricolage Grotesque"],
        "headline-md": ["Bricolage Grotesque"], "label-sm": ["Karla"], "label-md": ["Karla"], "body-md": ["Karla"],
        "body-lg": ["Karla"], "headline-sm": ["Bricolage Grotesque"], "body-sm": ["Karla"],
        "headline-lg": ["Bricolage Grotesque"]
      },
      fontSize: {
        "label-lg": ["15px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "700" }],
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.03em", fontWeight: "800" }],
        "headline-lg-mobile": ["26px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "700" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "700" }],
        "body-md": ["15px", { lineHeight: "22px", letterSpacing: "0em", fontWeight: "400" }],
        "body-lg": ["17px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "600" }],
        "body-sm": ["13px", { lineHeight: "18px", letterSpacing: "0em", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "700" }]
      }
    }
  }
};
