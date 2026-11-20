// Minimal Deno static file server for Solar Bay: Outlaw.
// Serves the ./game directory with correct MIME types, no external dependencies.
// Usage: imported by main.ts; call serveStatic({ port: 8000, root: "./game" }).

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function mimeFor(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return "application/octet-stream";
  return MIME_TYPES[path.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

export interface ServeOptions {
  port?: number;
  root?: string;
}

export function serveStatic(options: ServeOptions = {}): void {
  const port = options.port ?? 8000;
  const root = options.root ?? "./game";

  Deno.serve({ port }, async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";

    // Prevent directory traversal.
    if (pathname.includes("..")) {
      return new Response("Bad Request", { status: 400 });
    }

    const filePath = `${root}${pathname}`;
    try {
      const data = await Deno.readFile(filePath);
      return new Response(data, {
        headers: { "Content-Type": mimeFor(pathname) },
      });
    } catch {
      return new Response("404 Not Found", { status: 404 });
    }
  });
}
