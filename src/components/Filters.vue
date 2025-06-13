<template>
   <div class="filter-panel">
      <h2 style="font-size: 20px;">Фильтры</h2>
      <div class="filter-group">
         <label class="label"><span>Расстояние</span> <span class="grey-text">До {{ distance }} км</span></label>
         <input type="range" min="1" max="10" v-model="distance" />
      </div>

      <div class="filter-group">
         <label class="label"><span>Цена</span> <span class="grey-text">{{ price }}₽/час</span></label>
         <input type="range" min="0" max="500" step="10" v-model="price" />
      </div>

      <div class="filter-group">
         <label class="checkbox-label">
            <input type="checkbox" v-model="onlyAvailable" />
            Только свободные места
         </label>
      </div>

      <button class="apply-button" @click="applyFilters">
         Применить фильтры
      </button>
   </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const distance = ref(store.state.parking.filters.maxDistance)
const price = ref(store.state.parking.filters.maxPrice)
const onlyAvailable = ref(store.state.parking.filters.onlyAvailable)

const applyFilters = () => {
  store.commit('parking/SET_FILTERS', {
    maxDistance: distance.value,
    maxPrice: price.value,
    onlyAvailable: onlyAvailable.value
  })
}
</script>

<style scoped>
.filter-panel {
   background: #111;
   border-radius: 8px;
   padding: 20px;
   width: 300px;
   color: #fff;
   font-family: sans-serif;
   width: 429px;

   display: flex;
   flex-direction: column;
   row-gap: 25px;
}



input[type='range'] {
   width: 100%;
}

.label {
   display: flex;
   justify-content: space-between;

   font-size: 14px;
}

.grey-text {
   color: #6E7FA1;
   font-size: 12px;
}

.checkbox-label {
   display: flex;
   align-items: center;
   gap: 8px;
}

.apply-button {
   background: #333;
   color: #fff;
   border: none;
   border-radius: 25px;
   padding: 10px 20px;
   cursor: pointer;
   font-weight: bold;
   width: 100%;
}

.apply-button:hover {
   background: #444;
}

@media (max-width: 768px) {
   .filter-panel {
      padding: 12px;
      row-gap: 16px;
      border-radius: 0;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      max-width: 100%;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
   }

   .filter-title {
      font-size: 18px;
   }

   .apply-button {
      padding: 14px 20px;
      font-size: 14px;
   }

   input[type='range'] {
      height: 8px;
   }

   input[type='range']::-webkit-slider-thumb {
      width: 22px;
      height: 22px;
   }
}

@media (max-width: 480px) {
   .filter-panel {
      padding: 10px 12px;
   }

   .label {
      font-size: 13px;
   }

   .grey-text {
      font-size: 11px;
   }

   .checkbox-label {
      font-size: 14px;
   }
}
</style>