<template>
   <div class="booking-view">
     <header class="booking-header">
       <div class="header-left">
         <h2>{{ parking.name }}</h2>
         <p>{{ parking.address }}</p>
         <p>Открыто до 23:00</p>
       </div>
       <div class="header-right">
         <span class="price">{{ parking.price }}₽/час</span>
         <span class="available">Свободно: {{ parking.availablePlaces }}</span>
       </div>
     </header>
 
     <div class="places-grid">
       <div
         v-for="place in parking.places"
         :key="place"
         class="parking-spot"
         :class="{ occupied: place <= occupiedCount }"
       >
         {{ place }}
       </div>
     </div>
 
     <button class="back-button" @click="$emit('back')">Назад</button>
   </div>
 </template>
 
 <script setup>
 const props = defineProps({
   parking: {
     type: Object,
     required: true,
   },
 });
 
 const occupiedCount = props.parking.places - props.parking.availablePlaces;
 
 defineEmits(['back']);
 </script>
 
 <style scoped>
 .booking-view {
   background: #1f1f2e;
   color: white;
   padding: 16px;
   border-radius: 12px;
 }
 
 .booking-header {
   display: flex;
   justify-content: space-between;
   border-bottom: 1px solid #333;
   padding-bottom: 12px;
   margin-bottom: 16px;
 }
 
 .header-left h2 {
   margin: 0;
   font-size: 20px;
 }
 
 .header-left p {
   margin: 4px 0;
   font-size: 14px;
 }
 
 .header-right {
   text-align: right;
 }
 
 .price {
   font-size: 18px;
   color: #00f5d4;
   display: block;
 }
 
 .available {
   font-size: 14px;
   color: #03fd5f;
 }
 
 .places-grid {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
   gap: 10px;
 }
 
 .parking-spot {
   background: #2a2a3f;
   padding: 10px;
   border-radius: 6px;
   text-align: center;
   font-weight: bold;
   border: 1px solid #444;
 }
 
 .parking-spot.occupied {
   background: #444;
   color: #888;
 }
 
 .back-button {
   margin-top: 20px;
   width: 100%;
   padding: 10px;
   background: #007bff;
   border: none;
   border-radius: 6px;
   color: white;
   font-weight: bold;
   cursor: pointer;
 }
 </style>
 