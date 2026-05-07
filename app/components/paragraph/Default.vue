<template>
  <div
    class="flex min-h-0 flex-col space-y-2 leading-[1.5] lg:space-y-3 lg:leading-[1.55] 2xl:leading-relaxed"
  >
    <p
      v-for="(paragraph, index) in props.paragraphs"
      :key="paragraph"
      :class="['whitespace-pre-line', index === 0 ? 'block' : 'hidden md:block']"
      class="text-foreground/70"
    >
      {{ paragraph }}
    </p>
  </div>
</template>

<script setup lang="ts">
type ParagraphDefaultProps = {
  paragraphs: string[]
}

const props = defineProps<ParagraphDefaultProps>()
</script>
