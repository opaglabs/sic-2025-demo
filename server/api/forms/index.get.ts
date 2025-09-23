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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }

    const db = useDrizzle()

    const rawForms = await db.select().from(tables.forms).where(eq(tables.forms.userId, decoded.userId)).orderBy(desc(tables.forms.updatedAt)).all()

    if (!rawForms) {
      throw createError({ statusCode: 404, statusMessage: 'Forms not found' })
    }

    const forms: ({
      id: string;
      title: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
      userId: number;
      fields: number;
    })[] = []

    for (const form of rawForms) {
      const fields = await db.select().from(tables.fields).where(eq(tables.fields.formId, form.id)).all()
      forms.push({
        ...form,
        fields: fields.length
      })
    }

    return { forms }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: error instanceof Error ? error.message : 'Invalid token' })
  }
})
