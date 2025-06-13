<template>
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
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const map = ref(null);
const searchQuery = ref('');
const showSuggestions = ref(false);
const lastError = ref(false);
const selectedParkingDetail = computed({
   get() {
      return store.state.parking.selectedParkingDetail;
   },
   set(value) {
      store.commit('parking/SET_SELECTED_PARKING_DETAIL', value);
   },
});

const allParkings = computed(() => store.getters['parking/allParkings']);
const filteredParkings = computed(() => {
   const filtered = store.getters['parking/filteredParkings'];
   return searchQuery.value
      ? filtered.filter(p =>
         p.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
         `парковка ${p.id}`.includes(searchQuery.value.toLowerCase())
      )
      : filtered;
});

const clearSelectedParking = () => {
   selectedParkingDetail.value = null;
   store.commit('parking/SET_SELECTED_PARKING', null);
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

watch(
   () => store.getters['voiceInput/lastResult'],
   async (result) => {
      if (!result) return;
      searchQuery.value = result;
      const { success, parking } = await store.dispatch('voiceInput/handleVoiceResult', result);

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

<style lang="scss" scoped>
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
</style>