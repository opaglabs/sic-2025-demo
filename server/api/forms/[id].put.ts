import { jwtVerify } from 'jose'
import { getJwtSecret } from '~~/server/utils/secret';
import { useDrizzle } from '~~/server/utils/drizzle'

interface Field {
  type: string;
  label: string;
  name: string;
  options: string;
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
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()!))

    const id = getRouterParam(event, 'id')

    const body = await readBody<{ userId: number, title: string, description?: string, fields: Field[] }>(event)

    const db = useDrizzle()

    const form = await db.select().from(tables.forms).where(and(eq(tables.forms.id, id), eq(tables.forms.userId, (payload as { userId: number }).userId))).get()

    if (!form) {
      throw createError({ statusCode: 404, statusMessage: 'Form not found' })
    }

    form.updatedAt = new Date()

    await db.update(tables.forms).set({
      title: body.title,
      description: body.description ?? '',
      updatedAt: new Date(),
    }).where(eq(tables.forms.id, id)).run()

    const fields = await db.select().from(tables.fields).where(eq(tables.fields.formId, id)).all()

    for (const field of body.fields) {
      const existingField = fields.find(f => f.name === field.name)

      if (existingField) {
        await db.update(tables.fields).set({
          type: field.type.toLowerCase().trim().replace(/\s+/g, '_'),
          label: field.label.replace(/\s+/g, ' ').trim(),
          options: field.options ?? null,
          required: field.required ? 1 : 0,
          updatedAt: new Date(),
        }).where(eq(tables.fields.id, existingField.id)).run()
      } else {
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
        }).run()
      }
    }

    return { form, fields }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: error instanceof Error ? error.message : 'Invalid token' })
  }
})
