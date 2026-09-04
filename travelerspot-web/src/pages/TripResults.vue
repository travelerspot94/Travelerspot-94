<template>
  <q-page class="trip-results-page q-pa-md">
    <div class="page-wrap">
      <q-card class="hero-card q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-start q-col-gutter-md">
            <div class="col-12 col-md-8">
              <div class="text-overline text-primary">TravelersPot AI Trip Results</div>
              <div class="text-h4 text-weight-bold q-mb-sm">{{ fromLabel }} to {{ toLabel }}</div>
              <div class="row items-center q-gutter-sm text-grey-8">
                <q-chip dense color="green-1" text-color="green-10" icon="event">{{ travelDate }} to {{ endDate }}</q-chip>
                <q-chip dense color="indigo-1" text-color="indigo-10" icon="nightlight_round">{{ tripDurationText }}</q-chip>
                <q-chip dense color="blue-1" text-color="blue-10" icon="directions_car">{{
                  vehicle
                }}</q-chip>
                <q-chip
                  v-for="style in travelStyle"
                  :key="style"
                  dense
                  color="orange-1"
                  text-color="orange-10"
                  icon="stars"
                >
                  {{ style }}
                </q-chip>
              </div>
            </div>

            <div class="col-12 col-md-4">
              <q-list bordered class="summary-list rounded-borders">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="route" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption">Estimated Distance</q-item-label>
                    <q-item-label class="text-weight-medium">{{
                      estimatedDistance
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="schedule" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption">Estimated Time</q-item-label>
                    <q-item-label class="text-weight-medium">{{
                      estimatedTime
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="alt_route" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption">Main Route</q-item-label>
                    <q-item-label class="text-weight-medium">{{ routeSummary.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="section-card q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">1) Route Summary</div>
          <p class="text-body1 text-grey-9 q-mb-md">
            You are planning a {{ tripDurationText }} trip from <strong>{{ fromLabel }}</strong> to <strong>{{ toLabel }}</strong> traveling by {{ vehicle }}. Here are your routing options:
          </p>
          
          <q-list v-if="availableRoutes.length > 0" bordered class="rounded-borders q-mb-md" separator>
            <q-item v-for="(route, idx) in availableRoutes" :key="idx" :class="idx === 0 ? 'bg-blue-1' : ''">
              <q-item-section avatar>
                <q-icon :name="idx === 0 ? 'star' : 'alt_route'" :color="idx === 0 ? 'primary' : 'grey-7'" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  Route {{ idx + 1 }} {{ idx === 0 ? '(Fastest)' : '(Alternative)' }}
                </q-item-label>
                <q-item-label caption>Via {{ route.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-weight-medium text-dark">{{ route.distance }}</div>
                <div class="text-caption text-grey-8">{{ route.duration }}</div>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div v-else-if="estimatedDistance !== 'Calculating...'" class="text-grey-7 q-mb-md">
            No alternative routes found.
          </div>
          
          <div v-if="vehicle.toLowerCase().includes('public')" class="text-orange-9 text-caption q-mb-md">
            * Using road routes for public transport estimate. Actual transit times may vary.
          </div>

          <div ref="routeMapEl" class="map-block q-mb-md"></div>
          <div v-if="routeError" class="text-negative text-body2">{{ routeError }}</div>
        </q-card-section>
      </q-card>

      <q-card class="section-card q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">2) Current Conditions</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-card flat bordered class="inner-card full-height">
                <q-card-section>
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <q-icon name="cloud" color="blue-7" />
                    <div class="text-subtitle1 text-weight-medium">Live Weather</div>
                  </div>

                  <div v-if="weather">
                    <div class="text-body1 text-capitalize">{{ weather.description }}</div>
                    <div class="text-h5 text-weight-bold q-mt-sm">{{ weather.temp }}°C</div>
                    <div class="text-body2 text-grey-8">
                      Feels like {{ weather.feelsLike }}°C, Humidity {{ weather.humidity }}%, Wind
                      {{ weather.wind }} m/s
                    </div>
                  </div>
                  <div v-else class="text-body2 text-grey-7">
                    Weather data is not available right now.
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-7">
              <q-card flat bordered class="inner-card full-height">
                <q-card-section>
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <q-icon name="warning" color="orange-8" />
                    <div class="text-subtitle1 text-weight-medium">Road Condition Alerts</div>
                  </div>
                  <q-list separator>
                    <q-item v-for="(alert, idx) in roadAlerts" :key="idx">
                      <q-item-section avatar>
                        <q-icon :name="alert.icon" :color="alert.color" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ alert.title }}</q-item-label>
                        <q-item-label caption>{{ alert.text }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="section-card q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">
            3 & 4) Stops Along The Way + Community Insights
          </div>
          <q-timeline color="primary" layout="comfortable">
            <q-timeline-entry
              v-for="stop in itineraryStops"
              :key="stop.id"
              :title="stop.name"
              :subtitle="stop.categoryLabel"
              :icon="stop.icon"
            >
              <q-card flat bordered class="stop-card">
                <q-card-section>
                  <div class="text-body2 text-grey-8 q-mb-sm">{{ stop.description }}</div>
                  <div class="row q-col-gutter-sm q-mb-sm">
                    <div class="col-auto">
                      <q-chip dense color="amber-1" text-color="amber-10" icon="star">
                        {{ stop.avgRating.toFixed(1) }} ({{ stop.reviewCount }} reviews)
                      </q-chip>
                    </div>
                    <div class="col-auto" v-if="stop.district">
                      <q-chip dense color="blue-grey-1" text-color="blue-grey-9" icon="location_on">
                        {{ stop.district }}
                      </q-chip>
                    </div>
                  </div>

                  <div v-if="stop.photos.length" class="row q-col-gutter-sm q-mb-sm">
                    <div
                      v-for="(photo, photoIndex) in stop.photos"
                      :key="photoIndex"
                      class="col-6 col-sm-4"
                    >
                      <q-img :src="photo" height="96px" class="rounded-borders" />
                    </div>
                  </div>

                  <div v-if="stop.reviews.length" class="column q-gutter-xs">
                    <div
                      v-for="review in stop.reviews"
                      :key="review.id"
                      class="text-caption review-pill"
                    >
                      "{{ review.comment }}"
                    </div>
                  </div>
                  <div v-else class="text-caption text-grey-7">
                    No community reviews yet for this stop.
                  </div>
                </q-card-section>
              </q-card>
            </q-timeline-entry>
          </q-timeline>

          <q-card v-if="!itineraryStops.length && !pageLoading" flat bordered class="q-mt-md">
            <q-card-section class="text-grey-7">
              No matching tea shops, restaurants, or fuel stations were found in the current
              database.
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <q-card class="section-card q-mb-xl" flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">5) Interactive Map</div>
          <div ref="stopsMapEl" class="map-block"></div>
          <div class="text-caption text-grey-7 q-mt-sm">
            Pins show tea shops, restaurants, and fuel stations that were selected for this trip.
          </div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="pageLoading">
        <q-spinner-dots color="primary" size="44px" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'src/boot/supabase'

const route = useRoute()

const pageLoading = ref(false)
const routeMapEl = ref(null)
const stopsMapEl = ref(null)
const routeError = ref('')

const estimatedDistance = ref('Calculating...')
const estimatedTime = ref('Calculating...')
const availableRoutes = ref([])

const routeSummary = ref({
  name: 'Best available route',
})

const weather = ref(null)
const itineraryStops = ref([])

let routeMap = null
let stopsMap = null
let leafletPromise = null

const fromLabel = computed(() => {
  const raw = route.query.startingPoint || route.query.from || 'Origin'
  return decodeURIComponent(String(raw)).split(',')[0].trim()
})
const toLabel = computed(() => {
  const raw = route.query.destination || route.query.to || 'Destination'
  return decodeURIComponent(String(raw)).split(',')[0].trim()
})
const travelDate = computed(() => normalizeDate(String(route.query.startDate || route.query.date || '')))
const endDate = computed(() => normalizeDate(String(route.query.endDate || '')))
const tripDurationText = computed(() => {
  if (!travelDate.value || !endDate.value) return '1 Day, 0 Nights'
  const start = new Date(travelDate.value)
  const end = new Date(endDate.value)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const days = diffDays > 0 ? diffDays : 1
  const nights = Math.max(0, days - 1)
  return `${days} Day${days !== 1 ? 's' : ''}, ${nights} Night${nights !== 1 ? 's' : ''}`
})
const vehicle = computed(() => String(route.query.vehicleType || route.query.vehicle || 'Car'))
const travelStyle = computed(() => {
  const styles = route.query.travelStyle
  return styles ? String(styles).split(',') : []
})

const roadAlerts = computed(() => {
  const base = [
    {
      icon: 'construction',
      color: 'orange',
      title: 'General advisory',
      text: 'Expect occasional diversions near major city entries and highway interchanges.',
    },
  ]

  if (!weather.value) {
    return [
      ...base,
      {
        icon: 'info',
        color: 'blue',
        title: `${vehicle.value} travel tip`,
        text: 'Weather data unavailable. Ride defensively and check local updates before departure.',
      },
    ]
  }

  const conditionText = String(weather.value.description || '').toLowerCase()
  const rainy = conditionText.includes('rain') || conditionText.includes('drizzle')
  const windy = Number(weather.value.wind || 0) >= 9

  if (rainy) {
    base.push({
      icon: 'water_drop',
      color: 'blue',
      title: 'Wet surface risk',
      text: 'Rain expected on the route. Increase braking distance and reduce cornering speed.',
    })
  }

  if (vehicle.value.toLowerCase().includes('bike') && rainy) {
    base.push({
      icon: 'two_wheeler',
      color: 'deep-orange',
      title: 'Bike caution',
      text: 'Use rain gear and avoid sudden throttle changes on painted lane markings.',
    })
  }

  if (vehicle.value.toLowerCase().includes('4x4') && rainy) {
    base.push({
      icon: 'terrain',
      color: 'green',
      title: '4x4 guidance',
      text: 'Use 4H only on slippery climbs. Keep tire pressure balanced for mixed road conditions.',
    })
  }

  if (windy) {
    base.push({
      icon: 'air',
      color: 'purple',
      title: 'Crosswind alert',
      text: 'Strong side winds are expected. Keep a steady line, especially on open bridges.',
    })
  }

  if (!rainy && !windy) {
    base.push({
      icon: 'check_circle',
      color: 'green',
      title: 'Road conditions look stable',
      text: 'No severe weather signals found for your selected travel window.',
    })
  }

  return base
})

const normalizeDate = (value) => {
  const clean = value.trim()
  if (!clean) return new Date().toISOString().slice(0, 10)

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(clean)) return clean.replaceAll('/', '-')

  const parsed = new Date(clean)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return new Date().toISOString().slice(0, 10)
}

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('Leaflet failed to load'))
    document.head.appendChild(script)
  })

  return leafletPromise
}

const buildDirectionsRoute = async () => {
  routeError.value = ''

  estimatedDistance.value = 'Calculating...'
  estimatedTime.value = 'Calculating...'
  availableRoutes.value = []

  try {
    const cleanFrom = fromLabel.value.split(',')[0].trim()
    const cleanTo = toLabel.value.split(',')[0].trim()

    const nominatimOpts = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TravelerspotApp/1.0'
      }
    }

    const [fromRes, toRes] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanFrom)}&countrycodes=lk`, nominatimOpts).then(r => r.json()),
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanTo)}&countrycodes=lk`, nominatimOpts).then(r => r.json())
    ])

    if (!fromRes || fromRes.length === 0 || !toRes || toRes.length === 0) {
      throw new Error('Location not found. Ensure valid city names.')
    }

    const fromCoords = { lat: fromRes[0].lat, lon: fromRes[0].lon }
    const toCoords = { lat: toRes[0].lat, lon: toRes[0].lon }

    let osrmProfile = 'driving'
    const vType = vehicle.value.toLowerCase()
    if (vType.includes('bike') || vType.includes('cycle')) {
      osrmProfile = 'bike'
    } else if (vType.includes('walk') || vType.includes('foot')) {
      osrmProfile = 'foot'
    }

    const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/${osrmProfile}/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`)
    if (!osrmRes.ok) {
      throw new Error(`OSRM API responded with status: ${osrmRes.status}`)
    }
    
    const osrmData = await osrmRes.json()

    if (osrmData.code !== 'Ok' || !osrmData.routes || osrmData.routes.length === 0) {
      throw new Error('Could not calculate a route between the locations.')
    }

    const parsedRoutes = osrmData.routes.map(r => {
      const dist = (r.distance / 1000).toFixed(1)
      const durationMins = Math.round(r.duration / 60)
      const h = Math.floor(durationMins / 60)
      const m = durationMins % 60
      const durText = h > 0 ? `${h} hr ${m} min` : `${m} min`

      let rName = r.legs?.[0]?.summary || ''
      if (!rName && r.legs?.[0]?.steps) {
        const roadDistances = {}
        let maxD = 0
        r.legs[0].steps.forEach(step => {
          const n = step.ref || step.name
          if (n) {
            roadDistances[n] = (roadDistances[n] || 0) + step.distance
            if (roadDistances[n] > maxD) {
              maxD = roadDistances[n]
              rName = n
            }
          }
        })
      }

      return {
        name: rName || 'Available Route',
        distance: `${dist} km`,
        duration: durText,
        geometry: r.geometry
      }
    })

    availableRoutes.value = parsedRoutes

    estimatedDistance.value = parsedRoutes[0].distance
    estimatedTime.value = parsedRoutes[0].duration
    routeSummary.value.name = parsedRoutes[0].name
  } catch (err) {
    console.error('API Fetch Failed:', err)
    estimatedDistance.value = 'Unavailable'
    estimatedTime.value = 'Unavailable'
    routeSummary.value.name = 'Error fetching route'
    availableRoutes.value = []
    routeError.value = 'Failed to load accurate distance. The map will still display basic routing.'
  }

  try {
    if (availableRoutes.value.length === 0 || !availableRoutes.value[0].geometry) return
    const mainGeoJSON = availableRoutes.value[0].geometry

    const L = await loadLeaflet()
    await nextTick()

    if (!routeMapEl.value) return

    if (routeMap) {
      routeMap.remove()
    }

    routeMap = L.map(routeMapEl.value).setView([7.8731, 80.7718], 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap)

    const routeLayer = L.geoJSON(mainGeoJSON, {
      style: { color: '#0066ff', weight: 5, opacity: 0.8 }
    }).addTo(routeMap)

    const startPoint = mainGeoJSON.coordinates[0]
    const endPoint = mainGeoJSON.coordinates[mainGeoJSON.coordinates.length - 1]
    
    L.marker([startPoint[1], startPoint[0]]).addTo(routeMap).bindPopup('<strong>Start</strong>')
    L.marker([endPoint[1], endPoint[0]]).addTo(routeMap).bindPopup('<strong>Destination</strong>')

    routeMap.fitBounds(routeLayer.getBounds(), { padding: [30, 30] })
  } catch (e) {
    console.error('Leaflet routing fallback failed', e)
  }
}

const loadWeather = async () => {
  if (!import.meta.env.VITE_OPENWEATHER_API_KEY) {
    weather.value = null
    return
  }

  const geoRes = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(toLabel.value)},LK&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`,
  )
  const geoData = await geoRes.json()
  const point = geoData?.[0]

  if (!point) {
    weather.value = null
    return
  }

  const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`,
  )
  const payload = await weatherRes.json()

  if (!payload?.weather?.length) {
    weather.value = null
    return
  }

  weather.value = {
    description: payload.weather[0].description,
    temp: Number(payload.main?.temp || 0).toFixed(1),
    feelsLike: Number(payload.main?.feels_like || 0).toFixed(1),
    humidity: payload.main?.humidity || 0,
    wind: Number(payload.wind?.speed || 0).toFixed(1),
  }
}

const getCoords = (record) => {
  const lat = Number(record?.lat ?? record?.latitude)
  const lng = Number(record?.lng ?? record?.longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

const getCategoryLabel = (text) => {
  const value = (text || '').toLowerCase()
  if (value.includes('fuel') || value.includes('petrol') || value.includes('gas'))
    return 'Fuel Station'
  if (value.includes('tea') || value.includes('cafe') || value.includes('coffee')) return 'Tea Shop'
  return 'Restaurant'
}

const getCategoryIcon = (categoryLabel) => {
  if (categoryLabel === 'Fuel Station') return 'local_gas_station'
  if (categoryLabel === 'Tea Shop') return 'local_cafe'
  return 'restaurant'
}

const selectStops = async () => {
  try {
    const { data: placesData, error: placesError } = await supabase
      .from('places')
      .select('*')
      .limit(400)

    if (placesError) throw placesError

    const places = placesData || []

    const filtered = places.filter((item) => {
      const label = `${item.category || ''} ${item.name || ''}`.toLowerCase()
      return (
        label.includes('tea') ||
        label.includes('cafe') ||
        label.includes('restaurant') ||
        label.includes('food') ||
        label.includes('fuel') ||
        label.includes('petrol') ||
        label.includes('gas')
      )
    })

    const placeIds = filtered.map((item) => item.id).filter(Boolean)

    let reviewsData = []
    if (placeIds.length) {
      const { data: reviewRows, error: reviewError } = await supabase
        .from('reviews')
        .select('id,place_id,rating,comment,photo_url,image_url,created_at')
        .in('place_id', placeIds)
        .order('created_at', { ascending: false })

      if (reviewError) throw reviewError
      reviewsData = reviewRows || []
    }

    const reviewsByPlace = new Map()
    for (const review of reviewsData) {
      if (!reviewsByPlace.has(review.place_id)) {
        reviewsByPlace.set(review.place_id, [])
      }
      reviewsByPlace.get(review.place_id).push(review)
    }

    const scored = filtered.map((item) => {
      const reviews = reviewsByPlace.get(item.id) || []
      const avgRating = reviews.length
        ? reviews.reduce((sum, row) => sum + Number(row.rating || 0), 0) / reviews.length
        : 0

      const categoryLabel = getCategoryLabel(item.category || item.name)
      return {
        id: item.id,
        name: item.name || 'Unnamed Stop',
        description: item.description || 'No description yet.',
        district: item.district || '',
        categoryLabel,
        icon: getCategoryIcon(categoryLabel),
        coords: getCoords(item),
        reviews: reviews.slice(0, 3).map((review) => ({
          id: review.id,
          comment: review.comment || 'No comment',
        })),
        photos: reviews
          .map((review) => review.photo_url || review.image_url)
          .filter(Boolean)
          .slice(0, 3),
        avgRating,
        reviewCount: reviews.length,
      }
    })

    const prioritized = scored.sort((a, b) => b.avgRating - a.avgRating)

    const tea = prioritized.filter((item) => item.categoryLabel === 'Tea Shop').slice(0, 3)
    const restaurants = prioritized.filter((item) => item.categoryLabel === 'Restaurant').slice(0, 3)
    const fuel = prioritized.filter((item) => item.categoryLabel === 'Fuel Station').slice(0, 3)

    itineraryStops.value = [...tea, ...restaurants, ...fuel]
  } catch (err) {
    console.error('Supabase fetch failed during selectStops:', err)
    itineraryStops.value = []
  }
}

const drawStopsMap = async () => {
  try {
    const L = await loadLeaflet()
    await nextTick()

    if (!stopsMapEl.value) return

    if (stopsMap) {
      stopsMap.remove()
    }

    const center = [7.8731, 80.7718]

    stopsMap = L.map(stopsMapEl.value).setView(center, 7)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(stopsMap)

    const stopsWithCoords = itineraryStops.value.filter((item) => item.coords)

    if (!stopsWithCoords.length) return

    const bounds = L.latLngBounds([])

    stopsWithCoords.forEach((item) => {
      const latlng = [item.coords.lat, item.coords.lng]
      bounds.extend(latlng)

      const marker = L.marker(latlng).addTo(stopsMap)
      marker.bindPopup(`<strong>${item.name}</strong><br/>${item.categoryLabel}`)
    })

    stopsMap.fitBounds(bounds, { padding: [30, 30] })
  } catch (e) {
    console.error('Failed to draw stops map with Leaflet:', e)
  }
}

const loadTripData = async () => {
  if (!fromLabel.value || !toLabel.value) return

  pageLoading.value = true
  routeError.value = ''

  // Isolate each major background task so a single failure (like a Supabase DNS block) doesn't cascade and kill the routing.
  await Promise.allSettled([
    loadWeather().catch(err => console.error('Weather load error:', err)),
    buildDirectionsRoute().catch(err => {
      console.error('Routing crashed completely:', err)
      estimatedDistance.value = 'Unavailable'
      estimatedTime.value = 'Unavailable'
    }),
    selectStops()
      .then(() => drawStopsMap())
      .catch(err => console.error('Stops/Map load error:', err))
  ])

  pageLoading.value = false
}

watch(
  () => [route.query.startingPoint, route.query.destination, route.query.startDate, route.query.endDate, route.query.vehicleType],
  () => {
    loadTripData()
  },
)

onMounted(() => {
  loadTripData()
})
</script>

<style scoped>
.trip-results-page {
  background:
    radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.18) 0%, transparent 35%),
    radial-gradient(circle at 100% 10%, rgba(56, 189, 248, 0.12) 0%, transparent 38%),
    linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%);
}

.page-wrap {
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
}

.hero-card,
.section-card,
.inner-card,
.stop-card {
  border-radius: 16px;
}

.summary-list {
  background: #f8fafc;
}

.map-block {
  height: 360px;
  border-radius: 14px;
  border: 1px solid #dbe2ea;
}

.stop-card {
  background: #fbfdff;
}

.review-pill {
  border: 1px solid #d6e6f5;
  border-radius: 10px;
  padding: 6px 8px;
  background: #f8fbff;
}

@media (max-width: 768px) {
  .map-block {
    height: 280px;
  }
}
</style>
