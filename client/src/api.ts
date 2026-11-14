import type { AuthResult, CultureStory, Product, ProductDetails, User } from './types';

const fallbackProducts: Product[] = [
  { id: 1, name: 'Mochila Wayúu', category: 'Tejidos', price: 185000, maker: 'Tejedoras de Uribia', origin: 'La Guajira', image: '/assets/products/mochila-wayuu.svg', description: 'Tejida a mano con patrones que cuentan historias de la comunidad Wayúu.', story: 'El tejido Wayúu es un saber que se comparte entre generaciones. Sus diseños, conocidos como kanaas, se inspiran en elementos de la vida cotidiana y del territorio. Cada pieza combina técnica, tiempo y una interpretación propia de quien la teje.', tag: 'Hecho a mano' },
  { id: 2, name: 'Sombrero vueltiao', category: 'Tejidos', price: 250000, maker: 'Familia Mendoza', origin: 'Tuchín, Córdoba', image: '/assets/products/sombrero-vueltiao.svg', description: 'Trenzado en caña flecha siguiendo una tradición Zenú transmitida por generaciones.', story: 'La caña flecha se prepara y se trenza para formar las vueltas y figuras del sombrero. En Tuchín, familias artesanas conservan y transmiten este oficio Zenú, que requiere coordinación, paciencia y conocimiento del material.', tag: 'Pieza tradicional' },
  { id: 3, name: 'Jarrón de barro', category: 'Cerámica', price: 98000, maker: 'Taller Barro Vivo', origin: 'San Sebastián, Magdalena', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85', description: 'Cerámica de formas orgánicas, moldeada y acabada a mano.', story: 'El trabajo con barro parte de conocer la arcilla y cómo responde al modelado y al secado. En los talleres del Caribe, cada ceramista desarrolla formas y acabados propios, vinculados a su práctica y a los materiales disponibles en su territorio.', tag: 'Edición pequeña' },
  { id: 4, name: 'Aretes de palma', category: 'Accesorios', price: 68000, maker: 'Colectivo Manos del Río', origin: 'Sucre', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85', description: 'Accesorios livianos elaborados con fibras naturales y tintes de origen vegetal.', story: 'Las fibras de palma se seleccionan y trabajan para crear piezas livianas. El trenzado y el acabado dependen de la experiencia de cada artesana y de las cualidades de la fibra recolectada.', tag: 'Materiales naturales' },
  { id: 5, name: 'Hamaca de algodón', category: 'Tejidos', price: 320000, maker: 'Taller Tejedoras de San Jacinto', origin: 'San Jacinto, Bolívar', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85', description: 'Hamaca de muestra con una paleta inspirada en los colores del litoral.', story: 'Ejemplo de catálogo con imagen genérica. La técnica, autoría y disponibilidad deben confirmarse con quien produzca la pieza.', tag: 'Ejemplo de catálogo' },
  { id: 6, name: 'Canasto de fibras naturales', category: 'Decoración', price: 76000, maker: 'Colectivo Tejedoras del Sinú', origin: 'Córdoba', image: '/assets/products/canasto-fibras.svg', description: 'Canasto decorativo de fibras trenzadas para organizar objetos pequeños.', story: 'Producto de muestra con fotografía ilustrativa. Confirmar procedencia y técnica con la comunidad artesana antes de publicarlo como producto real.', tag: 'Ejemplo de catálogo' },
  { id: 7, name: 'Bandeja artesanal en madera', category: 'Decoración', price: 89000, maker: 'Taller Maderas del Caribe', origin: 'Santa Marta, Magdalena', image: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85', description: 'Bandeja de mesa de acabado natural y líneas sencillas.', story: 'Producto demostrativo: la foto es genérica y no representa una pieza o taller real. Reemplazar con imágenes y datos autorizados del productor.', tag: 'Ejemplo de catálogo' },
  { id: 8, name: 'Cartera tejida de colores', category: 'Accesorios', price: 145000, maker: 'Artesanas de Riohacha', origin: 'Riohacha, La Guajira', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85', description: 'Bolso de inspiración caribeña con detalles tejidos y colores vivos.', story: 'Producto de ejemplo con imagen genérica. Confirmar técnica, materiales, autoría y precio con quien lo elabore antes de ofrecerlo.', tag: 'Ejemplo de catálogo' },
];

const fallbackStories: CultureStory[] = [
  { id: 'wayuu', title: 'El tejido como lenguaje', people: 'Pueblo Wayúu · La Guajira', description: 'Cada mochila guarda una historia. Los diseños, llamados kanas, traducen elementos de la vida cotidiana y la relación con el territorio.', image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=85', accent: 'Tradición viva' },
  { id: 'zenu', title: 'La memoria de la caña flecha', people: 'Pueblo Zenú · Córdoba y Sucre', description: 'El trenzado de la caña flecha reúne conocimiento, paciencia y trabajo colectivo. De esta fibra nace uno de los símbolos más reconocibles del Caribe.', image: 'https://images.unsplash.com/photo-1514327605112-b887c0e1a6bb?auto=format&fit=crop&w=1000&q=85', accent: 'Oficio ancestral' },
  { id: 'territorio', title: 'Oficios que nacen del territorio', people: 'Comunidades artesanas del Caribe', description: 'Barro, palma, madera y fibras cuentan la diversidad de una región hecha de ríos, montañas y mar. Cada pieza acerca a quien la crea.', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85', accent: 'Saber compartido' },
  { id: 'cumbia', title: 'La cumbia tradicional del Caribe', people: 'Atlántico · Bolívar · Córdoba · Magdalena · Sucre', description: 'Música, danza, símbolos y vida comunitaria se encuentran en esta manifestación reconocida en la Lista Representativa del Patrimonio Cultural Inmaterial de Colombia.', image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1000&q=85', accent: 'Patrimonio vivo' },
  { id: 'vallenato', title: 'La música vallenata tradicional', people: 'Cesar · La Guajira · Magdalena', description: 'Cantos y prácticas musicales enlazan los relatos y la memoria de distintos territorios del Caribe.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=85', accent: 'Memoria musical' },
];

async function getOr<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('API unavailable');
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export const getProducts = () => getOr<Product[]>('/api/products', fallbackProducts);
export const getStories = () => getOr<CultureStory[]>('/api/culture', fallbackStories);
export const getProduct = (id: number) => {
  const fallback = fallbackProducts.find((product) => product.id === id);
  const detail: ProductDetails | null = fallback ? { ...fallback, rating: 0, rating_count: 0, comments: [], related: fallbackProducts.filter((product) => product.category === fallback.category && product.id !== id) } : null;
  return getOr<ProductDetails | null>(`/api/products/${id}`, detail);
};
export { fallbackProducts, fallbackStories };

async function apiRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || 'No se pudo completar la solicitud.');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const register = (values: { name: string; email: string; password: string }) => fetch('/api/auth/register', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
}).then(async (response) => {
  const body = await response.json() as AuthResult & { error?: string };
  if (!response.ok) throw new Error(body.error || 'No se pudo crear la cuenta.');
  return body;
});

export const login = (values: { email: string; password: string }) => fetch('/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
}).then(async (response) => {
  const body = await response.json() as AuthResult & { error?: string };
  if (!response.ok) throw new Error(body.error || 'No se pudo iniciar sesión.');
  return body;
});

export const getMe = (token: string) => apiRequest<User>('/api/auth/me', token);
export const getCart = (token: string) => apiRequest<Array<{ id: number; quantity: number }>>('/api/users/me/cart', token);
export const getFavorites = (token: string) => apiRequest<Array<{ id: number }>>('/api/users/me/favorites', token);
export const addToCart = (token: string, productId: number) => apiRequest('/api/users/me/cart', token, { method: 'POST', body: JSON.stringify({ productId }) });
export const addFavorite = (token: string, productId: number) => apiRequest<void>(`/api/users/me/favorites/${productId}`, token, { method: 'PUT' });
export const removeFavorite = (token: string, productId: number) => apiRequest<void>(`/api/users/me/favorites/${productId}`, token, { method: 'DELETE' });
