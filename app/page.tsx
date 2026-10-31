import { getAllMPRecords } from '@/lib/mp-data';
import { HomeClient } from '@/components/home/HomeClient';

export default function HomePage() {
  const mps = getAllMPRecords();
  return <HomeClient mps={mps} />;
}
