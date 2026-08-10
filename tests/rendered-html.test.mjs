import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the tapri radio shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>टपरी रेडियो<\/title>/i);
  assert.match(html, /YT Music/);
  assert.match(html, /Tapri Radio Playlist/);
  assert.match(html, /Play playlist on this site/);
  assert.match(html, /Bhai aaj office mein kya kaand hua pata hai/);
  assert.doesNotMatch(html, /2:11pm|Song name here|0:05 \/ 5:04|cutting ready/i);
});

test("keeps dynamic player, clock, and gossip wired", async () => {
  const [page, player, clock, gossip, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PlaylistPlayer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/IndiaClock.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/GossipTicker.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PLcBmiDcQHQPM/);
  assert.match(page, /IndiaClock/);
  assert.match(page, /GossipTicker/);
  assert.match(player, /youtube\.com\/iframe_api/);
  assert.match(player, /playVideo/);
  assert.match(player, /previousVideo/);
  assert.match(player, /nextVideo/);
  assert.match(clock, /timeZone:\s*"Asia\/Kolkata"/);
  assert.match(gossip, /window\.setInterval/);
  assert.match(gossip, /window\.clearInterval/);
  assert.match(css, /url\("\/bg\.jpg"\)/);
  assert.match(css, /youtube-host/);
  assert.match(css, /is-paused/);
  assert.match(css, /is-visible/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /overflow:\s*hidden/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
