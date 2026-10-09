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
    "../dist/assets/space-grotesk-400.woff2",
    "../dist/assets/space-grotesk-500.woff2",
    "../dist/assets/space-grotesk-700.woff2",
    "../dist/assets/sora-700.woff2",
    "../dist/favicon.png",
    "../dist/security.txt",
    "../dist/.well-known/security.txt"
  ];
  await Promise.all(paths.map((path) => access(new URL(path, import.meta.url))));
});

test("security policy is emitted at its advertised canonical path", async () => {
  const rootPolicy = await readFile(new URL("../dist/security.txt", import.meta.url), "utf8");
  const canonicalPolicy = await readFile(new URL("../dist/.well-known/security.txt", import.meta.url), "utf8");
  assert.equal(canonicalPolicy, rootPolicy);
  assert.match(canonicalPolicy, /^Canonical: https:\/\/remotefill\.com\/\.well-known\/security\.txt$/mu);
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
  assert.match(example, /\/assets\/eye\.svg\?v=0d514e/u);
  assert.match(example, /\/assets\/eye-slash\.svg\?v=0d514e/u);
});

test("test steps reserve room for their labels before wrapping", async () => {
  const styles = await readFile(new URL("../dist/assets/test.css", import.meta.url), "utf8");
  assert.match(styles, /\.quick-steps \{[^}]*grid-template-columns: repeat\(3, auto\)/u);
  assert.match(styles, /\.quick-steps li \{[^}]*min-inline-size: 0/u);
});

test("home and missing-extension states point to the published Chrome listing", async () => {
  const home = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const example = await readFile(new URL("../dist/test/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../dist/assets/test.js", import.meta.url), "utf8");
  const download = /https:\/\/chromewebstore\.google\.com\/detail\/npnlkifegebcabfbllgokeocadbeegbf/u;
  assert.match(home, /Extend one key, not the keyring\./u);
  assert.match(home, /Available in the Chrome Web Store/u);
  assert.match(home, /Choose\. Scan\. Send\./u);
  assert.equal((home.match(/\/assets\/transfer-hero\.png\?v=48fb6005/gu) ?? []).length, 1);
  assert.equal((home.match(/class="availability-badge"/gu) ?? []).length, 1);
  assert.equal((home.match(/class="closing-cta"/gu) ?? []).length, 1);
  assert.match(home, /Keep the vault on your phone\./u);
  assert.equal((home.match(/>Add to Chrome<\/a>/gu) ?? []).length, 2);
  assert.match(example, />Add to Chrome<\/a>/u);
  assert.doesNotMatch(home, /benefit-strip/u);
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
  assert.match(support, /<title>Support and technical FAQ · Remote Fill<\/title>/u);
  assert.match(support, /mailto:contact@asanowharton\.com/u);
  assert.equal((support.match(/<details name="support-faq">/gu) ?? []).length, 10);
  assert.equal((support.match(/<details name="support-faq"><summary>/gu) ?? []).length, 10);
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
    assert.match(body, /<p class="footer-copy"><span>&copy; 2026 <a href="https:\/\/remotefill\.com">Remote Fill<\/a>\.<\/span><span>Powered by <a href="https:\/\/asanowharton\.com">Asano Wharton, LLC<\/a>\.<\/span><span>All rights reserved\.<\/span><\/p>/u);
  }
});

test("support is presented as a regular navigation link", async () => {
  const styles = await readFile(new URL("../dist/assets/header.css", import.meta.url), "utf8");
  assert.match(styles, /\.site-wordmark \{[^}]*font-family: "Sora", "Space Grotesk", sans-serif;[^}]*font-size-adjust: from-font/u);
  const supportRule = styles.match(/\.site-support \{([^}]*)\}/u)?.[1] ?? "";
  assert.doesNotMatch(supportRule, /border|background|min-height/u);
  assert.match(styles, /\.site-support:hover, \.site-support\[aria-current="page"\] \{[^}]*text-decoration: underline/u);
  assert.match(styles, /\.site-wordmark:focus-visible, \.site-support:focus-visible \{[^}]*outline: 4px solid var\(--focus\)/u);
});

test("site uses Asano Wharton typography with the Remote Fill green palette", async () => {
  const styles = await readFile(new URL("../dist/assets/home.css", import.meta.url), "utf8");
  const support = await readFile(new URL("../dist/support/index.html", import.meta.url), "utf8");
  assert.match(styles, /--accent: #146c68/u);
  assert.match(styles, /font-family: "Space Grotesk", "Segoe UI", sans-serif/u);
  assert.match(styles, /h1, h2 \{[^}]*font-family: "Sora", "Space Grotesk", sans-serif/u);
  assert.match(support, /Space Grotesk and Sora/u);
  assert.doesNotMatch(support, /Source Serif 4/u);
});

test("privacy page includes concise terms of service", async () => {
  const privacy = await readFile(new URL("../dist/privacy/index.html", import.meta.url), "utf8");
  assert.match(privacy, /id="terms"/u);
  assert.match(privacy, /Use only what you are authorized to transfer/u);
  assert.match(privacy, /you may not reverse engineer, decompile, disassemble/u);
  assert.match(privacy, /rights that cannot lawfully be waived, including qualifying interoperability activity/u);
});
