import jwt from 'jsonwebtoken'

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)

    const id = getRouterParam(event, 'id')

    const db = useDrizzle();

    const form = await db.select().from(tables.forms).where(and(eq(tables.forms.id, id), eq(tables.forms.userId, (decoded as { userId: number }).userId))).get()

    if (!form) {
      throw createError({ statusCode: 404, statusMessage: 'Form not found' })
    }

    const fields = await db.select().from(tables.fields).where(eq(tables.fields.formId, id)).all()

    return { ...form, fields: fields.map(field => ({
      ...field,
      required: field.required === 1
    })) }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: error instanceof Error ? error.message : 'Invalid token' })
  }
})
