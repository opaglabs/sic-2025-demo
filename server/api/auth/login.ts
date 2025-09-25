import { SignJWT } from 'jose'
import { hash } from 'ohash';
import { getJwtSecret } from '~~/server/utils/secret'
import { useDrizzle } from '~~/server/utils/drizzle'

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

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(getJwtSecret()))

  return { user: { id: user.id, email: user.email, name: user.name }, token }
})