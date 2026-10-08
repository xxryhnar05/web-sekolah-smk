export type CustomSectionType = 'paragraph' | 'bullet' | 'number'

export interface CustomSection {
  id: string
  title: string
  content: string
  type: CustomSectionType
}

export function parseCustomSections(value: unknown): CustomSection[] {
  if (!Array.isArray(value)) return []

  return value.filter(
    (section): section is CustomSection =>
      typeof section === 'object' &&
      section !== null &&
      typeof section.id === 'string' &&
      typeof section.title === 'string' &&
      typeof section.content === 'string' &&
      (section.type === 'paragraph' ||
        section.type === 'bullet' ||
        section.type === 'number'),
  )
}
