"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"

export type SkillVideoItem = {
  id: string
  slug: string | null
  thumbnailUrl: string
  embedUrl: string
}

export default function SkillVideoFeed({ videos }: { videos: SkillVideoItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (videos.length === 0) return null

  return (
    <>
      {/* Horizontal scrollable thumbnail cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {videos.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setOpenIndex(i)}
            className="flex-shrink-0 w-[110px] snap-start text-left"
          >
            <div className="relative w-[110px] h-[148px] rounded-[12px] overflow-hidden bg-[#1a1a1a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.thumbnailUrl}
                alt={v.slug ?? "video keahlian"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M1 1L13 8L1 15V1Z" fill="white" />
                  </svg>
                </div>
              </div>
            </div>
            {v.slug && (
              <p className="text-[11px] text-[#5A3A7A] font-medium mt-1.5 truncate capitalize">
                {v.slug}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen Swiper overlay */}
      {openIndex !== null && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
            <p className="text-white/70 text-[12px]">
              {openIndex + 1} / {videos.length} · Geser untuk video lain
            </p>
            <button
              onClick={() => setOpenIndex(null)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Swiper */}
          {/* [&_.swiper-slide]:h-full — vertical Swiper butuh slide height eksplisit */}
          <div className="flex-1 overflow-hidden [&_.swiper]:h-full [&_.swiper-slide]:h-full">
            <Swiper
              direction="vertical"
              initialSlide={openIndex}
              onSlideChange={(swiper) => setOpenIndex(swiper.activeIndex)}
              className="h-full w-full"
            >
              {videos.map((v) => (
                <SwiperSlide key={v.id}>
                  <div className="flex flex-col h-full w-full">
                    {/* Video iframe fills most of the screen */}
                    <div className="flex-1 relative">
                      <iframe
                        src={v.embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title={v.slug ?? "Video Keahlian"}
                      />
                    </div>
                    {/* Category label below the video */}
                    {v.slug && (
                      <div className="py-4 text-center flex-shrink-0">
                        <span className="text-white font-semibold text-[14px] capitalize">
                          {v.slug}
                        </span>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  )
}
