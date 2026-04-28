import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const envExample = () => readFileSync(".env.example", "utf8");
const packageJson = () => JSON.parse(readFileSync("package.json", "utf8"));

describe("environment setup contract", () => {
  it("documents required environment variables without real secrets", () => {
    const content = envExample();

    for (const variable of [
      "DATABASE_URL",
      "NEXTAUTH_SECRET",
      "AUTH_GITHUB_ID",
      "AUTH_GITHUB_SECRET",
      "NEXT_PUBLIC_APP_URL",
    ]) {
      expect(content).toContain(`${variable}=`);
    }

    expect(content).not.toContain("neon.tech");
    expect(content).not.toContain("dp.st.");
  });

  it("provides Doppler and Prisma database scripts", () => {
    const scripts = packageJson().scripts;

    expect(scripts["dev:doppler"]).toBe("doppler run -- bun run dev");
    expect(scripts["db:validate"]).toBe("prisma validate");
    expect(scripts["db:generate"]).toBe("prisma generate");
    expect(scripts["db:migrate:deploy"]).toBe("prisma migrate deploy");
    expect(scripts["db:migrate:deploy:doppler"]).toBe(
      "doppler run -- bun run db:migrate:deploy",
    );
  });
});
