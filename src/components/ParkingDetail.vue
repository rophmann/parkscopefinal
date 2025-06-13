<template>
   <div class="parking-detail">
      <div class="parking-image">
         <img :src="'/public/park.jpg'" alt="Парковка" />
      </div>

      <div class="detail-info">
         <div class="info-row">
            <span class="park__name">{{ parking.name }}</span>
            <span class="park__price">
               {{ parking.price }}₽<span class="per-hour">/час</span>
            </span>
         </div>

         <div class="info-row">
            <span class="park__addr">
               <img src="/public/icons/adrdot.svg" alt="" />
               {{ parking.address }}
            </span>
            <span class="distance">{{ parking.distance }}</span>
         </div>

         <div class="info-row">
            <span class="open-until">Открыто до 23:00</span>
         </div>

         <div class="info-row">
            <div class="places-info">
               <div class="place-row">
                  <span class="free-label">Свободных мест:</span>
                  <span class="free-count">{{ parking.places }}</span>
               </div>
               <div class="place-row">
                  <span class="occupied-label">Занятых мест:</span>
                  <span class="occupied-count">{{ parking.places - 10 }}</span>
               </div>
            </div>
         </div>
      </div>

      <div class="detail-buttons">
         <button class="route-button" @click="$emit('build-route')">
            Проложить маршрут
         </button>
         <button class="book-button" @click="$emit('book-parking')">
            Забронировать место
         </button>
      </div>
   </div>
</template>

<script setup>
const props = defineProps({
   parking: {
      type: Object,
      required: true
   }
})




defineEmits(['build-route', 'book-parking'])
</script>

<style scoped>
.parking-detail {
   background: #1f1f2e;
   border-radius: 12px;
   overflow: hidden;
   color: white;
}

.parking-image img {
   width: 100%;
   height: 160px;
   object-fit: cover;
   border-bottom: 1px solid #333;
}

.detail-info {
   padding: 16px;
}

.info-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 10px;
   flex-wrap: wrap;
}

.park__name {
   font-size: 18px;
   font-weight: bold;
}

.park__price {
   font-size: 18px;
   color: #00f5d4;
}

.per-hour {
   font-size: 12px;
   color: #6e7fa1;
   margin-left: 4px;
}

.park__addr {
   display: flex;
   align-items: center;
   gap: 6px;
   font-size: 14px;
}

.distance {
   font-size: 12px;
   color: #6e7fa1;
}

.open-until {
   font-size: 14px;
   color: #0b03fd;
}

.places-info {
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: 6px;
}

.place-row {
   display: flex;
   justify-content: space-between;
}

.free-label,
.occupied-label {
   font-size: 16px;
}

.free-label {
   color: #03fd5f;
}

.free-count {
   color: #03fd5f;
}

.occupied-label {
   color: #fd0303;
}

.occupied-count {
   color: #fd0303;
}

.detail-buttons {
   display: flex;
   justify-content: space-around;
   gap: 10px;
   padding: 12px;
}

.route-button,
.book-button {
   flex: 1;
   padding: 10px 12px;
   border: none;
   border-radius: 6px;
   color: white;
   cursor: pointer;
   font-weight: bold;
}

.route-button {
   background: #007bff;
}

.book-button {
   background: #28a745;
}
</style>