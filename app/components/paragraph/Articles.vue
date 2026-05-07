<template>
  <article v-for="item in props.items" :key="item.title" class="w-full max-w-sm">
    <HeadingH3 hide-line size="2xl" text-align="center" color-class="foreground">
      <span class="block">{{ item.title }}</span>
      <span class="block">{{ item.accent }}</span>
    </HeadingH3>
    <p
      v-if="!isMobileLandscape"
      class="text-foreground/70 mt-0 px-2 whitespace-pre-line md:mt-4 md:px-4"
    >
      {{ item.description }}
    </p>
  </article>
</template>

<script setup lang="ts">
type ParagraphArticleItem = {
  title: string
  accent: string
  description: string
}

type ParagraphArticlesProps = {
  items: ParagraphArticleItem[]
}

const props = defineProps<ParagraphArticlesProps>()

const { isMobileLandscape } = useDeviceDetect()
</script>
