<template>
  <UPage class="pages-dashboard h-full w-full">
    <UPageSection
      class="bg-background text-foreground flex h-dvh w-screen items-center px-6 pt-28 pb-10 sm:px-10 lg:px-16"
    >
      <div class="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section class="flex min-h-0 flex-col justify-center gap-8">
          <div class="space-y-4">
            <p class="text-foreground/45 text-sm font-semibold tracking-[0.18em] uppercase">
              Dashboard
            </p>

            <h1
              class="font-heading text-foreground max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl"
            >
              {{ title }}
            </h1>

            <p class="text-foreground/70 max-w-2xl text-base leading-7 sm:text-lg">
              {{ description }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <UButton
              v-if="!loggedIn"
              :to="loginPath"
              icon="i-simple-icons-google"
              color="primary"
              variant="solid"
              class="rounded-lg"
              external
            >
              Se connecter avec Google
            </UButton>

            <UButton
              v-else
              type="button"
              icon="i-lucide-log-out"
              color="neutral"
              variant="outline"
              class="rounded-lg"
              @click="logout"
            >
              Se deconnecter
            </UButton>
          </div>
        </section>

        <aside
          v-if="loggedIn"
          class="border-foreground/10 text-foreground/65 self-center border-l px-6 py-4 text-sm leading-6"
          aria-label="Compte connecte"
        >
          <div class="flex items-center gap-4">
            <UAvatar
              :src="user?.picture"
              :alt="displayName"
              icon="i-lucide-user"
              size="xl"
              class="shrink-0"
            />

            <div class="min-w-0">
              <p class="text-foreground truncate font-semibold">{{ displayName }}</p>
              <p class="text-foreground/55 truncate">{{ user?.email }}</p>
            </div>
          </div>
        </aside>

        <aside
          v-else
          class="border-foreground/10 text-foreground/65 self-center border-l px-6 py-4 text-sm leading-6"
          aria-label="Acces reserve"
        >
          <p class="text-foreground font-semibold">Acces restreint</p>
          <p class="mt-2">
            La connexion est limitee aux comptes Google autorises par MLK - My Little Kasbah.
          </p>
        </aside>
      </div>
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
// 1. Imports

// 2. Types et constantes statiques

// 3. Props et emits

// 4. Composables, stores, routeur
const route = useRoute()
const { loggedIn, user, clear, fetch } = useUserSession()

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready
const displayName = computed<string>(() => user.value?.name || user.value?.email || 'client')

const loginPath = computed<string>(() => {
  return `/auth/google?state=${encodeURIComponent(route.fullPath)}`
})

const title = computed<string>(() => {
  return loggedIn.value ? `Bonjour ${displayName.value}` : 'Connexion au dashboard'
})

const description = computed<string>(() => {
  if (loggedIn.value) {
    return 'Ce dashboard est reserve aux clients autorises de MLK - My Little Kasbah. Les premiers services seront ajoutes progressivement.'
  }

  return 'Connectez-vous avec le compte Google autorise pour acceder au dashboard MLK - My Little Kasbah.'
})

// 9. Actions et handlers
const logout = async (): Promise<void> => {
  await clear()
  await navigateTo(route.fullPath)
}

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page
definePageMeta({
  layout: 'dashboard',
})

useSeoMeta({
  title: 'Dashboard - MLK My Little Kasbah',
  description: 'Dashboard prive reserve aux clients autorises MLK My Little Kasbah.',
  robots: 'noindex, nofollow',
})

// 12. Lifecycle
await fetch()
</script>
