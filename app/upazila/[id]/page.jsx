import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";

const UpazilaDetailsPage = async ({ params }) => {
  const { id } = await params;
  const gid = parseInt(id, 10);

  const filePath = path.join(process.cwd(), "public", "data", "unions.json");
  const raw = await readFile(filePath, "utf-8");
  const geojson = JSON.parse(raw);

  const feature = geojson.features.find((f) => f.properties.gid === gid);

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-6xl font-black text-red-500 mb-4">404</p>
          <p className="text-2xl font-semibold mb-2">Union not found</p>
          <p className="text-gray-400 mb-6">
            GID {id} does not exist in the dataset.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-white font-medium"
          >
            ← Back to Map
          </Link>
        </div>
      </div>
    );
  }

  const { shape0, shape1, shape2, shape3, shape4, shapeid, shapetype } =
    feature.properties;

  const breadcrumb = [
    { label: "Bangladesh", sublabel: "Country" },
    { label: shape1 ?? "—", sublabel: "Division" },
    { label: shape2 ?? "—", sublabel: "District" },
    { label: shape3 ?? "—", sublabel: "Upazila" },
    { label: shape4 ?? "—", sublabel: "Union", active: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-emerald-950 text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
        >
          ← Map
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/50">Union Details</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="mb-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-widest uppercase mb-4">
            {shapetype} · GID {gid}
          </span>
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            {shape4 ?? "Unknown Union"}
          </h1>
          <p className="mt-3 text-gray-400 text-lg">
            {shape3}, {shape2}, Bangladesh
          </p>
        </div>

        {/* Breadcrumb trail */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {breadcrumb.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`flex flex-col items-center px-4 py-2 rounded-xl border transition ${
                  item.active
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                    : "bg-white/5 border-white/10 text-gray-300"
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">
                  {item.sublabel}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {i < breadcrumb.length - 1 && (
                <span className="text-white/20 text-lg">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { label: "Division", value: shape1, icon: "🗺️" },
            { label: "District (Zila)", value: shape2, icon: "🏙️" },
            { label: "Upazila", value: shape3, icon: "🏘️" },
            { label: "Union", value: shape4, icon: "📍" },
            { label: "Country", value: "Bangladesh", icon: "🇧🇩" },
            { label: "Admin Level", value: shapetype, icon: "🏛️" },
          ].map((card) => (
            <div
              key={card.label}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/30 transition group"
            >
              <span className="text-2xl mt-0.5">{card.icon}</span>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="font-semibold text-white group-hover:text-emerald-300 transition">
                  {card.value ?? "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Shape ID */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Shape ID
          </p>
          <p className="font-mono text-sm text-emerald-400 break-all">
            {shapeid}
          </p>
        </div>
      </main>
    </div>
  );
};

export default UpazilaDetailsPage;
