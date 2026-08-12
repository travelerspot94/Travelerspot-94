<template>
  <q-page class="home-page q-pa-md">
    <div class="page-wrap">
      <div class="full-width q-mb-xl text-center" style="max-width: 760px; margin: 0 auto">
        <h4 class="text-weight-bold q-mb-sm text-primary">TravelersPot AI 🌴</h4>
        <p class="text-subtitle1 text-grey-8 q-mb-lg">
          මචං, අද කොහෙද බයික් එකේ යන්නේ? AI එකෙන් අහන්න.
        </p>

        <div class="row q-col-gutter-md q-mb-md justify-center">
          <div class="col-12 col-sm-6">
            <q-input filled :model-value="dateDisplay" label="ගමන යන කාලය" readonly>
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="travelDate" range>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-select
              filled
              v-model="vehicleType"
              :options="['Bike', 'Car', 'Van', '4x4 SUV']"
              label="වාහනය"
            />
          </div>
        </div>

        <q-input
          rounded
          outlined
          v-model="searchQuery"
          placeholder="උදා: බයික් එකේ යන්න හොඳ දියඇල්ලක් කියන්න..."
          bg-color="white"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <q-btn
              round
              dense
              flat
              icon="send"
              color="primary"
              @click="handleSearch"
              :loading="loading"
            />
          </template>
        </q-input>

        <q-card v-if="aiResponse" class="q-mt-lg bg-light-blue-1 shadow-2 no-border" bordered>
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="smart_toy" color="primary" size="sm" class="q-mr-sm" />
              <div class="text-weight-bold">AI Travel Buddy කියන දේ:</div>
            </div>
            <div class="text-body1 text-left" style="white-space: pre-wrap">
              {{ aiResponse }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="row items-center q-mb-md">
        <q-icon name="trending_up" color="orange" size="md" class="q-mr-sm" />
        <div class="text-h5 text-weight-bold">මේ සතියේ Trending 🔥</div>
      </div>

      <div class="row q-col-gutter-lg">
        <div
          v-for="place in displayedTrendingPlaces"
          :key="place.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card
            class="trending-card full-height cursor-pointer"
            flat
            bordered
            @click="goToPlace(place.id)"
          >
            <q-img :src="place.image" height="190px">
              <div class="absolute-top-right q-ma-sm">
                <q-badge color="deep-orange" label="Trending" />
              </div>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">{{ place.name }}</div>
              <div class="text-caption text-grey-7">{{ place.district }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="full-width q-mt-xl text-center">
        <div class="text-h6 text-weight-bold q-mb-md">
          ලංකාවේ සිතියම 🗺️ - එක ක්ලික් එකකින් ගවේෂණය කරන්න
        </div>
        <q-img
          src="~assets/sri_lanka_cartoon_map.jpg"
          class="map-image rounded-borders shadow-5"
          fit="contain"
        />
      </div>

      <div class="full-width q-mt-xl">
        <div class="text-h6 text-weight-bold q-mb-md">දිස්ත්‍රික්ක අනුව ගවේෂණය 🔍</div>
        <div class="row q-col-gutter-sm">
          <div
            v-for="district in districtList"
            :key="district"
            class="col-6 col-sm-4 col-md-3 col-lg-2"
          >
            <q-btn
              unelevated
              dense
              class="full-width district-btn"
              :color="selectedDistrict === district ? 'primary' : 'blue-grey-1'"
              :text-color="selectedDistrict === district ? 'white' : 'grey-9'"
              :label="district"
              @click="filterByDistrict(district)"
            />
          </div>
        </div>
      </div>

      <q-inner-loading :showing="loading">
        <q-spinner-dots size="40px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = useRouter()
const loading = ref(false)
const selectedDistrict = ref(null)
const searchQuery = ref('')
const aiResponse = ref('')
const travelDate = ref({ from: '2026/04/03', to: '2026/04/05' })
const vehicleType = ref('Bike')

const trendingPlaces = ref([])

const dateDisplay = computed(() => {
  if (typeof travelDate.value === 'string') return travelDate.value
  if (!travelDate.value?.from || !travelDate.value?.to) return 'දිනය තෝරන්න'
  return `${travelDate.value.from} - ${travelDate.value.to}`
})

const displayedTrendingPlaces = computed(() => trendingPlaces.value.slice(0, 9))

const districtList = ref([
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
])

const fallbackTrendingPlaces = [
  {
    id: 'fb-1',
    name: 'Ella Rock',
    district: 'Badulla',
    image:
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-2',
    name: 'Galle Fort',
    district: 'Galle',
    image:
      'https://images.unsplash.com/photo-1586500036706-41963de24d8f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-3',
    name: 'Sigiriya',
    district: 'Matale',
    image:
      'https://images.unsplash.com/photo-1625138245278-6c84df81853f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-4',
    name: 'Nine Arches Bridge',
    district: 'Badulla',
    image:
      'https://images.unsplash.com/photo-1622445275576-721325763afe?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-5',
    name: 'Arugam Bay',
    district: 'Ampara',
    image:
      'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-6',
    name: 'Horton Plains',
    district: 'Nuwara Eliya',
    image:
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-7',
    name: 'Mirissa Beach',
    district: 'Matara',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-8',
    name: 'Yala National Park',
    district: 'Hambantota',
    image:
      'https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'fb-9',
    name: 'Jaffna Fort',
    district: 'Jaffna',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  },
]

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

const systemPrompt = `
You are TravelersPot AI, a friendly Sri Lankan travel buddy.
Your goal is to help users find travel routes.

RULES:
- Talk naturally in Sinhala-English (Spanglish) like: "Ado macho, Galle yannada hadanne? Elakiri!"
- No matter how the user talks, ALWAYS look for 'Origin' and 'Destination'.
- At the VERY END of your response, add a hidden data line like this: DATA:{"from": "Origin", "to": "Destination"}
- If you don't know a place, still try to guess or ask nicely.
`

const normalizeDateParam = (value) => {
  const clean = String(value || '').trim()
  if (!clean) return new Date().toISOString().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(clean)) return clean.replaceAll('/', '-')

  const parsed = new Date(clean)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

const getTripDate = () => {
  if (typeof travelDate.value === 'string') return normalizeDateParam(travelDate.value)
  return normalizeDateParam(travelDate.value?.from || travelDate.value?.to)
}

const callGemini = async (basePrompt, text) => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key')
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: basePrompt,
  })

  const result = await model.generateContent(text)
  return result.response.text().trim()
}

const fetchTrending = async () => {
  loading.value = true

  try {
    const { data, error } = await supabase.from('trending_places').select('*')
    if (error) throw error

    trendingPlaces.value = (data || []).map((place, index) => ({
      id: place.id ?? `db-${index}`,
      name: place.name || 'Unknown Place',
      district: place.district || 'Sri Lanka',
      image:
        place.image_url ||
        'https://images.unsplash.com/photo-1552423130-c58a7d309c77?q=80&w=1200&auto=format&fit=crop',
    }))

    if (!trendingPlaces.value.length) trendingPlaces.value = fallbackTrendingPlaces
  } catch (error) {
    console.error('Failed to load trending places:', error)
    trendingPlaces.value = fallbackTrendingPlaces
  } finally {
    loading.value = false
  }
}

const filterByDistrict = (districtName) => {
  selectedDistrict.value = selectedDistrict.value === districtName ? null : districtName
  router.push('/district/' + encodeURIComponent(districtName))
}

const goToPlace = (placeId) => {
  if (!placeId) return
  router.push('/place/' + placeId)
}

const handleSearch = async () => {
  if (!searchQuery.value?.trim()) return

  loading.value = true
  aiResponse.value = ''

  try {
    const fullResponse = await callGemini(systemPrompt, searchQuery.value)

    aiResponse.value = fullResponse.split('DATA:')[0].trim()

    const dataPart = fullResponse.split('DATA:')[1]
    if (dataPart) {
      try {
        const locations = JSON.parse(dataPart.trim())
        if (locations?.to) {
          await router.push({
            path: '/trip-results',
            query: {
              from: locations.from,
              to: locations.to,
              date: getTripDate(),
              vehicle: vehicleType.value || 'Bike',
            },
          })
          return
        }
      } catch {
        console.log("Data parsing failed, but it's okay.")
      }
    }

    if (!aiResponse.value) {
      aiResponse.value =
        'Macho, kohe idan kohetada yanna one kiyala thawa poddak pahadiliwa kiyanawada?'
    }
  } catch (error) {
    console.error('AI Error:', error)
    aiResponse.value =
      'Macho, kohe idan kohetada yanna one kiyala thawa poddak pahadiliwa kiyanawada?'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrending()
})
</script>

<style scoped>
.home-page {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.page-wrap {
  max-width: 1200px;
  margin: 0 auto;
}

.trending-card {
  border-radius: 14px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.trending-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.map-image {
  width: min(100%, 980px);
  margin: 0 auto;
  border: 1px solid #dbe2ea;
}

.district-btn {
  border-radius: 10px;
  min-height: 34px;
  font-weight: 600;
}
</style>
