import jwt from 'jsonwebtoken'
import { hash } from 'ohash';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{ email: string; password: string }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const db = useDrizzle()

  const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const passwordHash = hash(password).localeCompare(user.password) === 0;

  if (!passwordHash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )

  return { user: { id: user.id, email: user.email, name: user.name }, token }
})