<template>
   <div v-if="!selectedParkingDetail" class="parks">
      <div v-if="allParkings.length !== 0" class="park__title">
         Найдено парковочных мест {{ allParkings.length }}
      </div>

      <div v-for="parking in allParkings" :key="parking.id" class="parking-item">
         <div class="left">
            <div class="parking-header">
               <h3 class="parking-title">Парковка №{{ parking.id }}</h3>
            </div>
            <p class="parking-address">
               <span class="parking-places">
                  <img src="/public/icons/adrdot.svg" alt="" />
               </span>
               {{ parking.address }}
            </p>
            <p style="color: #fff;">Свободных мест: {{ parking.places }}</p>
         </div>

         <div class="right">
            <div class="parking-footer">
               <span class="parking-price"><span>{{ parking.price }}₽</span> /час</span>
               <span class="parking-distance">{{ parking.distance }}</span>
               <div class="btns">
                  <button class="map" @click="$emit('go-to-parking', parking)">Карта</button>
                  <button class="open" @click="openDetail(parking)">Открыть</button>
               </div>
            </div>
         </div>
      </div>

      <div v-if="allParkings.length === 0" class="no-parkings">
         Нет доступных парковок по выбранным фильтрам
      </div>
   </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
defineProps({
   allParkings: {
      type: Array,
      required: true
   },
   selectedParkingDetail: {
      type: Object,
      required: false
   }
})
const router = useRouter()

function openDetail(parking) {
  router.push({ name: 'ParkingDetail', params: { id: parking.id } })
}

defineEmits(['go-to-parking', 'show-parking-detail'])
</script>

<style lang="scss" scoped>
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

.park__title {
   color: #fff;
   font-weight: 700;
   font-size: 20px;
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

detail-title {
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