
export interface Source {
  title: string;
  uri: string;
}

export interface Article {
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
  sources: Source[];
}

export interface GroundingChunk {
  web: Source;
}
