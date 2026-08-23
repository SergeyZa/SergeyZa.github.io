import { createServer } from "node:http";
import { joinSession, createCanvas } from "@github/copilot-sdk/extension";

const servers = new Map();

function renderHtml() {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GitHub Pages helper</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: var(--font-sans, system-ui, sans-serif);
        background: var(--background-color-default, #fff);
        color: var(--text-color-default, #111);
      }
      code {
        font-family: var(--font-mono, ui-monospace, monospace);
      }
    </style>
  </head>
  <body>
    <h1>GitHub Pages helper</h1>
    <p>This canvas is ready for GitHub Pages setup work.</p>
  </body>
</html>`;
}

async function startServer() {
    const server = createServer((req, res) => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(renderHtml());
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/` };
}

await joinSession({
    canvases: [
        createCanvas({
            id: "github-pages-helper",
            displayName: "GitHub Pages helper",
            description: "Inspect and set up GitHub Pages for this repository",
            actions: [
                {
                    name: "refresh",
                    description: "Refresh the canvas server",
                    handler: async (ctx) => {
                        const entry = servers.get(ctx.instanceId);
                        if (entry) {
                            await new Promise((resolve) => entry.server.close(() => resolve()));
                            servers.delete(ctx.instanceId);
                        }
                        const fresh = await startServer();
                        servers.set(ctx.instanceId, fresh);
                        return { ok: true, url: fresh.url };
                    },
                },
            ],
            open: async (ctx) => {
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    entry = await startServer();
                    servers.set(ctx.instanceId, entry);
                }
                return { title: "GitHub Pages helper", url: entry.url };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (entry) {
                    servers.delete(ctx.instanceId);
                    await new Promise((resolve) => entry.server.close(() => resolve()));
                }
            },
        }),
    ],
});
