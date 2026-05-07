<template>
  <section
    class="flex min-h-40 flex-col items-center justify-center gap-6 rounded-3xl border border-black/10 bg-white/80 px-6 py-10 text-center shadow-sm backdrop-blur-sm"
    aria-labelledby="hello-world-title"
  >
    <p class="text-foreground/60 text-xs font-semibold tracking-[0.24em] uppercase">Boot Step</p>

    <h1 id="hello-world-title" class="text-foreground text-3xl font-semibold tracking-tight">
      Hello World
    </h1>

    <p class="text-foreground/70 max-w-md text-sm leading-6">
      Premier composant de test pour construire le chargement de l application pas a pas.
    </p>

    <div class="bg-foreground/5 w-full max-w-2xl rounded-2xl p-4 text-left">
      <p class="text-foreground/60 mb-2 text-xs font-semibold tracking-[0.2em] uppercase">
        App Logo Aria Label
      </p>

      <p class="text-foreground/80 text-sm leading-6">
        {{ logoAriaLabel }}
      </p>
    </div>

    <div class="bg-foreground/5 w-full max-w-2xl rounded-2xl p-4 text-left">
      <p class="text-foreground/60 mb-3 text-xs font-semibold tracking-[0.2em] uppercase">
        Organization Metadata
      </p>

      <pre
        class="text-foreground/80 overflow-x-auto text-xs leading-6 break-words whitespace-pre-wrap"
      ><code>{{ organizationJson }}</code></pre>
    </div>
  </section>
</template>

<script setup lang="ts">
const { appData } = useApp()
const appConfig = useAppConfig()

const logoAriaLabel = computed<string>(() => appData.value?.components?.logo?.ariaLabel ?? '')
const organization = computed(() => appConfig.organization)
const organizationJson = computed<string>(() => JSON.stringify(organization.value, null, 2))
</script>
