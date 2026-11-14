declare module 'lucide-react' {
  import type { FC, SVGProps } from 'react';
  type Icon = FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const ArrowDown: Icon;
  export const ArrowRight: Icon;
  export const ArrowUpRight: Icon;
  export const Check: Icon;
  export const Heart: Icon;
  export const Menu: Icon;
  export const Search: Icon;
  export const ShoppingBag: Icon;
  export const Sparkles: Icon;
  export const X: Icon;
}
