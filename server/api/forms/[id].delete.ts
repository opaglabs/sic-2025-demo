import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const authHeader = getRequestHeader(event, 'Authorization')

  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header missing' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    const db = useDrizzle()

    const form = await db.select().from(tables.forms).where(and(eq(tables.forms.id, id), eq(tables.forms.userId, decoded.userId))).get()

    if (!form) {
      throw createError({ statusCode: 404, statusMessage: 'Form not found' })
    }

    await db.delete(tables.forms).where(eq(tables.forms.id, id)).run()
    await db.delete(tables.fields).where(eq(tables.fields.formId, id)).run()

    return { message: 'Form deleted successfully' }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: error instanceof Error ? error.message : 'Invalid token' })
  }
})
