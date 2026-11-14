// Datos de productos
const productos = [
  { 
    id: 1, 
    nombre: "Mochila Wayúu", 
    nombre_en: "Wayúu Bag",
    precio_cop: 120000, 
    precio_usd: 30,
    categoria: "Textiles",
    categoria_en: "Textiles",
    descripcion: "Mochila tradicional tejida a mano por la comunidad Wayúu.",
    descripcion_en: "Traditional handwoven bag by the Wayúu community.",
    imagen: "https://images.unsplash.com/photo-1593640408182-31c228ca89b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 2, 
    nombre: "Sombrero Vueltiao", 
    nombre_en: "Vueltiao Hat",
    precio_cop: 80000, 
    precio_usd: 20,
    categoria: "Textiles",
    categoria_en: "Textiles",
    descripcion: "Símbolo cultural de la región Caribe, hecho con caña flecha.",
    descripcion_en: "Cultural symbol of the Caribbean region, made with arrow cane.",
    imagen: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 3, 
    nombre: "Cerámica Zenú", 
    nombre_en: "Zenú Pottery",
    precio_cop: 150000, 
    precio_usd: 38,
    categoria: "Cerámica",
    categoria_en: "Pottery",
    descripcion: "Piezas artesanales con diseños ancestrales de la cultura Zenú.",
    descripcion_en: "Handcrafted pieces with ancestral designs from the Zenú culture.",
    imagen: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 4, 
    nombre: "Collar Indígena", 
    nombre_en: "Indigenous Necklace",
    precio_cop: 95000, 
    precio_usd: 24,
    categoria: "Joyería",
    categoria_en: "Jewelry",
    descripcion: "Elaborado con semillas naturales y detalles en plata.",
    descripcion_en: "Made with natural seeds and silver details.",
    imagen: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 5, 
    nombre: "Miel Orgánica", 
    nombre_en: "Organic Honey",
    precio_cop: 25000, 
    precio_usd: 6,
    categoria: "Alimentos",
    categoria_en: "Food",
    descripcion: "Producida por comunidades locales en la Sierra Nevada.",
    descripcion_en: "Produced by local communities in the Sierra Nevada.",
    imagen: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

// Configuración inicial
let currentLanguage = 'es';
let currentCurrency = 'COP';
let currentCategory = null;

// Traducciones
const translations = {
  es: {
    welcome: "Bienvenido visitante, puedes ",
    login: "Iniciar Sesión",
    or: " o ",
    register: "Crear una cuenta",
    callUs: "Llámanos gratis",
    categories: "CATEGORÍAS",
    explore: "Explora nuestras categorías",
    ceramics: "Cerámica",
    ceramicsDesc: "Modela tu hogar con arte hecho a mano.",
    jewelry: "Joyería",
    jewelryDesc: "Luces que cuentan historias, hechas con alma.",
    textiles: "Textiles",
    textilesDesc: "Tejidos que abrazan tradición y estilo.",
    food: "Alimentos",
    foodDesc: "Sabores auténticos de nuestra tierra.",
    catalog: "CATÁLOGO CON SAZÓN CARIBE",
    mainTitle: "Descubre Arte Tradicional",
    mainSubtitle: "Productos únicos hechos a mano por artesanos locales",
    loginTitle: "Iniciar Sesión",
    password: "Contraseña",
    loginButton: "Ingresar",
    footer: "Plataforma Artesanal",
    currency: "COP",
    language: "Español",
    viewingCategory: "Viendo categoría: ",
    viewDetails: "Ver Detalles"
  },
  en: {
    welcome: "Welcome visitor, you can ",
    login: "Log In",
    or: " or ",
    register: "Create an Account",
    callUs: "Call us toll free",
    categories: "CATEGORIES",
    explore: "Explore our categories",
    ceramics: "Pottery",
    ceramicsDesc: "Model your home with handmade art.",
    jewelry: "Jewelry",
    jewelryDesc: "Lights that tell stories, made with soul.",
    textiles: "Textiles",
    textilesDesc: "Fabrics that embrace tradition and style.",
    food: "Food",
    foodDesc: "Authentic flavors from our land.",
    catalog: "CARIBBEAN FLAVORED CATALOG",
    mainTitle: "Discover Traditional Art",
    mainSubtitle: "Unique handmade products by local artisans",
    loginTitle: "Log In",
    password: "Password",
    loginButton: "Login",
    footer: "Artisan Platform",
    currency: "USD",
    language: "English",
    viewingCategory: "Viewing category: ",
    viewDetails: "View Details"
  }
};

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupEventListeners();
  updateYear();
  updateUI();
});

// Actualizar año en el footer
function updateYear() {
  document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Actualizar toda la interfaz según idioma y moneda
function updateUI() {
  const lang = translations[currentLanguage];
  
  // Textos generales
  document.getElementById('welcome-message').textContent = lang.welcome;
  document.getElementById('login-text').textContent = lang.login;
  document.getElementById('welcome-or').textContent = lang.or;
  document.getElementById('register-text').textContent = lang.register;
  document.getElementById('call-us').textContent = lang.callUs;
  document.getElementById('categories-text').textContent = lang.categories;
  document.getElementById('explore-text').textContent = lang.explore;
  document.getElementById('ceramics-text').textContent = lang.ceramics;
  document.getElementById('ceramics-desc').textContent = lang.ceramicsDesc;
  document.getElementById('jewelry-text').textContent = lang.jewelry;
  document.getElementById('jewelry-desc').textContent = lang.jewelryDesc;
  document.getElementById('textiles-text').textContent = lang.textiles;
  document.getElementById('textiles-desc').textContent = lang.textilesDesc;
  document.getElementById('food-text').textContent = lang.food;
  document.getElementById('food-desc').textContent = lang.foodDesc;
  document.querySelector('.products-section .section-title').textContent = lang.catalog;
  document.getElementById('main-title').textContent = lang.mainTitle;
  document.getElementById('main-subtitle').textContent = lang.mainSubtitle;
  document.getElementById('loginModalTitle').textContent = lang.loginTitle;
  document.getElementById('current-language').textContent = lang.language;
  document.getElementById('current-currency').textContent = lang.currency;
  
  // Actualizar encabezado de categoría si hay una seleccionada
  if (currentCategory) {
    updateCategoryHeader();
  }
  
  // Volver a cargar productos para actualizar precios y textos
  loadProducts();
}

// Cargar productos
function loadProducts(categoria = null) {
  const container = document.getElementById('productosContainer');
  let productosFiltrados = categoria ? 
    productos.filter(p => p.categoria === categoria || p.categoria_en === categoria) : 
    productos;

  container.innerHTML = productosFiltrados.map(producto => {
    const nombre = currentLanguage === 'es' ? producto.nombre : producto.nombre_en;
    const categoria = currentLanguage === 'es' ? producto.categoria : producto.categoria_en;
    const descripcion = currentLanguage === 'es' ? producto.descripcion : producto.descripcion_en;
    const precio = currentCurrency === 'COP' ? 
      `$${producto.precio_cop.toLocaleString(currentLanguage === 'es' ? 'es-CO' : 'en-US')}` : 
      `$${producto.precio_usd.toLocaleString(currentLanguage === 'es' ? 'es-CO' : 'en-US')}`;
    const moneda = currentCurrency === 'COP' ? 'COP' : 'USD';
    const viewDetailsText = currentLanguage === 'es' ? 'Ver Detalles' : 'View Details';

    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card product-card h-100">
          <img src="${producto.imagen}" class="card-img-top" alt="${nombre}">
          <div class="card-body">
            <h5 class="card-title">${nombre}</h5>
            <p class="text-muted">${categoria}</p>
            <p class="fw-bold text-primary">${precio} ${moneda}</p>
            <button onclick="showProductDetail(${producto.id})" class="btn btn-outline-primary">
              ${viewDetailsText}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Mostrar categoría específica
function showCategory(categoria) {
  currentCategory = categoria;
  loadProducts(categoria);
  updateCategoryHeader();
  
  // Desplazarse suavemente a la sección de productos
  document.getElementById('productosContainer').scrollIntoView({
    behavior: 'smooth'
  });
}

// Actualizar encabezado de categoría
function updateCategoryHeader() {
  const section = document.getElementById('currentCategorySection');
  const title = document.getElementById('currentCategoryTitle');
  const desc = document.getElementById('currentCategoryDesc');
  const lang = translations[currentLanguage];
  
  if (currentCategory) {
    const categoria = currentLanguage === 'es' ? 
      productos.find(p => p.categoria === currentCategory)?.categoria :
      productos.find(p => p.categoria_en === currentCategory)?.categoria_en;
    
    const descripcion = currentLanguage === 'es' ? 
      productos.find(p => p.categoria === currentCategory)?.descripcion :
      productos.find(p => p.categoria_en === currentCategory)?.descripcion_en;
    
    section.style.display = 'block';
    title.textContent = `${lang.viewingCategory}${categoria}`;
    desc.textContent = descripcion;
  } else {
    section.style.display = 'none';
  }
}

// Mostrar detalles del producto
function showProductDetail(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const nombre = currentLanguage === 'es' ? producto.nombre : producto.nombre_en;
  const categoria = currentLanguage === 'es' ? producto.categoria : producto.categoria_en;
  const descripcion = currentLanguage === 'es' ? producto.descripcion : producto.descripcion_en;
  const precio = currentCurrency === 'COP' ? 
    `$${producto.precio_cop.toLocaleString(currentLanguage === 'es' ? 'es-CO' : 'en-US')}` : 
    `$${producto.precio_usd.toLocaleString(currentLanguage === 'es' ? 'es-CO' : 'en-US')}`;
  const moneda = currentCurrency === 'COP' ? 'COP' : 'USD';
  const addToCartText = currentLanguage === 'es' ? 'Agregar al carrito' : 'Add to Cart';
  const categoryText = currentLanguage === 'es' ? 'Categoría' : 'Category';
  const priceText = currentLanguage === 'es' ? 'Precio' : 'Price';
  const descriptionText = currentLanguage === 'es' ? 'Descripción' : 'Description';

  const modalHTML = `
    <div class="modal fade" id="productDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${nombre}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3 mb-md-0">
                <img src="${producto.imagen}" class="img-fluid rounded" alt="${nombre}">
              </div>
              <div class="col-md-6">
                <p><strong>${categoryText}:</strong> ${categoria}</p>
                <p><strong>${priceText}:</strong> ${precio} ${moneda}</p>
                <p><strong>${descriptionText}:</strong> ${descripcion}</p>
                <button class="btn btn-primary mt-3 w-100">${addToCartText}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const container = document.getElementById('productDetailModalContainer');
  container.innerHTML = modalHTML;
  
  const modalElement = document.getElementById('productDetailModal');
  modalElement.addEventListener('hidden.bs.modal', () => {
    container.innerHTML = '';
  });
  
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Configurar event listeners
function setupEventListeners() {
  // Login Modal
  document.getElementById('loginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById('loginModal')).show();
  });

  // Login Form
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(currentLanguage === 'es' ? '¡Bienvenido!' : 'Welcome!');
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
  });

  // Selector de idioma
  document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      currentLanguage = e.target.dataset.lang;
      updateUI();
    });
  });

  // Selector de moneda
  document.querySelectorAll('.currency-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      currentCurrency = e.target.dataset.currency;
      updateUI();
    });
  });
}