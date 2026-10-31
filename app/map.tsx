"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BoundaryFeature } from "@/lib/boundaries";
import styles from "./page.module.css";

function bounds(features: BoundaryFeature[]) {
  const points = features.flatMap((feature) => feature.coordinates[0]);
  return {
    minX: Math.min(...points.map(([x]) => x)),
    maxX: Math.max(...points.map(([x]) => x)),
    minY: Math.min(...points.map(([, y]) => y)),
    maxY: Math.max(...points.map(([, y]) => y)),
  };
}

function contains(point: [number, number], ring: number[][]): boolean {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x, y] = ring[index];
    const [previousX, previousY] = ring[previous];
    const intersects = y > point[1] !== previousY > point[1]
      && point[0] < ((previousX - x) * (point[1] - y)) / (previousY - y) + x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export default function ConstituencyMap({ features }: { features: BoundaryFeature[] }) {
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const view = useMemo(() => features.length > 0 ? bounds(features) : null, [features]);

  function locate() {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by this browser.");
      return;
    }
    setMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const match = features.find((feature) => contains([coords.longitude, coords.latitude], feature.coordinates[0]));
        setMessage(match ? `Your approximate location falls in ${match.constituency}.` : "Your location is outside the available boundary snapshot.");
        if (match) setSelected(match.slug);
      },
      () => setMessage("Location permission was not granted. You can still choose a region on the map."),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 },
    );
  }

  if (!view) {
    return <section className={styles.mapPanel}><h2 className={styles.heading}>Constituency map</h2><p>Boundary data is not available for the reviewed real snapshot yet.</p></section>;
  }

  const width = view.maxX - view.minX;
  const height = view.maxY - view.minY;
  const point = (coordinate: number[]) => `${((coordinate[0] - view.minX) / width) * 100},${100 - ((coordinate[1] - view.minY) / height) * 100}`;

  return (
    <section className={styles.mapPanel}>
      <div className={styles.mapHeader}><div><h2 className={styles.heading}>Explore the constituency map</h2><p>Synthetic development boundaries for testing. Location coordinates stay in your browser.</p></div><button className={styles.mapButton} type="button" onClick={locate}>Use my location</button></div>
      <svg className={styles.map} viewBox="0 0 100 100" role="img" aria-label="Synthetic constituency map">
        {features.map((feature) => {
          const points = feature.coordinates[0].map((coordinate) => point(coordinate)).join(" ");
          return <Link href={`/mp/${feature.slug}`} key={feature.slug}><polygon points={points} className={selected === feature.slug ? styles.mapSelected : styles.mapRegion} onClick={() => setSelected(feature.slug)}><title>{feature.constituency} · {feature.mpName}</title></polygon></Link>;
        })}
      </svg>
      {message && <p className={styles.mapMessage} aria-live="polite">{message}</p>}
    </section>
  );
}
