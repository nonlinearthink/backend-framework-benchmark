const port = Number(process.env.PORT) || 3456;
const root = `${import.meta.dir}/../results`;
const url = `http://127.0.0.1:${port}/compare.html`;

function openBrowser(target: string): void {
  const platform = process.platform;
  if (platform === "win32") {
    Bun.spawn(["cmd", "/c", "start", "", target], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return;
  }
  if (platform === "darwin") {
    Bun.spawn(["open", target], { stdout: "ignore", stderr: "ignore" });
    return;
  }
  Bun.spawn(["xdg-open", target], { stdout: "ignore", stderr: "ignore" });
}

console.log(`Serving ${root}`);
console.log(`Open ${url}`);

Bun.serve({
  port,
  hostname: "127.0.0.1",
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const rel = pathname === "/" ? "/compare.html" : pathname;
    const file = Bun.file(`${root}${rel}`);
    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(file);
  },
});

openBrowser(url);
