<template>
  <section class="px-6">
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <p
        v-if="props.designation"
        class="text-foreground/60 text-xs font-semibold tracking-[0.32em] uppercase"
      >
        {{ props.designation }}
      </p>
      <h2 v-if="props.title" class="text-foreground text-2xl font-semibold md:text-3xl">
        {{ props.title }}
      </h2>
      <div v-if="props.content" class="text-foreground/80 text-base leading-relaxed md:text-lg">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="props.content" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type HeadbandProps = {
  slug?: string
  designation?: string
  title?: string
  content?: string
  primaryImage?: {
    id?: number
    url?: string
    alt?: string
  }
}

const props = defineProps<HeadbandProps>()
</script>
