import jwt from 'jsonwebtoken'
import { hash } from 'ohash'

export default defineEventHandler(async (event) => {
  const body = await readBody<{name: string, email: string, password: string}>(event)

  if (!body.email || !body.password || !body.name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  if (body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
  }

  try {
    const db = useDrizzle();

    const existingUser = await useDrizzle().select().from(tables.users).where(eq(tables.users.email, body.email)).get()

    if (existingUser) {
      throw createError({ statusCode: 400, statusMessage: 'Email already in use' })
    }

    const passwordHash = hash(body.password)

    const user = await db.insert(tables.users).values({
      name: body.name,
      email: body.email,
      password: passwordHash,
      createdAt: new Date(),
    }).returning().get()

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    return { user: { id: user.id, email: user.email, name: user.name }, token }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string | number }).code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
      throw createError({ statusCode: 400, statusMessage: 'Email already in use' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
