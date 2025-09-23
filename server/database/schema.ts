import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const forms = sqliteTable('forms', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const formRelations = relations(forms, ({ one }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
}))

export const fields = sqliteTable('fields', {
  id: text('id').primaryKey(),
  formId: text('form_id')
    .notNull()
    .references(() => forms.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  label: text('label').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  required: integer('required').notNull().default(0),
  options: text('options', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const fieldRelations = relations(fields, ({ one }) => ({
  form: one(forms, {
    fields: [fields.formId],
    references: [forms.id],
  }),
}))
