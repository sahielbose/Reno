"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SWATCHES: { name: string; cls: string; on?: string }[] = [
  { name: "brand", cls: "bg-brand", on: "text-white" },
  { name: "brand-700", cls: "bg-brand-700", on: "text-white" },
  { name: "brand-100", cls: "bg-brand-100", on: "text-brand" },
  { name: "amber", cls: "bg-amber", on: "text-[#3a2a00]" },
  { name: "amber-soft", cls: "bg-amber-soft", on: "text-warn" },
  { name: "ink", cls: "bg-ink", on: "text-white" },
  { name: "paper", cls: "bg-paper border border-line", on: "text-ink" },
  { name: "line", cls: "bg-line", on: "text-ink" },
  { name: "line-2", cls: "bg-line-2", on: "text-ink" },
  { name: "text-2", cls: "bg-text-2", on: "text-white" },
  { name: "text-3", cls: "bg-text-3", on: "text-white" },
  { name: "ok", cls: "bg-ok", on: "text-white" },
  { name: "ok-soft", cls: "bg-ok-soft", on: "text-ok" },
  { name: "warn", cls: "bg-warn", on: "text-white" },
  { name: "danger", cls: "bg-danger", on: "text-white" },
  { name: "danger-soft", cls: "bg-danger-soft", on: "text-danger" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="bg-paper min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-14">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="size-8" viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="8" fill="var(--color-brand)" />
              <path
                d="M9 23V9h7.2c2.5 0 4.3 1.6 4.3 4.1 0 1.9-1.1 3.3-2.8 3.8L21 23h-3.3l-3-5.4H12V23H9z"
                fill="#fff"
              />
            </svg>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Reno styleguide
            </h1>
          </div>
          <p className="text-text-2">
            The blueprint design system — brand tokens and primitives used
            across the app.
          </p>
        </header>

        <Section title="Color">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {SWATCHES.map((s) => (
              <div
                key={s.name}
                className={`rounded-reno flex h-20 flex-col justify-end p-2 ${s.cls} ${s.on ?? ""}`}
              >
                <span className="text-[0.7rem] font-semibold">{s.name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <Card>
            <CardContent className="space-y-3">
              <p className="font-display text-4xl font-bold tracking-tight">
                Space Grotesk display
              </p>
              <p className="text-lg">
                Inter body — run every job from first bid to final build.
              </p>
              <p className="mono text-lg">
                JetBrains Mono · $48,200 · 1/4&quot;
              </p>
              <div className="text-text-2 flex flex-wrap gap-4 pt-2 text-sm">
                <span>text-foreground (ink)</span>
                <span className="text-text-2">text-2</span>
                <span className="text-text-3">text-3</span>
                <span className="text-brand">brand</span>
                <span className="text-warn">warn</span>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="Buttons">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="dark">Dark</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="rounded-reno bg-ink flex flex-wrap items-center gap-3 p-4">
              <Button variant="primary">On dark</Button>
              <Button variant="ghostOnDark">Ghost on dark</Button>
            </div>
          </div>
        </Section>

        <Section title="Badges / status pills">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ok" dot>
              Active
            </Badge>
            <Badge variant="amber" dot>
              Bidding
            </Badge>
            <Badge variant="brand" dot>
              Planning
            </Badge>
            <Badge variant="neutral">Closed</Badge>
            <Badge variant="info" dot>
              Sent
            </Badge>
            <Badge variant="ok" dot>
              Signed
            </Badge>
            <Badge variant="danger" dot>
              Overdue
            </Badge>
            <Badge variant="purple">Photo</Badge>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project summary</CardTitle>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-2">Contract value</span>
                  <span className="mono font-semibold">$48,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-2">Billed to date</span>
                  <span className="mono font-semibold">$18,400</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>With description</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cards compose a header, content, and footer with hairline
                  dividers.
                </CardDescription>
              </CardContent>
              <CardFooter className="justify-end">
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Forms">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="sg-name">
                <Input id="sg-name" placeholder="Dana Whitfield" />
              </Field>
              <Field
                label="Email"
                htmlFor="sg-email"
                description="We never share this."
              >
                <Input
                  id="sg-email"
                  type="email"
                  placeholder="dana@email.com"
                />
              </Field>
              <Field
                label="Budget"
                htmlFor="sg-budget"
                error="Enter a positive amount."
              >
                <Input id="sg-budget" aria-invalid defaultValue="-100" />
              </Field>
            </CardContent>
          </Card>
        </Section>

        <Section title="Table">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Contract</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">
                    Maple Street Kitchen
                  </TableCell>
                  <TableCell>Dana Whitfield</TableCell>
                  <TableCell>
                    <Badge variant="ok" dot>
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="mono text-right">$48,200</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Oakwood ADU</TableCell>
                  <TableCell>Marcus Lee</TableCell>
                  <TableCell>
                    <Badge variant="amber" dot>
                      Bidding
                    </Badge>
                  </TableCell>
                  <TableCell className="mono text-right">$184,500</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </Section>

        <Section title="Tabs">
          <Card>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="overview"
                  className="text-text-2 pt-4 text-sm"
                >
                  Project overview — financial summary and recent activity.
                </TabsContent>
                <TabsContent
                  value="budget"
                  className="text-text-2 pt-4 text-sm"
                >
                  Section-by-section budget with live totals.
                </TabsContent>
                <TabsContent
                  value="schedule"
                  className="text-text-2 pt-4 text-sm"
                >
                  Gantt with the critical path highlighted.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </Section>

        <Section title="Overlays & feedback">
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger
                render={<Button variant="dark">Open dialog</Button>}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send for signature</DialogTitle>
                  <DialogDescription>
                    Your client signs from any device — no account, straight to
                    the record.
                  </DialogDescription>
                </DialogHeader>
                <Field label="Signer name" htmlFor="sg-signer">
                  <Input id="sg-signer" defaultValue="Dana Whitfield" />
                </Field>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="ghost">Cancel</Button>}
                  />
                  <DialogClose
                    render={<Button variant="primary">Send</Button>}
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost">Menu</Button>}
              />
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit budget</DropdownMenuItem>
                <DropdownMenuItem>View proposal</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Archive project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="accent"
              onClick={() => toast("Proposal generated from budget")}
            >
              Trigger toast
            </Button>
          </div>
        </Section>
      </div>
    </main>
  );
}
