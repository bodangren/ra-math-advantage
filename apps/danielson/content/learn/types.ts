export type Technique = {
  id: string;
  title: string;
  subdomain: string;
  domain: number;
  source: string;
  alignment: string;
  description: string;
  detailedSummary?: string;
  quote?: string;
  actionSteps: string[];
  videos: {
    demo: string;
    deepDive?: string;
    curated?: string[];
  };
  literature?: {
    book: string;
    pages: string;
  };
  hasImage?: boolean;
};
