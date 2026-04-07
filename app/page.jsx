"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Home() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [90.4125, 23.8103],
      zoom: 10,
    });

    mapRef.current = map;

    map.on("load", async () => {
      // Load GeoJSON
      const res = await fetch("/data/unions.json");
      const geojson = await res.json();

      map.addSource("unions", {
        type: "geojson",
        data: geojson,
      });

      // Add fill layer (choropleth)
      map.addLayer({
        id: "union-fill",
        type: "fill",
        source: "unions",
        paint: {
          "fill-color": [
            "case",
            [">", ["get", "votes_a"], ["get", "votes_b"]],
            "#16a34a", // green
            "#dc2626", // red
          ],
          "fill-opacity": 0.6,
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

      // Click event
      map.on("click", "union-fill", (e) => {
        const props = e.features[0].properties;

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <strong>${props.shape1}</strong><br/>
            Zila: ${props.shape2}<br/>
            Upazila: ${props.shape3}
          `,
          )
          .addTo(map);
      });

      // Cursor pointer
      map.on("mouseenter", "union-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "union-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}
