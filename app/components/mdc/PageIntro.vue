<template>
  <section class="mx-auto w-full max-w-3xl px-6">
    <div
      class="text-foreground/80 text-base leading-relaxed md:text-lg [&_p]:mt-4 [&_p:first-child]:mt-0"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="props.text ?? ''" />
    </div>
  </section>
</template>

<script setup lang="ts">
type PageIntroProps = {
  text?: string
}

const props = defineProps<PageIntroProps>()
</script>
