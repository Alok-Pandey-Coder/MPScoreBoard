import React from 'react';
import type { Metadata } from 'next';
import { getAllMPRecords } from '@/lib/mp-data';
import { INDIA_STATES } from '@/lib/indiaGeoData';
import { StateExplorationClient } from '@/components/state/StateExplorationClient';

export function generateStaticParams() {
  return INDIA_STATES.map((s) => ({ state: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: stateParam } = await params;
  const state =
    INDIA_STATES.find(
      (s) => s.id === stateParam.toLowerCase() || s.name.toLowerCase().includes(stateParam.toLowerCase())
    ) || { name: stateParam };

  return {
    title: `${state.name} Lok Sabha Constituencies — Mera MP, Mera Report Card`,
    description: `Explore all parliamentary constituencies and elected MPs representing ${state.name} in the 18th Lok Sabha.`,
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const mps = getAllMPRecords();

  return <StateExplorationClient mps={mps} stateParam={state} />;
}
