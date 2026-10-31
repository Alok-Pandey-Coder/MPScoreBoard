import Link from "next/link";
import { getAllMPs, getSnapshotDate } from "@/lib/data";
import { getBoundaryFeatures } from "@/lib/boundaries";
import ConstituencyMap from "./map";
import PincodeLookup from "./pincode";
import MPDirectory from "./search";
import styles from "./page.module.css";

export default function Home() {
  const mps = getAllMPs();
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Mera MP</Link>
        <Link href="/about" className={styles.textLink}>How this works</Link>
      </header>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Delhi · 18th Lok Sabha · source-backed</p>
        <h1 className={styles.title}>Know your MP&apos;s record in 60 seconds.</h1>
        <p className={styles.lede}>Find a constituency, see descriptive parliamentary activity indicators, and check every source and date. No rankings. No verdicts.</p>
        <MPDirectory mps={mps} />
        <ConstituencyMap features={getBoundaryFeatures()} />
        <PincodeLookup />
      </section>
      <footer className={styles.footer}><span>Snapshot: {getSnapshotDate()} · {mps.length} Delhi seats</span><span>Unofficial civic project · verify facts at the linked sources</span></footer>
    </main>
  );
}
