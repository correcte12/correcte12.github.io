# Recursos de correcte12

Sitio con los recursos web que voy recopilando (gráficos, temas, UML,
dominios/hosting, SEO y desarrollo), agrupados por categoría.

Generado con [Eleventy](https://www.11ty.dev/) a partir de los datos en
`src/_data/recursos/*.json` y publicado en GitHub Pages mediante GitHub
Actions.

## Desarrollo local

```
npm install
npm start
```

Levanta el sitio en `http://localhost:8080` con recarga automática.

## Build de producción

```
npm run build
```

Genera el sitio estático en `_site/`. En GitHub, el workflow
`.github/workflows/deploy.yml` hace esto automáticamente en cada push a
`master` y lo publica en GitHub Pages.

## Añadir o editar recursos

Dos formas:

1. **Panel de administración**: `https://correcte12.github.io/admin/`
   (ver [README-admin.md](README-admin.md) para la configuración del login).
2. **A mano**: edita el JSON de la categoría correspondiente en
   `src/_data/recursos/` y haz commit.

## Comprobación de enlaces

`.github/workflows/link-check.yml` revisa semanalmente que las URLs de los
recursos sigan respondiendo, y abre un issue si detecta alguna caída.
