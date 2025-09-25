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
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()!))

    const db = useDrizzle()

    const rawForms = await db.select().from(tables.forms).where(eq(tables.forms.userId, payload.userId)).orderBy(desc(tables.forms.updatedAt)).all()

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
