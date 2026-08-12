<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold"> TravelersPot 🌴 </q-toolbar-title>

        <div>v1.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Main Menu </q-item-label>

        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="explore" />
          </q-item-section>
          <q-item-section> Explore Places </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/ai-travel-buddy">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section> AI Travel Buddy </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/add-place" class="bg-green-1 text-green-10">
          <q-item-section avatar>
            <q-icon name="add_location_alt" color="green-9" />
          </q-item-section>
          <q-item-section class="text-weight-bold"> අලුත් තැනක් ඇඩ් කරන්න ➕ </q-item-section>
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

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="scss">
.q-toolbar__title {
  font-size: 20px;
}
</style>
