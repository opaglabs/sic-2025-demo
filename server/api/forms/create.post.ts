
import jwt from 'jsonwebtoken'

interface Field {
  type: string;
  label: string;
  name: string;
  options: string[];
  required: boolean;
}

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
  
    const body = await readBody<{ userId: number, title: string, description?: string, fields: Field[] }>(event)

    const formId = crypto.randomUUID()

    const db = useDrizzle()

    const form = await db.insert(tables.forms).values({
      id: formId,
      userId: decoded.userId,
      title: body.title,
      description: body.description ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().get()

    for (const field of body.fields) {
      await db.insert(tables.fields).values({
        id: crypto.randomUUID(),
        formId: form.id,
        type: field.type.toLowerCase().trim().replace(/\s+/g, '_'),
        label: field.label.replace(/\s+/g, ' ').trim(),
        name: field.name.toLowerCase().replace(/\s+/g, '_').trim(),
        options: field.options ?? null,
        required: field.required ? 1 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return { formId: form.id }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: error instanceof Error ? error.message : 'Invalid token' })
  }
})
