import { main } from "./app";

function setupDom() {
  document.body.innerHTML = `
    <div id="status"></div>
    <div id="flags"></div>
  `;
}

function okJson(payload: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => payload,
  };
}

describe("Feature flags page (POST eval)", () => {
  beforeEach(() => {
    setupDom();
    (globalThis as any).fetch = undefined;
  });

  test("renders flags from POST /v1/feature/:key/eval and maps variationType to disabled toggles", async () => {
    const apiBase = "http://localhost:1031";
    const env = "dev";
    const evalContextKey = "08b5ffb7-7109-42f4-a6f2-b85560fbd20f";

    const flagKeys = ["my-flag-1", "my-flag-2"];

    // Mock fetch: return different payload per flag
    const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
      if (url === `${apiBase}/v1/feature/my-flag-1/eval`) {
        return okJson({
          variationType: "enabled",
          failed: false,
          reason: "TARGETING_MATCH",
          metadata: { evaluatedRuleName: "Target dev environment" },
        });
      }
      if (url === `${apiBase}/v1/feature/my-flag-2/eval`) {
        return okJson({
          variationType: "disabled",
          failed: false,
          reason: "DEFAULT",
          metadata: { evaluatedRuleName: "Fallback" },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    (globalThis as any).fetch = fetchMock;

    // Act
    await main({ apiBase, env, flagKeys, evalContextKey });

    // Assert status
    expect(document.getElementById("status")?.textContent).toBe("Loaded 2 flags.");

    // Assert we called POST twice
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Assert each call is POST w/ headers + body
    for (const [url, init] of fetchMock.mock.calls) {
      expect(typeof url).toBe("string");
      expect(init).toEqual(
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            accept: "application/json",
            "Content-Type": "application/json",
          }),
          body: expect.any(String),
        })
      );

      const body = JSON.parse((init as any).body);
      expect(body.evaluationContext.key).toBe(evalContextKey);
      expect(body.evaluationContext.custom.env).toBe(env);
    }

    // Assert rendered rows (sorted alphabetically by key)
    const rows = Array.from(document.querySelectorAll(".flag-row"));
    expect(rows).toHaveLength(2);

    // Row 0: my-flag-1 enabled
    expect(rows[0].querySelector(".key")?.textContent).toBe("my-flag-1");
    expect(rows[0].querySelector(".state")?.textContent?.startsWith("enabled")).toBe(true);
    const cb0 = rows[0].querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(cb0.disabled).toBe(true);
    expect(cb0.checked).toBe(true);

    // Row 1: my-flag-2 disabled
    expect(rows[1].querySelector(".key")?.textContent).toBe("my-flag-2");
    expect(rows[1].querySelector(".state")?.textContent?.startsWith("disabled")).toBe(true);
    const cb1 = rows[1].querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(cb1.disabled).toBe(true);
    expect(cb1.checked).toBe(false);
  });
});
