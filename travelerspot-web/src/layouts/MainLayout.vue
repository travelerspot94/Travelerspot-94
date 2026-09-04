<template>
  <q-layout view="lHh Lpr lFf">
    <q-scroll-observer @scroll="onScroll" />

    <q-header
      :class="isScrolled ? 'bg-white text-dark shadow-2' : 'bg-transparent text-white'"
      class="transition-header q-py-sm fixed-top"
      style="z-index: 9999 !important;"
    >
      <q-toolbar>
        <!-- Logo -->
        <q-toolbar-title
          class="text-weight-bold q-ml-md transition-text"
          :class="isScrolled ? 'text-grey-9' : 'text-white'"
          style="font-size: 24px;"
        >
          TravelersPot
          <span v-if="!isScrolled">🌴</span>
          <span v-else>🌴</span>
        </q-toolbar-title>

        <q-space />

        <!-- Desktop Navigation Links -->
        <div class="gt-sm q-mr-md row items-center no-wrap">
          <q-btn
            flat
            no-caps
            label="Home"
            to="/"
            :text-color="isScrolled ? 'grey-9' : 'white'"
            class="text-weight-medium q-mx-xs nav-btn transition-text"
          />
          <q-btn
            flat
            no-caps
            label="Destinations"
            to="/destinations"
            :text-color="isScrolled ? 'grey-9' : 'white'"
            class="text-weight-medium q-mx-xs nav-btn transition-text"
          />
          <q-btn
            flat
            no-caps
            label="Activities"
            to="/activities"
            :text-color="isScrolled ? 'grey-9' : 'white'"
            class="text-weight-medium q-mx-xs nav-btn transition-text"
          />
          <q-btn
            flat
            no-caps
            label="Tours"
            to="/tours"
            :text-color="isScrolled ? 'grey-9' : 'white'"
            class="text-weight-medium q-mx-xs nav-btn transition-text"
          />
          <q-btn
            flat
            no-caps
            label="Blog"
            to="/blog"
            :text-color="isScrolled ? 'grey-9' : 'white'"
            class="text-weight-medium q-mx-xs nav-btn transition-text"
          />
          <q-btn
            flat
            no-caps
            label="Contact"
            to="/contact"
            :text-color="isScrolled ? 'grey-9' : 'white'"
            class="text-weight-medium q-mx-xs nav-btn transition-text"
          />
        </div>

        <!-- Mobile Menu Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          :text-color="isScrolled ? 'grey-9' : 'white'"
          class="lt-md q-mr-sm transition-text"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <!-- Mobile Drawer -->
    <q-drawer v-model="leftDrawerOpen" side="right" bordered class="bg-white">
      <q-list class="q-pt-md">
        <q-item clickable v-ripple to="/">
          <q-item-section class="text-weight-medium">Home</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/destinations">
          <q-item-section class="text-weight-medium">Destinations</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/activities">
          <q-item-section class="text-weight-medium">Activities</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/tours">
          <q-item-section class="text-weight-medium">Tours</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/blog">
          <q-item-section class="text-weight-medium">Blog</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/contact">
          <q-item-section class="text-weight-medium">Contact</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
const isScrolled = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onScroll(info) {
  isScrolled.value = info.position.top > 50
}
</script>

<style lang="scss">
.transition-header {
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.nav-btn {
  font-size: 16px;
  border-radius: 8px;
  transition: color 0.3s ease, background-color 0.3s ease;
}
.nav-btn:hover {
  background: rgba(0, 156, 166, 0.1);
  color: var(--q-primary) !important;
}

.transition-text {
  transition: color 0.3s ease;
}
</style>
