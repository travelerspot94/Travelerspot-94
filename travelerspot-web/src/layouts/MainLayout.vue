<template>
  <q-layout view="lHh Lpr lFf">
    <q-scroll-observer @scroll="onScroll" />

    <q-header
      :class="isScrolled ? 'bg-white text-dark shadow-2' : 'bg-transparent text-white'"
      class="transition-header q-py-sm"
    >
      <q-toolbar>
        <!-- Logo -->
        <q-toolbar-title
          class="text-weight-bold q-ml-md"
          :class="isScrolled ? 'text-dark' : 'text-white'"
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
            :class="isScrolled ? 'text-dark' : 'text-white'"
            class="text-weight-medium q-mx-xs nav-btn"
          />
          <q-btn
            flat
            no-caps
            label="Destinations"
            to="/destinations"
            :class="isScrolled ? 'text-dark' : 'text-white'"
            class="text-weight-medium q-mx-xs nav-btn"
          />
          <q-btn
            flat
            no-caps
            label="Activities"
            to="/activities"
            :class="isScrolled ? 'text-dark' : 'text-white'"
            class="text-weight-medium q-mx-xs nav-btn"
          />
          <q-btn
            flat
            no-caps
            label="Tours"
            to="/tours"
            :class="isScrolled ? 'text-dark' : 'text-white'"
            class="text-weight-medium q-mx-xs nav-btn"
          />
          <q-btn
            flat
            no-caps
            label="Blog"
            to="/blog"
            :class="isScrolled ? 'text-dark' : 'text-white'"
            class="text-weight-medium q-mx-xs nav-btn"
          />
          <q-btn
            flat
            no-caps
            label="Contact"
            to="/contact"
            :class="isScrolled ? 'text-dark' : 'text-white'"
            class="text-weight-medium q-mx-xs nav-btn"
          />
        </div>

        <!-- Mobile Menu Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          :class="isScrolled ? 'text-dark' : 'text-white'"
          class="lt-md q-mr-sm"
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
  color: var(--q-primary);
}
</style>
