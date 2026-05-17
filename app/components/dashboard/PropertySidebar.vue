<template>
  <!-- Topbar mobile (lg:hidden) -->
  <div class="fixed top-0 right-0 left-0 z-20 flex flex-col bg-[#212121] lg:hidden">
    <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />

    <div class="flex shrink-0 items-center gap-3 px-4 py-2.5">
      <p class="flex-1 text-[0.6rem] font-semibold tracking-[0.22em] text-white/40 uppercase">
        Dashboard
      </p>
      <span class="text-[0.7rem] text-white/35">
        {{ filteredCount }} bien{{ filteredCount > 1 ? 's' : '' }}
      </span>
      <button
        type="button"
        class="rounded p-1 text-white/35 transition-colors hover:text-white/70"
        aria-label="Recharger les biens"
        @click="emit('refresh')"
      >
        <UIcon name="i-lucide-refresh-cw" class="text-sm" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="rounded p-1 text-white/35 transition-colors hover:text-white/70"
        :aria-label="isTopbarOpen ? 'Réduire' : 'Développer'"
        @click="isTopbarOpen = !isTopbarOpen"
      >
        <UIcon
          :name="isTopbarOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-sm"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        class="rounded p-1 text-white/35 transition-colors hover:text-white/70"
        aria-label="Se déconnecter"
        @click="emit('logout')"
      >
        <UIcon name="i-lucide-log-out" class="text-sm" aria-hidden="true" />
      </button>
    </div>

    <div v-if="isTopbarOpen" class="border-t border-white/10 px-4 pt-1 pb-4">
      <!-- Filtres inline -->
      <div>
        <!-- Recherche -->
        <div class="py-2.5">
          <input
            v-if="activeField === 'search'"
            type="text"
            class="w-full bg-transparent text-sm text-white caret-white outline-none placeholder:text-white/30"
            placeholder="Identifier..."
            :value="identifierSearch"
            aria-label="Recherche par identifier"
            @input="emit('update:identifierSearch', ($event.target as HTMLInputElement).value)"
            @blur="activeField = null"
            @keydown.escape="activeField = null"
          />
          <button
            v-else
            type="button"
            class="w-full text-left text-sm transition-colors hover:text-white/80"
            :class="identifierSearch ? 'text-white/75' : 'text-white/30'"
            aria-label="Recherche par identifier"
            @click="activeField = 'search'"
          >
            {{ identifierSearch || 'Identifier...' }}
          </button>
        </div>

        <div class="h-px" style="background-color: rgba(107, 122, 74, 0.35)" />

        <!-- Type d'offre -->
        <div class="py-2.5">
          <button
            v-if="activeField !== 'listing'"
            type="button"
            class="flex w-full items-center justify-between text-left text-sm text-white/70 transition-colors hover:text-white/90"
            aria-label="Filtrer par type d'offre"
            @click="activeField = 'listing'"
          >
            <span>{{ selectedListingLabel }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="shrink-0 text-xs text-white/30"
              aria-hidden="true"
            />
          </button>
          <div v-else class="space-y-0.5 py-0.5">
            <button
              v-for="opt in listingOptions"
              :key="opt.value"
              type="button"
              class="flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors"
              :class="
                opt.value === selectedListing ? 'text-white' : 'text-white/40 hover:text-white/65'
              "
              @click="selectListing(opt.value)"
            >
              <span
                class="mt-px h-1.5 w-1.5 shrink-0 rounded-full"
                :style="
                  opt.value === selectedListing
                    ? 'background-color: #6B7A4A'
                    : 'background-color: rgba(255,255,255,0.15)'
                "
              />
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="h-px" style="background-color: rgba(107, 122, 74, 0.35)" />

        <!-- Catégorie -->
        <div class="py-2.5">
          <button
            v-if="activeField !== 'category'"
            type="button"
            class="flex w-full items-center justify-between text-left text-sm text-white/70 transition-colors hover:text-white/90"
            aria-label="Filtrer par catégorie"
            @click="activeField = 'category'"
          >
            <span>{{ selectedCategoryLabel }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="shrink-0 text-xs text-white/30"
              aria-hidden="true"
            />
          </button>
          <div v-else class="space-y-0.5 py-0.5">
            <button
              v-for="opt in categoryOptions"
              :key="opt.value"
              type="button"
              class="flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors"
              :class="
                opt.value === selectedCategory ? 'text-white' : 'text-white/40 hover:text-white/65'
              "
              @click="selectCategory(opt.value)"
            >
              <span
                class="mt-px h-1.5 w-1.5 shrink-0 rounded-full"
                :style="
                  opt.value === selectedCategory
                    ? 'background-color: #6B7A4A'
                    : 'background-color: rgba(255,255,255,0.15)'
                "
              />
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-2 border-t border-white/10 pt-3">
        <UButton
          type="button"
          icon="i-lucide-chevron-up"
          color="neutral"
          variant="soft"
          size="sm"
          class="flex-1 justify-center bg-white/10 text-white hover:bg-white/15"
          aria-label="Bien précédent"
          :disabled="filteredCount <= 1"
          @click="emit('prev')"
        />
        <UButton
          type="button"
          icon="i-lucide-chevron-down"
          color="neutral"
          variant="soft"
          size="sm"
          class="flex-1 justify-center bg-white/10 text-white hover:bg-white/15"
          aria-label="Bien suivant"
          :disabled="filteredCount <= 1"
          @click="emit('next')"
        />
      </div>

      <div class="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
        <div class="relative h-8 w-8 shrink-0">
          <img
            v-if="user?.picture"
            :src="user.picture"
            :alt="userName"
            class="h-full w-full rounded-full object-cover"
            referrerpolicy="no-referrer"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center rounded-full text-xs font-bold text-white"
            style="background-color: #6b7a4a"
          >
            {{ userInitials }}
          </div>
        </div>
        <div class="min-w-0">
          <p class="truncate text-xs leading-tight font-semibold text-white">{{ userName }}</p>
          <p class="mt-0.5 truncate text-[0.65rem]" style="color: rgba(107, 122, 74, 0.7)">
            {{ user?.email }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Sidebar droite (desktop uniquement) -->
  <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />

  <div class="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 469 653"
        class="h-8 w-auto shrink-0"
        aria-hidden="true"
        fill="#6B7A4A"
        fill-rule="evenodd"
      >
        <path
          d="M234.0,29.5L228.5,34.0L225.5,39.0L211.5,56.0L199.5,74.0L195.5,83.0L191.5,89.0L191.5,91.0L186.5,101.0L186.5,103.0L184.5,107.0L184.5,110.0L182.5,114.0L182.5,118.0L181.5,119.0L181.5,123.0L180.5,124.0L180.5,129.0L179.5,130.0L179.0,144.5L178.0,144.5L166.0,133.5L157.0,128.5L155.0,126.5L148.0,123.5L146.0,121.5L140.0,118.5L138.0,118.5L135.0,116.5L133.0,116.5L126.0,113.5L123.0,113.5L122.0,112.5L119.0,112.5L114.0,110.5L110.0,110.5L109.0,109.5L105.0,109.5L104.0,108.5L99.0,108.5L98.0,107.5L64.0,107.5L62.0,108.5L60.5,111.0L62.5,135.0L63.5,136.0L63.5,140.0L64.5,141.0L64.5,144.0L66.5,148.0L66.5,151.0L67.5,152.0L69.5,160.0L78.5,178.0L89.5,193.0L104.0,206.5L113.0,211.5L115.0,213.5L125.0,218.5L127.0,218.5L137.0,222.5L145.0,223.5L146.0,224.5L150.0,224.5L151.0,225.5L173.5,227.0L173.0,228.5L169.0,229.5L151.0,238.5L149.0,240.5L144.0,242.5L139.0,246.5L130.0,251.5L122.0,257.5L116.0,263.5L115.0,263.5L97.5,281.0L97.5,282.0L88.5,292.0L82.5,301.0L81.5,304.0L77.5,309.0L70.5,324.0L68.5,326.0L65.5,336.0L69.0,338.5L94.0,339.5L95.0,338.5L106.0,338.5L107.0,337.5L114.0,337.5L115.0,336.5L125.0,335.5L126.0,334.5L129.0,334.5L130.0,333.5L136.0,332.5L142.0,329.5L147.0,328.5L161.0,321.5L181.0,306.5L181.5,309.0L180.5,310.0L180.5,313.0L179.5,314.0L178.5,319.0L170.5,334.0L154.0,351.5L147.0,356.5L141.0,359.5L138.0,359.5L137.0,358.5L107.0,358.5L106.0,359.5L100.0,359.5L99.0,360.5L90.0,361.5L86.0,363.5L76.0,365.5L62.0,372.5L52.0,379.5L42.5,389.0L35.5,400.0L35.5,402.0L32.5,408.0L31.5,415.0L30.5,416.0L30.5,423.0L29.5,424.0L29.5,428.0L30.5,429.0L30.5,438.0L31.5,439.0L31.5,443.0L32.5,444.0L32.5,447.0L33.5,448.0L33.5,451.0L34.5,452.0L34.5,455.0L35.5,456.0L37.5,464.0L40.5,469.0L41.5,474.0L44.5,479.0L44.5,481.0L46.5,483.0L46.5,485.0L49.5,490.0L49.5,492.0L52.5,497.0L52.5,499.0L54.5,503.0L55.5,513.0L56.5,514.0L56.5,518.0L57.5,519.0L57.5,526.0L58.5,527.0L58.5,538.0L59.5,539.0L59.5,544.0L58.5,545.0L58.5,560.0L57.5,561.0L56.5,572.0L55.5,573.0L55.5,576.0L54.5,577.0L54.5,580.0L53.5,581.0L51.5,589.0L45.5,601.0L42.5,604.0L40.5,608.0L29.5,620.0L32.0,623.5L34.0,623.5L38.0,621.5L47.0,615.5L64.5,599.0L75.5,582.0L75.5,580.0L78.5,575.0L78.5,573.0L80.5,569.0L80.5,566.0L81.5,565.0L81.5,560.0L82.5,559.0L82.5,541.0L81.5,540.0L81.5,535.0L80.5,534.0L80.5,531.0L79.5,530.0L78.5,525.0L74.5,517.0L74.5,515.0L63.5,492.0L63.5,474.0L62.5,473.0L62.5,471.0L63.5,470.0L63.5,459.0L64.5,458.0L64.5,453.0L65.5,452.0L66.5,443.0L67.5,442.0L68.5,436.0L70.5,433.0L70.5,431.0L73.5,426.0L73.5,424.0L75.5,422.0L79.5,414.0L86.5,406.0L86.5,405.0L101.0,391.5L116.0,381.5L130.0,374.5L137.0,372.5L142.0,369.5L150.0,370.5L151.0,371.5L154.0,371.5L155.0,372.5L166.0,375.5L190.0,387.5L205.0,398.5L210.0,403.5L211.0,403.5L233.0,425.5L238.0,424.5L256.0,405.5L257.0,405.5L267.0,396.5L281.0,386.5L301.0,376.5L303.0,376.5L306.0,374.5L308.0,374.5L312.0,372.5L315.0,372.5L319.0,370.5L328.0,369.5L342.0,376.5L344.0,376.5L355.0,382.5L372.0,394.5L384.5,407.0L390.5,415.0L398.5,430.0L399.5,435.0L401.5,438.0L402.5,445.0L403.5,446.0L404.5,456.0L405.5,457.0L405.5,466.0L406.5,467.0L406.5,486.0L405.5,487.0L405.5,495.0L403.5,497.0L403.5,499.0L397.5,509.0L397.5,511.0L394.5,516.0L394.5,518.0L390.5,526.0L390.5,529.0L387.5,537.0L386.5,554.0L387.5,555.0L387.5,563.0L388.5,564.0L389.5,571.0L397.5,589.0L402.5,596.0L407.5,601.0L407.5,602.0L409.0,602.5L415.0,609.5L430.0,620.5L436.0,623.5L438.0,623.5L439.5,622.0L439.5,619.0L427.5,606.0L417.5,588.0L417.5,586.0L415.5,582.0L415.5,579.0L413.5,575.0L413.5,571.0L412.5,570.0L412.5,566.0L411.5,565.0L411.5,558.0L410.5,557.0L410.5,530.0L411.5,529.0L411.5,522.0L412.5,521.0L413.5,510.0L414.5,509.0L414.5,506.0L415.5,505.0L415.5,502.0L416.5,501.0L417.5,496.0L431.5,465.0L431.5,463.0L433.5,459.0L433.5,456.0L436.5,449.0L436.5,445.0L437.5,444.0L438.5,435.0L439.5,434.0L439.5,422.0L438.5,421.0L438.5,415.0L437.5,414.0L435.5,404.0L430.5,394.0L427.5,390.0L415.0,377.5L406.0,371.5L398.0,367.5L396.0,367.5L393.0,365.5L387.0,364.5L383.0,362.5L380.0,362.5L375.0,360.5L371.0,360.5L370.0,359.5L365.0,359.5L364.0,358.5L332.0,358.5L331.0,359.5L329.0,359.5L324.0,357.5L318.0,352.5L314.0,350.5L299.5,335.0L292.5,323.0L292.5,321.0L288.5,311.0L288.5,308.0L287.5,307.0L289.0,306.5L294.0,311.5L307.0,320.5L325.0,329.5L327.0,329.5L340.0,334.5L349.0,335.5L350.0,336.5L354.0,336.5L355.0,337.5L362.0,337.5L363.0,338.5L373.0,338.5L374.0,339.5L399.0,338.5L403.5,336.0L403.5,333.0L401.5,330.0L401.5,328.0L398.5,322.0L396.5,320.0L393.5,314.0L393.5,312.0L391.5,310.0L390.5,307.0L388.5,305.0L387.5,302.0L381.5,293.0L374.5,285.0L374.5,284.0L353.0,262.5L352.0,262.5L346.0,256.5L338.0,250.5L327.0,244.5L325.0,242.5L320.0,240.5L318.0,238.5L311.0,235.5L309.0,233.5L305.0,232.5L295.5,227.0L310.0,226.5L311.0,225.5L324.0,224.5L325.0,223.5L329.0,223.5L330.0,222.5L336.0,221.5L337.0,220.5L342.0,219.5L345.0,217.5L347.0,217.5L367.0,205.5L382.5,190.0L391.5,177.0L401.5,156.0L401.5,153.0L404.5,146.0L404.5,142.0L406.5,137.0L407.5,120.0L408.5,119.0L408.5,110.0L404.0,107.5L372.0,107.5L371.0,108.5L366.0,108.5L365.0,109.5L361.0,109.5L360.0,110.5L356.0,110.5L355.0,111.5L344.0,113.5L343.0,114.5L335.0,116.5L332.0,118.5L330.0,118.5L311.0,128.5L308.0,131.5L301.0,135.5L291.0,144.5L290.5,141.0L289.5,140.0L289.5,127.0L288.5,126.0L287.5,117.0L286.5,116.0L286.5,113.0L284.5,109.0L283.5,103.0L281.5,100.0L281.5,98.0L277.5,90.0L277.5,88.0L274.5,84.0L270.5,75.0L256.5,54.0L252.5,50.0L240.5,34.0L236.0,29.5L235.0,29.5Z M212.5,236.0L214.0,235.5L217.0,239.5L223.0,243.5L230.5,246.0L230.0,277.5L224.5,273.0L224.5,272.0L216.5,264.0L212.5,258.0L212.5,256.0L211.5,255.0L211.5,250.0L210.5,249.0L211.5,239.0L212.5,237.0Z M255.5,236.0L256.0,235.5L257.5,237.0L258.5,251.0L257.5,252.0L257.5,256.0L251.5,266.0L241.0,276.5L239.5,276.0L239.5,273.0L238.5,272.0L238.5,247.0L242.0,244.5L244.0,244.5L248.0,242.5L255.0,236.5Z M189.5,312.0L190.0,311.5L192.5,314.0L192.5,315.0L202.5,327.0L202.5,333.0L201.5,334.0L200.5,346.0L198.5,351.0L198.5,355.0L197.5,356.0L196.5,363.0L195.5,364.0L191.5,377.0L189.0,377.5L179.0,371.5L172.0,369.5L167.0,366.5L155.0,363.5L153.5,362.0L159.0,358.5L176.5,340.0L185.5,324.0L189.0,312.5Z M278.5,312.0L280.5,312.0L281.5,318.0L286.5,328.0L286.5,330.0L288.5,332.0L293.5,341.0L308.0,356.5L315.5,362.0L315.0,363.5L312.0,363.5L311.0,364.5L300.0,367.5L295.0,370.5L293.0,370.5L281.0,376.5L279.0,378.5L277.5,377.0L277.5,374.0L275.5,371.0L275.5,369.0L272.5,362.0L271.5,354.0L270.5,353.0L270.5,350.0L268.5,345.0L266.5,327.0L278.5,313.0Z"
        />
      </svg>
      <div>
        <p
          class="text-[0.6rem] leading-none font-semibold tracking-[0.28em] whitespace-nowrap text-white/40 uppercase"
        >
          Dashboard
        </p>
        <p
          class="mt-1 text-[0.45rem] leading-none font-medium tracking-wider whitespace-nowrap text-white/25 uppercase"
        >
          Graines Digitales
        </p>
      </div>
    </div>
    <UButton
      type="button"
      icon="i-lucide-log-out"
      color="neutral"
      variant="ghost"
      size="xs"
      aria-label="Se déconnecter"
      class="text-white/40 hover:bg-white/10 hover:text-white"
      @click="emit('logout')"
    />
  </div>

  <div class="mx-5 h-0.5 shrink-0 bg-[#6B7A4A]/50" />

  <!-- Filtres : hors overflow pour permettre les dropdowns flottants -->
  <div class="relative z-10 shrink-0 px-5 pt-4">
    <!-- Recherche -->
    <div class="py-2.5">
      <input
        v-if="activeField === 'search'"
        type="text"
        class="w-full bg-transparent text-sm text-white caret-white outline-none placeholder:text-white/30"
        placeholder="Identifier..."
        :value="identifierSearch"
        aria-label="Recherche par identifier"
        @input="emit('update:identifierSearch', ($event.target as HTMLInputElement).value)"
        @blur="activeField = null"
        @keydown.escape="activeField = null"
      />
      <button
        v-else
        type="button"
        class="w-full text-left text-sm transition-colors hover:text-white/80"
        :class="identifierSearch ? 'text-white/75' : 'text-white/30'"
        aria-label="Recherche par identifier"
        @click="activeField = 'search'"
      >
        {{ identifierSearch || 'Identifier...' }}
      </button>
    </div>

    <div class="h-px" style="background-color: rgba(107, 122, 74, 0.35)" />

    <!-- Type d'offre -->
    <div class="relative py-2.5">
      <button
        type="button"
        class="flex w-full items-center justify-between text-left text-sm text-white/70 transition-colors hover:text-white/90"
        aria-label="Filtrer par type d'offre"
        @click="activeField = activeField === 'listing' ? null : 'listing'"
      >
        <span>{{ selectedListingLabel }}</span>
        <UIcon
          :name="activeField === 'listing' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="shrink-0 text-xs text-white/30"
          aria-hidden="true"
        />
      </button>
      <div
        v-if="activeField === 'listing'"
        class="absolute top-full right-0 left-0 z-20 space-y-0.5 py-1.5"
        style="
          background-color: #212121;
          border-top: 1px solid rgba(107, 122, 74, 0.35);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
        "
      >
        <button
          v-for="opt in listingOptions"
          :key="opt.value"
          type="button"
          class="flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors"
          :class="
            opt.value === selectedListing ? 'text-white' : 'text-white/40 hover:text-white/65'
          "
          @click="selectListing(opt.value)"
        >
          <span
            class="mt-px h-1.5 w-1.5 shrink-0 rounded-full"
            :style="
              opt.value === selectedListing
                ? 'background-color: #6B7A4A'
                : 'background-color: rgba(255,255,255,0.15)'
            "
          />
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="h-px" style="background-color: rgba(107, 122, 74, 0.35)" />

    <!-- Catégorie -->
    <div class="relative py-2.5">
      <button
        type="button"
        class="flex w-full items-center justify-between text-left text-sm text-white/70 transition-colors hover:text-white/90"
        aria-label="Filtrer par catégorie"
        @click="activeField = activeField === 'category' ? null : 'category'"
      >
        <span>{{ selectedCategoryLabel }}</span>
        <UIcon
          :name="activeField === 'category' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="shrink-0 text-xs text-white/30"
          aria-hidden="true"
        />
      </button>
      <div
        v-if="activeField === 'category'"
        class="absolute top-full right-0 left-0 z-20 space-y-0.5 py-1.5"
        style="
          background-color: #212121;
          border-top: 1px solid rgba(107, 122, 74, 0.35);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
        "
      >
        <button
          v-for="opt in categoryOptions"
          :key="opt.value"
          type="button"
          class="flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors"
          :class="
            opt.value === selectedCategory ? 'text-white' : 'text-white/40 hover:text-white/65'
          "
          @click="selectCategory(opt.value)"
        >
          <span
            class="mt-px h-1.5 w-1.5 shrink-0 rounded-full"
            :style="
              opt.value === selectedCategory
                ? 'background-color: #6B7A4A'
                : 'background-color: rgba(255,255,255,0.15)'
            "
          />
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>

  <!-- Compteur -->
  <div class="flex shrink-0 justify-end px-5 py-2">
    <span class="text-xs font-semibold text-white/60">
      {{ filteredCount }} bien{{ filteredCount > 1 ? 's' : '' }}
    </span>
  </div>

  <div class="mx-5 h-px shrink-0 bg-white/5" />

  <!-- Liste des biens : seule zone scrollable -->
  <div class="min-h-0 flex-1 overflow-y-auto">
    <ul v-if="filteredItems.length" class="space-y-0.5 px-5 py-2">
      <li v-for="(item, index) in filteredItems" :key="item.slug">
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
          :class="index === activeIndex ? 'bg-white/10' : ''"
          @click="emit('select', index)"
        >
          <span
            class="shrink-0 font-mono text-[0.6rem] leading-none"
            :class="index !== activeIndex ? 'text-white/35' : ''"
            :style="index === activeIndex ? 'color: #6B7A4A' : ''"
          >
            {{ item.identifier }}
          </span>
          <span class="min-w-0 truncate text-xs text-white/60">
            {{ item.preview.title }}
          </span>
        </button>
      </li>
    </ul>
  </div>

  <div class="mx-5 h-0.5 shrink-0 bg-[#6B7A4A]/50" />

  <div class="flex shrink-0 items-center gap-3 px-5 py-5">
    <div class="relative h-9 w-9 shrink-0">
      <img
        v-if="user?.picture"
        :src="user.picture"
        :alt="userName"
        class="h-full w-full rounded-full object-cover"
        referrerpolicy="no-referrer"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center rounded-full text-xs font-bold text-white"
        style="background-color: #6b7a4a"
      >
        {{ userInitials }}
      </div>
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm leading-tight font-semibold text-white">{{ userName }}</p>
      <p class="mt-0.5 truncate text-[0.7rem]" style="color: rgba(107, 122, 74, 0.7)">
        {{ user?.email }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

// 2. Types et constantes statiques
type WorkspaceUser = {
  id?: string
  name?: string
  email?: string
  picture?: string
} | null

type SelectOption = {
  label: string
  value: string
}

// 3. Props et emits
const props = defineProps<{
  user?: WorkspaceUser
  listingOptions: SelectOption[]
  categoryOptions: SelectOption[]
  selectedListing: string
  selectedCategory: string
  identifierSearch: string
  filteredCount: number
  activeIndex: number
  filteredItems: DashboardAccommodation[]
}>()

const emit = defineEmits<{
  refresh: []
  logout: []
  prev: []
  next: []
  select: [index: number]
  'update:selectedListing': [value: string]
  'update:selectedCategory': [value: string]
  'update:identifierSearch': [value: string]
}>()

// 4. Composables, stores, routeur

// 5. Etat local
const isTopbarOpen = ref(false)
const activeField = ref<'search' | 'listing' | 'category' | null>(null)

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready
const userName = computed<string>(
  () => props.user?.name ?? props.user?.email?.split('@')[0] ?? 'Utilisateur',
)

const userInitials = computed<string>(() => {
  const source = props.user?.name ?? props.user?.email ?? '?'
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
})

const stripCount = (label: string): string => label.replace(/\s*\(\d+\)$/, '').trim()

const selectedListingLabel = computed<string>(() => {
  const label =
    props.listingOptions.find((o) => o.value === props.selectedListing)?.label ?? 'Tous les types'
  return stripCount(label)
})

const selectedCategoryLabel = computed<string>(() => {
  const label =
    props.categoryOptions.find((o) => o.value === props.selectedCategory)?.label ??
    'Toutes les catégories'
  return stripCount(label)
})

// 9. Actions et handlers
const selectListing = (value: string): void => {
  emit('update:selectedListing', value)
  activeField.value = null
}

const selectCategory = (value: string): void => {
  emit('update:selectedCategory', value)
  activeField.value = null
}

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
