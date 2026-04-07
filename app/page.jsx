"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Home() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

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
