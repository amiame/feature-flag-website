import { test as base, expect } from "@playwright/test";
import path from "node:path";
import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
  Wait,
} from "testcontainers";

type Fixtures = {
  net: StartedNetwork;

  be: StartedTestContainer;
  fe: StartedTestContainer;

  feURL: string;
};

export const test = base.extend<Fixtures>({
  net: [
    async ({}, use, testInfo) => {
      const networkName = `pw-net-w${testInfo.workerIndex}`;
      const net = await new Network().withName(networkName).start();
      try {
        await use(net);
      } finally {
        await net.stop();
      }
    },
    { scope: "worker" },
  ],

  // TODO: adjust BE setup when BE is ready
  be: [
    async ({ net }, use, testInfo) => {
      // Build BE image from Dockerfile (once per worker)
      const beContext = path.resolve(process.cwd(), "be");
      const beDockerfile = "../../../be/Dockerfile";

      const beImage = await GenericContainer.fromDockerfile(beContext, beDockerfile)
        // .withBuildArg("SOME_ARG", "value")               // optional
        .build(`pw-be-w${testInfo.workerIndex}`);

      // Run BE container from built image
      const be = await new GenericContainer(beImage)
        .withNetwork(net)
        .withNetworkAliases("be") // FE calls http://be:<port>
        .withExposedPorts(8080)   // <-- change to your BE container port
        .withEnvironment({
          PORT: "8080",
          // ...other BE env vars
        })
        // Prefer HTTP healthcheck if you have it:
        // .withWaitStrategy(Wait.forHttp("/health").forPort(8080))
        .withWaitStrategy(Wait.forLogMessage(/listening|started|ready/i))
        .start();

      try {
        await use(be);
      } finally {
        await be.stop();
      }
    },
    { scope: "worker" },
  ],

  // TODO: adjust FE setup when FE is ready
  fe: [
    async ({ net }, use, testInfo) => {
      // Build FE image from Dockerfile (once per worker)
      const feContext = path.resolve(process.cwd(), "fe");
      const feDockerfile = "../../../fe/Dockerfile";

      const feImage = await GenericContainer.fromDockerfile(feContext, feDockerfile)
        // .withBuildArg("SOME_ARG", "value")               // optional
        .build(`pw-fe-w${testInfo.workerIndex}`);

      // Run FE container from built image
      const fe = await new GenericContainer(feImage)
        .withNetwork(net)
        .withNetworkAliases("fe")
        .withExposedPorts(3000) // <-- change to your FE container port
        .withEnvironment({
          PORT: "3000",
          // IMPORTANT: FE must reach BE via docker network alias, not localhost:
          API_BASE_URL: "http://be:8080", // <-- adapt to your FE (VITE_*, NEXT_PUBLIC_*, etc.)
        })
        .withWaitStrategy(Wait.forHttp("/", 3000))
        .start();

      try {
        await use(fe);
      } finally {
        await fe.stop();
      }
    },
    { scope: "worker" },
  ],

  feURL: [
    async ({ fe }, use) => {
      const host = fe.getHost();
      const port = fe.getMappedPort(3000); // match exposed container port above
      await use(`http://${host}:${port}`);
    },
    { scope: "worker" },
  ],
});

export { expect };
