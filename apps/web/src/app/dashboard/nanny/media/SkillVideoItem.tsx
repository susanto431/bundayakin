"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type VideoItem = { id: string; embedUrl: string; thumbnailUrl?: string; slug?: string; isReady?: boolean }

type Props = {
  video: VideoItem
  onDelete: () => void
  disabled?: boolean
}

export default function SkillVideoItem({ video, onDelete, disabled }: Props) {
  const [showPlayer, setShowPlayer] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const isReady = video.isReady !== false

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 bg-white border border-[#E0D0F0] rounded-[12px] p-3 touch-none"
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 px-1 py-2 cursor-grab active:cursor-grabbing text-[#C8B8DC] select-none"
          aria-label="Geser untuk mengatur urutan"
        >
          ⠿
        </div>

        {/* Thumbnail — tappable saat video ready */}
        <button
          onClick={() => isReady && setShowPlayer(true)}
          disabled={!isReady}
          className="relative w-20 h-14 rounded-[8px] overflow-hidden flex-shrink-0 focus:outline-none"
          aria-label={isReady ? `Putar ${video.slug ?? "video"}` : "Video sedang diproses"}
        >
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.slug ?? "thumbnail"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#F3EEF8] flex items-center justify-center">
              <span className="text-xl">🎬</span>
            </div>
          )}
          {!isReady ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#5A3A7A] ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#5A3A7A] truncate capitalize">
            {video.slug ?? "Video Keahlian"}
          </p>
          {!isReady ? (
            <p className="text-[11px] text-[#E07B39]">Sedang diproses… refresh sebentar lagi</p>
          ) : (
            <button
              onClick={() => setShowPlayer(true)}
              className="text-[11px] text-[#5BBFB0] font-medium hover:underline"
            >
              ▶ Putar video
            </button>
          )}
        </div>

        <button
          onClick={onDelete}
          disabled={disabled}
          className="text-[#C75D5D] text-[11px] font-semibold hover:underline flex-shrink-0 min-h-[40px] px-2 disabled:opacity-40"
        >
          Hapus
        </button>
      </div>

      {/* Modal player */}
      {showPlayer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPlayer(false)}
        >
          <div
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-white text-[13px] font-semibold capitalize truncate">
                {video.slug ?? "Video Keahlian"}
              </p>
              <button
                onClick={() => setShowPlayer(false)}
                className="text-white/70 hover:text-white text-[20px] leading-none min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video rounded-[12px] overflow-hidden bg-black">
              <iframe
                src={`${video.embedUrl}?autoplay=true`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                title={video.slug ?? "Video Keahlian"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
