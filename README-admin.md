# Panel de administración (/admin)

El sitio ahora se genera con [Eleventy](https://www.11ty.dev/) a partir de los
JSON en `src/_data/recursos/`. Para añadir, editar o borrar un recurso sin
tocar código, usa el panel en `https://correcte12.github.io/admin/`
(Decap CMS). Al guardar, hace commit directo al repo y una GitHub Action
reconstruye el sitio en unos segundos.

**Estado actual: funcionando.** El login con GitHub y el Worker de
Cloudflare (`recursos.correcte12.workers.dev`) ya están desplegados y en
uso. Esta guía se mantiene por si algún día hay que recrear el Worker desde
cero (por ejemplo, en otra cuenta de Cloudflare).

## 1. Probar el panel en local (sin nada más)

`admin/config.yml` ya tiene `local_backend: true`, así que puedes probarlo
ahora mismo sin desplegar nada:

```
npm install
npx decap-server &
npm start
```

Abre `http://localhost:8080/admin/` — Decap detecta el backend local y te
deja editar y guardar directamente en tus archivos, sin login. Es la forma
más rápida de ver el panel funcionando y de revisar que los formularios
reflejan bien tus categorías.

## 2. Login real desde la web pública

Para que el botón "Login with GitHub" funcione en `correcte12.github.io/admin`
(no solo en local), hacen falta dos piezas:

### 2.1. Crear la GitHub OAuth App

1. En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Rellena:
   - **Application name**: `correcte12 recursos admin` (o lo que prefieras)
   - **Homepage URL**: `https://correcte12.github.io`
   - **Authorization callback URL**: `https://TU-WORKER.workers.dev/callback`
     (la sabrás en el siguiente paso; puedes volver a editarla después)
3. Guarda. Copia el **Client ID** y genera un **Client Secret** (solo se
   muestra una vez, guárdalo).

### 2.2. Desplegar el Cloudflare Worker

El código ya está en `cloudflare-worker/oauth-worker.js`. Es un proxy de
~80 líneas que solo gestiona el login, no aloja nada del sitio.

1. Crea una cuenta gratuita en <https://dash.cloudflare.com/sign-up> (no
   pide tarjeta para el plan gratuito de Workers).
2. **Workers & Pages → Create → Create Worker**. Dale un nombre, por
   ejemplo `correcte12-admin-auth`.
3. Pega el contenido de `cloudflare-worker/oauth-worker.js` en el editor y
   pulsa **Deploy**.
4. Ve a **Settings → Variables and Secrets** del Worker y añade:
   - `GITHUB_CLIENT_ID` → el Client ID del paso 2.1 (puede ir en texto plano)
   - `GITHUB_CLIENT_SECRET` → el Client Secret del paso 2.1 (márcalo como
     **Secret**, no como texto plano)
5. Guarda. Copia la URL pública del Worker, algo como
   `https://correcte12-admin-auth.tu-usuario.workers.dev`.

### 2.3. Conectar las piezas

1. Vuelve a la GitHub OAuth App y confirma que la **Authorization callback
   URL** es exactamente `https://TU-WORKER.workers.dev/callback`.
2. Edita `admin/config.yml` en el repo: sustituye
   `https://REEMPLAZA-CON-TU-WORKER.workers.dev` por la URL real del Worker
   (sin `/callback` al final, solo el dominio).
3. Haz commit y push. La GitHub Action reconstruirá el sitio.
4. Entra en `https://correcte12.github.io/admin/`, pulsa login, autoriza con
   tu cuenta de GitHub (correcte12) y ya deberías ver el panel con las 6
   categorías listas para editar.

Como el repo es privado para ti (solo tú tienes permisos de escritura),
solo tu cuenta de GitHub podrá completar el login y guardar cambios, aunque
la página de login sea pública.

### Si el login se queda colgado en blanco

Nos pasó una vez: alguna extensión de Chrome (en concreto, React DevTools)
manda su propio `postMessage` a la ventana de callback, y si el código del
Worker no comprueba el contenido del mensaje antes de reenviarlo, ese
mensaje de la extensión "cuela" como si fuera la respuesta real de Decap y
rompe el login silenciosamente (la ventana se queda en blanco, sin errores
visibles). El código en `cloudflare-worker/oauth-worker.js` ya filtra esto
(`if (message.data !== "authorizing:github") return;`) — si alguna vez
recreas el Worker desde cero, asegúrate de mantener ese filtro.

## Cómo se guardan los recursos

Cada categoría es un fichero en `src/_data/recursos/*.json` con esta forma:

```json
{
  "titulo": "Nombre de la categoría",
  "descripcion": "Texto introductorio de la página",
  "grupos": [
    {
      "titulo": "Nombre del grupo/acordeón",
      "recursos": [
        {
          "titulo": "Nombre del recurso",
          "descripcion": "Descripción corta",
          "url": "https://ejemplo.com",
          "imagen": "nombre-de-archivo.png"
        }
      ]
    }
  ]
}
```

El campo `imagen` es el nombre de un archivo dentro de `img/` (sin la
carpeta). Si quieres usar una imagen nueva, súbela a `img/` por git antes
de referenciarla desde el panel (el widget de imagen con subida directa
queda como posible mejora futura).
