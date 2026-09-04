<template>
  <q-page class="home-page">
    <!-- Hero Section -->
    <div class="hero-section flex flex-center relative-position">
      <div class="hero-overlay absolute-full"></div>

      <div class="hero-content text-center q-px-md z-top">
        <h1 class="text-white text-weight-bolder hero-title q-mb-md">
          DISCOVER THE WONDERS OF SRI LANKA
        </h1>
        <p class="text-white text-h6 q-mb-xl" style="opacity: 0.9;">
          Find your perfect getaway and explore the beautiful paradise.
        </p>

        <!-- Advanced Smart Trip Planner -->
        <AdvancedTripPlanner />

        <!-- Quick Filters -->
        <div class="quick-filters q-mt-md text-white row justify-center q-gutter-x-md">
          <span class="text-weight-medium">Popular:</span>
          <a href="#" class="text-white filter-link">Beaches</a>
          <a href="#" class="text-white filter-link">Cultural</a>
          <a href="#" class="text-white filter-link">Nature</a>
          <a href="#" class="text-white filter-link">Mountains</a>
        </div>
      </div>
    </div>

    <!-- Trending Destinations Section -->
    <div class="section-container q-py-xl q-px-md">
      <div class="text-center q-mb-xl">
        <h4 class="text-weight-bold text-dark q-mb-sm section-title">TRENDING DESTINATIONS</h4>
        <p class="text-grey-7 text-subtitle1">Explore the most loved spots by our travelers this week.</p>
      </div>

      <div class="row q-col-gutter-lg">
        <div
          v-for="place in displayedTrendingPlaces"
          :key="place.id"
          class="col-12 col-sm-6 col-md-3"
        >
          <q-card class="destination-card cursor-pointer" flat @click="goToPlace(place.id)">
            <div class="image-wrapper relative-position">
              <q-img :src="place.image" height="240px" class="card-img" />
              <q-btn
                round
                color="white"
                text-color="red"
                icon="favorite_border"
                class="absolute-top-right q-ma-sm heart-btn shadow-3"
                size="sm"
                unelevated
                @click.stop="toggleLike(place)"
              />
            </div>

            <q-card-section class="q-pt-md">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-h6 text-weight-bold ellipsis text-dark" style="max-width: 70%;">{{ place.name }}</div>
                <div class="row items-center">
                  <q-icon name="star" color="warning" size="xs" />
                  <q-icon name="star" color="warning" size="xs" />
                  <q-icon name="star" color="warning" size="xs" />
                  <q-icon name="star" color="warning" size="xs" />
                  <q-icon name="star" color="warning" size="xs" />
                </div>
              </div>

              <div class="text-caption text-uppercase text-primary text-weight-bold q-mb-md">
                {{ place.district }} - Cultural Heritage
              </div>

              <q-btn
                outline
                color="primary"
                label="Learn More"
                rounded
                no-caps
                class="learn-more-btn text-weight-medium"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdvancedTripPlanner from '../components/AdvancedTripPlanner.vue'

const router = useRouter()
const trendingPlaces = ref([])

const displayedTrendingPlaces = computed(() => trendingPlaces.value.slice(0, 4))

const fallbackTrendingPlaces = [
  {
    id: 'fb-3',
    name: 'Sigiriya Rock Fortress',
    district: 'Matale',
    image: 'https://images.unsplash.com/photo-1625138245278-6c84df81853f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-4',
    name: 'Nine Arches Bridge',
    district: 'Badulla',
    image: 'https://images.unsplash.com/photo-1622445275576-721325763afe?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-7',
    name: 'Mirissa Beach',
    district: 'Matara',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-6',
    name: 'Horton Plains',
    district: 'Nuwara Eliya',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop',
  }
]

const loadTrending = () => {
  trendingPlaces.value = fallbackTrendingPlaces
}

const toggleLike = (place) => {
  console.log('Toggled like for', place.name)
}

const goToPlace = (placeId) => {
  if (!placeId) return
  router.push('/place/' + placeId)
}

onMounted(() => {
  loadTrending()
})
</script>

<style scoped lang="scss">
.home-page {
  background-color: #f8fafc;
}

.hero-section {
  min-height: 75vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('/hero-bg.jpg.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  margin-top: -64px; /* Pull up to go under transparent header */
  padding-top: 64px;
}

.hero-overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
}

.hero-content {
  width: 100%;
  max-width: 1000px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.search-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  max-width: 900px;
  margin: 0 auto;
}

.search-input :deep(.q-field__control) {
  border-radius: 10px;
}

.search-btn {
  border-radius: 10px;
  height: 40px;
  font-size: 16px;
}

.filter-link {
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.filter-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  letter-spacing: 1px;
}

.destination-card {
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.destination-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 156, 166, 0.1);
}

.card-img {
  border-radius: 20px 20px 0 0;
}

.heart-btn {
  backdrop-filter: blur(4px);
  background: rgba(255,255,255,0.9) !important;
  transition: transform 0.2s;
}
.heart-btn:hover {
  transform: scale(1.1);
}

.learn-more-btn {
  padding: 4px 20px;
}
</style>
