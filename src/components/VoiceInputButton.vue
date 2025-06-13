<template>
   <button
     class="btn btn-voice"
     @click="toggleVoiceInput"
     :class="{
       active: isListening,
       success: lastSuccess,
       error: lastError
     }"
   >
     <img src="/public/icons/voice.svg" alt="" class="btn-voice__icon" />
     <span v-if="isListening" class="pulse-animation"></span>
     <span v-if="lastSuccess" class="status-icon">✓</span>
     <span v-if="lastError" class="status-icon">✗</span>
   </button>
 </template>
 
 <script setup>
 import { computed, ref } from 'vue'
 import { useStore } from 'vuex'
 
 const store = useStore()
 const lastError = ref(false)
 
 const isListening = computed(() => store.getters['voiceInput/isListening'])
 const lastSuccess = computed(() => store.getters['voiceInput/lastSuccess'])
 
 const toggleVoiceInput = async () => {
   if (isListening.value) {
     store.dispatch('voiceInput/stopListening')
     return
   }
 
   try {
     await store.dispatch('voiceInput/startListening')
     lastError.value = false
   } catch (error) {
     lastError.value = true
     setTimeout(() => (lastError.value = false), 2000)
     console.error('Ошибка голосового ввода:', error)
   }
 }

 
 </script>
 
 <style lang="scss" scoped>
 .btn-voice {
   position: relative;
   background: #ffffff;
   border-radius: 100%;
   width: 40px;
   aspect-ratio: 1;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;

   img {
      width: 20px;
      aspect-ratio: 1;
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
 
 @keyframes pulse {
   0% {
     transform: scale(1);
     opacity: 0.6;
   }
   70% {
     transform: scale(1.6);
     opacity: 0;
   }
   100% {
     transform: scale(1.6);
     opacity: 0;
   }
 }
 </style>
 