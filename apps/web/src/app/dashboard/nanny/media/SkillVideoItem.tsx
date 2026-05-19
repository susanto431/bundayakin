"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type VideoItem = { id: string; embedUrl: string; thumbnailUrl?: string; slug?: string; isReady?: boolean }

type Props = {
  video: VideoItem
  onDelete: () => void
  disabled?: boolean
}

export default function SkillVideoItem({ video, onDelete, disabled }: Props) {
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

  return (
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

      <div className="relative w-20 h-14 rounded-[8px] overflow-hidden flex-shrink-0">
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
        {video.isReady === false && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#5A3A7A] truncate capitalize">
          {video.slug ?? "Video Keahlian"}
        </p>
        {video.isReady === false ? (
          <p className="text-[11px] text-[#E07B39]">Sedang diproses… refresh sebentar lagi</p>
        ) : (
          <p className="text-[11px] text-[#999AAA]">Geser ⠿ untuk ubah urutan</p>
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
  )
}
