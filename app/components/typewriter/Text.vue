<template>
  <span>
    {{ text }}
    <span v-if="caret" class="ml-1 inline-block animate-pulse">|</span>
  </span>
</template>

<script setup lang="ts">
/**
 * 
<TypewriterText
  :phrases="[
    'MLK — immobilier premium.',
    'Nuxt 4 • SEO • Performance.',
    'Essaouira vibes.'
  ]"
  :typeSpeed="30"
  :deleteSpeed="15"
  :pause="2000"
  :loop="true"
  :deleteBeforeNext="true"
  :caret="false"
/>

 */
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  phrases: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pause?: number
  loop?: boolean
  deleteBeforeNext?: boolean
  caret?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  typeSpeed: 40,
  deleteSpeed: 25,
  pause: 1200,
  loop: true,
  deleteBeforeNext: true,
  caret: true,
})

const text = ref('')
const phraseIndex = ref(0)
const charIndex = ref(0)
const deleting = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

const clear = () => {
  if (timer) clearTimeout(timer)
}

const step = () => {
  const current = props.phrases[phraseIndex.value] ?? ''

  if (!deleting.value) {
    if (charIndex.value < current.length) {
      text.value += current[charIndex.value++]
      timer = setTimeout(step, props.typeSpeed)
    } else {
      if (!props.deleteBeforeNext) {
        timer = setTimeout(nextPhrase, props.pause)
      } else {
        timer = setTimeout(() => {
          deleting.value = true
          step()
        }, props.pause)
      }
    }
  } else {
    if (text.value.length > 0) {
      text.value = text.value.slice(0, -1)
      timer = setTimeout(step, props.deleteSpeed)
    } else {
      deleting.value = false
      nextPhrase()
    }
  }
}

const nextPhrase = () => {
  phraseIndex.value++
  if (phraseIndex.value >= props.phrases.length) {
    if (!props.loop) return
    phraseIndex.value = 0
  }
  charIndex.value = 0
  step()
}

onMounted(() => {
  if (props.phrases.length) step()
})

onUnmounted(clear)

watch(
  () => props.phrases,
  () => {
    text.value = ''
    phraseIndex.value = 0
    charIndex.value = 0
  },
)
</script>
