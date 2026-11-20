// Minimal static file server for Solar Bay: Outlaw.
// No dependencies — uses only Deno's built-in HTTP server.
// Serves ./game by default; see main.ts for the entrypoint.

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function mimeFor(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return "application/octet-stream";
  return MIME_TYPES[path.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

export interface ServeOptions {
  root: string;
  port: number;
}

export function serveStatic({ root, port }: ServeOptions): void {
  Deno.serve({ port }, async (req: Request) => {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";

    // Prevent directory traversal outside the game root.
    const safePath = pathname.replace(/\.\.+/g, ".");
    const filePath = `${root}${safePath}`;

    try {
      const data = await Deno.readFile(filePath);
      return new Response(data, {
        headers: { "content-type": mimeFor(filePath) },
      });
    } catch {
      return new Response("404 Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  });
}
