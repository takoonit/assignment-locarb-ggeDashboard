"use client";

import { useEffect, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { cohereTokens } from "@/theme";

const slides = [
  "Brief",
  "Analysis",
  "Data",
  "Plan",
  "Stack",
  "Agents",
  "Recovery",
  "Demo",
] as const;

const requirementSignals = [
  ["API", "Validation, errors, docs, and endpoint contracts had to be visible, not hidden in source code."],
  ["Data", "The database had to answer country, year, gas, and sector questions, not mirror the raw CSV shape."],
  ["Dashboard", "Charts and map were the proof that the API and data model worked together."],
  ["Edge cases", "Missing years, sparse countries, null values, and no-data map states were core evaluation items."],
  ["Bonus", "Auth, admin CRUD, deployment, and caching only mattered after the core behavior was stable."],
] as const;

const dataFindings = [
  ["wide years", "normalize", "Years were columns, so the seed converted them into country-year records."],
  ["blank / NA", "preserve null", "Missing values stayed null because zero would create false emissions data."],
  ["sector shares", "label as %", "Sector rows were percentage-style shares, so the model and UI made that explicit."],
  ["partial coverage", "available years", "Different views had different year coverage, so the UI needed available-year logic."],
] as const;

const planningFlow = [
  ["PRD", "scope", "must-have, bonus, backlog, and definition of done"],
  ["Architecture", "boundaries", "single deployable app with layered API, services, validation, and UI"],
  ["Data model", "tables", "Country, AnnualEmission, SectorShare, User"],
  ["API spec", "contracts", "params, response shape, error shape, OpenAPI schemas"],
  ["UI spec", "states", "scoped controls, null handling, empty states, map legend"],
  ["BMAD", "stories", "ordered from scaffold to deploy smoke test"],
] as const;

const stackChoices = [
  ["Next.js", "one reviewable app", "The assignment included API and dashboard, so one deployable app reduced review friction."],
  ["Postgres", "country-year relations", "The data is relational and query-driven: countries, years, gas fields, and sectors."],
  ["Prisma", "typed persistence", "It kept schema, migrations, and service queries explicit."],
  ["TanStack Query", "cached filters", "Dashboard filters needed loading, error, retry, and cache behavior."],
  ["Zod", "validated contracts", "Invalid params and missing country codes needed consistent API handling."],
  ["Scalar", "live API docs", "The reviewer could inspect the API contract without reading source code."],
] as const;

const agentLoop = [
  ["Human", "assignment judgment", "I decided what the assignment meant and which risks mattered."],
  ["Docs", "constraints", "PRD, ADRs, API contracts, and UI spec controlled what agents could change."],
  ["Codex", "implementation slices", "Codex helped build focused pieces after the contract was written."],
  ["Claude", "scaffold support", "Claude helped with scaffolding and alternate passes under the same constraints."],
  ["Tests", "verification", "Tests, typecheck, and browser review caught drift between intent and implementation."],
] as const;

const recoveryFlow = [
  ["Apr 29", "submitted", "Sent GitHub and Vercel links after the first delivery pass."],
  ["Apr 30", "drift found", "Post-submit review showed completed dashboard behavior had been dropped during branch integration."],
  ["Apr 30", "transparent email", "I told Lo-Carb what happened and asked whether a corrected version would be acceptable."],
  ["May 1", "restored", "Restored the missing behavior and documented stricter workflow rules."],
] as const;

const demoSurfaces = [
  "Dashboard",
  "REST API",
  "API Docs",
  "Admin CRUD",
  "Seed Pipeline",
  "ADRs",
] as const;

export function PresentationBoard() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setActiveSlide((current) => Math.min(current + 1, slides.length - 1));
      }

      if (event.key === "ArrowLeft") {
        setActiveSlide((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const goPrevious = () => setActiveSlide((current) => Math.max(current - 1, 0));
  const goNext = () => setActiveSlide((current) => Math.min(current + 1, slides.length - 1));

  return (
    <Box sx={pageSx}>
      <Box aria-label="Presentation Deck" component="article" role="region" sx={deckSx}>
        <Box sx={topBarSx}>
          <Typography sx={eyebrowSx}>Lo-Carb GHG dashboard interview</Typography>
          <Typography sx={counterSx}>
            {activeSlide + 1} / {slides.length}
          </Typography>
        </Box>

        <Box sx={slideShellSx}>
          <Box component="nav" aria-label="Presentation slides" sx={railSx}>
            {slides.map((slide, index) => {
              const selected = activeSlide === index;

              return (
                <Button
                  key={slide}
                  aria-pressed={selected}
                  onClick={() => setActiveSlide(index)}
                  sx={navButtonSx(selected)}
                  type="button"
                >
                  <Box component="span" sx={navNumberSx(selected)}>
                    {String(index + 1).padStart(2, "0")}
                  </Box>
                  <Box component="span">{slide}</Box>
                </Button>
              );
            })}
          </Box>

          <Box aria-live="polite" component="section" sx={canvasSx}>
            {activeSlide === 0 && <BriefSlide />}
            {activeSlide === 1 && <AnalysisSlide />}
            {activeSlide === 2 && <DataSlide />}
            {activeSlide === 3 && <PlanSlide />}
            {activeSlide === 4 && <StackSlide />}
            {activeSlide === 5 && <AgentsSlide />}
            {activeSlide === 6 && <RecoverySlide />}
            {activeSlide === 7 && <DemoSlide />}
          </Box>
        </Box>

        <Box sx={footerSx}>
          <Typography sx={sourceSx}>
            Evidence: Gmail assignment + attached PDF, Notion planning docs, ADRs, TASK.md, README, git history.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button disabled={activeSlide === 0} onClick={goPrevious} type="button" variant="outlined">
              Previous
            </Button>
            <Button disabled={activeSlide === slides.length - 1} onClick={goNext} type="button" variant="contained">
              Next
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function BriefSlide() {
  return (
    <SlideFrame
      kicker="The assignment"
      title="Full-stack emissions product"
      source="Lo-Carb HR email, Apr 21 2026; full stack project based.pdf."
    >
      <Box sx={briefLayoutSx}>
        <Box sx={bigCardSx}>
          <Typography sx={heroLineSx}>REST API + dashboard + admin data management</Typography>
          <Typography sx={shortBodySx}>
            I read this as a full-stack product exercise: public users explore emissions, while admins manage the records behind the charts.
          </Typography>
          <Typography sx={explainSx}>
            The important part was not just showing a chart. The app had to prove data modeling, API contracts, dashboard behavior, edge-case handling, documentation, and deployment readiness.
          </Typography>
        </Box>
        <Box sx={orbitSx}>
          <OrbitNode label="Public dashboard" />
          <OrbitNode label="REST API" strong />
          <OrbitNode label="Admin CRUD" />
          <OrbitNode label="API docs" />
          <OrbitNode label="Deployment" />
        </Box>
      </Box>
    </SlideFrame>
  );
}

function AnalysisSlide() {
  return (
    <SlideFrame
      kicker="How I read it"
      title="Turn the PDF into review signals"
      source="Assignment PDF requirements; docs/00-prd.md."
    >
      <Box sx={analysisLayoutSx}>
        <Box sx={analysisFlowSx}>
          <LargeNode title="PDF brief" subtitle="requirements" />
          <Connector />
          <LargeNode title="Build target" subtitle="reviewable app" />
        </Box>
        <Box sx={signalListSx}>
          {requirementSignals.map(([title, detail]) => (
            <MiniSignal key={title} title={title} detail={detail} />
          ))}
        </Box>
      </Box>
      <Explanation
        title="Decision"
        body="I planned the build around review signals: API correctness, data shape, visible dashboard behavior, missing-data honesty, and a small set of bonus features that supported the assignment instead of distracting from it."
      />
    </SlideFrame>
  );
}

function DataSlide() {
  return (
    <SlideFrame
      kicker="What changed the model"
      title="The CSV was source data, not app design"
      source="docs/02-data-model.md; docs/04-ui-spec.md; ADR-006; ADR-010."
    >
      <Box sx={transformSx}>
        <LargeNode title="Provided CSV" subtitle="wide reporting shape" />
        <Connector />
        <LargeNode title="Seed transform" subtitle="normalize + preserve null" />
        <Connector />
        <LargeNode title="App tables" subtitle="Country / AnnualEmission / SectorShare" />
      </Box>
      <Box sx={findingGridSx}>
        {dataFindings.map(([found, response, detail]) => (
          <Box key={found} sx={findingSx}>
            <Typography sx={findingLabelSx}>{found}</Typography>
            <Typography sx={findingActionSx}>{response}</Typography>
            <Typography sx={findingDetailSx}>{detail}</Typography>
          </Box>
        ))}
      </Box>
    </SlideFrame>
  );
}

function PlanSlide() {
  return (
    <SlideFrame
      kicker="Before coding"
      title="Make the build contract explicit"
      source="Notion planning board; TASK.md readiness gate; docs/05-ai-workflow.md."
    >
      <Box sx={planningGridSx}>
        {planningFlow.map(([title, detail, explanation], index) => (
          <Box key={title} sx={planStepSx}>
            <Typography sx={stepIndexSx}>{String(index + 1).padStart(2, "0")}</Typography>
            <Typography sx={planTitleSx}>{title}</Typography>
            <Typography sx={planDetailSx}>{detail}</Typography>
            <Typography sx={planExplainSx}>{explanation}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={bannerSx}>
        <Typography sx={bannerTextSx}>BMAD: Build → Measure → Adapt → Document</Typography>
      </Box>
    </SlideFrame>
  );
}

function StackSlide() {
  return (
    <SlideFrame
      kicker="Tech decisions"
      title="Choose boring tools for the assignment risks"
      source="docs/01-architecture.md; docs/01c-adrs.md; README."
    >
      <Box sx={stackGridSx}>
        {stackChoices.map(([tool, why, detail]) => (
          <Box key={tool} sx={stackCardSx}>
            <Typography sx={stackToolSx}>{tool}</Typography>
            <Typography sx={stackWhySx}>{why}</Typography>
            <Typography sx={stackDetailSx}>{detail}</Typography>
          </Box>
        ))}
      </Box>
      <EvidenceStrip items={["ADR-001", "ADR-002", "ADR-003", "ADR-005", "ADR-011"]} />
    </SlideFrame>
  );
}

function AgentsSlide() {
  return (
    <SlideFrame
      kicker="Codex and Claude"
      title="Agents worked inside the contract"
      source="docs/05-ai-workflow.md; BMAD stories; implementation history."
    >
      <Box sx={agentDiagramSx}>
        {agentLoop.map(([title, detail, explanation], index) => (
          <Box key={title} sx={agentNodeSx(index === 0)}>
            <Typography sx={agentTitleSx}>{title}</Typography>
            <Typography sx={agentDetailSx}>{detail}</Typography>
            <Typography sx={agentExplainSx}>{explanation}</Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={oneLineSx}>
        Straight answer: ChatGPT and Codex helped inspect files, detect inconsistencies, compare choices, and scaffold focused slices.
      </Typography>
    </SlideFrame>
  );
}

function RecoverySlide() {
  return (
    <SlideFrame
      kicker="Problem and response"
      title="Integration drift was found and fixed"
      source="Submission email Apr 29; follow-up email Apr 30; May 1 recovery commits; ADR-024."
    >
      <Box sx={timelineSx}>
        {recoveryFlow.map(([date, label, detail]) => (
          <Box key={`${date}-${label}`} sx={timelineStepSx}>
            <Typography sx={timelineDateSx}>{date}</Typography>
            <Typography sx={timelineLabelSx}>{label}</Typography>
            <Typography sx={timelineDetailSx}>{detail}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={fixPanelSx}>
        <Chip label="available-year endpoints" />
        <Chip label="map no-data legend" />
        <Chip label="zero vs null sector bars" />
        <Chip label="Recharts sizing" />
        <Chip label="stricter workflow ADR-024" />
      </Box>
    </SlideFrame>
  );
}

function DemoSlide() {
  return (
    <SlideFrame
      kicker="Current state"
      title="What I can walk through now"
      source="README; app routes; API docs; ADRs."
    >
      <Box sx={demoGridSx}>
        {demoSurfaces.map((surface) => (
          <Box key={surface} sx={demoTileSx}>
            <Typography sx={demoTextSx}>{surface}</Typography>
          </Box>
        ))}
      </Box>
      <Explanation
        title="Walkthrough angle"
        body="In the interview I can start from the dashboard, open the API docs to prove the contract, show how the CSV became app tables, then discuss ADRs and recovery decisions when technical questions come up."
      />
      <EvidenceStrip items={["Dashboard behavior", "API contracts", "Data transform", "Tradeoffs", "Recovery story"]} />
    </SlideFrame>
  );
}

function SlideFrame({
  kicker,
  title,
  source,
  children,
}: {
  kicker: string;
  title: string;
  source: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={frameSx}>
      <Box sx={headlineSx}>
        <Typography sx={eyebrowSx}>{kicker}</Typography>
        <Typography component="h1" sx={titleSx}>
          {title}
        </Typography>
      </Box>
      <Box sx={visualAreaSx}>{children}</Box>
      <Typography sx={sourceSx}>Source: {source}</Typography>
    </Box>
  );
}

function OrbitNode({ label, strong = false }: { label: string; strong?: boolean }) {
  return (
    <Box sx={orbitNodeSx(strong)}>
      <Typography sx={orbitTextSx(strong)}>{label}</Typography>
    </Box>
  );
}

function LargeNode({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box sx={largeNodeSx}>
      <Typography sx={largeNodeTitleSx}>{title}</Typography>
      <Typography sx={largeNodeSubtitleSx}>{subtitle}</Typography>
    </Box>
  );
}

function MiniSignal({ title, detail }: { title: string; detail: string }) {
  return (
    <Box sx={miniSignalSx}>
      <Typography sx={miniTitleSx}>{title}</Typography>
      <Typography sx={miniDetailSx}>{detail}</Typography>
    </Box>
  );
}

function Explanation({ title, body }: { title: string; body: string }) {
  return (
    <Box sx={explanationSx}>
      <Typography sx={explanationTitleSx}>{title}</Typography>
      <Typography sx={explanationBodySx}>{body}</Typography>
    </Box>
  );
}

function Connector() {
  return <Box aria-hidden="true" sx={connectorSx} />;
}

function EvidenceStrip({ items }: { items: string[] }) {
  return (
    <Box sx={evidenceStripSx}>
      {items.map((item) => (
        <Chip key={item} label={item} size="small" variant="outlined" />
      ))}
    </Box>
  );
}

const pageSx = {
  bgcolor: cohereTokens.colors.canvas,
  color: cohereTokens.colors.ink,
  flex: 1,
  py: { xs: 2, md: 3 },
};

const deckSx = {
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  maxWidth: 1280,
  mx: "auto",
  overflow: "hidden",
  width: "calc(100% - 32px)",
};

const topBarSx = {
  alignItems: "center",
  borderBottom: `1px solid ${cohereTokens.colors.hairline}`,
  display: "flex",
  justifyContent: "space-between",
  px: { xs: 2, md: 2.5 },
  py: 1.25,
};

const slideShellSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "210px 1fr" },
};

const railSx = {
  alignContent: "start",
  borderRight: { xs: "none", md: `1px solid ${cohereTokens.colors.hairline}` },
  display: "grid",
  gap: 0.65,
  gridAutoRows: "max-content",
  p: { xs: 1, md: 1.25 },
};

const navButtonSx = (selected: boolean) => ({
  alignItems: "center",
  bgcolor: selected ? cohereTokens.colors.paleGreen : "transparent",
  border: `1px solid ${selected ? cohereTokens.colors.formFocus : "transparent"}`,
  borderRadius: 1.25,
  color: cohereTokens.colors.ink,
  display: "grid",
  fontSize: 14,
  gap: 0.9,
  gridTemplateColumns: "30px 1fr",
  justifyContent: "start",
  minHeight: 42,
  px: 1,
  py: 0.65,
  textTransform: "none",
  width: "100%",
  "&:hover": {
    bgcolor: selected ? cohereTokens.colors.paleGreen : cohereTokens.colors.softEarth,
  },
});

const navNumberSx = (selected: boolean) => ({
  alignItems: "center",
  bgcolor: selected ? cohereTokens.colors.formFocus : cohereTokens.colors.canvas,
  border: `1px solid ${selected ? cohereTokens.colors.formFocus : cohereTokens.colors.hairline}`,
  borderRadius: cohereTokens.rounded.full,
  color: selected ? cohereTokens.colors.onPrimary : cohereTokens.colors.formFocus,
  display: "flex",
  fontFamily: cohereTokens.font.mono,
  fontSize: 11,
  fontWeight: 800,
  height: 26,
  justifyContent: "center",
  width: 26,
});

const canvasSx = {
  minHeight: { xs: 620, md: 628 },
  p: { xs: 2, md: 3 },
};

const footerSx = {
  alignItems: { xs: "stretch", md: "center" },
  borderTop: `1px solid ${cohereTokens.colors.hairline}`,
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  gap: 1.25,
  justifyContent: "space-between",
  px: { xs: 2, md: 2.5 },
  py: 1.25,
};

const frameSx = {
  display: "grid",
  gap: 2,
  minHeight: { xs: 580, md: 585 },
};

const headlineSx = {
  maxWidth: 900,
};

const visualAreaSx = {
  display: "grid",
  gap: 2,
};

const briefLayoutSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", md: "0.92fr 1.08fr" },
};

const bigCardSx = {
  alignContent: "center",
  bgcolor: cohereTokens.colors.paleGreen,
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  display: "grid",
  minHeight: 360,
  p: { xs: 2.25, md: 3 },
};

const orbitSx = {
  display: "grid",
  gap: 1.25,
  gridTemplateColumns: "repeat(6, 1fr)",
};

const orbitNodeSx = (strong: boolean) => ({
  alignItems: "center",
  bgcolor: strong ? cohereTokens.colors.ink : cohereTokens.colors.canvas,
  border: `1px solid ${strong ? cohereTokens.colors.ink : cohereTokens.colors.hairline}`,
  borderRadius: cohereTokens.rounded.full,
  display: "flex",
  gridColumn: strong ? "2 / span 4" : "span 3",
  justifyContent: "center",
  minHeight: strong ? 150 : 102,
  p: 2,
  textAlign: "center",
});

const orbitTextSx = (strong: boolean) => ({
  color: strong ? cohereTokens.colors.onPrimary : cohereTokens.colors.ink,
  fontSize: strong ? { xs: 24, md: 33 } : { xs: 17, md: 20 },
  fontWeight: 620,
  letterSpacing: 0,
  lineHeight: 1.1,
});

const analysisLayoutSx = {
  display: "grid",
  gap: 1.5,
};

const analysisFlowSx = {
  alignItems: "center",
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: { xs: "1fr", md: "1fr 72px 1fr" },
};

const signalListSx = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
};

const largeNodeSx = {
  alignContent: "center",
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  display: "grid",
  minHeight: 180,
  p: 2,
  textAlign: "center",
};

const connectorSx = {
  bgcolor: cohereTokens.colors.formFocus,
  display: { xs: "none", md: "block" },
  height: 2,
  width: "100%",
};

const miniSignalSx = {
  bgcolor: cohereTokens.colors.softEarth,
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 1.5,
  minHeight: 210,
  p: 1.5,
};

const transformSx = {
  alignItems: "center",
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: { xs: "1fr", md: "1fr 42px 1fr 42px 1fr" },
};

const findingGridSx = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
};

const findingSx = {
  border: `1px solid ${cohereTokens.colors.warningAmber}`,
  borderRadius: 2,
  minHeight: 178,
  p: 1.5,
};

const planningGridSx = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: { xs: "1fr", md: "repeat(6, 1fr)" },
};

const planStepSx = {
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  minHeight: 230,
  p: 1.5,
};

const bannerSx = {
  bgcolor: cohereTokens.colors.ink,
  borderRadius: 2,
  p: 2,
  textAlign: "center",
};

const stackGridSx = {
  display: "grid",
  gap: 1.25,
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
};

const stackCardSx = {
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  minHeight: 205,
  p: 2,
};

const evidenceStripSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
};

const agentDiagramSx = {
  display: "grid",
  gap: 1.25,
  gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
};

const agentNodeSx = (strong: boolean) => ({
  bgcolor: strong ? cohereTokens.colors.paleGreen : cohereTokens.colors.canvas,
  border: `1px solid ${strong ? cohereTokens.colors.formFocus : cohereTokens.colors.hairline}`,
  borderRadius: strong ? cohereTokens.rounded.full : 2,
  minHeight: strong ? 270 : 240,
  p: 2,
});

const timelineSx = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
};

const timelineStepSx = {
  bgcolor: cohereTokens.colors.softEarth,
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  minHeight: 225,
  p: 2,
};

const fixPanelSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
};

const demoGridSx = {
  display: "grid",
  gap: 1.25,
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
};

const demoTileSx = {
  alignItems: "center",
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  display: "flex",
  justifyContent: "center",
  minHeight: 150,
  p: 2,
  textAlign: "center",
};

const titleSx = {
  fontFamily: cohereTokens.font.display,
  fontSize: { xs: 38, md: 60 },
  fontWeight: 560,
  letterSpacing: 0,
  lineHeight: 1,
  mt: 0.5,
};

const heroLineSx = {
  fontFamily: cohereTokens.font.display,
  fontSize: { xs: 36, md: 54 },
  fontWeight: 560,
  letterSpacing: 0,
  lineHeight: 1,
};

const shortBodySx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: { xs: 18, md: 22 },
  lineHeight: 1.4,
  mt: 2,
};

const explainSx = {
  borderTop: `1px solid ${cohereTokens.colors.hairline}`,
  color: cohereTokens.colors.ink,
  fontSize: { xs: 16, md: 18 },
  lineHeight: 1.45,
  mt: 2,
  pt: 2,
};

const oneLineSx = {
  bgcolor: cohereTokens.colors.paleGreen,
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  color: cohereTokens.colors.ink,
  fontSize: { xs: 18, md: 22 },
  lineHeight: 1.35,
  p: 2,
};

const eyebrowSx = {
  color: cohereTokens.colors.formFocus,
  fontFamily: cohereTokens.font.mono,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.4,
  textTransform: "uppercase",
};

const counterSx = {
  color: cohereTokens.colors.bodyMuted,
  fontFamily: cohereTokens.font.mono,
  fontSize: 13,
};

const sourceSx = {
  color: cohereTokens.colors.formFocus,
  fontFamily: cohereTokens.font.mono,
  fontSize: 12,
  lineHeight: 1.35,
};

const largeNodeTitleSx = {
  color: cohereTokens.colors.ink,
  fontSize: { xs: 24, md: 30 },
  fontWeight: 620,
  letterSpacing: 0,
  lineHeight: 1.1,
};

const largeNodeSubtitleSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 15,
  lineHeight: 1.35,
  mt: 1,
};

const miniTitleSx = {
  color: cohereTokens.colors.ink,
  fontSize: 19,
  fontWeight: 620,
  lineHeight: 1.15,
};

const miniDetailSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 13,
  lineHeight: 1.35,
  mt: 1,
};

const findingLabelSx = {
  color: cohereTokens.colors.ink,
  fontSize: 22,
  fontWeight: 620,
  lineHeight: 1.1,
};

const findingActionSx = {
  color: cohereTokens.colors.formFocus,
  fontFamily: cohereTokens.font.mono,
  fontSize: 13,
  fontWeight: 800,
  mt: 1.25,
  textTransform: "uppercase",
};

const findingDetailSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 14,
  lineHeight: 1.35,
  mt: 1.2,
};

const stepIndexSx = {
  color: cohereTokens.colors.formFocus,
  fontFamily: cohereTokens.font.mono,
  fontSize: 12,
  fontWeight: 800,
};

const planTitleSx = {
  color: cohereTokens.colors.ink,
  fontSize: 22,
  fontWeight: 620,
  lineHeight: 1.1,
  mt: 1.25,
};

const planDetailSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 14,
  mt: 1,
};

const planExplainSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 13,
  lineHeight: 1.35,
  mt: 1.2,
};

const bannerTextSx = {
  color: cohereTokens.colors.onPrimary,
  fontSize: { xs: 22, md: 32 },
  fontWeight: 620,
  lineHeight: 1.15,
};

const stackToolSx = {
  color: cohereTokens.colors.ink,
  fontSize: 28,
  fontWeight: 620,
  lineHeight: 1.05,
};

const stackWhySx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 16,
  lineHeight: 1.35,
  mt: 1.5,
};

const stackDetailSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 14,
  lineHeight: 1.35,
  mt: 1.25,
};

const agentTitleSx = {
  color: cohereTokens.colors.ink,
  fontSize: 28,
  fontWeight: 620,
  lineHeight: 1.05,
};

const agentDetailSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 15,
  lineHeight: 1.35,
  mt: 1.5,
};

const agentExplainSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 13,
  lineHeight: 1.35,
  mt: 1.2,
};

const timelineDateSx = {
  color: cohereTokens.colors.formFocus,
  fontFamily: cohereTokens.font.mono,
  fontSize: 14,
  fontWeight: 800,
};

const timelineLabelSx = {
  color: cohereTokens.colors.ink,
  fontSize: 28,
  fontWeight: 620,
  lineHeight: 1.05,
  mt: 1.5,
};

const timelineDetailSx = {
  color: cohereTokens.colors.bodyMuted,
  fontSize: 14,
  lineHeight: 1.35,
  mt: 1.2,
};

const demoTextSx = {
  color: cohereTokens.colors.ink,
  fontSize: { xs: 24, md: 32 },
  fontWeight: 620,
  lineHeight: 1.05,
};

const explanationSx = {
  bgcolor: cohereTokens.colors.paleGreen,
  border: `1px solid ${cohereTokens.colors.hairline}`,
  borderRadius: 2,
  p: 2,
};

const explanationTitleSx = {
  color: cohereTokens.colors.formFocus,
  fontFamily: cohereTokens.font.mono,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.35,
  textTransform: "uppercase",
};

const explanationBodySx = {
  color: cohereTokens.colors.ink,
  fontSize: { xs: 17, md: 20 },
  lineHeight: 1.4,
  mt: 0.8,
};
