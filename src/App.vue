<script setup>
import { onMounted } from 'vue'
import axios from 'axios'

// onMounted(async () => {


//   try {
//     // const res = await axios.get('http://localhost:3000/get_camera?id=1')
//     // const users = await axios.get('http://localhost:3000/users')
//     // const camera = await axios.get('http://localhost:3000/camera')
//     const res2 = await axios.get('http://localhost:3000/send-camera?id=1');
//     // console.log('Камера:', res.data);
//     console.log('Камера добавлена:', res2.data);
//   } catch (error) {
//     console.error('Ошибка при отправке камеры:', error.message);
//   }
  
// })


</script>

<template>
  <router-view />
</template>

<style>
:where(*, *::before, *::after) {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

 .leaflet-routing-alternatives-container {
  display: none !important;
} 

:where(body, h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd) {
  margin: 0;
}

:where(ul, ol) {
  list-style: none;
  padding: 0;
}

:where(img, picture, video, canvas, svg) {
  display: block;
  max-width: 100%;
  height: auto;
}

:where(a) {
  text-decoration: none;
  color: inherit;
}

:where(.sr-only) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

button {
  border: 0;
  outline: 0;
  cursor: pointer;
}
</style>
