const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'ai-travel-buddy', component: () => import('pages/AITravelBuddy.vue') },
      { path: 'trip-results', component: () => import('pages/TripResults.vue') },
      { path: 'place/:id', component: () => import('pages/PlaceDetails.vue') },
      { path: 'district/:name', component: () => import('pages/DistrictPlaces.vue') },
      { path: 'add-place', component: () => import('pages/AddPlace.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
