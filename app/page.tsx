import { getAllMPs } from '@/lib/data';
import { HomeClient } from '@/components/home/HomeClient';

export default function HomePage() {
  const mps = getAllMPs();
  return <HomeClient mps={mps} />;
}
