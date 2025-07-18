<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'

const props = defineProps({
  parkings: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-parking'])

const store = useStore()
const mapRef = ref(null)
const zoom = ref(13)
const center = ref([47.2225, 39.7187])

const icons = {
  parking: L.icon({
    iconUrl: '/icons/park.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  }),
  selectedParking: L.icon({
    iconUrl: '/icons/park-pin.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  }),
  user: L.icon({
    iconUrl: '/icons/user-icon.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })
}

const userPosition = computed(() => store.state.geolocation.userLocation)

const displayedParkings = computed(() => {
  return props.parkings.length > 0
    ? props.parkings
    : store.getters['parking/filteredParkings']
})

const isRouting = computed(() => store.getters['parking/isRouting'])

const handleMarkerClick = (parking) => {
  emit('select-parking', parking)
}

const cancelRoute = () => {
  store.dispatch('parking/cancelRoute')
}

watch(
  () => store.state.parking.routeControl,
  (newControl, oldControl) => {
    const map = mapRef.value?.leafletObject;
    if (!map) return;

    if (oldControl && map.hasControl && map.hasControl(oldControl)) {
      map.removeControl(oldControl);
    }

    if (newControl) {
      newControl.addTo(map);
      newControl.on('routesfound', (e) => {
        const route = e.routes[0];
        if (route) {
          map.fitBounds(route.coordinates);
        }
      });
    }
  },
  { flush: 'post' }
);
onMounted(async () => {
  await store.dispatch('geolocation/fetchUserLocation')
  await store.dispatch('parking/updateParkingDistances')
})
</script>


<template>
  <div class="map-container">
    <l-map ref="mapRef" :zoom="zoom" :center="center" :options="{ zoomControl: false }">
      <l-tile-layer
        url="https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=QC6BzC3o5furecFhRPc9DuwifZ7Z5dHqhnmSbWHlFPaJzv8xJvWi8tqsy4zNqQvd"
        attribution='&copy; OpenStreetMap' />
      <l-marker v-for="parking in displayedParkings" :key="parking.id" :lat-lng="parking.position"
        :icon="parking.selected ? icons.selectedParking : icons.parking"  @click="handleMarkerClick(parking)" />

      <l-marker v-if="userPosition" :lat-lng="userPosition" :icon="icons.user" />
    </l-map>

    <button v-if="isRouting" class="cancel-route-button" @click="cancelRoute">
      Отменить маршрут
    </button>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: 100vh;
  width: 100vw; /* Была 100% — замени на 100vw для всей ширины экрана */
  z-index: 1;
}

/* Кнопка отмены маршрута */
.cancel-route-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: #ff4444;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  transition: background 0.2s;
}

.cancel-route-button:hover {
  background: #cc0000;
}

/* Убираем ненужные элементы Leaflet */
.leaflet-routing-container {
  display: none !important;
}

.leaflet-popup {
  display: none !important;
}
</style>
