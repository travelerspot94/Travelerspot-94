<template>
  <q-page class="add-place-page q-pa-md">
    <div class="page-wrap">
      <q-btn
        flat
        icon="arrow_back"
        label="Back"
        color="primary"
        class="q-mb-md"
        @click="router.back()"
      />

      <q-card class="form-card" flat bordered>
        <q-card-section>
          <div class="text-h4 text-weight-bold q-mb-xs">Contribute a New Place</div>
          <div class="text-subtitle2 text-grey-7 q-mb-lg">
            Share a new destination with the TravelersPot community.
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                outlined
                label="Place Name"
                :error="Boolean(errors.name)"
                :error-message="errors.name"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.district"
                outlined
                :options="districtOptions"
                label="District"
                :error="Boolean(errors.district)"
                :error-message="errors.district"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.category"
                outlined
                :options="categoryOptions"
                label="Category"
                :error="Boolean(errors.category)"
                :error-message="errors.category"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.description"
                outlined
                autogrow
                type="textarea"
                label="Description"
                :error="Boolean(errors.description)"
                :error-message="errors.description"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-file
                v-model="form.photo"
                outlined
                accept="image/*"
                label="Main Photo"
                :error="Boolean(errors.photo)"
                :error-message="errors.photo"
              >
                <template #prepend>
                  <q-icon name="photo_camera" />
                </template>
              </q-file>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7 q-mb-xs">Initial Review Rating</div>
              <q-rating
                v-model="form.initialRating"
                size="2rem"
                color="amber"
                icon="star_border"
                icon-selected="star"
              />
              <div v-if="errors.initialRating" class="text-negative text-caption q-mt-xs">
                {{ errors.initialRating }}
              </div>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.initialComment"
                outlined
                autogrow
                type="textarea"
                label="Initial Review Comment"
                :error="Boolean(errors.initialComment)"
                :error-message="errors.initialComment"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-8" label="Reset" @click="resetForm" />
          <q-btn
            unelevated
            color="primary"
            label="Submit Place"
            :disable="isSubmitDisabled"
            :loading="submitting"
            @click="submitPlace"
          />
        </q-card-actions>
      </q-card>

      <q-inner-loading :showing="submitting">
        <q-spinner-dots size="44px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()
const router = useRouter()

const submitting = ref(false)

const districtOptions = [
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
]

const categoryOptions = [
  'Waterfall',
  'Beach',
  'Hike',
  'Temple',
  'Lake',
  'Forest',
  'Historical',
  'Camping',
  'Scenic Spot',
  'Wildlife',
]

const emptyForm = () => ({
  name: '',
  district: '',
  category: '',
  description: '',
  photo: null,
  initialRating: 0,
  initialComment: '',
})

const form = ref(emptyForm())
const errors = ref({
  name: '',
  district: '',
  category: '',
  description: '',
  photo: '',
  initialRating: '',
  initialComment: '',
})

const isSubmitDisabled = computed(
  () =>
    submitting.value ||
    !form.value.name.trim() ||
    !form.value.district ||
    !form.value.category ||
    !form.value.description.trim() ||
    !form.value.photo ||
    !form.value.initialRating ||
    !form.value.initialComment.trim(),
)

const resetForm = () => {
  form.value = emptyForm()
  errors.value = {
    name: '',
    district: '',
    category: '',
    description: '',
    photo: '',
    initialRating: '',
    initialComment: '',
  }
}

const validateForm = () => {
  errors.value = {
    name: form.value.name.trim() ? '' : 'Place name is required.',
    district: form.value.district ? '' : 'District is required.',
    category: form.value.category ? '' : 'Category is required.',
    description: form.value.description.trim() ? '' : 'Description is required.',
    photo: form.value.photo ? '' : 'Main photo is required.',
    initialRating: form.value.initialRating ? '' : 'Initial rating is required.',
    initialComment: form.value.initialComment.trim() ? '' : 'Initial comment is required.',
  }

  return Object.values(errors.value).every((value) => !value)
}

const uploadMainPhoto = async (file) => {
  const extension = file.name?.split('.').pop() || 'jpg'
  const fileName = `place-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`
  const filePath = `places/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('place-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('place-photos').getPublicUrl(filePath)
  return data.publicUrl
}

const submitPlace = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    const imageUrl = await uploadMainPhoto(form.value.photo)

    const placePayload = {
      name: form.value.name.trim(),
      district: form.value.district,
      category: form.value.category,
      description: form.value.description.trim(),
      image_url: imageUrl,
    }

    const { data: placeData, error: placeError } = await supabase
      .from('places')
      .insert(placePayload)
      .select('id')
      .single()

    if (placeError) throw placeError

    const placeId = placeData?.id
    if (!placeId) throw new Error('Failed to retrieve new place id')

    const reviewPayload = {
      place_id: placeId,
      rating: form.value.initialRating,
      comment: form.value.initialComment.trim(),
      photo_url: imageUrl,
    }

    const { error: reviewError } = await supabase.from('reviews').insert(reviewPayload)
    if (reviewError) throw reviewError

    $q.notify({
      type: 'positive',
      message: 'New place added successfully!',
      position: 'top',
    })

    resetForm()
    router.push('/place/' + placeId)
  } catch (error) {
    console.error('Failed to submit new place:', error)
    $q.notify({
      type: 'negative',
      message: 'Could not submit place. Please try again.',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.add-place-page {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.page-wrap {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.form-card {
  border-radius: 16px;
}
</style>
