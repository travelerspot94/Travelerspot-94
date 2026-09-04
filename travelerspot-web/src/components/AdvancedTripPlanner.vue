<template>
  <q-card class="advanced-trip-planner q-pa-lg shadow-10" :style="cardStyle">
    <q-card-section class="q-pa-none">
      <h5 class="text-h6 text-weight-bold q-mb-lg text-dark">
        Plan Your Perfect Journey
      </h5>

      <!-- Form Grid Layout -->
      <div class="row q-col-gutter-md">
        <!-- Where From? -->
        <div class="col-12 col-md-3">
          <label class="text-weight-medium text-dark q-mb-sm block">Where from?</label>
          <q-select
            v-model="formData.startingPoint"
            :options="filteredStartingLocations"
            use-input
            hide-selected
            fill-input
            input-debounce="500"
            @filter="filterStartingFn"
            placeholder="Starting point"
            outlined
            dense
            bg-color="white"
            class="search-input"
            hide-bottom-space
            popup-content-class="bg-white text-black trip-planner-dropdown"
            popup-content-style="background-color: white !important; box-shadow: 0px 10px 25px rgba(0,0,0,0.3) !important; z-index: 9999 !important;"
            menu-anchor="bottom left"
            menu-self="top left"
          >
            <template v-slot:prepend>
              <q-icon name="my_location" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="text-black bg-white">
                <q-item-section class="text-black">
                  <q-item-label class="text-black">{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results found
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Where To? -->
        <div class="col-12 col-md-3">
          <label class="text-weight-medium text-dark q-mb-sm block">Where to?</label>
          <q-select
            v-model="formData.destination"
            :options="filteredLocations"
            use-input
            hide-selected
            fill-input
            input-debounce="500"
            @filter="filterFn"
            placeholder="Destination"
            outlined
            dense
            bg-color="white"
            class="search-input"
            hide-bottom-space
            popup-content-class="bg-white text-black trip-planner-dropdown"
            popup-content-style="background-color: white !important; box-shadow: 0px 10px 25px rgba(0,0,0,0.3) !important; z-index: 9999 !important;"
            menu-anchor="bottom left"
            menu-self="top left"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="text-black bg-white">
                <q-item-section class="text-black">
                  <q-item-label class="text-black">{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results found
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Start Date -->
        <div class="col-12 col-md-3">
          <label class="text-weight-medium text-dark q-mb-sm block">Start Date</label>
          <q-input
            v-model="formData.startDate"
            outlined
            dense
            bg-color="white"
            class="search-input cursor-pointer"
            hide-bottom-space
            mask="date"
            placeholder="YYYY/MM/DD"
            readonly
          >
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
            <q-popup-proxy cover transition-show="scale" transition-hide="scale" style="z-index: 9999 !important;" class="bg-white">
              <q-date v-model="formData.startDate" class="bg-white text-dark" text-color="black">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-input>
        </div>

        <!-- End Date -->
        <div class="col-12 col-md-3">
          <label class="text-weight-medium text-dark q-mb-sm block">End Date</label>
          <q-input
            v-model="formData.endDate"
            outlined
            dense
            bg-color="white"
            class="search-input cursor-pointer"
            hide-bottom-space
            mask="date"
            placeholder="YYYY/MM/DD"
            readonly
          >
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
            <q-popup-proxy cover transition-show="scale" transition-hide="scale" style="z-index: 9999 !important;" class="bg-white">
              <q-date v-model="formData.endDate" :options="endDateOptions" class="bg-white text-dark" text-color="black">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-input>
        </div>

        <!-- Vehicle Type -->
        <div class="col-12 col-md-6">
          <label class="text-weight-medium text-dark q-mb-sm block">Vehicle Type</label>
          <q-select
            v-model="formData.vehicleType"
            :options="vehicleOptions"
            outlined
            dense
            bg-color="white"
            emit-value
            map-option
            class="search-input"
            hide-bottom-space
            popup-content-class="bg-white text-black trip-planner-dropdown"
            popup-content-style="background-color: white !important; box-shadow: 0px 10px 25px rgba(0,0,0,0.3) !important; z-index: 9999 !important;"
            menu-anchor="bottom left"
            menu-self="top left"
          >
            <template v-slot:prepend>
              <q-icon name="directions_car" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="text-black bg-white">
                <q-item-section class="text-black">
                  <q-item-label class="text-black">{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Travel Style -->
        <div class="col-12 col-md-6">
          <label class="text-weight-medium text-dark q-mb-sm block">Travel Style</label>
          <div class="row q-gutter-sm">
            <q-chip
              v-for="style in travelStyleOptions"
              :key="style"
              clickable
              :color="formData.travelStyle.includes(style) ? 'primary' : 'grey-3'"
              :text-color="formData.travelStyle.includes(style) ? 'white' : 'grey-8'"
              @click="toggleTravelStyle(style)"
              class="travel-style-chip"
            >
              {{ style }}
            </q-chip>
          </div>
        </div>

        <!-- Build My Trip Button - Full Width -->
        <div class="col-12 q-mt-md">
          <q-btn
            color="primary"
            label="Build My Trip"
            class="full-width build-trip-btn text-weight-bold"
            size="lg"
            unelevated
            @click="handleBuildTrip"
            :disable="!isFormValid"
            :loading="isLoading"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  startingPoint: '',
  destination: '',
  startDate: '',
  endDate: '',
  vehicleType: 'Car',
  travelStyle: [],
})

const isLoading = ref(false)

const filteredLocations = ref([])
const filteredStartingLocations = ref([])

const vehicleOptions = ['Car', 'Van', 'Bike', 'Public Transport']

const travelStyleOptions = [
  'Adventure',
  'Historical',
  'Nature',
  'Cultural',
  'Beaches',
]

const cardStyle = ref({
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '16px',
  maxWidth: '900px',
  margin: '0 auto',
})

const isFormValid = computed(() => {
  return (
    formData.value.startingPoint &&
    formData.value.startingPoint.trim() !== '' &&
    formData.value.destination &&
    formData.value.destination.trim() !== '' &&
    formData.value.startDate !== '' &&
    formData.value.endDate !== '' &&
    formData.value.endDate >= formData.value.startDate
  )
})

const endDateOptions = (date) => {
  if (!formData.value.startDate) return true;
  return date >= formData.value.startDate;
}

async function filterStartingFn(val, update, abort) {
  if (val.length < 2) {
    update(() => {
      filteredStartingLocations.value = []
    })
    return
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=lk`)
    const data = await response.json()
    update(() => {
      filteredStartingLocations.value = data.map(item => item.display_name)
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    abort()
  }
}

async function filterFn(val, update, abort) {
  if (val.length < 2) {
    update(() => {
      filteredLocations.value = []
    })
    return
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=lk`)
    const data = await response.json()
    update(() => {
      filteredLocations.value = data.map(item => item.display_name)
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    abort()
  }
}

function toggleTravelStyle(style) {
  const index = formData.value.travelStyle.indexOf(style)
  if (index > -1) {
    formData.value.travelStyle.splice(index, 1)
  } else {
    formData.value.travelStyle.push(style)
  }
}

async function handleBuildTrip() {
  if (!isFormValid.value) return

  isLoading.value = true

  try {
    // Create query parameters from form data
    const queryParams = {
      startingPoint: encodeURIComponent(formData.value.startingPoint),
      destination: encodeURIComponent(formData.value.destination),
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      vehicleType: formData.value.vehicleType,
      travelStyle: formData.value.travelStyle.join(','),
    }

    // Navigate to trip-results with query parameters
    await router.push({
      path: '/trip-results',
      query: queryParams,
    })
  } catch (error) {
    console.error('Navigation error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.advanced-trip-planner {
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.98);
  }
}

.search-input {
  transition: all 0.2s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(0, 156, 166, 0.1);
  }
}

.travel-style-chip {
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
}

.build-trip-btn {
  background: linear-gradient(135deg, #009ca6 0%, #0080d4 100%);
  border-radius: 12px;
  font-size: 16px;
  padding: 12px 24px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #007a83 0%, #0066a8 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 156, 166, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

label {
  font-size: 14px;
  display: inline-block;
}

.block {
  display: block;
}
</style>

<style>
.trip-planner-dropdown .q-item__label, 
.trip-planner-dropdown .q-item {
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 16px !important;
}
</style>


