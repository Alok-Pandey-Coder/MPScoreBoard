"use client";

import { useMemo, useState } from "react";
import type { ReportMP } from "@/lib/data";
import styles from "./page.module.css";

export default function WorksList({ works }: { works: ReportMP["works"] }) {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => works.filter((work) => (category === "all" || work.category === category) && (status === "all" || work.status === status)), [category, status, works]);
  const visible = filtered.slice(page * 10, page * 10 + 10);
  return (
    <>
      <div className={styles.filters}>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }} aria-label="Filter works by category"><option value="all">All categories</option>{[...new Set(works.map((work) => work.category))].map((value) => <option key={value}>{value}</option>)}</select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} aria-label="Filter works by status"><option value="all">All statuses</option>{[...new Set(works.map((work) => work.status))].map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className={styles.list}>{visible.map((work) => <div className={styles.listItem} key={work.id}><strong>{work.title}</strong><span>{work.category} · {work.status} · {work.locality ?? "Locality not available"}</span></div>)}</div>
      {filtered.length > 10 && <div className={styles.pagination}><button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page + 1} of {Math.ceil(filtered.length / 10)}</span><button type="button" disabled={(page + 1) * 10 >= filtered.length} onClick={() => setPage((current) => current + 1)}>Next</button></div>}
    </>
  );
}
