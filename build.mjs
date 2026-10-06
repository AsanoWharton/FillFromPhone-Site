import { copyFile, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { build } from "esbuild";

function icon(definition) {
  const [width, height, , , path] = definition.icon;
  if (typeof path !== "string") throw new Error(`unexpected icon data for ${definition.iconName}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img"><path fill="#0d514e" d="${path}"/></svg>`;
}

const output = new URL("./dist/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL("./assets/", output), { recursive: true });

for (const page of ["privacy", "support", "test"]) {
  await mkdir(new URL(`./${page}/`, output), { recursive: true });
}

await Promise.all([
  copyFile(new URL("./home/index.html", import.meta.url), new URL("./index.html", output)),
  copyFile(new URL("./privacy/index.html", import.meta.url), new URL("./privacy/index.html", output)),
  copyFile(new URL("./support/index.html", import.meta.url), new URL("./support/index.html", output)),
  copyFile(new URL("./test/index.html", import.meta.url), new URL("./test/index.html", output)),
  copyFile(new URL("./shared/header.css", import.meta.url), new URL("./assets/header.css", output)),
  copyFile(new URL("./home/styles.css", import.meta.url), new URL("./assets/home.css", output)),
  copyFile(new URL("./test/styles.css", import.meta.url), new URL("./assets/test.css", output)),
  copyFile(new URL("./src/favicon.png", import.meta.url), new URL("./favicon.png", output)),
  copyFile(new URL("./security.txt", import.meta.url), new URL("./security.txt", output)),
  cp(new URL("./home/assets/", import.meta.url), new URL("./assets/", output), { recursive: true }),
  cp(new URL("./third-party/licenses/", import.meta.url), new URL("./licenses/", output), { recursive: true }),
  copyFile(new URL("./node_modules/@fontsource/public-sans/files/public-sans-latin-400-normal.woff2", import.meta.url), new URL("./assets/public-sans-400.woff2", output)),
  copyFile(new URL("./node_modules/@fontsource/public-sans/files/public-sans-latin-700-normal.woff2", import.meta.url), new URL("./assets/public-sans-700.woff2", output)),
  copyFile(new URL("./node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2", import.meta.url), new URL("./assets/source-serif-600.woff2", output)),
  writeFile(new URL("./assets/eye.svg", output), icon(faEye)),
  writeFile(new URL("./assets/eye-slash.svg", output), icon(faEyeSlash)),
  build({
    entryPoints: [new URL("./test/app.ts", import.meta.url).pathname],
    outfile: new URL("./assets/test.js", output).pathname,
    bundle: true,
    minify: true,
    sourcemap: false,
    target: ["chrome120", "safari17", "firefox121"],
    legalComments: "none"
  })
]);
