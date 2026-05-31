import type { DashboardState } from "@/lib/types";
import AccordionCard from "./accordion-card";
import CopyButton from "./copy-button";
export default function DeveloperShell({
  initialData,
}: {
  initialData: DashboardState;
}) {
  const densityCurrent = JSON.stringify(
    initialData.apiExamples.densityCurrent,
    null,
    2,
  );
  const etaCurrent = JSON.stringify(initialData.apiExamples.eta, null, 2);
  const gpsCurrent = JSON.stringify(
    initialData.apiExamples.gpsCurrent,
    null,
    2,
  );
  const gpsStream = JSON.stringify(
    initialData.apiExamples.gpsStreamExample,
    null,
    2,
  );
  return (
    <main className="page-shell">
      <div className="shell">
        <header className="hero">
          <div className="hero-left">
            <p className="kicker">
              <span className="dot" /> Developer Hand-off
            </p>
            <h1>Endpoint, payload, dan integrasi</h1>
            <p className="hero-sub">
              Handoff developer dipisahkan dari dashboard operasional agar tim
              backend, frontend, dan AI bisa bekerja lebih rapi.
            </p>
          </div>
        </header>
        <section className="developer-grid">
          <div className="developer-stack">
            <AccordionCard
              title="GET /api/density/current"
              subtitle="Snapshot density untuk operasional"
              defaultOpen
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <CopyButton text={densityCurrent} />
              </div>
              <code className="accordion-code">{densityCurrent}</code>
            </AccordionCard>
            <AccordionCard title="GET /api/eta" subtitle="Traffic-aware ETA">
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <CopyButton text={etaCurrent} />
              </div>
              <code className="accordion-code">{etaCurrent}</code>
            </AccordionCard>
          </div>
          <div className="developer-stack">
            <AccordionCard
              title="GET /api/gps/current"
              subtitle="Snapshot GPS yang sama dengan map"
              defaultOpen
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <CopyButton text={gpsCurrent} />
              </div>
              <code className="accordion-code">{gpsCurrent}</code>
            </AccordionCard>
            <AccordionCard
              title="GET /api/gps/stream"
              subtitle="SSE event stream"
              defaultOpen
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <CopyButton text={gpsStream} />
              </div>
              <code className="accordion-code">{gpsStream}</code>
            </AccordionCard>
          </div>
        </section>
        <div className="card developer-card">
          <div className="developer-head">
            <div>
              <p className="kicker">
                <span className="dot" /> Scheduling rule
              </p>
              <h2>Cascading delay case</h2>
              <p className="developer-note">
                Jika Bus A terlambat 10 menit, maka Bus B dan unit berikutnya
                ikut membawa estimasi delay 10 menit sampai recovery jadwal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
