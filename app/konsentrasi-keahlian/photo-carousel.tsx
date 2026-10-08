'use client'

import { useRef, useState, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PhotoCarousel({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (images.length === 0) return null

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length)
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current
    const endX = event.changedTouches[0]?.clientX
    touchStartX.current = null

    if (startX === null || endX === undefined) return
    const distance = endX - startX
    if (Math.abs(distance) < 48) return
    if (distance < 0) showNext()
    else showPrevious()
  }

  return (
    <section
      aria-label={`Galeri foto ${title}`}
      className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-slate-900/40"
    >
      <div
        className="group relative aspect-[2/1] touch-pan-y overflow-hidden bg-slate-950"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="h-full w-full shrink-0">
              <img
                src={image}
                alt={`${title} - foto ${index + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Foto sebelumnya"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-slate-950/55 text-white backdrop-blur transition hover:border-amber-300/60 hover:bg-slate-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Foto berikutnya"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-slate-950/55 text-white backdrop-blur transition hover:border-amber-300/60 hover:bg-slate-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="font-mono text-xs tracking-wider text-slate-500" aria-live="polite">
            {String(activeIndex + 1).padStart(2, '0')}
            <span className="mx-1.5 text-slate-700">/</span>
            {String(images.length).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2" aria-label="Pilih foto">
            {images.map((image, index) => (
              <button
                key={`${image}-dot-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Tampilkan foto ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${activeIndex === index ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'}`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">Geser foto</span>
        </div>
      )}
    </section>
  )
}
