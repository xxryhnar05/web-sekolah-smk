import type { CustomSection } from '@/lib/custom-sections'

export default function CustomSectionsDisplay({
  sections,
}: {
  sections: CustomSection[] | null
}) {
  const visibleSections = sections?.filter(
    (section) => section.title.trim() && section.content.trim(),
  )

  if (!visibleSections?.length) return null

  return (
    <>
      {visibleSections.map((section) => {
        const points = section.content
          .split('\n')
          .map((point) => point.trim())
          .filter(Boolean)

        return (
          <section
            key={section.id}
            className="border-t border-white/10 py-8 sm:py-10"
          >
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                Informasi Tambahan
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {section.title}
              </h2>
            </div>

            {section.type === 'paragraph' ? (
              <p className="whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
                {section.content}
              </p>
            ) : section.type === 'bullet' ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-400 marker:text-amber-400 sm:text-base">
                {points.map((point, index) => (
                  <li key={`${section.id}-${index}`}>{point}</li>
                ))}
              </ul>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-400 marker:text-amber-400 sm:text-base">
                {points.map((point, index) => (
                  <li key={`${section.id}-${index}`}>{point}</li>
                ))}
              </ol>
            )}
          </section>
        )
      })}
    </>
  )
}
