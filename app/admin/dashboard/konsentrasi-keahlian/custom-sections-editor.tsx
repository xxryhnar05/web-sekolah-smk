'use client'

import { Layers, Plus, Trash2 } from 'lucide-react'
import {
  type CustomSection,
  type CustomSectionType,
} from '@/lib/custom-sections'

const sectionTypes: { value: CustomSectionType; label: string }[] = [
  { value: 'paragraph', label: 'Paragraf' },
  { value: 'bullet', label: 'Poin Bullet' },
  { value: 'number', label: 'Poin Nomor' },
]

export default function CustomSectionsEditor({
  sections,
  onChange,
}: {
  sections: CustomSection[]
  onChange: (sections: CustomSection[]) => void
}) {
  const handleAddSection = () => {
    onChange([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: '',
        content: '',
        type: 'paragraph',
      },
    ])
  }

  const handleUpdateSection = (
    id: string,
    field: 'title' | 'content' | 'type',
    value: string,
  ) => {
    onChange(
      sections.map((section) =>
        section.id === id
          ? {
              ...section,
              [field]: value,
            }
          : section,
      ),
    )
  }

  const handleRemoveSection = (id: string) => {
    onChange(sections.filter((section) => section.id !== id))
  }

  return (
    <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3e0d8] pb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#17231f]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
            <Layers className="h-4 w-4" />
          </span>
          Sub-bab Tambahan
        </div>
        <button
          type="button"
          onClick={handleAddSection}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-2 text-xs font-semibold text-[#785e2d] transition hover:border-[#bd9142] hover:bg-[#f5ecda] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9142]"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Sub-bab Baru
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="py-1 text-xs text-slate-500">
          Belum ada sub-bab tambahan. Tambahkan jika diperlukan.
        </p>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <article
              key={section.id}
              className="relative space-y-4 rounded-xl border border-[#e3e0d8] bg-white p-4 sm:p-5"
            >
              <button
                type="button"
                onClick={() => handleRemoveSection(section.id)}
                aria-label={`Hapus sub-bab ${section.title || index + 1}`}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 gap-4 pr-10 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`custom-section-title-${section.id}`}
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Judul Sub-bab {index + 1}
                  </label>
                  <input
                    id={`custom-section-title-${section.id}`}
                    type="text"
                    value={section.title}
                    onChange={(event) =>
                      handleUpdateSection(section.id, 'title', event.target.value)
                    }
                    placeholder="Contoh: Mitra Industri"
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`custom-section-type-${section.id}`}
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Format Tampilan
                  </label>
                  <select
                    id={`custom-section-type-${section.id}`}
                    value={section.type}
                    onChange={(event) =>
                      handleUpdateSection(
                        section.id,
                        'type',
                        event.target.value as CustomSectionType,
                      )
                    }
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  >
                    {sectionTypes.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`custom-section-content-${section.id}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Isi Konten Sub-bab
                </label>
                <textarea
                  id={`custom-section-content-${section.id}`}
                  rows={4}
                  value={section.content}
                  onChange={(event) =>
                    handleUpdateSection(section.id, 'content', event.target.value)
                  }
                  placeholder={
                    section.type === 'paragraph'
                      ? 'Tuliskan isi paragraf di sini...'
                      : 'Tulis satu poin per baris...'
                  }
                  className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-3.5 text-sm leading-7 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
                {section.type !== 'paragraph' && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Pisahkan setiap poin dengan baris baru.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
