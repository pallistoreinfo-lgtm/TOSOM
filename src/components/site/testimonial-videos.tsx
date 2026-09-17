"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, Play, X } from "lucide-react";

export type TestimonialVideo = {
  title: string;
  youtubeId: string;
  thumbnail: string;
};

export function TestimonialVideos({ videos }: { videos: TestimonialVideo[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {videos.map((video) => (
        <Dialog.Root key={video.youtubeId}>
          <Dialog.Trigger asChild>
            <button className="group overflow-hidden rounded-[13px] bg-white text-left shadow-[0_12px_28px_rgba(16,83,111,0.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#07835e]" aria-label={`Play ${video.title}`}>
              <span className="relative block aspect-video overflow-hidden">
                <img
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  src={video.thumbnail}
                  alt=""
                  loading="lazy"
                />
                <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#173e5e]/55 text-white shadow-md backdrop-blur-[1px] transition group-hover:bg-[#07835e]">
                  <Play className="ml-1 h-5 w-5 fill-current" />
                </span>
              </span>
              <span className="block min-h-[70px] px-3 pb-4 pt-3 text-[14px] font-semibold leading-5 text-[#0b3d74]">{video.title}</span>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#02182d]/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-3 shadow-2xl focus:outline-none sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-4 px-1">
                <Dialog.Title className="text-base font-bold leading-6 text-[#082a55] sm:text-lg">{video.title}</Dialog.Title>
                <Dialog.Close className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4f7] text-[#082a55] hover:bg-[#dcecf1]" aria-label="Close video">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <a className="mt-3 inline-flex items-center gap-2 px-1 text-sm font-semibold text-[#0b5f91] hover:underline" href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer">
                Watch on YouTube <ExternalLink className="h-4 w-4" />
              </a>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  );
}
