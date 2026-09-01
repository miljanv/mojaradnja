import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockTx, prismaMock } = vi.hoisted(() => {
  const mockTx = {
    shop: {
      updateMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    aiCreditTransaction: {
      create: vi.fn(),
    },
    tryOnJob: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  const prismaMock = {
    $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) =>
      fn(mockTx)
    ),
    tryOnJob: mockTx.tryOnJob,
    shop: mockTx.shop,
    aiCreditTransaction: mockTx.aiCreditTransaction,
  };
  return { mockTx, prismaMock };
});

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import {
  consumeCreditForJob,
  refundCreditForJob,
  adminAdjustCredits,
  TryOnServiceError,
} from "./credits";

describe("consumeCreditForJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consumes exactly one credit when available", async () => {
    mockTx.shop.updateMany.mockResolvedValue({ count: 1 });
    mockTx.aiCreditTransaction.create.mockResolvedValue({});
    const ok = await consumeCreditForJob(mockTx as never, {
      shopId: "shop1",
      tryOnJobId: "job1",
    });
    expect(ok).toBe(true);
    expect(mockTx.shop.updateMany).toHaveBeenCalledWith({
      where: { id: "shop1", aiCredits: { gt: 0 } },
      data: { aiCredits: { decrement: 1 } },
    });
    expect(mockTx.aiCreditTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: -1,
          type: "TRY_ON_USE",
          tryOnJobId: "job1",
        }),
      })
    );
  });

  it("fails when shop has no credits", async () => {
    mockTx.shop.updateMany.mockResolvedValue({ count: 0 });
    const ok = await consumeCreditForJob(mockTx as never, {
      shopId: "shop1",
      tryOnJobId: "job1",
    });
    expect(ok).toBe(false);
    expect(mockTx.aiCreditTransaction.create).not.toHaveBeenCalled();
  });
});

describe("refundCreditForJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refunds once for a consumed job", async () => {
    mockTx.tryOnJob.findUnique.mockResolvedValue({
      id: "job1",
      shopId: "shop1",
      creditConsumed: true,
      creditRefunded: false,
    });
    mockTx.aiCreditTransaction.create.mockResolvedValue({});
    mockTx.shop.update.mockResolvedValue({});
    mockTx.tryOnJob.update.mockResolvedValue({});

    const ok = await refundCreditForJob("job1");
    expect(ok).toBe(true);
    expect(mockTx.aiCreditTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 1,
          type: "TRY_ON_REFUND",
        }),
      })
    );
  });

  it("does not double-refund", async () => {
    mockTx.tryOnJob.findUnique.mockResolvedValue({
      id: "job1",
      shopId: "shop1",
      creditConsumed: true,
      creditRefunded: true,
    });
    const ok = await refundCreditForJob("job1");
    expect(ok).toBe(false);
    expect(mockTx.aiCreditTransaction.create).not.toHaveBeenCalled();
  });

  it("treats unique constraint as already refunded", async () => {
    mockTx.tryOnJob.findUnique.mockResolvedValue({
      id: "job1",
      shopId: "shop1",
      creditConsumed: true,
      creditRefunded: false,
    });
    mockTx.aiCreditTransaction.create.mockRejectedValue(new Error("unique"));
    const ok = await refundCreditForJob("job1");
    expect(ok).toBe(false);
  });
});

describe("adminAdjustCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a note", async () => {
    await expect(
      adminAdjustCredits({
        shopId: "s1",
        amount: 10,
        note: "  ",
        createdByUserId: "u1",
      })
    ).rejects.toBeInstanceOf(TryOnServiceError);
  });

  it("adds credits with ADMIN_ADD transaction", async () => {
    mockTx.shop.findUnique.mockResolvedValue({ id: "s1", aiCredits: 5 });
    mockTx.shop.update.mockResolvedValue({ aiCredits: 15 });
    mockTx.aiCreditTransaction.create.mockResolvedValue({});

    const result = await adminAdjustCredits({
      shopId: "s1",
      amount: 10,
      note: "Uplata",
      createdByUserId: "u1",
    });
    expect(result.aiCredits).toBe(15);
    expect(mockTx.aiCreditTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "ADMIN_ADD", amount: 10 }),
      })
    );
  });
});
