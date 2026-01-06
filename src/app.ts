const API_BASE = "http://localhost:1031";
const ENV = "dev";

// TODO: replace with your real list (or fetch these from somewhere later)
const FLAG_KEYS = ["my-flag-1"];

const EVAL_CONTEXT_KEY = "08b5ffb7-7109-42f4-a6f2-b85560fbd20f";

export type FlagEvalResponse = {
  variationType: "enabled" | "disabled";
  failed?: boolean;
  reason?: string;
  errorCode?: string;
  metadata?: { evaluatedRuleName?: string };
  [k: string]: unknown;
};

export type FlagItem = {
  key: string;
  enabled: boolean;
  reason?: string;
  rule?: string;
};

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

export function renderFlags(flags: FlagItem[]) {
  const container = $("flags");
  container.innerHTML = "";

  for (const flag of flags) {
    const row = document.createElement("div");
    row.className = "flag-row";

    const left = document.createElement("div");
    left.className = "flag-name";

    left.innerHTML = `
      <div class="key">${escapeHtml(flag.key)}</div>
      <div class="state">${flag.enabled ? "enabled" : "disabled"}</div>
    `;

    const label = document.createElement("label");
    label.className = "toggle";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = flag.enabled;
    input.disabled = true; // still disabled (per your requirement)

    const switchEl = document.createElement("span");
    switchEl.className = "switch";
    switchEl.innerHTML = `<span class="knob"></span>`;

    label.appendChild(input);
    label.appendChild(switchEl);

    row.appendChild(left);
    row.appendChild(label);
    container.appendChild(row);
  }
}

type MainOpts = {
  apiBase?: string;
  env?: string;
  flagKeys?: string[];
  evalContextKey?: string;
};

async function evalFlag(flagKey: string, apiBase: string, env: string, evalContextKey: string): Promise<FlagItem> {
  const url = `${apiBase}/v1/feature/${encodeURIComponent(flagKey)}/eval`;

  const body = {
    defaultValue: "string",
    evaluationContext: {
      custom: {
        company: "GO Feature Flag",
        email: "contact@gofeatureflag.org",
        firstname: "John",
        lastname: "Doe",
        env,
      },
      key: evalContextKey,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return { key: flagKey, enabled: false, reason: `HTTP ${res.status} ${res.statusText}` };
  }

  const payload = (await res.json()) as any;
  const variationType = payload?.variationType;

  return {
    key: flagKey,
    enabled: variationType === "enabled",
    reason: typeof payload?.reason === "string" ? payload.reason : undefined,
    rule: typeof payload?.metadata?.evaluatedRuleName === "string" ? payload.metadata.evaluatedRuleName : undefined,
  };
}

export async function main(opts: MainOpts = {}) {
  const apiBase = opts.apiBase ?? API_BASE;
  const env = opts.env ?? ENV;
  const flagKeys = opts.flagKeys ?? FLAG_KEYS;
  const evalContextKey = opts.evalContextKey ?? EVAL_CONTEXT_KEY;

  const status = $("status");
  status.textContent = "Loading…";

  try {
    const results = await Promise.all(flagKeys.map((k) => evalFlag(k, apiBase, env, evalContextKey)));
    results.sort((a, b) => a.key.localeCompare(b.key));

    renderFlags(results);
    status.textContent = `Loaded ${results.length} flags.`;
  } catch (e) {
    console.error(e);
    $("flags").innerHTML = "";
    status.textContent = e instanceof Error ? `Failed: ${e.message}` : "Failed to load flags.";
  }
}

// ✅ Auto-run only in the browser, not in Jest
const isJest = typeof process !== "undefined" && !!(process as any).env?.JEST_WORKER_ID;
if (!isJest) {
  // safe in browser usage
  main();
}
