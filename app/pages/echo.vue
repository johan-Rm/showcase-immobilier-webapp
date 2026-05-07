<template>
  <section class="pages-echo space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-gray-900">Echo (Zod + types partagés)</h1>
      <p class="text-gray-600">
        Démo FEAT-009 : schéma Zod partagé, types dérivés, validation côté composable et endpoint.
      </p>
    </header>

    <form class="space-y-4" @submit.prevent="submit">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-gray-800">Message</span>
        <input
          v-model="message"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
          type="text"
          name="message"
          autocomplete="off"
          :disabled="loading"
          placeholder="Bonjour Nuxt"
        />
      </label>

      <p v-if="validationError" class="text-sm font-medium text-red-700">
        {{ validationError }}
      </p>

      <button
        class="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Envoi…' : 'Envoyer' }}
      </button>
    </form>

    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <p class="font-semibold">Erreur ({{ error.status }})</p>
      <p>{{ error.message }}</p>
    </div>

    <div
      v-if="echoed"
      class="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
    >
      <p class="font-semibold">Réponse</p>
      <p>{{ echoed }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useEcho } from '~/composables/useEcho'

const { message, validationError, echoed, loading, error, submit } = useEcho()
</script>
