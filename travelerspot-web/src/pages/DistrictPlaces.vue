<template>
  <q-page class="district-page q-pa-md">
    <div class="page-wrap">
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" label="Back" @click="router.back()" />
      </div>

      <div class="q-mb-lg">
        <div class="text-h4 text-weight-bold">Places to visit in {{ districtName }}</div>
        <div class="text-subtitle2 text-grey-7">Explore top spots available in this district.</div>
      </div>

      <div v-if="places.length" class="row q-col-gutter-lg">
        <div v-for="place in places" :key="place.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="place-card full-height" flat bordered>
            <q-img :src="place.image" height="200px" />
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">{{ place.name }}</div>
              <div class="text-caption text-grey-7">{{ place.district }}</div>
              <div class="text-body2 text-grey-8 q-mt-sm ellipsis-2-lines">
                {{ place.description }}
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn unelevated color="primary" label="View Details" @click="goToPlace(place.id)" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <q-card v-else-if="!loading" class="empty-state" flat bordered>
        <q-card-section class="text-center q-pa-xl">
          <div class="text-h6 q-mb-sm">No places found yet</div>
          <div class="text-body2 text-grey-7">
            We do not have places listed for {{ districtName }} yet. Please check another district.
          </div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-dots size="42px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const places = ref([])

const districtName = computed(() => decodeURIComponent(String(route.params.name || '')))

const normalizePlace = (place, index) => ({
  id: place.id ?? `place-${index}`,
  name: place.name || 'Unknown Place',
  district: place.district || districtName.value,
  description: place.description || 'Description coming soon.',
  image:
    place.image_url ||
    place.photo_url ||
    'https://images.unsplash.com/photo-1552423130-c58a7d309c77?q=80&w=1200&auto=format&fit=crop',
})

const fetchPlacesByDistrict = async () => {
  if (!districtName.value) {
    places.value = []
    return
  }

  loading.value = true

  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('district', districtName.value)
      .order('name', { ascending: true })

    if (error) throw error

    places.value = (data || []).map((place, index) => normalizePlace(place, index))
  } catch (error) {
    console.error('Failed to fetch district places:', error)
    places.value = []
  } finally {
    loading.value = false
  }
}

const goToPlace = (placeId) => {
  if (!placeId) return
  router.push('/place/' + placeId)
}

watch(
  () => route.params.name,
  () => {
    fetchPlacesByDistrict()
  },
  { immediate: true },
)
</script>

<style scoped>
.district-page {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.page-wrap {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.place-card,
.empty-state {
  border-radius: 14px;
}

.place-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.place-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}
</style>
