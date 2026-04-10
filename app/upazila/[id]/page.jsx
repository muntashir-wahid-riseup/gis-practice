import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import UnionCanvas from "./UnionCanvas";

const UpazilaDetailsPage = async ({ params }) => {
  const { id } = await params;
  const gid = parseInt(id, 10);

  const filePath = path.join(process.cwd(), "public", "data", "unions.json");
  const raw = await readFile(filePath, "utf-8");
  const geojson = JSON.parse(raw);

  const feature = geojson.features.find((f) => f.properties.gid === gid);

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center">
          <p className="text-6xl font-black text-red-500 mb-4">404</p>
          <p className="text-2xl font-semibold mb-2">Union not found</p>
          <p className="text-slate-500 mb-6">
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

  const { shape1, shape2, shape3, shape4, shapeid, shapetype } =
    feature.properties;
  const coordinates = feature.geometry.coordinates;

  const breadcrumb = [
    { label: "Bangladesh", sublabel: "Country" },
    { label: shape1 ?? "—", sublabel: "Division" },
    { label: shape2 ?? "—", sublabel: "District" },
    { label: shape3 ?? "—", sublabel: "Upazila" },
    { label: shape4 ?? "—", sublabel: "Union", active: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-800">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-emerald-700 hover:text-emerald-600 transition flex items-center gap-1 font-medium"
        >
          ← Map
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-400">Union Details</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-widest uppercase mb-4">
            {shapetype} · GID {gid}
          </span>
          <h1 className="text-5xl font-black tracking-tight text-slate-800">
            {shape4 ?? "Unknown Union"}
          </h1>
          <p className="mt-2 text-slate-500 text-lg">
            {shape3}, {shape2}, Bangladesh
          </p>
        </div>

        {/* Canvas */}
        <div className="mb-10 rounded-2xl shadow-sm overflow-hidden border border-emerald-100 bg-[#f0fdf4] p-4">
          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-widest mb-3 text-center">
            Union Boundary
          </p>
          <UnionCanvas coordinates={coordinates} />
        </div>

        {/* Breadcrumb trail */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {breadcrumb.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex flex-col items-center px-4 py-2 rounded-xl border transition ${
                  item.active
                    ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
                  {item.sublabel}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {i < breadcrumb.length - 1 && (
                <span className="text-slate-300 text-lg">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { label: "Division", value: shape1, icon: "🗺️" },
            { label: "District (Zila)", value: shape2, icon: "🏙️" },
            { label: "Upazila", value: shape3, icon: "🏘️" },
            { label: "Union", value: shape4, icon: "📍" },
            { label: "Country", value: "Bangladesh", icon: "🇧🇩" },
            // { label: "Admin Level", value: shapetype, icon: "🏛️" },
          ].map((card) => (
            <div
              key={card.label}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
            >
              <span className="text-2xl mt-0.5">{card.icon}</span>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                  {card.value ?? "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Shape ID */}
        {/* <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Shape ID
          </p>
          <p className="font-mono text-sm text-emerald-700 break-all">
            {shapeid}
          </p>
        </div> */}
      </main>
    </div>
  );
};

export default UpazilaDetailsPage;
