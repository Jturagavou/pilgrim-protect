"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pilgrimSpring, gentleFade, countUp } from "@/lib/motion";

const buttonVariants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const buttonSizes = ["xs", "sm", "default", "lg", "icon"] as const;

const badgeVariants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

interface Swatch {
  name: string;
  className: string;
  hint?: string;
}

const paperSwatches: Swatch[] = [
  { name: "paper", className: "bg-paper", hint: "#f3f0df" },
  { name: "paper-alt", className: "bg-paper-alt", hint: "#f4f2e8" },
  { name: "paper-soft", className: "bg-paper-soft", hint: "#faf8eb" },
  { name: "paper-depth", className: "bg-paper-depth", hint: "#f0eee4" },
];

const inkSwatches: Swatch[] = [
  { name: "ink", className: "bg-ink", hint: "#101828" },
  { name: "ink-deep", className: "bg-ink-deep", hint: "#1a1b1f" },
];

const brandSwatches: Swatch[] = [
  { name: "pilgrim-blue", className: "bg-pilgrim-blue", hint: "#0050bd" },
  { name: "pilgrim-orange", className: "bg-pilgrim-orange", hint: "#fb6202" },
  { name: "pilgrim-olive", className: "bg-pilgrim-olive", hint: "#617d0e" },
];

const semanticSwatches: Swatch[] = [
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "accent", className: "bg-accent" },
  { name: "muted", className: "bg-muted" },
  { name: "destructive", className: "bg-destructive" },
  { name: "card", className: "bg-card" },
  { name: "popover", className: "bg-popover" },
];

const chartSwatches: Swatch[] = [
  { name: "chart-1", className: "bg-chart-1" },
  { name: "chart-2", className: "bg-chart-2" },
  { name: "chart-3", className: "bg-chart-3" },
  { name: "chart-4", className: "bg-chart-4" },
  { name: "chart-5", className: "bg-chart-5" },
];

function SwatchRow({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section>
      <h3 className="mb-3 text-sm">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {swatches.map((s) => (
          <div
            key={s.name}
            className="overflow-hidden rounded-lg ring-1 ring-border"
          >
            <div className={`h-16 ${s.className}`} />
            <div className="bg-card px-3 py-2">
              <div className="text-xs font-medium text-foreground">{s.name}</div>
              {s.hint && (
                <div className="font-mono text-[10px] text-muted-foreground">
                  {s.hint}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ThemeTestPage() {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(42);

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-4xl font-bold">Pilgrim theme test</h1>
        <p className="mt-2 text-muted-foreground">
          Visual verification of brand tokens, typography, and every installed
          shadcn primitive. Delete this route in prompt 04.
        </p>
      </header>

      {/* Swatches */}
      <div className="space-y-8">
        <SwatchRow title="Papers" swatches={paperSwatches} />
        <SwatchRow title="Ink" swatches={inkSwatches} />
        <SwatchRow title="Brand" swatches={brandSwatches} />
        <SwatchRow title="Semantic" swatches={semanticSwatches} />
        <SwatchRow title="Charts" swatches={chartSwatches} />
      </div>

      <Separator />

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Typography</h2>
        <div className="space-y-2">
          <h1 className="text-5xl">Display / heading · Montserrat</h1>
          <h2 className="text-4xl">Section heading</h2>
          <h3 className="text-2xl">Subsection heading</h3>
          <h4 className="text-xl">Condensed heading · Oswald</h4>
          <h5 className="text-lg">Condensed level 5</h5>
          <h6 className="text-base">Condensed level 6</h6>
          <p className="mt-4">
            Body text — Roboto. The quick brown fox jumps over the lazy dog.
            Pilgrim Protect brings transparency to indoor residual spraying at
            schools across Uganda.
          </p>
          <p className="text-muted-foreground">
            Muted body — secondary information and supporting copy.
          </p>
          <p className="font-mono text-sm">
            Mono — Inconsolata · 2026-03-20T00:00:00Z · GPS 2.7746, 32.2999
          </p>
        </div>
      </section>

      <Separator />

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Buttons</h2>
        <div className="space-y-3">
          {buttonVariants.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-sm text-muted-foreground">
                {variant}
              </span>
              {buttonSizes.map((size) => (
                <Button key={`${variant}-${size}`} variant={variant} size={size}>
                  {size === "icon" ? "★" : `${variant} ${size}`}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Badges</h2>
        <div className="flex flex-wrap items-center gap-2">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Default card</CardTitle>
              <CardDescription>
                Standard card with title, description, and body.
              </CardDescription>
            </CardHeader>
            <CardContent>
              Card body content uses the card-foreground token. Long form copy
              wraps naturally and inherits the global line-height.
            </CardContent>
            <CardFooter>
              <Button size="sm">Primary action</Button>
              <Button size="sm" variant="outline">
                Secondary
              </Button>
            </CardFooter>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Compact card (size=sm)</CardTitle>
              <CardDescription>base-nova compact padding preset.</CardDescription>
            </CardHeader>
            <CardContent>
              Denser layout for dashboard tiles and list items.
            </CardContent>
            <CardFooter>
              <Button size="xs" variant="ghost">
                Dismiss
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Inputs + Labels */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Inputs</h2>
        <div className="grid max-w-md gap-3">
          <div className="space-y-1">
            <Label htmlFor="t-email">Email</Label>
            <Input id="t-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="t-disabled">Disabled</Label>
            <Input id="t-disabled" disabled placeholder="Disabled state" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="t-invalid">Invalid</Label>
            <Input
              id="t-invalid"
              aria-invalid="true"
              defaultValue="oops@"
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Progress */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Progress</h2>
        <Progress value={progress} max={100} className="max-w-md">
          <ProgressLabel>Funding progress</ProgressLabel>
          <ProgressValue>{(_, value) => `${value ?? 0}%`}</ProgressValue>
        </Progress>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setProgress((p) => Math.max(0, p - 10))}
          >
            −10
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setProgress((p) => Math.min(100, p + 10))}
          >
            +10
          </Button>
        </div>
      </section>

      <Separator />

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Tabs</h2>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            Tabs panel uses the muted/card tokens. Keyboard nav and focus ring
            should show Pilgrim blue on tab.
          </TabsContent>
          <TabsContent value="donors">
            Second panel — triggered by clicking the donors tab.
          </TabsContent>
          <TabsContent value="reports">
            Third panel — reports view would go here.
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Dialog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Dialog</h2>
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline">Open dialog</Button>}
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm sponsorship</DialogTitle>
              <DialogDescription>
                Sponsoring a school commits to one spray cycle (~$120).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <DialogClose render={<Button>Confirm</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <Separator />

      {/* Motion */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Motion</h2>
        <p className="text-sm text-muted-foreground">
          Reduced motion preference:{" "}
          <span className="font-medium text-foreground">
            {reduce ? "on — presets are disabled" : "off — presets active"}
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <MotionPill
            label="pilgrimSpring"
            animate={reduce ? undefined : { x: [0, 24, 0] }}
            transition={reduce ? { duration: 0 } : pilgrimSpring}
          />
          <MotionPill
            label="gentleFade"
            animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
            transition={reduce ? { duration: 0 } : gentleFade}
          />
          <MotionPill
            label="countUp"
            animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
            transition={reduce ? { duration: 0 } : countUp}
          />
        </div>
      </section>
    </div>
  );
}

function MotionPill({
  label,
  animate,
  transition,
}: {
  label: string;
  animate?: Record<string, number[]>;
  transition: Transition;
}) {
  return (
    <motion.span
      animate={animate}
      transition={{ ...transition, repeat: Infinity, repeatDelay: 0.8 }}
      className="inline-flex items-center rounded-full bg-pilgrim-blue/10 px-3 py-1 text-sm font-medium text-pilgrim-blue ring-1 ring-pilgrim-blue/20"
    >
      {label}
    </motion.span>
  );
}
