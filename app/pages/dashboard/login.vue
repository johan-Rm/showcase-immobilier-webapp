<template>
  <div
    class="pages-dashboard-login flex h-dvh w-screen items-center justify-center bg-[#212121] px-6"
  >
    <div class="w-full max-w-sm">
      <section class="flex flex-col gap-16 text-center">
        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2">
            <LogoGd class="h-5 w-auto shrink-0 text-[#6B7A4A]" aria-hidden="true" />
            <p class="text-xs font-semibold tracking-[0.18em] uppercase">
              <span class="text-white/40">Dashboard</span>
              <span class="text-[#6B7A4A]"> Graines Digitales</span>
            </p>
          </div>

          <h1 class="text-4xl leading-tight text-white uppercase sm:text-5xl lg:text-6xl">
            MLK - My Little Kasbah
          </h1>
        </div>

        <div class="flex flex-col gap-4">
          <a
            :href="loginPath"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B7A4A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#7d8f57]"
          >
            <UIcon name="i-simple-icons-google" class="text-base" aria-hidden="true" />
            Se connecter avec Google
          </a>

          <div class="text-sm leading-6 text-white/50">
            <p class="font-semibold text-white/80">Accès restreint</p>
            <p class="mt-1">La connexion est limitée aux comptes Google</p>
            <p>autorisés par MLK - My Little Kasbah.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import LogoGd from '~/assets/logo/logo_gd.svg'

// 4. Composables, stores, routeur
const { loggedIn, fetch } = useUserSession()

// 6. Data inputs
await fetch()
if (loggedIn.value) {
  await navigateTo('/dashboard')
}

// 8. Computed UI-ready
const loginPath = computed<string>(() => {
  return `/auth/google?state=${encodeURIComponent('/dashboard')}`
})

// 11. Metadonnees ecran ou page
definePageMeta({
  layout: 'dashboard',
})
</script>
