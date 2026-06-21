import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma client so we can assert org-scoping without a database.
const { db } = vi.hoisted(() => {
  const delegate = () => ({
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findFirstOrThrow: vi.fn().mockResolvedValue({ id: "x" }),
    create: vi.fn().mockResolvedValue({ id: "x" }),
    update: vi.fn().mockResolvedValue({ id: "x" }),
    delete: vi.fn().mockResolvedValue({ id: "x" }),
    groupBy: vi.fn().mockResolvedValue([]),
  });
  return {
    db: {
      contact: delegate(),
      project: delegate(),
      costCatalogItem: delegate(),
      budget: delegate(),
    },
  };
});

vi.mock("@/lib/db", () => ({ db }));

import * as contacts from "@/server/repositories/contact";
import * as projects from "@/server/repositories/project";
import * as catalog from "@/server/repositories/catalog";
import * as budget from "@/server/repositories/budget";

const ORG = "org_apex";

const whereOf = (mock: ReturnType<typeof vi.fn>) =>
  mock.mock.calls[0]?.[0]?.where;

beforeEach(() => vi.clearAllMocks());

describe("repository tenant scoping — reads", () => {
  it("listContacts filters by orgId", async () => {
    await contacts.listContacts(ORG);
    expect(whereOf(db.contact.findMany)).toMatchObject({ orgId: ORG });
  });

  it("listContacts keeps orgId alongside a type filter", async () => {
    await contacts.listContacts(ORG, { type: "SUB" });
    expect(whereOf(db.contact.findMany)).toMatchObject({
      orgId: ORG,
      type: "SUB",
    });
  });

  it("getContact scopes by id AND orgId", async () => {
    await contacts.getContact(ORG, "c1");
    expect(whereOf(db.contact.findFirst)).toMatchObject({
      id: "c1",
      orgId: ORG,
    });
  });

  it("listProjects filters by orgId", async () => {
    await projects.listProjects(ORG);
    expect(whereOf(db.project.findMany)).toMatchObject({ orgId: ORG });
  });

  it("getProject scopes by id AND orgId", async () => {
    await projects.getProject(ORG, "p1");
    expect(whereOf(db.project.findFirst)).toMatchObject({
      id: "p1",
      orgId: ORG,
    });
  });

  it("listCatalog filters by orgId", async () => {
    await catalog.listCatalog(ORG);
    expect(whereOf(db.costCatalogItem.findMany)).toMatchObject({ orgId: ORG });
  });

  it("getProjectBudget scopes by orgId + projectId", async () => {
    await budget.getProjectBudget(ORG, "p1");
    expect(whereOf(db.budget.findFirst)).toMatchObject({
      orgId: ORG,
      projectId: "p1",
    });
  });
});

describe("repository tenant scoping — mutations verify ownership", () => {
  const input = {
    name: "Test Co",
    type: "VENDOR" as const,
    email: "",
    tags: [],
  };

  it("createContact stamps the orgId", async () => {
    await contacts.createContact(ORG, input);
    expect(db.contact.create.mock.calls[0][0].data).toMatchObject({
      orgId: ORG,
    });
  });

  it("updateContact checks org ownership before writing", async () => {
    await contacts.updateContact(ORG, "c1", input);
    expect(whereOf(db.contact.findFirstOrThrow)).toMatchObject({
      id: "c1",
      orgId: ORG,
    });
    expect(db.contact.update).toHaveBeenCalled();
  });

  it("deleteContact checks org ownership before deleting", async () => {
    await contacts.deleteContact(ORG, "c1");
    expect(whereOf(db.contact.findFirstOrThrow)).toMatchObject({
      id: "c1",
      orgId: ORG,
    });
    expect(db.contact.delete).toHaveBeenCalled();
  });

  it("updateProject checks org ownership before writing", async () => {
    await projects.updateProject(ORG, "p1", { name: "Renamed" });
    expect(whereOf(db.project.findFirstOrThrow)).toMatchObject({
      id: "p1",
      orgId: ORG,
    });
  });
});
