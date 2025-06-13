<template>
   <div v-if="!selectedParkingDetail && userCity" class="aside__address">
      <div class="city" @click="toggleCityDropdown">
         <span class="dot">
            <img src="/public/icons/dot.svg" alt="" />
         </span>
         <span class="city__name">{{ selectedCity }}</span>
         <span class="dropdown-arrow">▼</span>
      </div>

      <div v-if="showCityDropdown" class="city-dropdown">
         <div v-for="city in availableCities" :key="city" class="city-option" @click="selectCity(city)">
            {{ city }}
         </div>
      </div>

      <button class="fetchGEO" @click="fetchCurrentLocation">
         Текущее местоположение
      </button>
   </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const showCityDropdown = ref(false)

const selectedParkingDetail = computed(() => store.state.parking.selectedParkingDetail)
const userCity = computed(() => store.getters['geolocation/userCity'])
const selectedCity = computed(() => userCity.value || 'Выберите город')

const availableCities = computed(() => {
   const defaultCities = [
      'Москва',
      'Санкт-Петербург',
      'Ростов-на-Дону',
      'Казань',
      'Новосибирск'
   ]
   const customCities = Object.keys(store.state.geolocation.cityCoordinates)
      .filter(city => !defaultCities.includes(city))
   return [...defaultCities, ...customCities]
})

const toggleCityDropdown = () => {
   showCityDropdown.value = !showCityDropdown.value
}

const selectCity = async (cityName) => {
   try {
      const result = await store.dispatch('geolocation/selectCity', cityName)
      showCityDropdown.value = false
      if (result && store.state.map && store.state.map.instance) {
         store.state.map.instance.zoomToLocation(result.coordinates, result.zoom)
      }
   } catch (error) {
      console.error('Ошибка при выборе города:', error)
   }
}

const fetchCurrentLocation = async () => {
   showCityDropdown.value = false
   await store.dispatch('geolocation/fetchLocation')
   const coords = store.getters['geolocation/coordinates']
   if (coords && store.state.map && store.state.map.instance) {
      store.state.map.instance.zoomToLocation(coords, 14)
   }
}
</script>

<style lang="scss" scoped>
.aside__address {
   margin-top: 24px;
   position: relative;
   display: flex;
   justify-content: space-between;
   align-items: center;

   .city {
      display: flex;
      align-items: center;
      column-gap: 8px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
         background: rgba(255, 255, 255, 0.2);
      }

      .city__name {
         color: #fff;
         font-size: 14px;
         font-weight: bold;
         white-space: nowrap;
         max-width: 150px;
         overflow: hidden;
         text-overflow: ellipsis;
      }

      .dropdown-arrow {
         margin-left: 4px;
         font-size: 10px;
         color: rgba(255, 255, 255, 0.7);
         transition: transform 0.2s;
      }
   }

   .city-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      width: 200px;
      max-height: 250px;
      overflow-y: auto;
      background: #1E2025;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      margin-top: 5px;

      .city-option {
         padding: 10px 15px;
         color: rgba(255, 255, 255, 0.8);
         cursor: pointer;
         transition: all 0.2s;

         &:hover {
            background: rgba(11, 3, 253, 0.2);
            color: #fff;
         }
      }
   }

   .fetchGEO {
      padding: 8px 12px;
      background: transparent;
      color: #0B03FD;
      font-size: 15px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
         background: rgba(11, 3, 253, 0.1);
      }
   }
}
</style>