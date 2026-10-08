'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface FacilityPhoto {
  id: string
  photo_url: string
}

interface FacilityGroup {
  id: string
  title: string
  description: string | null
  facility_photos: FacilityPhoto[]
}

function PhotoCarousel({
  title,
  description,
  photos,
}: {
  title: string
  description: string | null
  photos: FacilityPhoto[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' })
  }

  if (!photos || photos.length === 0) return null

  return (
    <section className="border-t border-white/10 py-8 sm:py-10">
      {/* Header Carousel per Bab */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
            Dokumentasi
          </p>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
          {description && <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>}
        </div>

        {/* Panah Navigasi Slider */}
        {photos.length > 1 && (
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={`Foto ${title} sebelumnya`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-amber-400/40 hover:text-amber-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={`Foto ${title} berikutnya`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-amber-400/40 hover:text-amber-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Slider Kartu Foto */}
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0"
      >
        {photos.map((photo) => (
          <article
            key={photo.id}
            className="group w-[84%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-slate-900/25 transition-colors hover:border-amber-400/25 sm:w-[48%]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
              <img
                src={photo.photo_url}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>
          </article>
        ))}
      </div>

      {photos.length > 1 && (
        <p className="mt-2 text-xs text-slate-600 sm:hidden">
          Geser ke samping untuk melihat foto lainnya
        </p>
      )}
    </section>
  )
}

export default function SaranaPrasaranaGalleries() {
  const [facilityGroups, setFacilityGroups] = useState<FacilityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true

    const fetchFacilitiesWithPhotos = async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select(`
          id,
          title,
          description,
          created_at,
          facility_photos (
            id,
            photo_url
          )
        `)
        .order('created_at', { ascending: false })

      if (active) {
        setFacilityGroups(error ? [] : (data || []) as FacilityGroup[])
        setLoadError(Boolean(error))
        setLoading(false)
      }
    }

    fetchFacilitiesWithPhotos()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 py-8">
        {[0, 1].map((item) => (
          <div key={item} className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-800" />
            <div className="flex gap-4 overflow-hidden">
              <div className="w-[82%] sm:w-[48%] shrink-0 aspect-[4/3] animate-pulse rounded-2xl bg-slate-900" />
              <div className="w-[82%] sm:w-[48%] shrink-0 aspect-[4/3] animate-pulse rounded-2xl bg-slate-900" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loadError || facilityGroups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-slate-500 my-8">
        {loadError ? 'Gagal memuat dokumentasi sarana & prasarana.' : 'Dokumentasi sarana & prasarana belum tersedia.'}
      </div>
    )
  }

  return (
    <div>
      {facilityGroups.map((group) => (
        <PhotoCarousel
          key={group.id}
          title={group.title}
          description={group.description}
          photos={group.facility_photos || []}
        />
      ))}
    </div>
  )
}