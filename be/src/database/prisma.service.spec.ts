import { PrismaService } from "./prisma.service.js";

describe("PrismaService", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/ecommerce_ai?schema=public";
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("extends PrismaClient lifecycle hooks", () => {
    const service = new PrismaService();

    expect(typeof service.onModuleInit).toBe("function");
    expect(typeof service.onModuleDestroy).toBe("function");
  });
});
