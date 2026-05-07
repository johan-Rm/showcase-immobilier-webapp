<template>
  <section class="px-6 md:px-12 md:py-14">
    <div class="mx-auto w-full max-w-3xl space-y-4">
      <p
        v-if="props.designation"
        class="text-foreground/60 text-xs font-semibold tracking-[0.32em] uppercase"
      >
        {{ props.designation }}
      </p>
      <div class="relative w-full overflow-hidden rounded-2xl bg-black/80 pt-[56.25%]">
        <iframe
          v-if="videoId"
          class="absolute inset-0 h-full w-full"
          :src="`https://www.youtube.com/embed/${videoId}`"
          :title="props.video?.name ?? 'YouTube video'"
          loading="lazy"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
          "
          allowfullscreen
        />
        <div v-else class="absolute inset-0 flex items-center justify-center text-sm text-white/70">
          Vidéo indisponible.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type YoutubeVideo = {
  id?: number
  name?: string
  url?: string
}

type YoutubeProps = {
  slug?: string
  designation?: string
  video?: YoutubeVideo
}

const props = defineProps<YoutubeProps>()

const getVideoId = (url?: string): string | null => {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  return match?.[1] ?? null
}

const videoId = computed(() => getVideoId(props.video?.url))
</script>
