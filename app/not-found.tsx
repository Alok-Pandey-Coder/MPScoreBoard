import type { Metadata } from 'next';
import { getAllMPs } from '@/lib/data';
import { NotFoundContent } from './NotFoundContent';

export const metadata: Metadata = {
  title: 'Page not found — Mera MP, Mera Report Card',
};

export default function NotFound() {
  return <NotFoundContent mps={getAllMPs()} />;
}
