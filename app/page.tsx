import { getAllMPs } from '@/lib/data';
import { HomeClient } from '@/components/home/HomeClient';

export default async function HomePage() {
  const mps = await getAllMPs();
  return <HomeClient mps={mps} />;
}
