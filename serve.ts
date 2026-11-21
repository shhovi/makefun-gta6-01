const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function mimeFor(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  const ext = path.slice(dot).toLowerCase();
  return MIME[ext] ?? "application/octet-stream";
}

export async function serveStatic(port: number): Promise<void> {
  const root = new URL("./game/", import.meta.url);
  const handler = async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === "/" || pathname === "") pathname = "/index.html";
      if (pathname.includes("..")) {
        return new Response("Bad Request", { status: 400 });
      }
      const fileUrl = new URL("." + pathname, root);
      const data = await Deno.readFile(fileUrl);
      return new Response(data, {
        status: 200,
        headers: { "content-type": mimeFor(pathname) },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  };
  console.log("Solar Bay: Outlaw serving game on port " + String(port) + " (static, no deps)");
  await Deno.serve({ port }, handler).finished;
}
