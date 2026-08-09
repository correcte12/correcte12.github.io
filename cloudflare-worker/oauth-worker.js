// Proxy OAuth mínimo para que el panel /admin (Decap CMS) pueda iniciar
// sesión con GitHub. No aloja ningún contenido del sitio: solo gestiona
// el "quién eres" cuando entras a /admin y pulsas "Login with GitHub".
//
// Requiere dos variables de entorno configuradas en el Worker:
//   GITHUB_CLIENT_ID      - Client ID de la GitHub OAuth App
//   GITHUB_CLIENT_SECRET  - Client Secret de la GitHub OAuth App (como "secret" cifrado)
//
// Ver README-admin.md para los pasos de despliegue.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const redirectUri = `${url.origin}/callback`;
      const state = crypto.randomUUID();

      const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
      githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
      githubAuthUrl.searchParams.set("scope", "repo,user");
      githubAuthUrl.searchParams.set("state", state);

      return Response.redirect(githubAuthUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Falta el parámetro code en la respuesta de GitHub.", { status: 400 });
      }

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          `Error de autenticación de GitHub: ${tokenData.error_description || tokenData.error}`,
          { status: 400 }
        );
      }

      const content = { token: tokenData.access_token, provider: "github" };

      // Protocolo de postMessage que espera Decap CMS: el popup anuncia
      // "authorizing:github" y, cuando el opener responde, le envía el token.
      const html = `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(message) {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify(content)}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response(
      "Servicio de login del panel /admin de correcte12.github.io. Nada que ver aquí directamente.",
      { status: 200 }
    );
  },
};
