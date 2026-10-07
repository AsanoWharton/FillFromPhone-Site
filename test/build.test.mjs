import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("static build contains every public page and required local asset", async () => {
  const paths = [
    "../dist/index.html",
    "../dist/privacy/index.html",
    "../dist/support/index.html",
    "../dist/test/index.html",
    "../dist/assets/header.css",
    "../dist/assets/home.css",
    "../dist/assets/test.js",
    "../dist/favicon.png"
  ];
  await Promise.all(paths.map((path) => access(new URL(path, import.meta.url))));
});

test("public pages do not disclose deployment topology", async () => {
  const pages = ["index.html", "privacy/index.html", "support/index.html"];
  for (const page of pages) {
    const body = await readFile(new URL(`../dist/${page}`, import.meta.url), "utf8");
    assert.doesNotMatch(body, /Cloudflare|Tunnel|Nginx|LXC|Proxmox|systemd|192\.168\./iu);
  }
});

test("test page stays unlinked from the public navigation", async () => {
  const home = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(home, /href=["']\/test/iu);
  const example = await readFile(new URL("../dist/test/index.html", import.meta.url), "utf8");
  assert.match(example, /noindex,?\s*nofollow,?\s*noarchive/u);
});

test("field help is exclusive and light-dismissable", async () => {
  const example = await readFile(new URL("../dist/test/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../dist/assets/test.js", import.meta.url), "utf8");
  assert.equal((example.match(/class="field-tip" name="field-help"/gu) ?? []).length, 3);
  assert.match(script, /pointerdown/u);
  assert.match(script, /focusin/u);
  assert.match(script, /Escape/u);
});

test("test steps reserve room for their labels before wrapping", async () => {
  const styles = await readFile(new URL("../dist/assets/test.css", import.meta.url), "utf8");
  assert.match(styles, /\.quick-steps \{[^}]*grid-template-columns: repeat\(3, auto\)/u);
  assert.match(styles, /\.quick-steps li \{[^}]*min-inline-size: 0/u);
});

test("home and missing-extension states point to the current GitHub release", async () => {
  const home = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const example = await readFile(new URL("../dist/test/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../dist/assets/test.js", import.meta.url), "utf8");
  const download = /https:\/\/github\.com\/AsanoWharton\/FillFromPhone-Extension\/releases\/latest\/download\/fill-from-phone-0\.6\.2-chrome-web-store\.zip/u;
  assert.match(home, /Extend one key, not the keyring\./u);
  assert.match(home, /Chrome Web Store · Coming soon/u);
  assert.match(home, download);
  assert.match(example, /id="extension-install"[^>]+hidden/u);
  assert.match(example, download);
  assert.match(script, /extension-install/u);
  assert.match(script, /Extension not detected/u);
});

test("support uses direct licensing language", async () => {
  const support = await readFile(new URL("../dist/support/index.html", import.meta.url), "utf8");
  assert.match(support, /Commercial evaluation, integration, and licensing are available only by written agreement/u);
});

test("support consolidates process, security, cryptography, limits, and notices", async () => {
  const support = await readFile(new URL("../dist/support/index.html", import.meta.url), "utf8");
  assert.match(support, /<title>Support and technical FAQ · Fill from Phone<\/title>/u);
  assert.match(support, /mailto:contact@asanowharton\.com/u);
  assert.equal((support.match(/<details name="support-faq">/gu) ?? []).length, 9);
  assert.equal((support.match(/<details name="support-faq"><summary>/gu) ?? []).length, 9);
  for (const anchor of ["using", "troubleshooting", "process", "security", "cryptography", "limitations", "notices", "contact"]) {
    assert.match(support, new RegExp(`id="${anchor}"`, "u"));
  }
  assert.match(support, /P-256 ECDH/u);
  assert.match(support, /HKDF-SHA-256/u);
  assert.match(support, /AES-256-GCM/u);
  assert.match(support, /relay opacity/u);
  assert.match(support, /These licenses below|licenses below apply only/u);
  assert.match(support, /SIL OFL 1\.1/u);
  assert.doesNotMatch(support, /href="\/(?:security|cryptography|licenses)"/u);
  const securityPolicy = await readFile(new URL("../dist/security.txt", import.meta.url), "utf8");
  assert.match(securityPolicy, /^Contact: mailto:contact@asanowharton\.com$/mu);
});

test("site chrome keeps only the wordmark, support, privacy, and terms", async () => {
  for (const page of ["index.html", "privacy/index.html", "support/index.html", "test/index.html"]) {
    const body = await readFile(new URL(`../dist/${page}`, import.meta.url), "utf8");
    const navigation = body.match(/<nav aria-label="Primary">([\s\S]*?)<\/nav>/u)?.[1] ?? "";
    assert.match(body, /class="site-wordmark" href="\/"/u);
    assert.match(navigation, /href="\/support"/u);
    assert.equal((navigation.match(/<a /gu) ?? []).length, 1);
    assert.match(body, /<nav aria-label="Legal"><a href="\/privacy">Privacy<\/a><a href="\/privacy#terms">Terms of Service<\/a><\/nav>/u);
    assert.match(body, /<p class="footer-copy"><span>&copy; 2026 <a href="https:\/\/fillfromphone\.com">FillFromPhone\.com<\/a>\.<\/span><span>Powered by <a href="https:\/\/asanowharton\.com">Asano Wharton, LLC<\/a>\.<\/span><span>All rights reserved\.<\/span><\/p>/u);
  }
});

test("privacy page includes concise terms of service", async () => {
  const privacy = await readFile(new URL("../dist/privacy/index.html", import.meta.url), "utf8");
  assert.match(privacy, /id="terms"/u);
  assert.match(privacy, /Use only what you are authorized to transfer/u);
  assert.match(privacy, /you may not reverse engineer, decompile, disassemble/u);
  assert.match(privacy, /rights that cannot lawfully be waived, including qualifying interoperability activity/u);
});
