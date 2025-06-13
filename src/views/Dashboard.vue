<template>
   <div class="wrap">
      <aside class="aside" :class="{ 'mobile-detail-view': selectedParkingDetail }">
         <div class="aside__header">
            <div class="search-container">
               <button v-if="selectedParkingDetail" class="back-button"
               @click="() => { selectedParkingDetail = null, selectedParking = null }">
               <img src="/public/icons/arrow.svg" alt="">
            </button>
               <input v-model="searchQuery" class="header__search" type="text" placeholder="Введите адрес"
                  @focus="showSuggestions = true" @blur="handleBlur" @keydown.enter="handleEnter">

               <div v-if="showSuggestions && searchQuery" class="suggestions-dropdown">
                  <div v-for="parking in filteredParkings" :key="parking.id" class="suggestion-item"
                     @mousedown.prevent="goToParking(parking)">
                     <div class="suggestion-title">Парковка №{{ parking.id }}</div>
                     <div class="suggestion-address">{{ parking.address }}</div>
                     <div class="suggestion-distance">{{ parking.distance }}</div>
                  </div>

                  <div v-if="filteredParkings.length === 0" class="no-results">
                     Ничего не найдено
                  </div>
               </div>
            </div>

            <button class="btn btn-voice" @click="toggleVoiceInput" :class="{
               'active': isListening,
               'success': lastSuccess,
               'error': lastError
            }">
               <img src="/public/icons/voice.svg" alt="" class="btn-voice__icon">
               <span v-if="isListening" class="pulse-animation"></span>
               <span v-if="lastSuccess" class="status-icon">✓</span>
               <span v-if="lastError" class="status-icon">✗</span>
            </button>
         </div>


         <!-- Блок с городом и геолокацией (только в основном режиме) -->
         <div v-if="!selectedParkingDetail && userCity" class="aside__address">
            <div class="city" @click="toggleCityDropdown">
               <span class="dot">
                  <img src="/public/icons/dot.svg" alt="">
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

         <!-- Фильтры (только в основном режиме) -->
         <Filters v-if="!selectedParkingDetail" />

         <!-- Основной контент (список парковок) -->
         <div v-if="!selectedParkingDetail" class="parks">
            <div v-if="allParkings.length != 0" class="park__title">Найдено парковочных мест {{ allParkings.length }}</div>
            <div v-for="parking in allParkings" :key="parking.id" class="parking-item">
               <div class="left">
                  <div class="parking-header">
                     <h3 class="parking-title">Парковка №{{ parking.id }}</h3>
                  </div>
                  <p class="parking-address">
                     <span class="parking-places">
                        <img src="/public/icons/adrdot.svg" alt="">
                     </span> {{ parking.address }}
                  </p>
                  <p style="color: #fff;">Свободных мест: {{ parking.places }}</p>
               </div>
               <div class="right">
                  <div class="parking-footer">
                     <span class="parking-price"><span>{{ parking.price }}₽</span> /час</span>
                     <span class="parking-distance">{{ parking.distance }}</span>
                     <div class="btns">
                        <button class="map" @click="goToParking(parking)">Карта</button>
                        <button class="open" @click="showParkingDetail(parking)">Открыть</button>
                     </div>
                  </div>
               </div>
            </div>

            <div v-if="allParkings.length === 0" class="no-parkings">
               Нет доступных парковок по выбранным фильтрам
            </div>
         </div>

         <!-- Детальная информация о парковке -->
         <div v-else class="parking-detail">
            <div class="parking-image">
               <img :src="selectedParkingDetail.image || '/public/park.jpg'" alt="Парковка">
            </div>

            <div class="detail-info">
               <div class="info-row">
                  <span class="park__name"> {{ selectedParkingDetail.name }}</span>
                  <span class="park__price">{{ selectedParkingDetail.price }}₽<span
                        style="color: #6E7FA1; font-size: 12px;">/час</span></span>
               </div>
               <div class="info-row">
                  <span class="park__addr">
                     <img src="/public/icons/adrdot.svg" alt="">
                     {{ selectedParkingDetail.address }}
                  </span>
                  <span style="color: #6E7FA1; font-size: 12px;">{{ selectedParkingDetail.distance }}</span>
               </div>

               <div class="info-row">
                  <span style="font-size: 14px; color: #0B03FD;">Открыто до 23:00</span>
               </div>

               <div class="info-row">
                  <div style="display: flex; flex-direction: column; width: 100%;">
                     <div style="display: flex; justify-content: space-between;">
                        <span style="color: #03FD5F; font-size: 18px;">Свободных мест:</span>
                        <span style="color: #03FD5F;">{{ selectedParkingDetail.places }}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between;">
                        <span style="color: #FD0303; font-size: 18px;">Занятых мест:</span>
                        <span style="color: #FD0303;">{{ selectedParkingDetail.places - 10 }}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div class="detail-buttons">
               <button class="route-button" @click="buildRoute">
                  Проложить маршрут
               </button>
               <button class="book-button" @click="bookParking">
                  Забронировать место
               </button>
            </div>
         </div>
      </aside>


      <LeafletMap ref="map" :parkings="allParkings" />
   </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useStore } from 'vuex';
import LeafletMap from '@/components/LeafletMap.vue';
import Filters from '../components/Filters.vue';

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

const availableCities = computed(() => {
   const cities = [
      'Москва', 'Санкт-Петербург', 'Ростов-на-Дону',
      'Казань', 'Новосибирск'
   ];
   const customCities = Object.keys(store.state.geolocation.cityCoordinates)
      .filter(city => !cities.includes(city));

   return [...cities, ...customCities];
});

const userCity = computed(() => store.getters['geolocation/userCity']);

const selectedCity = computed(() => store.getters['geolocation/userCity'] || 'Выберите город');
const isListening = computed(() => store.getters['voiceInput/isListening']);
const lastSuccess = computed(() => store.getters['voiceInput/lastSuccess']);
const allParkings = computed(() => store.getters['parking/allParkings'])

console.log(allParkings.value);

const filteredParkings = computed(() => {
   const searchResults = store.getters['parking/searchParkings'](searchQuery.value)
   const filtered = store.getters['parking/filteredParkings']

   // Применяем поиск к отфильтрованным парковкам
   return searchQuery.value
      ? filtered.filter(p =>
         p.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
         `парковка ${p.id}`.includes(searchQuery.value.toLowerCase())
      )
      : filtered
})


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
const bookParking = () => {
   if (selectedParkingDetail.value) {
      console.log('Бронирование места на парковке', selectedParkingDetail.value.id);
      // Здесь можно добавить логику бронирования
   }
};


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
         map.value.zoomToParking(parking.position);
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



.search-container {
   position: relative;
   width: 100%;
   display: flex;
}

.header__search {
   width: 100%;
   padding: 22px 25px 22px 16px;
   border-radius: 10px;
   background-color: #040404;
   background-image: url('/public/icons/search.svg');
   background-repeat: no-repeat;
   background-position: right 20px center;
   color: rgba(255, 255, 255, 0.5);
   outline: none;
   border: 0;

   &::placeholder {
      color: #6E7FA1;
      font-size: 16px;
   }
}

.back-button {
   background: none;
   border: none;
   cursor: pointer;
   padding: 8px;
   margin-right: 12px;

   img {
      width: 24px;
      height: 24px;
   }
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

.btn-voice {
   position: relative;
   background-color: #0B03FD;
   box-shadow: 0 4px 8px rgba(0, 0, 0, .3);

   &.active {
      animation: pulse 1.5s infinite;
   }

   &.success {
      background-color: #4CAF50;
   }

   &.error {
      background-color: #ff5722;
   }
}
.filter-panel {
   margin: 32px 0;
}

.pulse-animation {
   position: absolute;
   width: 100%;
   height: 100%;
   border-radius: 16px;
   background-color: rgba(244, 67, 54, 0.3);
   animation: pulse 1.5s infinite;
}

.status-icon {
   position: absolute;
   color: white;
   font-weight: bold;
   font-size: 18px;
   animation: fadeOut 2s forwards;
}

.suggestions-dropdown {
   position: absolute;
   top: 100%;
   left: 0;
   right: 0;
   max-height: 300px;
   overflow-y: auto;
   background: #1E2025;
   border-radius: 0 0 10px 10px;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
   z-index: 1001;
}

.suggestion-item {
   padding: 12px 15px;
   cursor: pointer;
   transition: background 0.2s;
   border-bottom: 1px solid #2a2d35;

   &:hover {
      background: #2a2d35;
   }
}

.suggestion-title {
   font-weight: bold;
   color: #fff;
   margin-bottom: 4px;
}

.suggestion-address {
   font-size: 0.9em;
   color: rgba(255, 255, 255, 0.7);
   margin-bottom: 4px;
}

.suggestion-distance {
   font-size: 0.8em;
   color: #E25319;
}

.no-results {
   padding: 12px 15px;
   color: rgba(255, 255, 255, 0.5);
   font-style: italic;
}

.aside__address {
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
      font-size: 12px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
         background: rgba(11, 3, 253, 0.1);
      }
   }
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

.no-parkings {
   color: rgba(255, 255, 255, 0.5);
   text-align: center;
   padding: 20px;
   font-style: italic;
}

.detail-title {
   color: #fff;
   font-size: 20px;
   margin: 0;
}

.parking-detail {
   position: relative;
   padding-top: 200px;
   display: flex;
   flex-direction: column;
   gap: 20px;
   padding: 16px;
   flex: 1;
   overflow-y: auto;
}

.parking-image {
   width: 100%;
   height: 200px;
   border-radius: 12px;
   overflow: hidden;

   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
}

.detail-info {
   display: flex;
   flex-direction: column;
   gap: 16px;
   padding: 16px;
   border-radius: 12px;
}

.info-row {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 12px;
   color: #fff;

   img {
      width: 20px;
      height: 20px;
   }
}

.detail-buttons {
   display: flex;
   flex-direction: column;
   gap: 12px;
   padding-bottom: 20px;
}

.route-button,
.book-button {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8px;
   padding: 16px;
   border-radius: 12px;
   border: none;
   font-weight: bold;
   cursor: pointer;

   img {
      width: 20px;
      height: 20px;
   }
}

.route-button {
   background: #2F2F31;
   border-radius: 64px;
   color: white;
}

.book-button {
   border-radius: 64px;
   background: #0B03FD;
   color: white;
}


.btns {
   display: flex;
   column-gap: 8px;
}

.map,
.open {
   padding: 10px 12px;
   font-size: 12px;
   font-weight: 700;
   color: #fff;
   border-radius: 12px;
}

.map {
   background: #2F2F31;
}

.open {
   background: #0B03FD;
}

@keyframes pulse {
   0% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
   }

   70% {
      box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
   }

   100% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
   }
}

@keyframes fadeOut {
   0% {
      opacity: 1;
   }

   100% {
      opacity: 0;
   }
}
</style>
