<template>
   <div class="wrap">
      <aside class="aside" :class="{ 'mobile-detail-view': selectedParkingDetail }">
         <div class="aside__header">
            <SearchContainer />
            <VoiceInputButton />
         </div>
         <div v-if="!store.state.parking.selectedParkingDetail && !store.state.parking.bookingView">


            <CitySelector v-if="!selectedParkingDetail" />
            <Filters v-if="!selectedParkingDetail" />

            <ParkingList v-if="!selectedParkingDetail" :allParkings="allParkings"
               :selectedParkingDetail="selectedParkingDetail" @go-to-parking="goToParking"
               @show-parking-detail="showParkingDetail" />
         </div>

         <ParkingDetail v-else-if="store.state.parking.selectedParkingDetail" :parking="selectedParking"
            @build-route="buildRoute" @book-parking="bookParking" @close-detail="closeParkingDetail" />
         <BookingView v-else-if="store.state.parking.bookingView" :parking="selectedParking"
            @close="store.commit('parking/SET_BOOKING_VIEW', false)" />
      </aside>

      <LeafletMap @select-parking="showParkingDetai" ref="map" :parkings="filteredParkings" />
   </div>

</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useStore } from 'vuex';
import LeafletMap from '@/components/LeafletMap.vue';
import Filters from '../components/Filters.vue';
import SearchContainer from '../components/SearchContainer.vue';
import VoiceInputButton from '../components/VoiceInputButton.vue'
import CitySelector from '../components/CitySelector.vue'
import ParkingDetail from '../components/ParkingDetail.vue'
import BookingView from '../components/BookingView.vue';


import ParkingList from '../components/ParkingList.vue'


// const selectedParkingDetaill = computed(() => store.state.parking.selectedParkingDetail)
const allParkingss = computed(() => store.getters['parking/allParkings'])
const selectedParking = computed(() => store.state.parking.selectedParking);
const showBookingView = ref(false);
const showParkPanel = ref(false)
const goToParkingg = async (parking) => {
   await store.dispatch('parking/selectParking', { id: parking.id })
   const map = store.state.map?.instance
   if (map) map.zoomToParking(parking.position)
}

const showParkingDetaill = async (parking) => {
   store.commit('parking/SET_SELECTED_PARKING_DETAIL', parking)
   await store.dispatch('parking/selectParking', { id: parking.id })
}

const store = useStore();
const map = ref(null);
const searchQuery = ref('');
const showSuggestions = ref(false);
const lastError = ref(false);
const showCityDropdown = ref(false);
const selectedParkingDetail = computed({
   get() {
      return store.state.parking.selectedParkingDetail;
   },
   set(value) {
      store.commit('parking/SET_SELECTED_PARKING_DETAIL', value);
   }
});

const closeParkingDetail = () => {
   selectedParkingDetail.value = null;
   store.commit('parking/CLEAR_SELECTED_PARKING');
};

const availableCities = computed(() => {
   const cities = [
      'Москва', 'Санкт-Петербург', 'Ростов-на-Дону',
      'Казань', 'Новосибирск'
   ];
   const customCities = Object.keys(store.state.geolocation.cityCoordinates)
      .filter(city => !cities.includes(city));

   return [...cities, ...customCities];
});

const bookParking = () => {
   if (selectedParkingDetail.value && showParkPanel) {
      showBookingView.value = true;
   }
};

const showParkingDetai = async (parking) => {
   showParkPanel.value = true
   selectedParkingDetail.value = parking;
   store.commit('parking/SELECT_PARKING', { id: parking.id });
   await store.dispatch('parking/selectParking', { id: parking.id });
};

const userCity = computed(() => store.getters['geolocation/userCity']);

const selectedCity = computed(() => store.getters['geolocation/userCity'] || 'Выберите город');
const isListening = computed(() => store.getters['voiceInput/isListening']);
const lastSuccess = computed(() => store.getters['voiceInput/lastSuccess']);
const allParkings = computed(() => store.getters['parking/allParkings'])

console.log(allParkings.value);

const filteredParkings = computed(() => store.getters['parking/filteredParkings']);
console.log("filter", filteredParkings.value);





const toggleVoiceInput = async () => {
   if (isListening.value) {
      store.dispatch('voiceInput/stopListening');
      return;
   }

   try {
      await store.dispatch('voiceInput/startListening');
      lastError.value = false;
   } catch (error) {
      lastError.value = true;
      setTimeout(() => lastError.value = false, 2000);
      console.error('Ошибка голосового ввода:', error);
   }
};

const handleBlur = () => {
   setTimeout(() => {
      showSuggestions.value = false;
   }, 200);
};

const handleEnter = () => {
   if (filteredParkings.value.length > 0) {
      goToParking(filteredParkings.value[0]);
   }
};



const goToParking = async (parking) => {
   showSuggestions.value = false;
   await store.dispatch('parking/selectParking', { id: parking.id });

   if (map.value) {
      map.value.zoomToParking(parking.position);
   }
   document.activeElement?.blur();
};

const toggleCityDropdown = () => {
   showCityDropdown.value = !showCityDropdown.value;
};

const selectCity = async (cityName) => {
   try {
      const result = await store.dispatch('geolocation/selectCity', cityName);
      showCityDropdown.value = false;

      if (result && map.value) {
         map.value.zoomToLocation(result.coordinates, result.zoom);
      }
   } catch (error) {
      console.error('Ошибка при выборе города:', error);
   }
};

const fetchCurrentLocation = async () => {
   showCityDropdown.value = false;
   await store.dispatch('geolocation/fetchLocation');
   if (map.value && store.getters['geolocation/coordinates']) {
      map.value.zoomToLocation(
         store.getters['geolocation/coordinates'],
         14
      );
   }
};

const handleFindParking = async () => {
   if (!searchQuery.value.trim()) {
      // Можно добавить уведомление пользователю, что поле поиска пустое
      console.log('Введите адрес для поиска');
      return;
   }

   // Нормализуем поисковый запрос
   const query = searchQuery.value.toLowerCase().trim();

   // Ищем точное или почти точное совпадение
   const foundParking = allParkings.value.find(parking => {
      const address = parking.address.toLowerCase();
      return (
         address === query ||
         address.includes(query) ||
         query.includes(address)
      );
   });

   if (foundParking) {
      await goToParking(foundParking);
      showSuggestions.value = false;
   } else {
      // Если точного совпадения нет, показываем подсказки
      showSuggestions.value = true;
      // Можно добавить уведомление пользователю
      console.log('Точного совпадения не найдено. Уточните адрес.');
   }
};

const showParkingDetail = async (parking) => {
   selectedParkingDetail.value = parking;
   await store.dispatch('parking/selectParking', { id: parking.id });
   const showParkingDetail = (parking) => {
      // Очищаем предыдущий маршрут
      store.commit('parking/CLEAR_ROUTE');
      selectedParkingDetail.value = parking;
      store.dispatch('parking/selectParking', { id: parking.id });
   };
};

// Построение маршрута

const buildRoute = async () => {
   try {
      await store.dispatch('parking/buildRoute');
   } catch (error) {
      console.error('Route building failed:', error);
      // Показать пользователю сообщение об ошибке
   }
};
// Бронирование места



watch(
   () => store.getters['voiceInput/lastResult'],
   async (result) => {
      if (!result) return;

      searchQuery.value = result;
      const { success, parking, message } = await store.dispatch(
         'voiceInput/handleVoiceResult',
         result
      );

      if (success && parking && map.value) {
         await nextTick();
         // map.value.zoomToParking(parking.position);
         showSuggestions.value = false;
      }
   }
);

onMounted(async () => {
   await store.dispatch('geolocation/initCityCoordinates');
});
</script>

<style scoped lang="scss">
.wrap {
   display: flex;
}

.aside {
   min-width: 470px;
   background-color: #1d1f25;
   height: 100vh;
   overflow-x: hidden;
   padding: 10px 24px;
}

.mobile-back-button {
   display: none;

   @media (max-width: 768px) {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #2a2d35;
      color: white;
      border: none;
      width: 100%;
      font-size: 16px;
      margin-bottom: 12px;

      img {
         width: 20px;
         height: 20px;
         transform: rotate(180deg);
      }
   }
}

.aside__header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   column-gap: 20px;
}


.btn {
   width: 65px;
   aspect-ratio: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 8px;
   transition: all 0.3s ease;

   &:hover {
      transform: scale(1.05);
   }

   img {
      padding: 8px;
   }
}

.filter-panel {
   margin: 32px 0;
}

.status-icon {
   position: absolute;
   color: white;
   font-weight: bold;
   font-size: 18px;
   animation: fadeOut 2s forwards;
}


.findPark {
   padding: 12px 0;
   width: 100%;
   background-color: #0B03FD;
   color: #fff;
   text-align: center;
   border-radius: 64px;
}

.parks {
   flex: 1;
   overflow-y: auto;
   margin-top: 20px;
   display: flex;
   flex-direction: column;
   gap: 16px;
}

.left {
   display: flex;
   flex-direction: column;
   row-gap: 16px;
}

.park__title {
   color: #fff;
   font-weight: 700;
   font-size: 20px;
}

.parking-item {
   background: #000000;
   border-radius: 8px;
   padding: 16px;
   cursor: pointer;
   transition: all 0.2s ease;

   display: flex;
   justify-content: space-between;

   &:hover {
      background: #3a3d45;
      transform: translateY(-2px);
   }
}

.parking-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 8px;
}

.parking-title {
   margin: 0;
   font-size: 17px;
   color: #fff;
   font-weight: 700;
}

.park__name {
   color: #fff;
   font-size: 20px;
   font-weight: 700;
}

.park__price {
   font-size: 20px;
}

.park__addr {
   color: #6E7FA1;
   font-size: 14px;
   display: flex;
   align-items: center;
   column-gap: 5px;
}

.parking-price {
   color: #6E7FA1;
   padding: 4px 8px;
   border-radius: 4px;

   span {
      font-size: 20px;
      font-weight: bold;
      color: #fff;
   }
}

.parking-address {
   margin: 0 0 12px 0;
   color: #6E7FA1;
   font-size: 14px;
   display: flex;
   column-gap: 5px;
}

.parking-footer {
   display: flex;
   flex-direction: column;
   align-items: flex-end;
   row-gap: 16px;
   font-size: 13px;
}

.parking-distance {
   color: #6E7FA1;
}

.parking-places {
   color: rgba(255, 255, 255, 0.5);
}
</style>
