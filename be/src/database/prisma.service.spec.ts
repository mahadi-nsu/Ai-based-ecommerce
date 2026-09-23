import { PrismaService } from "./prisma.service.js";

describe("PrismaService", () => {
  it("extends PrismaClient lifecycle hooks", () => {
    const service = new PrismaService();

    expect(typeof service.onModuleInit).toBe("function");
    expect(typeof service.onModuleDestroy).toBe("function");
  });
});
