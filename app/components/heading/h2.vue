<template>
  <h2
    class="heading-h2 leading-tight tracking-[0.05em]"
    :class="[{ 'text-white': !props.colorClass }, props.colorClass, sizeClass, textAlignClass]"
  >
    <span
      v-if="!props.hideLine"
      class="heading-h2__line block h-0.5 w-12 rounded-full bg-white/75"
      aria-hidden="true"
    />
    <span>
      <slot />
    </span>
  </h2>
</template>

<script setup lang="ts">
import { resolveHeadingSizeClass } from './sizePresets'

type HeadingTextAlign = 'left' | 'center' | 'right'

interface HeadingH2Props {
  hideLine?: boolean
  colorClass?: string
  size?: string
  textAlign?: HeadingTextAlign
}

const props = withDefaults(defineProps<HeadingH2Props>(), {
  hideLine: false,
  colorClass: '',
  size: '',
  textAlign: 'left',
})

const sizeClass = computed(() => resolveHeadingSizeClass(props.size))
const textAlignClass = computed(() => {
  switch (props.textAlign) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
})
</script>

<style scoped>
.heading-size-xs {
  --h2-size: clamp(0.8rem, 0.95vw, 0.95rem);
}
.heading-size-sm {
  --h2-size: clamp(0.95rem, 1.1vw, 1.05rem);
}
.heading-size-md {
  --h2-size: clamp(1.05rem, 1.25vw, 1.2rem);
}
.heading-size-lg {
  --h2-size: clamp(1.15rem, 1.5vw, 1.45rem);
}
.heading-size-xl {
  --h2-size: clamp(1.3rem, 1.9vw, 1.9rem);
}
.heading-size-2xl {
  --h2-size: clamp(1.6rem, 2.2vw, 2.7rem);
}
.heading-size-3xl {
  --h2-size: clamp(2rem, 3.1vw, 3.4rem);
}
.heading-size-4xl {
  --h2-size: clamp(2.4rem, 4vw, 4.6rem);
}
.heading-size-5xl {
  --h2-size: clamp(2.5rem, 4.5vw, 5.5rem);
}
</style>
