// Artifact data for the Adventure theme
export const artifacts = [
  {
    id: "3A1",
    title: "Video of Biplane Flight, 1919",
    description: "A rare historical video showing Helen Keller's biplane flight in 1919.",
    type: "video",
    videoSrc: "3A1Biplane.mp4",
    posterSrc: "3A1Biplane_frame.png",
    images: []
  },
  {
    id: "3A2",
    title: "Japanese Luncheon Set, 1948",
    description: "Kazuo Honma, the founder of the Japanese Braille Library, gifted Helen a New Year's luncheon set in 1948. The black lacquer set has gold symbols and carved abalone inlays, all set in a carrying stand with a brass handle. It contains six drawers, six trays, and a pair of cylindrical flasks.",
    type: "images",
    images: [
      {
        src: "3A2Lunch1.jpeg",
        alt: "Black lacquer Japanese luncheon set with gold decorative symbols, shown from the front view displaying the carrying stand with brass handle"
      },
      {
        src: "3A2Lunch2.jpeg",
        alt: "Close-up view of the Japanese luncheon set showing the intricate carved abalone inlays and gold detailing on the black lacquer surface"
      }
    ]
  },
  {
    id: "3A3",
    title: "Photograph with Bantu Chief, 1951",
    description: "A photograph of Helen Keller meeting with a Bantu Chief during her travels in 1951.",
    type: "images",
    images: [
      {
        src: "3A3Bantu1.jpeg",
        alt: "Helen Keller meeting with a Bantu Chief in 1951"
      },
      {
        src: "3A3Bantu2.jpeg",
        alt: "Another view of Helen Keller's meeting with the Bantu Chief"
      }
    ]
  },
  {
    id: "3A4",
    title: "Global Travel Schedule, 1948-49",
    description: "Helen Keller's global travel schedule from 1948-49, showing her extensive travels around the world.",
    type: "images",
    images: [
      {
        src: "3A4_Schedule.png",
        alt: "Helen Keller's global travel schedule from 1948-49"
      }
    ]
  },
  {
    id: "3A5",
    title: "Photograph of Helen Dancing with Italian Veteran, 1946",
    description: "A photograph showing Helen Keller dancing with an Italian veteran in 1946.",
    type: "images",
    images: [
      {
        src: "3A5ItalyVet1.jpeg",
        alt: "Helen Keller dancing with an Italian veteran in 1946"
      },
      {
        src: "3A5ItalyVet2.jpeg",
        alt: "Another view of Helen Keller with the Italian veteran"
      }
    ]
  },
  {
    id: "3A6",
    title: "Photograph with Golda Meir, 1952",
    description: "A photograph of Helen Keller meeting with Golda Meir in Israel in 1952.",
    type: "images",
    images: [
      {
        src: "3A6Israel1.jpeg",
        alt: "Helen Keller meeting with Golda Meir in Israel, 1952"
      },
      {
        src: "3A6Israel2.jpeg",
        alt: "Another photograph from Helen Keller's meeting with Golda Meir"
      }
    ]
  },
  {
    id: "3A7",
    title: "Syria Travel Itinerary, 1952",
    description: "Helen Keller's travel itinerary for her trip to Syria in 1952.",
    type: "images",
    images: [
      {
        src: "3A7Syria1.jpeg",
        alt: "Helen Keller's Syria travel itinerary from 1952"
      }
    ]
  }
];

export function getArtifact(id) {
  return artifacts.find(a => a.id === id);
}

export function getArtifactIndex(id) {
  return artifacts.findIndex(a => a.id === id);
}

export function getNextArtifact(id) {
  const index = getArtifactIndex(id);
  if (index === -1 || index >= artifacts.length - 1) return null;
  return artifacts[index + 1];
}

export function getPrevArtifact(id) {
  const index = getArtifactIndex(id);
  if (index <= 0) return null;
  return artifacts[index - 1];
}

