export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  authorId: string;
  category: string;
  imageUrl: string;
  readTime: string;
  isAiGenerated?: boolean;
}