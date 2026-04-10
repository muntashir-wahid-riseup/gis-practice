"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (mapRef.current) return;

    // Bangladesh bounding box: SW [88.0, 20.5] → NE [92.7, 26.7]
    const BANGLADESH_BOUNDS = [
      [88.0, 20.5],
      [92.7, 26.7],
    ];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [90.35, 23.68],
      maxBounds: [
        [85.0, 18.0],
        [95.5, 29.0],
      ], // restrict panning near Bangladesh
    });

    mapRef.current = map;

    map.on("load", async () => {
      // Load GeoJSON
      const res = await fetch("/data/unions.json");
      const geojson = await res.json();

      // Assign a random color to each feature
      geojson.features.forEach((feature) => {
        const hue = Math.floor(Math.random() * 360);
        feature.properties._color = `hsl(${hue}, 70%, 55%)`;
      });

      map.addSource("unions", {
        type: "geojson",
        data: geojson,
      });

      // Add fill layer (random colors per union)
      map.addLayer({
        id: "union-fill",
        type: "fill",
        source: "unions",
        paint: {
          "fill-color": ["get", "_color"],
          "fill-opacity": 0.7,
        },
      });

      // Border layer
      map.addLayer({
        id: "union-border",
        type: "line",
        source: "unions",
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });

      // Fit map to Bangladesh extent
      map.fitBounds(BANGLADESH_BOUNDS, { padding: 20, duration: 0 });

      // Hover popup
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on("mousemove", "union-fill", (e) => {
        const props = e.features[0].properties;
        map.getCanvas().style.cursor = "pointer";

        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <strong>${props.shape4}</strong><br/>
            Upazila: ${props.shape3}<br/>
            District: ${props.shape2}<br/>
            Division: ${props.shape1 ?? "—"}<br/>
            <span style="font-size:11px;color:#888;margin-top:4px;display:block">Click to view details</span>
          `,
          )
          .addTo(map);
      });

      map.on("click", "union-fill", (e) => {
        const props = e.features[0].properties;
        const upazilaId = props.gid;

        router.push(`/upazila/${upazilaId}`);
      });

      map.on("mouseleave", "union-fill", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}
