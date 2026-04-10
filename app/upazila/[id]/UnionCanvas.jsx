"use client";

import { useEffect, useRef } from "react";

export default function UnionCanvas({ coordinates }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Collect all points across all rings of all polygons
    const allPoints = coordinates.flatMap((polygon) =>
      polygon.flatMap((ring) => ring),
    );

    const lngs = allPoints.map(([lng]) => lng);
    const lats = allPoints.map(([, lat]) => lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padding = 24;
    const W = canvas.width - padding * 2;
    const H = canvas.height - padding * 2;

    const scaleX = W / (maxLng - minLng || 1);
    const scaleY = H / (maxLat - minLat || 1);
    const scale = Math.min(scaleX, scaleY);

    // Center offset
    const drawW = (maxLng - minLng) * scale;
    const drawH = (maxLat - minLat) * scale;
    const offsetX = padding + (W - drawW) / 2;
    const offsetY = padding + (H - drawH) / 2;

    const project = ([lng, lat]) => [
      offsetX + (lng - minLng) * scale,
      // flip Y: lat increases upward, canvas Y increases downward
      offsetY + drawH - (lat - minLat) * scale,
    ];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    coordinates.forEach((polygon) => {
      polygon.forEach((ring, ringIndex) => {
        ctx.beginPath();
        ring.forEach((point, i) => {
          const [x, y] = project(point);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();

        if (ringIndex === 0) {
          // Outer ring — fill
          ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
          ctx.fill();
          ctx.strokeStyle = "#059669";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Inner rings (holes) — cut out
          ctx.fillStyle = "#f0fdf4";
          ctx.fill();
          ctx.strokeStyle = "#6ee7b7";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
  }, [coordinates]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={400}
      className="w-full h-auto rounded-2xl border border-emerald-200 bg-[#f0fdf4] shadow-inner"
    />
  );
}
