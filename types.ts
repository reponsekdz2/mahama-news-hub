
export interface Source {
  title: string;
  uri: string;
}

export interface Article {
  id: string; // Added for unique identification
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
  sources: Source[];
}

export interface GroundingChunk {
  web: Source;
}
