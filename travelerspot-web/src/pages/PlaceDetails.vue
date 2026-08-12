<template>
  <q-page class="place-details-page q-pa-md">
    <div class="page-wrap">
      <q-btn
        flat
        icon="arrow_back"
        label="Back"
        color="primary"
        class="q-mb-md"
        @click="router.back()"
      />

      <q-card v-if="place" class="hero-card q-mb-xl" flat bordered>
        <q-img :src="place.heroImage" height="360px">
          <div class="absolute-full hero-overlay">
            <div class="hero-copy">
              <div class="text-overline text-white">TravelersPot Place Details</div>
              <div class="text-h3 text-weight-bold text-white">{{ place.name }}</div>
              <div class="text-subtitle1 text-white">{{ place.district }}</div>
            </div>
          </div>
        </q-img>
      </q-card>

      <q-card v-if="place" class="content-card q-mb-xl" flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-7">
              <div class="text-h6 text-weight-bold q-mb-sm">Description</div>
              <div class="text-body1 text-grey-8">{{ place.description }}</div>
            </div>

            <div class="col-12 col-md-5">
              <div class="text-h6 text-weight-bold q-mb-sm">Travel Tips</div>
              <div class="text-body2 text-grey-8" style="white-space: pre-wrap">
                {{ place.travelTips }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="place" class="row q-col-gutter-xl items-start">
        <div class="col-12 col-lg-7">
          <div class="row items-center q-mb-md">
            <div class="text-h6 text-weight-bold">Latest Reviews</div>
            <q-space />
            <div class="text-caption text-grey-7">{{ reviews.length }} reviews</div>
          </div>

          <div v-if="reviews.length" class="column q-gutter-md">
            <q-card v-for="review in reviews" :key="review.id" class="review-card" flat bordered>
              <q-card-section>
                <div class="row items-start q-col-gutter-md">
                  <div class="col">
                    <div class="row items-center q-gutter-sm q-mb-xs">
                      <q-rating
                        :model-value="review.rating"
                        readonly
                        size="1.1rem"
                        color="amber"
                        icon="star_border"
                        icon-selected="star"
                      />
                      <span class="text-caption text-grey-7">{{
                        formatReviewDate(review.createdAt)
                      }}</span>
                    </div>
                    <div class="text-body2">{{ review.comment }}</div>
                  </div>

                  <div v-if="review.photoUrl" class="col-12 col-sm-4">
                    <q-img
                      :src="review.photoUrl"
                      class="review-image rounded-borders"
                      height="140px"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <q-card v-else class="review-card" flat bordered>
            <q-card-section class="text-grey-7">
              තාම මේ place එකට reviews නැහැ. පළවෙනි review එක ඔයා දෙන්න.
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-5">
          <q-card class="review-form-card" flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-md">Add Review</div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-7 q-mb-xs">Star Rating</div>
                <q-rating
                  v-model="reviewForm.rating"
                  size="2rem"
                  color="amber"
                  icon="star_border"
                  icon-selected="star"
                />
                <div v-if="reviewErrors.rating" class="text-negative text-caption q-mt-xs">
                  {{ reviewErrors.rating }}
                </div>
              </div>

              <q-input
                v-model="reviewForm.comment"
                type="textarea"
                autogrow
                outlined
                label="Comment"
                placeholder="මෙතන review එක ලියන්න..."
                :error="Boolean(reviewErrors.comment)"
                :error-message="reviewErrors.comment"
                class="q-mb-md"
              />

              <q-file
                v-model="reviewForm.photo"
                outlined
                accept="image/*"
                label="Upload Photo"
                class="q-mb-md"
              >
                <template #prepend>
                  <q-icon name="photo_camera" />
                </template>
              </q-file>

              <div class="row justify-end">
                <q-btn
                  unelevated
                  color="primary"
                  label="Submit"
                  :disable="isSubmitDisabled"
                  :loading="reviewSubmitting"
                  @click="submitReview"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card v-else-if="!pageLoading" class="content-card" flat bordered>
        <q-card-section class="text-center q-pa-xl">
          <div class="text-h6 q-mb-sm">Place not found</div>
          <div class="text-body2 text-grey-7">
            This place could not be loaded from TravelersPot.
          </div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="pageLoading || reviewSubmitting">
        <q-spinner-dots size="44px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const pageLoading = ref(false)
const reviewSubmitting = ref(false)
const place = ref(null)
const reviews = ref([])

const reviewForm = ref({
  rating: 0,
  comment: '',
  photo: null,
})

const reviewErrors = ref({
  rating: '',
  comment: '',
})

const fallbackHero =
  'https://images.unsplash.com/photo-1552423130-c58a7d309c77?q=80&w=1400&auto=format&fit=crop'

const currentPlaceId = computed(() => String(route.params.id || ''))
const isSubmitDisabled = computed(
  () => reviewSubmitting.value || !reviewForm.value.rating || !reviewForm.value.comment.trim(),
)

const normalizePlace = (data) => ({
  id: data.id,
  name: data.name || 'Unknown Place',
  district: data.district || 'Sri Lanka',
  heroImage: data.image_url || data.photo_url || fallbackHero,
  description: data.description || 'No description available yet.',
  travelTips:
    data.travel_tips ||
    data.travelTips ||
    'Best visited in daylight. Check weather, road conditions, and carry water before you go.',
})

const normalizeReview = (review, fallbackId) => ({
  id: review?.id ?? fallbackId,
  rating: Number(review?.rating || 0),
  comment: review?.comment || '',
  photoUrl: review?.photo_url || review?.image_url || '',
  createdAt: review?.created_at || new Date().toISOString(),
})

const formatReviewDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const resetReviewForm = () => {
  reviewForm.value = {
    rating: 0,
    comment: '',
    photo: null,
  }
  reviewErrors.value = {
    rating: '',
    comment: '',
  }
}

const validateReviewForm = () => {
  reviewErrors.value = {
    rating: reviewForm.value.rating ? '' : 'Star rating එකක් දෙන්න.',
    comment: reviewForm.value.comment.trim() ? '' : 'Comment එකක් ලියන්න.',
  }

  return !reviewErrors.value.rating && !reviewErrors.value.comment
}

const uploadReviewPhoto = async (file) => {
  if (!file) return ''

  const extension = file.name?.split('.').pop() || 'jpg'
  const fileName = `place-${currentPlaceId.value}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`
  const filePath = `reviews/${fileName}`

  const { error } = await supabase.storage.from('place-photos').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('place-photos').getPublicUrl(filePath)
  return data.publicUrl
}

const fetchPlace = async () => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', currentPlaceId.value)
    .single()
  if (error) throw error
  place.value = normalizePlace(data)
}

const fetchReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('place_id', currentPlaceId.value)
    .order('created_at', { ascending: false })

  if (error) throw error
  reviews.value = (data || []).map((review, index) => normalizeReview(review, `review-${index}`))
}

const loadPageData = async () => {
  if (!currentPlaceId.value) return

  pageLoading.value = true

  try {
    await Promise.all([fetchPlace(), fetchReviews()])
  } catch (error) {
    console.error('Failed to load place details:', error)
    place.value = null
    reviews.value = []
  } finally {
    pageLoading.value = false
  }
}

const submitReview = async () => {
  if (!validateReviewForm()) return

  reviewSubmitting.value = true

  try {
    const photoUrl = await uploadReviewPhoto(reviewForm.value.photo)
    const payload = {
      place_id: currentPlaceId.value,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment.trim(),
      photo_url: photoUrl,
    }

    const { error } = await supabase.from('reviews').insert(payload)
    if (error) throw error

    resetReviewForm()
    await fetchReviews()
    $q.notify({
      type: 'positive',
      message: 'Review submitted successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to submit place review:', error)
    $q.notify({
      type: 'negative',
      message: 'Review submit කරන්න බැරි වුණා.',
      position: 'top',
    })
  } finally {
    reviewSubmitting.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    resetReviewForm()
    loadPageData()
  },
  { immediate: true },
)
</script>

<style scoped>
.place-details-page {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.page-wrap {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.hero-card,
.content-card,
.review-card,
.review-form-card {
  border-radius: 16px;
}

.hero-overlay {
  display: flex;
  align-items: flex-end;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.72) 100%);
}

.hero-copy {
  padding: 32px;
}

.review-image {
  border: 1px solid #dbe2ea;
}
</style>
