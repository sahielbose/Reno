/**
 * Seed the local database from the Reno_UI_REFERENCE prototype `DATA`.
 * Idempotent: clears the demo org (cascades) and the demo users, then recreates.
 * Run with `pnpm db:seed`.
 */
import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();

const d = (s: string) => new Date(s + "T12:00:00Z");

async function main() {
  // ── Reset demo data ────────────────────────────────────────────────────────
  await db.organization.deleteMany({
    where: { slug: { in: ["apex-build-co", "cedarline-renovations"] } },
  });
  await db.user.deleteMany({
    where: { email: { in: ["nolan@apexbuild.co", "jamie@apexbuild.co"] } },
  });

  // ── Organization + users ────────────────────────────────────────────────────
  const org = await db.organization.create({
    data: {
      name: "Apex Build Co.",
      slug: "apex-build-co",
      primaryColor: "#1E47D8",
      address: "Portland, OR",
    },
  });

  const owner = await db.user.create({
    data: { email: "nolan@apexbuild.co", name: "Nolan Rossi" },
  });
  const estimator = await db.user.create({
    data: { email: "jamie@apexbuild.co", name: "Jamie Ortiz" },
  });
  await db.membership.createMany({
    data: [
      { userId: owner.id, orgId: org.id, role: "OWNER" },
      { userId: estimator.id, orgId: org.id, role: "MEMBER" },
    ],
  });

  // ── Contacts ────────────────────────────────────────────────────────────────
  const mk = (
    name: string,
    type: "CLIENT" | "SUB" | "VENDOR" | "CREW",
    company: string | null,
    email: string,
    phone: string,
  ) =>
    db.contact.create({
      data: {
        orgId: org.id,
        name,
        type,
        company: company ?? undefined,
        email,
        phone,
      },
    });

  const dana = await mk("Dana Whitfield", "CLIENT", null, "dana.w@email.com", "(503) 555-0142"); // prettier-ignore
  const marcus = await mk("Marcus Lee", "CLIENT", null, "m.lee@email.com", "(503) 555-0188"); // prettier-ignore
  const priya = await mk("Priya Anand", "CLIENT", null, "priya.a@email.com", "(503) 555-0411"); // prettier-ignore
  const tom = await mk("Tom Becker", "CLIENT", null, "tom.b@email.com", "(503) 555-0455"); // prettier-ignore
  const summit = await mk("Summit Plumbing", "SUB", "Summit Plumbing LLC", "ops@summitplumb.co", "(503) 555-0210"); // prettier-ignore
  const peak = await mk("Peak Electric", "SUB", "Peak Electric Inc.", "dispatch@peakelec.co", "(503) 555-0277"); // prettier-ignore
  const tileworks = await mk("TileWorks", "VENDOR", "TileWorks Supply", "orders@tileworks.co", "(503) 555-0301"); // prettier-ignore

  // ── Cost catalog ─────────────────────────────────────────────────────────────
  const catalogData: [string, string, string, number][] = [
    ["100", "Demo & disposal", "LS", 3200],
    ["210", "Custom cabinetry", "LF", 520],
    ["215", "Cabinet island", "EA", 4200],
    ["310", "Quartz counter + install", "SF", 95],
    ["410", "Plumbing rough + fixtures", "LS", 5600],
    ["510", "Electrical rough + fixtures", "LS", 4800],
    ["610", "Tile, installed", "SF", 32],
    ["620", "Interior paint", "LS", 2400],
  ];
  const catalog: Record<string, string> = {};
  for (const [code, name, unit, cost] of catalogData) {
    const item = await db.costCatalogItem.create({
      data: { orgId: org.id, code, name, unit, defaultUnitCost: cost },
    });
    catalog[code] = item.id;
  }

  // ── Projects ─────────────────────────────────────────────────────────────────
  const maple = await db.project.create({
    data: {
      orgId: org.id,
      clientId: dana.id,
      name: "Maple Street Kitchen Remodel",
      address: "412 Maple St, Portland OR",
      trade: "Remodel",
      status: "ACTIVE",
      icon: "",
      startDate: d("2026-03-01"),
      targetEndDate: d("2026-06-14"),
    },
  });
  const oakwood = await db.project.create({
    data: {
      orgId: org.id,
      clientId: marcus.id,
      name: "Oakwood ADU Build",
      address: "88 Oakwood Ave, Portland OR",
      trade: "New build",
      status: "ACTIVE",
      icon: "",
      startDate: d("2026-02-10"),
      targetEndDate: d("2026-09-02"),
    },
  });
  const ridgeline = await db.project.create({
    data: {
      orgId: org.id,
      clientId: priya.id,
      name: "Ridgeline Roof Replacement",
      address: "19 Ridgeline Dr, Beaverton OR",
      trade: "Roofing",
      status: "BIDDING",
      icon: "",
    },
  });
  const beacon = await db.project.create({
    data: {
      orgId: org.id,
      clientId: tom.id,
      name: "Beacon Hill Second Story",
      address: "230 Beacon Hill Rd, Portland OR",
      trade: "Addition",
      status: "PLANNING",
      icon: "",
    },
  });

  // ── Budget: Maple Street Kitchen (detailed, from DATA.budget) ────────────────
  const mapleBudget = await db.budget.create({
    data: {
      orgId: org.id,
      projectId: maple.id,
      name: "Maple Street Kitchen",
      status: "FINAL",
    },
  });

  const sections: {
    name: string;
    items: {
      code?: string;
      catalog?: string;
      name: string;
      qty: number;
      unit: string;
      cost: number;
    }[];
  }[] = [
    {
      name: "Demolition",
      items: [{ catalog: "100", name: "Demo & disposal", qty: 1, unit: "LS", cost: 3200 }], // prettier-ignore
    },
    {
      name: "Cabinetry & millwork",
      items: [
        { catalog: "210", name: "Custom cabinets", qty: 18, unit: "LF", cost: 520 }, // prettier-ignore
        { catalog: "215", name: "Kitchen island", qty: 1, unit: "EA", cost: 4200 }, // prettier-ignore
      ],
    },
    {
      name: "Countertops",
      items: [{ catalog: "310", name: "Quartz slab + install", qty: 62, unit: "SF", cost: 95 }], // prettier-ignore
    },
    {
      name: "Plumbing",
      items: [{ catalog: "410", name: "Rough-in + fixtures", qty: 1, unit: "LS", cost: 5600 }], // prettier-ignore
    },
    {
      name: "Electrical",
      items: [{ catalog: "510", name: "Rough-in + fixtures", qty: 1, unit: "LS", cost: 4800 }], // prettier-ignore
    },
    {
      name: "Finishes",
      items: [
        { catalog: "610", name: "Tile backsplash", qty: 48, unit: "SF", cost: 32 }, // prettier-ignore
        { catalog: "620", name: "Paint", qty: 1, unit: "LS", cost: 2400 }, // prettier-ignore
      ],
    },
  ];

  for (const [si, section] of sections.entries()) {
    const sec = await db.budgetSection.create({
      data: { budgetId: mapleBudget.id, name: section.name, order: si },
    });
    for (const [ii, item] of section.items.entries()) {
      await db.budgetLineItem.create({
        data: {
          sectionId: sec.id,
          costCatalogItemId: item.catalog ? catalog[item.catalog] : undefined,
          name: item.name,
          qty: item.qty,
          unit: item.unit,
          unitCost: item.cost,
          order: ii,
        },
      });
    }
  }

  // Lightweight single-line budgets for the other projects (so contract value
  // computes for the dashboard / projects list).
  const simpleBudget = async (
    projectId: string,
    name: string,
    line: string,
    unit: string,
    cost: number,
  ) => {
    const b = await db.budget.create({
      data: { orgId: org.id, projectId, name, status: "DRAFT" },
    });
    const s = await db.budgetSection.create({
      data: { budgetId: b.id, name: "Scope", order: 0 },
    });
    await db.budgetLineItem.create({
      data: { sectionId: s.id, name: line, qty: 1, unit, unitCost: cost },
    });
    return b;
  };
  await simpleBudget(oakwood.id, "Oakwood ADU", "ADU - lot to keys", "LS", 184500); // prettier-ignore
  await simpleBudget(ridgeline.id, "Ridgeline Roof", "Tear-off + re-roof", "SQ", 27800); // prettier-ignore
  await simpleBudget(beacon.id, "Beacon Hill", "Second-story addition", "LS", 96400); // prettier-ignore

  // ── Proposal for Maple ────────────────────────────────────────────────────────
  await db.proposal.create({
    data: {
      orgId: org.id,
      projectId: maple.id,
      budgetId: mapleBudget.id,
      number: "PRO-008",
      status: "SENT",
      total: new Prisma.Decimal(36986),
      sentAt: d("2026-03-15"),
      recipients: {
        create: [
          { name: "Dana Whitfield", email: "dana.w@email.com", role: "SIGNER" },
        ],
      },
    },
  });

  // ── Invoices (DATA.invoices) ──────────────────────────────────────────────────
  const inv1 = await db.invoice.create({
    data: {
      orgId: org.id,
      projectId: maple.id,
      number: "INV-001",
      status: "PAID",
      amount: 7500,
      dueDate: d("2026-03-03"),
      issuedAt: d("2026-02-25"),
    },
  });
  const inv2 = await db.invoice.create({
    data: {
      orgId: org.id,
      projectId: maple.id,
      number: "INV-002",
      status: "PAID",
      amount: 10900,
      dueDate: d("2026-04-18"),
      issuedAt: d("2026-04-04"),
    },
  });
  await db.invoice.create({
    data: {
      orgId: org.id,
      projectId: maple.id,
      number: "INV-003",
      status: "OVERDUE",
      amount: 12500,
      dueDate: d("2026-03-28"),
      issuedAt: d("2026-03-03"),
      lineItems: {
        create: [
          { description: "Kitchen demo & disposal", amount: 1200, order: 0 },
          { description: "Cabinet installation", amount: 6800, order: 1 },
          { description: "Countertop & backsplash", amount: 4500, order: 2 },
        ],
      },
    },
  });
  await db.invoice.create({
    data: {
      orgId: org.id,
      projectId: oakwood.id,
      number: "INV-004",
      status: "SENT",
      amount: 62000,
      dueDate: d("2026-05-01"),
      issuedAt: d("2026-04-15"),
    },
  });
  await db.payment.createMany({
    data: [
      { orgId: org.id, invoiceId: inv1.id, amount: new Prisma.Decimal(7500), paidAt: d("2026-03-02") }, // prettier-ignore
      { orgId: org.id, invoiceId: inv2.id, amount: new Prisma.Decimal(10900), paidAt: d("2026-04-16") }, // prettier-ignore
    ],
  });

  // ── Vendor bills (costs-out ~ $11,950 for Maple) ─────────────────────────────
  await db.vendorBill.createMany({
    data: [
      { orgId: org.id, projectId: maple.id, vendorId: summit.id, number: "BILL-021", amount: new Prisma.Decimal(4200), status: "PAID", dueDate: d("2026-03-20") }, // prettier-ignore
      { orgId: org.id, projectId: maple.id, vendorId: peak.id, number: "BILL-022", amount: new Prisma.Decimal(3750), status: "PAID", dueDate: d("2026-03-25") }, // prettier-ignore
      { orgId: org.id, projectId: maple.id, vendorId: tileworks.id, number: "BILL-023", amount: new Prisma.Decimal(4000), status: "SCHEDULED", dueDate: d("2026-04-10") }, // prettier-ignore
    ],
  });

  // ── Schedule (DATA.tasks): 7 tasks, critical path ────────────────────────────
  const base = d("2026-03-24");
  const addDays = (start: number, days: number) => {
    const s = new Date(base);
    s.setDate(s.getDate() + start);
    const e = new Date(s);
    e.setDate(e.getDate() + days);
    return { start: s, end: e };
  };
  const taskData: [string, number, number, boolean][] = [
    ["Site prep", 0, 3, true],
    ["Demolition", 3, 4, true],
    ["Rough plumbing", 7, 5, true],
    ["Rough electrical", 7, 4, false],
    ["Cabinets", 12, 6, true],
    ["Countertops", 18, 3, true],
    ["Finishes", 21, 5, true],
  ];
  const tasks: string[] = [];
  for (const [i, [name, start, days, crit]] of taskData.entries()) {
    const { start: s, end: e } = addDays(start, days);
    const t = await db.scheduleTask.create({
      data: {
        orgId: org.id,
        projectId: maple.id,
        name,
        startDate: s,
        endDate: e,
        durationDays: days,
        isCritical: crit,
        percentComplete: i < 3 ? 100 : i === 3 ? 60 : i === 4 ? 30 : 0,
        order: i,
      },
    });
    tasks.push(t.id);
  }
  // Dependencies along the critical chain + the parallel electrical branch.
  const deps: [number, number][] = [
    [0, 1], // Site prep -> Demolition
    [1, 2], // Demolition -> Rough plumbing
    [1, 3], // Demolition -> Rough electrical (parallel, has float)
    [2, 4], // Rough plumbing -> Cabinets
    [4, 5], // Cabinets -> Countertops
    [5, 6], // Countertops -> Finishes
  ];
  await db.taskDependency.createMany({
    data: deps.map(([p, s]) => ({
      predecessorId: tasks[p],
      successorId: tasks[s],
      type: "FS" as const,
    })),
  });

  // ── Documents (DATA.documents) ───────────────────────────────────────────────
  const docs: [
    string,
    "PLAN" | "PERMIT" | "INSURANCE" | "PHOTO" | "CONTRACT",
  ][] = [
    ["Floor Plan - L1.pdf", "PLAN"],
    ["Building Permit.pdf", "PERMIT"],
    ["COI - Summit Plumbing.pdf", "INSURANCE"],
    ["Demo Photos", "PHOTO"],
    ["Framing Contract.pdf", "CONTRACT"],
  ];
  await db.document.createMany({
    data: docs.map(([name, kind], i) => ({
      orgId: org.id,
      projectId: maple.id,
      name,
      kind,
      fileKey: `seed/maple/${i}-${name.replace(/[^a-z0-9]/gi, "_")}`,
    })),
  });

  // ── Request / RFI (DATA, RFI-003) ────────────────────────────────────────────
  await db.request.create({
    data: {
      orgId: org.id,
      projectId: maple.id,
      number: "RFI-003",
      type: "RFI",
      subject: "Electrical panel location",
      status: "RESOLVED",
      messages: {
        create: [
          {
            authorName: "Summit Plumbing",
            authorRole: "SUB",
            body: "Plans show two possible spots on page 4. Which one - need it before rough-in tomorrow.",
            createdAt: d("2026-03-18"),
          },
          {
            authorName: "Nolan Rossi",
            authorRole: "OWNER",
            body: "Utility closet, NE corner. Confirm with your inspector first.",
            createdAt: d("2026-03-19"),
          },
        ],
      },
    },
  });

  // ── Activity log ─────────────────────────────────────────────────────────────
  await db.activityLog.createMany({
    data: [
      { orgId: org.id, projectId: maple.id, actorId: owner.id, verb: "signed", target: "Proposal PRO-008", createdAt: d("2026-03-18") }, // prettier-ignore
      { orgId: org.id, projectId: maple.id, actorId: owner.id, verb: "paid", target: "Invoice INV-002", createdAt: d("2026-04-16") }, // prettier-ignore
      { orgId: org.id, projectId: maple.id, actorId: owner.id, verb: "resolved", target: "RFI-003", createdAt: d("2026-03-19") }, // prettier-ignore
    ],
  });

  // ── A second org (so the org switcher meaningfully changes data) ─────────────
  const org2 = await db.organization.create({
    data: {
      name: "Cedarline Renovations",
      slug: "cedarline-renovations",
      primaryColor: "#1E47D8",
      address: "Seattle, WA",
    },
  });
  await db.membership.create({
    data: { userId: owner.id, orgId: org2.id, role: "ADMIN" },
  });
  const helena = await db.contact.create({
    data: {
      orgId: org2.id,
      name: "Helena Cruz",
      type: "CLIENT",
      email: "helena@email.com",
      phone: "(206) 555-0190",
    },
  });
  await db.project.create({
    data: {
      orgId: org2.id,
      clientId: helena.id,
      name: "Lakeview Bath Remodel",
      address: "77 Lakeview Ter, Seattle WA",
      trade: "Remodel",
      status: "ACTIVE",
      icon: "",
      startDate: d("2026-04-01"),
      targetEndDate: d("2026-06-30"),
    },
  });
  await db.project.create({
    data: {
      orgId: org2.id,
      clientId: helena.id,
      name: "Greenwood Deck Build",
      trade: "Carpentry",
      status: "BIDDING",
      icon: "",
    },
  });

  const counts = {
    contacts: await db.contact.count(),
    projects: await db.project.count(),
    budgetLineItems: await db.budgetLineItem.count(),
    invoices: await db.invoice.count(),
    tasks: await db.scheduleTask.count(),
  };
  console.log("✓ Seeded Apex Build Co.", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
