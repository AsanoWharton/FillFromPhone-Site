const passwordInput = document.querySelector<HTMLInputElement>("#example-password");
const visibilityButton = document.querySelector<HTMLButtonElement>("#password-visibility");
const visibilityLabel = document.querySelector<HTMLElement>("#password-visibility-label");
const showIcon = document.querySelector<HTMLImageElement>("#password-visibility-show-icon");
const hideIcon = document.querySelector<HTMLImageElement>("#password-visibility-hide-icon");
const extensionStatus = document.querySelector<HTMLElement>("#extension-status");
const extensionInstall = document.querySelector<HTMLElement>("#extension-install");
const fieldTips = [...document.querySelectorAll<HTMLDetailsElement>(".field-tip")];

if (!passwordInput || !visibilityButton || !visibilityLabel || !showIcon || !hideIcon || !extensionStatus || !extensionInstall || fieldTips.length !== 3) throw new Error("test controls unavailable");

function closeFieldTips(except?: HTMLDetailsElement): void {
  for (const tip of fieldTips) if (tip !== except) tip.open = false;
}

for (const tip of fieldTips) {
  tip.addEventListener("toggle", () => { if (tip.open) closeFieldTips(tip); });
}

document.addEventListener("pointerdown", (event) => {
  const target = event.target;
  if (target instanceof Node && fieldTips.some((tip) => tip.contains(target))) return;
  closeFieldTips();
});

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (target instanceof Node && fieldTips.some((tip) => tip.contains(target))) return;
  closeFieldTips();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openTip = fieldTips.find((tip) => tip.open);
  if (!openTip) return;
  openTip.open = false;
  openTip.querySelector<HTMLElement>("summary")?.focus();
  event.preventDefault();
});

let presenceTimer: number | undefined;

function extensionPresent(): boolean {
  return document.documentElement.getAttribute("data-fill-from-phone-extension") === "installed";
}

function showPresence(): void {
  if (presenceTimer !== undefined) window.clearTimeout(presenceTimer);
  presenceTimer = undefined;
  extensionStatus!.dataset.state = "installed";
  extensionStatus!.querySelector("strong")!.textContent = "Extension detected · Ready to test";
  extensionInstall!.hidden = true;
}

function checkPresence(): void {
  if (extensionPresent()) {
    showPresence();
    return;
  }
  presenceTimer = window.setTimeout(() => {
    if (extensionPresent()) return showPresence();
    extensionStatus!.dataset.state = "missing";
    extensionStatus!.querySelector("strong")!.textContent = "Extension not detected";
    extensionInstall!.hidden = false;
  }, 1_000);
}

document.addEventListener("fill-from-phone-extension-present", showPresence);
new MutationObserver(() => { if (extensionPresent()) showPresence(); }).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-fill-from-phone-extension"]
});
checkPresence();

let remaskTimer: number | undefined;

function remask(): void {
  if (remaskTimer !== undefined) window.clearTimeout(remaskTimer);
  remaskTimer = undefined;
  passwordInput!.type = "password";
  visibilityButton!.setAttribute("aria-pressed", "false");
  visibilityButton!.setAttribute("aria-label", "Show password");
  visibilityLabel!.textContent = "Show";
  showIcon!.hidden = false;
  hideIcon!.hidden = true;
}

visibilityButton.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    visibilityButton.setAttribute("aria-pressed", "true");
    visibilityButton.setAttribute("aria-label", "Hide password");
    visibilityLabel.textContent = "Hide";
    showIcon.hidden = true;
    hideIcon.hidden = false;
    remaskTimer = window.setTimeout(remask, 10_000);
  } else {
    remask();
  }
  passwordInput.focus();
});

window.addEventListener("blur", remask);
document.addEventListener("visibilitychange", () => { if (document.hidden) remask(); });
