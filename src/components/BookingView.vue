<template>
   <div class="booking-view">
      <img :src="'/public/park.jpg'" alt="Фото парковки" class="booking-image" />

      <div class="booking-info">
         <h2>{{ parking.name }}</h2>
         <p>Стоимость: {{ parking.price }}₽/час</p>
         <p>Время работы: 08:00 – 23:00</p>
      </div>

      <h3 class="slot-title">Свободные места</h3>
      <div class="slots-grid">
         <div v-for="slot in parkingPlaces" :key="slot.number" :class="['slot', { occupied: slot.isOccupied }]"
            @click="handleSlotClick(slot)">
            <template v-if="slot.isOccupied">
               <img v-if="slot.isUserCar" src="/public/icons/user-car.svg" alt="Машина пользователя" class="car-icon" />
               <img v-else src="/public/icons/car.svg" alt="Машина" class="car-icon" />
            </template>
            <template v-else>
               {{ slot.number }}
            </template>
         </div>
      </div>

      <button @click="$emit('close')" class="close-btn">Закрыть</button>

      <Transition name="popup-fade">
         <BookingPopup v-if="showPopup" :slotNumber="selectedSlot" @close="showPopup = false"
            @confirm="handleConfirmBooking" />
      </Transition>
   </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BookingPopup from './BookingPopup.vue'

const props = defineProps({
   parking: Object
})

defineEmits(['close'])

const showPopup = ref(false)
const selectedSlot = ref(null)

// Локальное состояние парковочных мест
const parkingPlaces = ref([])

// Функция инициализации парковочных мест из props.parking
function initParkingPlaces() {
   if (!props.parking) {
      parkingPlaces.value = []
      return
   }
   const total = props.parking.places
   const free = props.parking.availablePlaces
   // Заполняем массив с учётом пропсов
   parkingPlaces.value = []
   for (let i = 1; i <= total; i++) {
      parkingPlaces.value.push({
         number: i,
         isOccupied: i > free,
         isUserCar: false,  // изначально занятые места
      })
   }
}

// Инициализируем при загрузке и при изменении parking
initParkingPlaces()
watch(() => props.parking, () => {
   initParkingPlaces()
})

// Обработчик клика по месту
function handleSlotClick(slot) {
   if (!slot.isOccupied) {
      selectedSlot.value = slot.number
      showPopup.value = true
   }
}

// После подтверждения бронирования — отмечаем место как занятое
function handleConfirmBooking(data) {
   const slot = parkingPlaces.value.find(s => s.number === selectedSlot.value)
   if (slot) {
      slot.isOccupied = true
      slot.isUserCar = true
   }
   showPopup.value = false
}
</script>



<style scoped>
.booking-view {
   background: #1f1f2e;
   padding: 20px;
   color: white;
   display: flex;
   flex-direction: column;
   gap: 16px;
}

.booking-image {
   width: 100%;
   height: 160px;
   object-fit: cover;
   border-radius: 8px;
}

.booking-info {
   display: flex;
   flex-direction: column;
   gap: 4px;
}

.slot-title {
   margin-top: 16px;
   font-size: 18px;
   font-weight: 600;
}

.slots-grid {
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   /* Было: 4 столбца, стало: 2 */
   gap: 12px;
}

.slot {
   background: #2e2e3e;
   padding: 10px;
   border-radius: 6px;
   text-align: center;
   font-weight: bold;
   font-size: 16px;
   border: 2px solid #3e3e5e;
   transition: background 0.2s;
   cursor: pointer;
}

.slot:hover {
   background: #3a3a50;
}

.slot {
   background: #2e2e3e;
   padding: 20px;
   border-radius: 6px;
   text-align: center;
   font-weight: bold;
   font-size: 16px;
   border: 2px solid #3e3e5e;
   cursor: pointer;
   transition: background 0.2s;
}

.slot:hover {
   background: #3a3a50;
}

.slot.occupied {
   background: #555555;
   cursor: not-allowed;
   color: #aaa;
   border-color: #444444;
}

.slot.occupied:hover {
   background: #555555;
}

.car-icon {
   width: 90px;
   height: 40px;
   object-fit: cover;
   display: block;
   margin: 0 auto;
}

.close-btn {
   background: #ff4444;
   color: white;
   padding: 10px;
   border: none;
   border-radius: 8px;
   margin-top: auto;
}



.popup-fade-enter-active,
.popup-fade-leave-active {
   transition: all 0.3s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
   opacity: 0;
   transform: scale(0.95);
}
</style>