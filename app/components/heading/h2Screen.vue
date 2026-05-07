<template>
  <HeadingH2
    size="2xl"
    class="group absolute right-4 bottom-2 left-4 z-9999 whitespace-nowrap uppercase md:bottom-4 2xl:right-10 2xl:bottom-10 2xl:left-10"
  >
    <NuxtLink v-if="hasLink" :to="linkTarget" :class="hoverCss">
      <slot />
    </NuxtLink>
    <span v-else>
      <slot />
    </span>
  </HeadingH2>
</template>

<script setup lang="ts">
const props = defineProps<{
  to?: string
}>()

const { currentMeta } = useScreenSystem()
const hasLink = computed<boolean>(() => Boolean(props.to?.trim()))
const linkTarget = computed<string>(() => props.to?.trim() ?? '')
const hoverCss = computed(() => {
  return currentMeta.value?.layout?.imageZone === 'background'
    ? ''
    : 'hover:text-primary transition-colors'
})
</script>
