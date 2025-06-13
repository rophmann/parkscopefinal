<template>
   <div class="search-container">
     <button v-if="selectedParkingDetail" class="back-button" @click="clearSelectedParking">
       <img src="/public/icons/arrow.svg" alt="" />
     </button>
 
     <input
       v-model="searchQuery"
       class="header__search"
       type="text"
       placeholder="Введите адрес"
       @focus="showSuggestions = true"
       @blur="handleBlur"
       @keydown.enter="handleEnter"
     />
 
     <div v-if="showSuggestions && searchQuery" class="suggestions-dropdown">
       <div
         v-for="parking in filteredParkings"
         :key="parking.id"
         class="suggestion-item"
         @mousedown.prevent="goToParking(parking)"
       >
         <div class="suggestion-title">
           {{ parking.name || `Парковка №${parking.id}` }}
         </div>
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
 import { ref, computed } from 'vue';
 import { useStore } from 'vuex';
 
 const store = useStore();
 const searchQuery = ref('');
 const showSuggestions = ref(false);
 
 const selectedParkingDetail = computed({
   get: () => store.state.parking.selectedParkingDetail,
   set: val => store.commit('parking/SET_SELECTED_PARKING_DETAIL', val),
 });
 
 const clearSelectedParking = () => {
   selectedParkingDetail.value = null;
   console.log(store.commit('parking/SET_SELECTED_PARKING_DETAIL', null));
   
   store.commit('parking/SET_SELECTED_PARKING_DETAIL', null);
 };
 
 const allParkings = computed(() => store.state.parking.parkings || []);
 
 const filteredParkings = computed(() => {
   const query = searchQuery.value.trim().toLowerCase();
   if (!query) return allParkings.value;
 
   return allParkings.value.filter(p => {
     const address = p.address?.toLowerCase() || '';
     const name = p.name?.toLowerCase() || p.title?.toLowerCase() || '';
     const idStr = `парковка ${p.id}`;
     return (
       address.includes(query) ||
       name.includes(query) ||
       idStr.includes(query)
     );
   });
 });
 
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
  store.commit('parking/SET_SELECTED_PARKING_DETAIL', parking);
  await store.dispatch('parking/selectParking', { id: parking.id });
  document.activeElement?.blur();
};
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
     color: #6e7fa1;
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
   background: #1e2025;
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
   color: #e25319;
 }
 
 .no-results {
   padding: 12px 15px;
   color: rgba(255, 255, 255, 0.5);
   font-style: italic;
 }
 </style>
 