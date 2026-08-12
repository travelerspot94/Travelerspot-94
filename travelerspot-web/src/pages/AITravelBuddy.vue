<template>
  <q-page class="ai-page q-pa-md">
    <div class="page-wrap">
      <q-card class="control-card q-mb-md" flat bordered>
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-sm">AI Travel Buddy</div>
          <div class="text-subtitle2 text-grey-7 q-mb-md">
            Plan routes, weather-aware travel, and smart stop recommendations.
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="origin" outlined label="Origin (e.g., Aluthgama)" />
            </div>

            <div class="col-12 col-md-4">
              <q-input v-model="destination" outlined label="Destination (e.g., Nuwara Eliya)" />
            </div>

            <div class="col-12 col-md-4">
              <q-input filled :model-value="travelDate" label="Travel Date" readonly>
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="travelDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="vehicleType"
                outlined
                :options="vehicleOptions"
                label="Vehicle Type"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="chat-card" flat bordered>
        <q-card-section class="chat-window">
          <div v-for="(message, index) in messages" :key="index" class="q-mb-sm">
            <div :class="message.role === 'user' ? 'bubble bubble-user' : 'bubble bubble-ai'">
              <div class="text-caption text-grey-6 q-mb-xs">
                {{ message.role === 'user' ? 'You' : 'AI Buddy' }}
              </div>
              <div style="white-space: pre-wrap">{{ message.text }}</div>
            </div>
          </div>

          <div v-if="loading" class="text-grey-7 text-caption q-mt-sm">
            Thinking about your route...
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions class="q-pa-md">
          <q-input
            v-model="chatInput"
            outlined
            dense
            class="col"
            placeholder="Ask anything about your trip..."
            @keyup.enter="sendMessage"
          />
          <q-btn
            class="q-ml-sm"
            unelevated
            color="primary"
            label="Send"
            :loading="loading"
            @click="sendMessage"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from 'src/boot/supabase'

const vehicleOptions = ['TukTuk', 'Car', 'Bike', 'Van', '4x4']

const origin = ref('Aluthgama')
const destination = ref('Nuwara Eliya')
const travelDate = ref(new Date().toISOString().slice(0, 10))
const vehicleType = ref('Car')
const chatInput = ref('')
const loading = ref(false)

const messages = ref([
  {
    role: 'assistant',
    text: 'Ado machan, route eka kiyapan. Mama weather, road condition, tea/food/stay stops okkoma balala plan ekak denna.',
  },
])

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

const getRouteData = async () => {
  if (!origin.value || !destination.value || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return null
  }

  const url =
    `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin.value)}` +
    `&destination=${encodeURIComponent(destination.value)}` +
    `&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`

  const response = await fetch(url)
  const data = await response.json()

  const firstRoute = data?.routes?.[0]
  const firstLeg = firstRoute?.legs?.[0]

  if (!firstRoute || !firstLeg) return null

  return {
    summary: firstRoute.summary || 'Best available route',
    distance: firstLeg.distance?.text || 'N/A',
    duration: firstLeg.duration?.text || 'N/A',
    startAddress: firstLeg.start_address || origin.value,
    endAddress: firstLeg.end_address || destination.value,
  }
}

const getWeatherData = async () => {
  if (!destination.value || !import.meta.env.VITE_OPENWEATHER_API_KEY) return null

  const geoRes = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination.value)},LK&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`,
  )
  const geoData = await geoRes.json()
  const point = geoData?.[0]
  if (!point) return null

  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${point.lat}&lon=${point.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`,
  )
  const forecastData = await forecastRes.json()

  const targetDate = travelDate.value
  const candidate = (forecastData?.list || []).find((item) => item.dt_txt?.startsWith(targetDate))
  const weather = candidate || forecastData?.list?.[0]
  if (!weather) return null

  return {
    description: weather.weather?.[0]?.description || 'Unknown',
    tempC: weather.main?.temp,
    humidity: weather.main?.humidity,
    wind: weather.wind?.speed,
  }
}

const getDatabaseRecommendations = async () => {
  const [{ data: placesData }, { data: reviewsData }] = await Promise.all([
    supabase.from('places').select('id,name,district,category,description').limit(200),
    supabase.from('reviews').select('place_id,rating').limit(1000),
  ])

  const places = placesData || []
  const reviews = reviewsData || []

  const ratingsByPlace = new Map()
  for (const review of reviews) {
    if (!ratingsByPlace.has(review.place_id)) {
      ratingsByPlace.set(review.place_id, { sum: 0, count: 0 })
    }
    const entry = ratingsByPlace.get(review.place_id)
    entry.sum += Number(review.rating || 0)
    entry.count += 1
  }

  const withScore = places.map((place) => {
    const stats = ratingsByPlace.get(place.id)
    const avg = stats && stats.count ? stats.sum / stats.count : 0
    return { ...place, avgRating: avg, reviewCount: stats?.count || 0 }
  })

  const byCategory = (keywords) =>
    withScore
      .filter((place) => keywords.some((key) => (place.category || '').toLowerCase().includes(key)))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5)

  const teaRest = byCategory(['tea', 'rest', 'cafe'])
  const food = byCategory(['food', 'restaurant', 'eat'])
  const stay = byCategory(['hotel', 'guest', 'stay', 'villa'])

  return { teaRest, food, stay }
}

const buildSystemPrompt = (context) => {
  return `
You are TravelersPot AI, a smart Sri Lankan travel planner.

Rules:
1) Analyze best route with road name hints and explain practical path.
2) Mention expected weather for selected travel date and likely road conditions for selected vehicle.
3) Recommend stops in three groups:
   - Tea/Rest stops
   - Food places (from database)
   - Stay options (from database)
4) Use friendly Sri Lankan buddy tone (e.g., "Ado machan", "Gihin balapan").
5) If data is missing, clearly mention assumptions and safe alternatives.

Trip Context:
- Origin: ${origin.value}
- Destination: ${destination.value}
- Travel Date: ${travelDate.value}
- Vehicle: ${vehicleType.value}

Route Data:
${JSON.stringify(context.route, null, 2)}

Weather Data:
${JSON.stringify(context.weather, null, 2)}

Database Recommendations (from places + reviews):
${JSON.stringify(context.recommendations, null, 2)}
  `.trim()
}

const sendMessage = async () => {
  const userText = chatInput.value.trim()
  if (!userText || loading.value) return

  messages.value.push({ role: 'user', text: userText })
  chatInput.value = ''

  loading.value = true
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key')
    }

    const [route, weather, recommendations] = await Promise.all([
      getRouteData().catch(() => null),
      getWeatherData().catch(() => null),
      getDatabaseRecommendations().catch(() => ({ teaRest: [], food: [], stay: [] })),
    ])

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: buildSystemPrompt({ route, weather, recommendations }),
    })

    const result = await model.generateContent(userText)
    const reply = result.response.text()

    messages.value.push({ role: 'assistant', text: reply })
  } catch (error) {
    console.error('AI buddy error:', error)
    messages.value.push({
      role: 'assistant',
      text: 'Ado machan, podi awulak giya. API keys tikak check karala aye try කරමු.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ai-page {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.page-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

.control-card,
.chat-card {
  border-radius: 14px;
}

.chat-window {
  min-height: 420px;
  max-height: 56vh;
  overflow-y: auto;
}

.bubble {
  max-width: min(90%, 760px);
  padding: 12px 14px;
  border-radius: 14px;
}

.bubble-user {
  margin-left: auto;
  background: #dcfce7;
}

.bubble-ai {
  margin-right: auto;
  background: #f1f5f9;
}
</style>
