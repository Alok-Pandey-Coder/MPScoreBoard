import stateImagesJson from '@/data/processed/state_images.json';
import stateIconsJson from '@/data/processed/state_icons.json';

export interface StateImage {
  /** Public path, e.g. "/images/states/delhi.jpg". */
  file: string;
  /** What the picture shows, e.g. "India Gate". */
  subject: string;
  source_url: string;
  licence: string;
  author: string | null;
  retrieved_at: string;
}

export interface StateIcon {
  icon: string;
  /** What the icon stands for, e.g. "India Gate". */
  label: string;
  /** Public path of the SVG, e.g. "/icons/states/delhi.svg". */
  file: string;
  source_url: string;
  set: string;
  author: string;
  licence: string;
  retrieved_at: string;
}

const icons = (stateIconsJson as { icons: Record<string, StateIcon> }).icons;
const iconSets = (stateIconsJson as { sets: Record<string, { name: string; author: string; licence: string; url: string }> }).sets;

/** The outline landmark icon for a state id (see scripts/12_fetch_state_icons.py). */
export function getStateIcon(stateId: string): StateIcon | undefined {
  return icons[stateId];
}

export function getStateIconSets() {
  return Object.values(iconSets);
}

const images = (stateImagesJson as { images: Record<string, StateImage> }).images;

/** The monument/emblem picture for a state id, or undefined when none has been added. */
export function getStateImage(stateId: string): StateImage | undefined {
  return images[stateId];
}

export function getAllStateImages(): Array<StateImage & { stateId: string }> {
  return Object.entries(images).map(([stateId, image]) => ({ stateId, ...image }));
}
