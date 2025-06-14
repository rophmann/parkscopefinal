<!-- components/BookingPopup.vue -->
<template>
   <div class="popup-overlay" @click.self="$emit('close')">
     <div class="popup-content">
       <h3>Бронирование места №{{ slotNumber }}</h3>
 
       <label>
         Время бронирования:
         <input type="time" v-model="bookingTime" />
       </label>
 
       <label>
         Способ оплаты:
         <select v-model="paymentMethod">
           <option value="card">Карта</option>
           <option value="cash">Наличные</option>
         </select>
       </label>
 
       <button @click="pay" class="pay-btn">Оплатить</button>
     </div>
   </div>
 </template>
 
 <script setup>
 import { ref } from 'vue';
 
 const props = defineProps({
   slotNumber: Number
 });
 
 const emit = defineEmits(['close', 'confirm']);
 
 const bookingTime = ref('');
 const paymentMethod = ref('card');
 
 function pay() {
   emit('confirm', {
     slotNumber: props.slotNumber,
     bookingTime: bookingTime.value,
     paymentMethod: paymentMethod.value
   });
   emit('close');
 }
 </script>
 
 <style scoped>
 .popup-overlay {
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.6);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
 }
 
 .popup-content {
   background: #2c2c3c;
   padding: 24px;
   border-radius: 10px;
   color: white;
   min-width: 300px;
   display: flex;
   flex-direction: column;
   gap: 16px;
 }
 
 label {
   display: flex;
   flex-direction: column;
   gap: 4px;
 }
 
 input,
 select {
   padding: 8px;
   border-radius: 6px;
   border: none;
   background: #444;
   color: white;
 }
 
 .pay-btn {
   background: #00c853;
   color: white;
   padding: 10px;
   border: none;
   border-radius: 8px;
 }
 </style>
 