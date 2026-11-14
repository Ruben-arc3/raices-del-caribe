import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Heart, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { addFavorite, addToCart, getCart, getFavorites, getMe, getProduct, getProducts, getStories, login, register, removeFavorite } from '../api';
import type { CultureStory, Product, ProductDetails, User } from '../types';
import './auth.css';
import './detail.css';

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const page = window.location.pathname.replace(/\/$/, '') || '/';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<CultureStory[]>([]);
  const [productDetail, setProductDetail] = useState<ProductDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [category, setCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('caribe-token') || '');
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => { getProducts().then(setProducts); getStories().then(setStories); }, []);
  const detailMatch = page.match(/^\/productos\/(\d+)$/);
  const detailId = detailMatch ? Number(detailMatch[1]) : null;
  useEffect(() => {
    if (detailId === null) return;
    let active = true;
    setDetailLoading(true);
    getProduct(detailId).then((detail) => { if (active) setProductDetail(detail); }).finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [detailId]);
  useEffect(() => {
    if (!token) { setUser(null); setFavorites([]); setCart([]); return; }
    let active = true;
    Promise.all([getMe(token), getCart(token), getFavorites(token)]).then(([account, savedCart, savedFavorites]) => {
      if (!active) return;
      setUser(account);
      setCart(savedCart.flatMap((item) => Array.from({ length: item.quantity }, () => item.id)));
      setFavorites(savedFavorites.map((item) => item.id));
    }).catch(() => {
      if (!active) return;
      localStorage.removeItem('caribe-token');
      setToken('');
      setAuthError('No fue posible validar tu sesión. Vuelve a iniciar sesión.');
    });
    return () => { active = false; };
  }, [token]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2400); return () => window.clearTimeout(timer); }, [notice]);

  const categories = ['Todo', ...Array.from(new Set(products.map((product) => product.category)))];
  const visibleProducts = useMemo(() => products.filter((product) => (category === 'Todo' || product.category === category) && `${product.name} ${product.maker} ${product.origin}`.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  const requestSignIn = (mode: 'login' | 'register' = 'login') => { setAuthMode(mode); setAuthError(''); setAuthOpen(true); };
  const toggleFavorite = async (id: number) => {
    if (!user || !token) { requestSignIn(); return; }
    try {
      if (favorites.includes(id)) { await removeFavorite(token, id); setFavorites((items) => items.filter((item) => item !== id)); setNotice('Producto eliminado de favoritos'); }
      else { await addFavorite(token, id); setFavorites((items) => [...items, id]); setNotice('Producto guardado en favoritos'); }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo actualizar favoritos'); }
  };
  const addProduct = async (product: Product) => {
    if (!user || !token) { requestSignIn(); return; }
    try { await addToCart(token, product.id); setCart((items) => [...items, product.id]); setNotice(`${product.name} se sumó a tu canasta`); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo actualizar la canasta'); }
  };
  const signOut = () => { localStorage.removeItem('caribe-token'); setToken(''); setUser(null); setFavorites([]); setCart([]); setNotice('Sesión cerrada'); };
  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthBusy(true); setAuthError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = authMode === 'register'
        ? await register({ name: String(form.get('name') || ''), email: String(form.get('email') || ''), password: String(form.get('password') || '') })
        : await login({ email: String(form.get('email') || ''), password: String(form.get('password') || '') });
      localStorage.setItem('caribe-token', result.token);
      setUser(result.user); setToken(result.token); setAuthOpen(false);
      setNotice(authMode === 'register' ? 'Cuenta creada. ¡Bienvenido!' : `Bienvenido, ${result.user.name}`);
    } catch (error) { setAuthError(error instanceof Error ? error.message : 'No se pudo completar el acceso.'); }
    finally { setAuthBusy(false); }
  };
  const isProductsPage = page === '/productos';
  const isCulturePage = page === '/cultura';
  const isProductDetailPage = detailId !== null;
  const productCards = (items: Product[]) => <div className="product-grid">{items.map((product, index) => <article className="product-card" key={product.id}><div className="product-image-wrap"><a className="product-image-link" href={`/productos/${product.id}`} aria-label={`Ver detalles de ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" /></a><span className="product-tag">{product.tag}</span><button className={favorites.includes(product.id) ? 'favorite-button selected' : 'favorite-button'} aria-label={favorites.includes(product.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'} onClick={() => void toggleFavorite(product.id)}><Heart size={17} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button><span className="image-index">{String(index + 1).padStart(2, '0')}</span></div><div className="product-info"><div className="product-meta"><span>{product.category}</span><span>{product.origin}</span></div><h3><a href={`/productos/${product.id}`}>{product.name}</a></h3><div className="maker">Por {product.maker}</div><p className="product-description">{product.description}</p><div className="product-bottom"><strong>{money(product.price)}</strong><button className="add-button" onClick={() => void addProduct(product)} aria-label={`Agregar ${product.name} a la canasta`}><ShoppingBag size={16} /></button></div></div></article>)}</div>;
  const catalogControls = <div className="product-toolbar"><div className="filters">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una pieza" aria-label="Buscar piezas" />{query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X size={14} /></button>}</label></div>;

  return <>
    <div className="announcement"><Sparkles size={14} /> Hecho con tiempo, oficio y raíces <span>—</span> Envíos a toda Colombia</div>
    <header className="site-header">
      <a href="/" className="brand" aria-label="Raíces del Caribe, inicio"><span className="brand-mark">R<span>.</span></span><span className="brand-name">raíces<span>del caribe</span></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'}>
        <a href="/productos" onClick={() => setMenuOpen(false)}>Productos</a><a href="/cultura" onClick={() => setMenuOpen(false)}>Cultura del Caribe</a><a href="/#origen" onClick={() => setMenuOpen(false)}>Nuestro propósito</a>
      </nav>
      <div className="header-actions">{user ? <><span className="user-greeting">Hola, {user.name.split(' ')[0]}</span><button className="signout-button" onClick={signOut}>Salir</button></> : <button className="login-button" onClick={() => requestSignIn()}>Iniciar sesión</button>}<button className="icon-button" aria-label="Favoritos" onClick={() => user ? setNotice(`Tienes ${favorites.length} productos favoritos`) : requestSignIn()}><Heart size={19} /><span>{favorites.length}</span></button><button className="bag-button" onClick={() => user ? setNotice(`Tu canasta tiene ${cart.length} ${cart.length === 1 ? 'pieza' : 'piezas'}`) : requestSignIn()}><ShoppingBag size={17} /><span>Canasta</span><b>{cart.length}</b></button></div>
    </header>

    <main>
      {!isProductsPage && !isCulturePage && !isProductDetailPage && <section className="hero" id="inicio">
        <img className="hero-image" src="/imagen.jpg" alt="Paisaje cálido del Caribe colombiano" />
        <div className="hero-shade" />
        <div className="hero-content"><span className="eyebrow light"><span /> COLOMBIA, HECHA A MANO</span><h1>Historias que<br />se <em>llevan</em> contigo.</h1><p>Un encuentro con los oficios, las manos y las culturas que hacen único al Caribe colombiano.</p><div className="hero-links"><a className="button button-light" href="#productos">Descubre los productos <ArrowRight size={16} /></a><a className="text-link light-link" href="#cultura">Explora la cultura <ArrowDown size={15} /></a></div></div>
        <div className="hero-note"><span>01 / 03</span><i /><span>La Guajira · Colombia</span></div>
        <div className="hero-seal">OBJETOS<br /><span>con</span><br />ORIGEN</div>
      </section>}

      {isProductDetailPage ? <>
        {detailLoading ? <section className="detail-loading"><span className="eyebrow">CARGANDO PRODUCTO</span><p>Buscando su historia…</p></section> : productDetail ? <>
          <section className="product-detail-hero"><div className="detail-image"><img src={productDetail.image} alt={productDetail.name} /></div><div className="detail-overview"><a className="detail-back" href="/productos">← Volver a productos</a><span className="eyebrow">{productDetail.category} · {productDetail.origin}</span><h1>{productDetail.name}</h1><p>{productDetail.description}</p><div className="detail-maker"><span className="maker-initial">{productDetail.maker.slice(0, 1)}</span><span>Hecho por<strong>{productDetail.maker}</strong><small>{productDetail.origin}</small></span></div><div className="detail-purchase"><strong>{money(productDetail.price)}</strong><button className="button button-dark" onClick={() => void addProduct(productDetail)}>Agregar a la canasta <ShoppingBag size={16} /></button><button className={favorites.includes(productDetail.id) ? 'favorite-button selected detail-favorite' : 'favorite-button detail-favorite'} aria-label="Guardar en favoritos" onClick={() => void toggleFavorite(productDetail.id)}><Heart size={18} fill={favorites.includes(productDetail.id) ? 'currentColor' : 'none'} /></button></div></div></section>
          <section className="product-story section-wrap"><span className="eyebrow">EL OFICIO DETRÁS DE LA PIEZA</span><h2>Una historia de<br /><em>tiempo y saber.</em></h2><p>{productDetail.story || productDetail.description}</p><div className="story-origin"><span>ORIGEN</span><strong>{productDetail.origin}</strong><i /><span>QUIÉN LO HIZO</span><strong>{productDetail.maker}</strong></div></section>
          {productDetail.related.length > 0 && <section className="collection section-wrap related-products"><div className="section-heading"><div><span className="eyebrow">TAMBIÉN TE PUEDE INTERESAR</span><h2>Más piezas <em>del Caribe</em></h2></div><a className="text-link desktop-link" href="/productos">Ver todo <ArrowRight size={16} /></a></div>{productCards(productDetail.related)}</section>}
        </> : <section className="detail-loading"><h1>No encontramos este producto</h1><a className="button button-dark" href="/productos">Volver al catálogo <ArrowRight size={16} /></a></section>}
      </> : isProductsPage ? <>
        <section className="subpage-hero products-subpage-hero"><div className="subpage-hero-content"><span className="eyebrow light"><span /> CATÁLOGO ARTESANAL</span><h1>Encuentra algo<br /><em>hecho con sentido.</em></h1><p>Explora las piezas, conoce su origen y descubre las manos artesanas detrás de cada oficio.</p><a className="button button-light" href="#catalogo">Explorar productos <ArrowDown size={15} /></a></div><img src={products[0]?.image ?? 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1400&q=85'} alt="Textiles artesanales del Caribe" /></section>
        <section className="collection section-wrap catalog-page" id="catalogo"><div className="section-heading"><div><span className="eyebrow">PIEZAS HECHAS EN EL CARIBE</span><h2>Todos los productos</h2><p className="section-description">Filtra por oficio o busca por nombre, artesano y región de origen.</p></div><a className="text-link desktop-link" href="/cultura">Explorar la cultura <ArrowRight size={16} /></a></div>{catalogControls}{visibleProducts.length ? productCards(visibleProducts) : <div className="empty-state">No encontramos piezas con esa búsqueda. Prueba con otro nombre o categoría.</div>}<div className="catalog-note"><span>{visibleProducts.length} piezas en esta selección</span><span>Compra con origen, conoce quién la hizo.</span></div></section>
      </> : isCulturePage ? <>
        <section className="subpage-hero culture-subpage-hero"><div className="subpage-hero-content"><span className="eyebrow light"><span /> CULTURAS, MEMORIAS Y TERRITORIOS</span><h1>Un Caribe,<br /><em>muchas voces.</em></h1><p>Un espacio para acercarse con respeto a los saberes y tradiciones que viven en las comunidades del Caribe colombiano.</p><a className="button button-light" href="#relatos">Leer las historias <ArrowDown size={15} /></a></div><img src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=85" alt="Paisaje del Caribe colombiano" /></section>
        <section className="culture-intro"><span className="eyebrow light"><span /> DIVERSIDAD CULTURAL</span><h2>La cultura del Caribe no cabe<br />en una sola <em>historia.</em></h2><p>En esta región conviven pueblos indígenas, comunidades afrodescendientes, campesinas y urbanas. Sus conocimientos, lenguas, músicas y oficios se transforman con cada generación y con cada territorio.</p></section>
        <section className="culture culture-page" id="relatos"><div className="culture-inner"><div className="section-heading"><div><span className="eyebrow light"><span /> RELATOS Y SABERES</span><h2>Tradiciones que<br />siguen <em>vivas.</em></h2></div><p>Conoce algunos oficios y memorias del Caribe. Cada relato es una invitación a seguir aprendiendo de quienes los mantienen vivos.</p></div><div className="story-grid">{stories.map((story, index) => <article className="story-card" key={story.id}><div className="story-image"><img src={story.image} alt={story.title} loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="story-content"><span className="story-accent">{story.accent}</span><h3>{story.title}</h3><p>{story.description}</p><span className="story-people">{story.people}</span></div></article>)}</div></div></section>
        <section className="culture-learning section-wrap"><span className="eyebrow">APRENDER TAMBIÉN ES ESCUCHAR</span><h2>Acercarse con <em>respeto.</em></h2><div className="learning-grid"><article><span>01</span><h3>Reconoce el origen</h3><p>Pregunta por la comunidad, el territorio y las personas que elaboran cada pieza. El contexto forma parte de su valor.</p></article><article><span>02</span><h3>Valora el conocimiento</h3><p>Las técnicas artesanales reúnen aprendizaje, práctica y transmisión entre generaciones.</p></article><article><span>03</span><h3>Apoya a sus creadores</h3><p>Elegir directamente el trabajo artesanal contribuye a que los oficios y sus comunidades sigan contando sus propias historias.</p></article></div><a className="button button-dark" href="/productos">Conocer las piezas artesanales <ArrowRight size={16} /></a></section>
      </> : <>
        <section className="collection section-wrap home-products" id="productos"><div className="section-heading"><div><span className="eyebrow">OBJETOS CON HISTORIA</span><h2>Una selección <em>del Caribe</em></h2><p className="section-description">Piezas únicas de artesanas y artesanos de la región.</p></div></div>{productCards(visibleProducts.slice(0, 4))}<div className="home-more"><a className="button button-dark" href="/productos">Ver más productos <ArrowRight size={16} /></a></div></section>
        <section className="culture home-culture"><div className="culture-inner"><div className="section-heading"><div><span className="eyebrow light"><span /> CULTURA VIVA</span><h2>Historias de un Caribe<br />diverso y <em>vivo.</em></h2></div><p>Conoce los saberes, pueblos y territorios que dan sentido a las piezas.</p></div><div className="story-grid">{stories.slice(0, 3).map((story, index) => <article className="story-card" key={story.id}><div className="story-image"><img src={story.image} alt={story.title} loading="lazy" /><span>0{index + 1}</span></div><div className="story-content"><span className="story-accent">{story.accent}</span><h3>{story.title}</h3><p>{story.description}</p><span className="story-people">{story.people}</span></div></article>)}</div><a href="/cultura" className="culture-cta">Explorar la cultura del Caribe <ArrowRight size={16} /></a></div></section>
        <section className="intro section-wrap" id="origen"><div className="intro-kicker"><span className="eyebrow">MÁS QUE UNA PIEZA</span><span className="intro-rule" /></div><div className="intro-copy"><h2>Detrás de cada objeto<br />hay <em>un mundo.</em></h2><p>Celebramos el talento de artesanas y artesanos del Caribe. Acá, cada pieza tiene un origen, cada técnica guarda memoria y cada compra ayuda a que una tradición siga viva.</p><a className="text-link" href="/cultura">Conoce más sobre la cultura <ArrowUpRight size={16} /></a></div><span className="intro-number">01</span></section>
        <section className="explore-modules section-wrap" aria-labelledby="modules-title"><div className="modules-heading"><span className="eyebrow">EXPLORA RAÍCES DEL CARIBE</span><h2>Dos maneras de <em>acercarte.</em></h2></div><div className="module-grid"><a className="module-card module-products" href="/productos"><span className="module-number">01 / TIENDA</span><span className="module-copy"><strong>Productos<br />con origen.</strong><small>Explora el catálogo artesanal</small></span><span className="module-arrow"><ArrowUpRight size={19} /></span></a><a className="module-card module-culture" href="/cultura"><span className="module-number">02 / CULTURA</span><span className="module-copy"><strong>Territorios<br />con historia.</strong><small>Conoce las culturas del Caribe</small></span><span className="module-arrow"><ArrowUpRight size={19} /></span></a></div></section>
      </>}

      <section className="closing section-wrap"><div className="closing-mark">R<span>.</span></div><div><span className="eyebrow">UNA FORMA DE ELEGIR</span><h2>Que lo que llevas<br />te <em>conecte.</em></h2></div><p>Conoce quién hizo tu próxima pieza favorita. Apoya el trabajo artesanal con una compra que reconoce su valor y su origen.</p><a className="button button-dark" href="#productos">Encontrar mi pieza <ArrowRight size={16} /></a></section>
    </main>
    <footer><a href="#inicio" className="brand footer-brand"><span className="brand-mark">R<span>.</span></span><span className="brand-name">raíces<span>del caribe</span></span></a><span>Hecho con respeto, desde el Caribe colombiano.</span><span>© 2025 Raíces del Caribe</span></footer>
    {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
    {authOpen && <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Cerrar"><X size={19} /></button><span className="eyebrow">RAÍCES DEL CARIBE</span><h2 id="auth-title">{authMode === 'login' ? 'Qué bueno verte.' : 'Crea tu cuenta.'}</h2><p>{authMode === 'login' ? 'Inicia sesión para guardar tus piezas favoritas y tu canasta.' : 'Regístrate para guardar tus piezas favoritas y tu canasta.'}</p><form onSubmit={submitAuth}>{authMode === 'register' && <label>Nombre completo<input name="name" type="text" autoComplete="name" minLength={2} required /></label>}<label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label><label>Contraseña<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} required /><small>Mínimo 8 caracteres.</small></label>{authError && <div className="auth-error" role="alert">{authError}</div>}<button className="button button-dark auth-submit" disabled={authBusy}>{authBusy ? 'Un momento…' : authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}<ArrowRight size={16} /></button></form><div className="auth-switch">{authMode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'} <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>{authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button></div></section></div>}
  </>;
}
