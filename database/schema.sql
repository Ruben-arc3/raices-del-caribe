CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'artisan', 'admin')),
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  artisan_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  maker_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT 'Hecho a mano',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS story TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS culture_stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  people TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  accent TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, user_id)
);

INSERT INTO categories (name) VALUES ('Tejidos'), ('Cerámica'), ('Accesorios') ON CONFLICT (name) DO NOTHING;

INSERT INTO products (id, name, category_id, price, maker_name, origin, image, description, story, tag)
SELECT seed.id, seed.name, categories.id, seed.price, seed.maker_name, seed.origin, seed.image, seed.description, seed.story, seed.tag
FROM (VALUES
  (1, 'Mochila Wayúu', 'Tejidos', 185000::numeric, 'Tejedoras de Uribia', 'La Guajira', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=85', 'Tejida a mano con patrones que cuentan historias de la comunidad Wayúu.', 'El tejido Wayúu es un saber que se comparte entre generaciones. Sus diseños, conocidos como kanaas, se inspiran en elementos de la vida cotidiana y del territorio. Cada pieza combina técnica, tiempo y una interpretación propia de quien la teje.', 'Hecho a mano'),
  (2, 'Sombrero vueltiao', 'Tejidos', 250000::numeric, 'Familia Mendoza', 'Tuchín, Córdoba', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR5z4_KL004z2-9XoLecgioIrDrg7KZmoEnxztxX3sGA&s=10', 'Trenzado en caña flecha siguiendo una tradición Zenú transmitida por generaciones.', 'La caña flecha se prepara y se trenza para formar las vueltas y figuras del sombrero. En Tuchín, familias artesanas conservan y transmiten este oficio Zenú, que requiere coordinación, paciencia y conocimiento del material.', 'Pieza tradicional'),
  (3, 'Jarrón de barro', 'Cerámica', 98000::numeric, 'Taller Barro Vivo', 'San Sebastián, Magdalena', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85', 'Cerámica de formas orgánicas, moldeada y acabada a mano.', 'El trabajo con barro parte de conocer la arcilla y cómo responde al modelado y al secado. En los talleres del Caribe, cada ceramista desarrolla formas y acabados propios, vinculados a su práctica y a los materiales disponibles en su territorio.', 'Edición pequeña'),
  (4, 'Aretes de palma', 'Accesorios', 68000::numeric, 'Colectivo Manos del Río', 'Sucre', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85', 'Accesorios livianos elaborados con fibras naturales y tintes de origen vegetal.', 'Las fibras de palma se seleccionan y trabajan para crear piezas livianas. El trenzado y el acabado dependen de la experiencia de cada artesana y de las cualidades de la fibra recolectada.', 'Materiales naturales')
) AS seed(id, name, category_name, price, maker_name, origin, image, description, story, tag)
JOIN categories ON categories.name = seed.category_name
ON CONFLICT (id) DO UPDATE SET story=EXCLUDED.story;

SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));

INSERT INTO culture_stories (id, title, people, description, image, accent) VALUES
('wayuu', 'El tejido como lenguaje', 'Pueblo Wayúu · La Guajira', 'Cada mochila guarda una historia. Los diseños, llamados kanas, traducen elementos de la vida cotidiana y la relación con el territorio.', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=85', 'Tradición viva'),
('zenu', 'La memoria de la caña flecha', 'Pueblo Zenú · Córdoba y Sucre', 'El trenzado de la caña flecha reúne conocimiento, paciencia y trabajo colectivo. De esta fibra nace uno de los símbolos más reconocibles del Caribe.', 'https://images.unsplash.com/photo-1514327605112-b887c0e1a6bb?auto=format&fit=crop&w=1000&q=85', 'Oficio ancestral'),
('territorio', 'Oficios que nacen del territorio', 'Comunidades artesanas del Caribe', 'Barro, palma, madera y fibras cuentan la diversidad de una región hecha de ríos, montañas y mar. Cada pieza acerca a quien la crea.', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85', 'Saber compartido')
ON CONFLICT (id) DO NOTHING;
