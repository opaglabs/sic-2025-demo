import { jwtVerify } from 'jose'
import { getJwtSecret } from '~~/server/utils/secret'
import { useDrizzle } from '~~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
  const authHeader = getRequestHeader(event, 'Authorization')

  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header missing' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token missing' })
  }

  try {
    const decoded = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()!))

    const db = useDrizzle()

    const user = await db.select().from(tables.users).where(eq(tables.users.id, decoded.payload.userId)).get()

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return { success: true, message: 'Logged out successfully' }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error during logout' })
  }
})