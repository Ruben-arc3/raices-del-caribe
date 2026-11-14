import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { issueToken, requireAuth, type AuthRequest } from './auth.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function databaseSetupError(error: unknown): string | null {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('client password must be a string') || message.includes('no password supplied')) {
    return 'PostgreSQL pide una contraseña. Añade DATABASE_URL con tu usuario y contraseña a .env, crea artesanias_caribe y ejecuta npm run db:migrate.';
  }
  if (message.includes('ECONNREFUSED')) return 'No se puede conectar con PostgreSQL en el host y puerto configurados. Verifica que el servicio esté activo.';
  return null;
}

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); return res.json({ status: 'ok', database: 'connected' }); }
  catch { return res.status(503).json({ status: 'error', database: 'disconnected' }); }
});

app.post('/api/auth/register', async (req, res) => {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: 'El servidor aún no está configurado para crear sesiones.' });
  const { name, email, password, address = null, phone = null } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ error: 'Indica nombre, correo válido y contraseña de al menos 8 caracteres.' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query('INSERT INTO users(name,email,password_hash,address,phone) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,role', [name.trim(), email.trim().toLowerCase(), hash, address, phone]);
    const user = result.rows[0];
    return res.status(201).json({ user, token: issueToken(Number(user.id)) });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    const setupError = databaseSetupError(error);
    if (setupError) return res.status(503).json({ error: setupError });
    console.error(error); return res.status(500).json({ error: 'No se pudo crear la cuenta.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: 'El servidor aún no está configurado para crear sesiones.' });
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  try {
    const result = await pool.query('SELECT id,name,email,password_hash,role FROM users WHERE email=$1', [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    const { password_hash: _hash, ...safeUser } = user;
    return res.json({ user: safeUser, token: issueToken(Number(user.id)) });
  } catch (error) {
    const setupError = databaseSetupError(error);
    if (setupError) return res.status(503).json({ error: setupError });
    console.error(error); return res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  const result = await pool.query('SELECT id,name,email,role,address,phone,created_at FROM users WHERE id=$1', [req.userId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Cuenta no encontrada.' });
  return res.json(result.rows[0]);
});

app.get('/api/products', async (req, res) => {
  const search = `%${String(req.query.search ?? '').trim()}%`;
  const category = String(req.query.category ?? '');
  const result = await pool.query(`SELECT p.id,p.name,c.name AS category,p.price,p.maker_name AS maker,p.origin,p.image,p.description,p.tag
    FROM products p LEFT JOIN categories c ON c.id=p.category_id
    WHERE ($1='' OR c.name=$1) AND ($2='%%' OR p.name ILIKE $2 OR p.maker_name ILIKE $2 OR p.origin ILIKE $2)
    ORDER BY p.created_at DESC,p.id`, [category === 'Todo' ? '' : category, search]);
  return res.json(result.rows.map((row) => ({ ...row, id: Number(row.id), price: Number(row.price) })));
});

app.get('/api/products/:id', async (req, res) => {
  const result = await pool.query(`SELECT p.id,p.name,p.category_id,c.name AS category,p.price,p.maker_name AS maker,p.origin,p.image,p.description,p.story,p.tag,p.created_at,
    COALESCE(AVG(r.score),0)::numeric(3,1) AS rating,COUNT(DISTINCT r.user_id)::int AS rating_count
    FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN ratings r ON r.product_id=p.id
    WHERE p.id=$1 GROUP BY p.id,c.name`, [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Producto no encontrado.' });
  const [comments, related] = await Promise.all([
    pool.query('SELECT c.id,c.content,c.created_at,u.name AS author FROM comments c JOIN users u ON u.id=c.user_id WHERE c.product_id=$1 ORDER BY c.created_at DESC', [req.params.id]),
    pool.query(`SELECT p.id,p.name,c.name AS category,p.price,p.maker_name AS maker,p.origin,p.image,p.description,p.story,p.tag FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.category_id=$1 AND p.id<>$2 ORDER BY p.id LIMIT 6`, [result.rows[0].category_id, req.params.id]),
  ]);
  return res.json({ ...result.rows[0], id: Number(result.rows[0].id), price: Number(result.rows[0].price), rating: Number(result.rows[0].rating), comments: comments.rows, related: related.rows.map((row) => ({ ...row, id: Number(row.id), price: Number(row.price) })) });
});

app.get('/api/culture', async (_req, res) => res.json((await pool.query('SELECT id,title,people,description,image,accent FROM culture_stories ORDER BY id')).rows));

app.get('/api/users/me/cart', requireAuth, async (req: AuthRequest, res) => {
  const rows = await pool.query(`SELECT p.id,p.name,p.category_id,c.name AS category,p.price,p.maker_name AS maker,p.origin,p.image,p.description,p.tag,ci.quantity,ci.added_at
    FROM cart_items ci JOIN products p ON p.id=ci.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE ci.user_id=$1 ORDER BY ci.added_at DESC`, [req.userId]);
  return res.json(rows.rows.map((row) => ({ ...row, id: Number(row.id), quantity: Number(row.quantity), price: Number(row.price) })));
});
app.post('/api/users/me/cart', requireAuth, async (req: AuthRequest, res) => {
  const productId = Number(req.body?.productId);
  if (!Number.isInteger(productId) || productId < 1) return res.status(400).json({ error: 'Producto inválido.' });
  const result = await pool.query(`INSERT INTO cart_items(user_id,product_id,quantity) VALUES($1,$2,1)
    ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=cart_items.quantity+1 RETURNING product_id,quantity`, [req.userId, productId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Producto no encontrado.' });
  return res.status(201).json(result.rows[0]);
});
app.patch('/api/users/me/cart/:productId', requireAuth, async (req: AuthRequest, res) => {
  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).json({ error: 'La cantidad debe estar entre 1 y 99.' });
  const result = await pool.query('UPDATE cart_items SET quantity=$1 WHERE user_id=$2 AND product_id=$3 RETURNING product_id,quantity', [quantity, req.userId, req.params.productId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Ese artículo no está en tu canasta.' });
  return res.json(result.rows[0]);
});
app.delete('/api/users/me/cart/:productId', requireAuth, async (req: AuthRequest, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2', [req.userId, req.params.productId]);
  return res.status(204).end();
});

app.get('/api/users/me/favorites', requireAuth, async (req: AuthRequest, res) => {
  const rows = await pool.query(`SELECT p.id,p.name,c.name AS category,p.price,p.maker_name AS maker,p.origin,p.image,p.description,p.tag,f.created_at
    FROM favorites f JOIN products p ON p.id=f.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE f.user_id=$1 ORDER BY f.created_at DESC`, [req.userId]);
  return res.json(rows.rows.map((row) => ({ ...row, id: Number(row.id), price: Number(row.price) })));
});
app.put('/api/users/me/favorites/:productId', requireAuth, async (req: AuthRequest, res) => {
  const result = await pool.query('INSERT INTO favorites(user_id,product_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING product_id', [req.userId, req.params.productId]);
  if (!result.rowCount) {
    const exists = await pool.query('SELECT 1 FROM products WHERE id=$1', [req.params.productId]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  return res.status(204).end();
});
app.delete('/api/users/me/favorites/:productId', requireAuth, async (req: AuthRequest, res) => {
  await pool.query('DELETE FROM favorites WHERE user_id=$1 AND product_id=$2', [req.userId, req.params.productId]);
  return res.status(204).end();
});

app.post('/api/products/:id/comments', requireAuth, async (req: AuthRequest, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (!content || content.length > 2000) return res.status(400).json({ error: 'El comentario debe tener entre 1 y 2000 caracteres.' });
  const result = await pool.query(`INSERT INTO comments(product_id,user_id,content) VALUES($1,$2,$3)
    RETURNING id,product_id,content,created_at`, [req.params.id, req.userId, content]);
  return res.status(201).json({ ...result.rows[0], author: (await pool.query('SELECT name FROM users WHERE id=$1', [req.userId])).rows[0].name });
});
app.patch('/api/comments/:id', requireAuth, async (req: AuthRequest, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (!content || content.length > 2000) return res.status(400).json({ error: 'El comentario debe tener entre 1 y 2000 caracteres.' });
  const result = await pool.query('UPDATE comments SET content=$1 WHERE id=$2 AND user_id=$3 RETURNING id,content,created_at', [content, req.params.id, req.userId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Comentario no encontrado.' });
  return res.json(result.rows[0]);
});
app.delete('/api/comments/:id', requireAuth, async (req: AuthRequest, res) => {
  const result = await pool.query('DELETE FROM comments WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Comentario no encontrado.' });
  return res.status(204).end();
});
app.put('/api/products/:id/rating', requireAuth, async (req: AuthRequest, res) => {
  const score = Number(req.body?.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ error: 'La valoración debe ser de 1 a 5.' });
  await pool.query('INSERT INTO ratings(product_id,user_id,score) VALUES($1,$2,$3) ON CONFLICT(product_id,user_id) DO UPDATE SET score=EXCLUDED.score,created_at=NOW()', [req.params.id, req.userId, score]);
  const result = await pool.query('SELECT ROUND(AVG(score)::numeric,1) AS average,COUNT(*)::int AS count FROM ratings WHERE product_id=$1', [req.params.id]);
  return res.json({ success: true, average: Number(result.rows[0].average), count: result.rows[0].count });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const code = (error as { code?: string }).code;
  if (code === '23503') return res.status(404).json({ error: 'El recurso solicitado no existe.' });
  console.error(error);
  return res.status(500).json({ error: 'Ocurrió un error interno.' });
});

app.listen(port, () => console.log(`Caribe API lista en http://localhost:${port}`));
