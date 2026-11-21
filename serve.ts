// Deno static file server for ./game. No dependencies.
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export async function serveStatic(port) {
  // Serves ./game only; directory traversal is rejected below.
  const root = new URL("./game/", import.meta.url).pathname;
  console.log("Solar Bay serving " + root + " on http://localhost:" + port);
  await Deno.serve({ port: port }, async (req) => {
    try {
      const url = new URL(req.url);
      let path = decodeURIComponent(url.pathname);
      if (path === "/") path = "/index.html";
      if (path.includes("..")) return new Response("Forbidden", { status: 403 });
      const filePath = root + path.replace(/^\//, "");
      const data = await Deno.readFile(filePath);
      const dot = path.lastIndexOf(".");
      const ext = dot >= 0 ? path.slice(dot).toLowerCase() : "";
      const type = MIME[ext] || "application/octet-stream";
      return new Response(data, { headers: { "content-type": type } });
    } catch {
      return new Response("404 Not Found", { status: 404 });
    }
  }).finished;
}
