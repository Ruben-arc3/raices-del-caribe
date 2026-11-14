export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  maker: string;
  origin: string;
  image: string;
  description: string;
  story?: string;
  tag: string;
};

export type ProductDetails = Product & {
  rating: number;
  rating_count: number;
  comments: Array<{ id: number; content: string; created_at: string; author: string }>;
  related: Product[];
};

export type CultureStory = {
  id: string;
  title: string;
  people: string;
  description: string;
  image: string;
  accent: string;
};

export type User = { id: number; name: string; email: string; role: string };
export type AuthResult = { user: User; token: string };
