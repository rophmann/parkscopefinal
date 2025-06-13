const state = {
   isListening: false,
   recognition: null,
   lastResult: '',
   lastSuccess: false
 };
 
 const mutations = {
   SET_LISTENING(state, isListening) {
     state.isListening = isListening;
   },
   SET_RECOGNITION(state, recognition) {
     state.recognition = recognition;
   },
   SET_LAST_RESULT(state, result) {
     state.lastResult = result;
   },
   SET_LAST_SUCCESS(state, success) {
     state.lastSuccess = success;
   }
 };
 
 const actions = {
   initVoiceRecognition({ commit, state }) {
     if (state.recognition) return;
     
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) {
       console.error('Браузер не поддерживает распознавание речи');
       return;
     }
     
     const recognition = new SpeechRecognition();
     recognition.lang = 'ru-RU';
     recognition.interimResults = false;
     recognition.maxAlternatives = 1;
     
     recognition.onstart = () => {
       commit('SET_LISTENING', true);
       commit('SET_LAST_SUCCESS', false);
     };
     
     recognition.onend = () => {
       commit('SET_LISTENING', false);
     };
     
     recognition.onresult = (event) => {
       const transcript = event.results[0][0].transcript;
       this.dispatch('voiceInput/handleVoiceResult', transcript);
     };
     
     recognition.onerror = (event) => {
       console.error('Ошибка распознавания:', event.error);
       commit('SET_LISTENING', false);
     };
     
     commit('SET_RECOGNITION', recognition);
   },
   
   startListening({ commit, state, dispatch }) {
     if (!state.recognition) {
       dispatch('initVoiceRecognition');
       return;
     }
     
     try {
       state.recognition.start();
       commit('SET_LAST_RESULT', '');
     } catch (error) {
       console.error('Ошибка запуска распознавания:', error);
     }
   },
   
   stopListening({ state }) {
     if (state.recognition && state.isListening) {
       state.recognition.stop();
     }
   },
   
   async handleVoiceResult({ commit, dispatch, rootState }, transcript) {
     commit('SET_LAST_RESULT', transcript);
     
     const foundParkings = rootState.parking.parkings.filter(p => 
       p.address.toLowerCase().includes(transcript.toLowerCase()) || 
       `парковка ${p.id}`.toLowerCase().includes(transcript.toLowerCase()) ||
       p.id.toString().includes(transcript)
     );
     
     if (foundParkings.length === 1) {
       await dispatch('parking/selectParking', { id: foundParkings[0].id }, { root: true });
       commit('SET_LAST_SUCCESS', true);
       return { 
         success: true, 
         parking: foundParkings[0],
         message: `Найдена парковка №${foundParkings[0].id}`
       };
     }
     
     commit('SET_LAST_SUCCESS', false);
     return { 
       success: false, 
       count: foundParkings.length,
       message: foundParkings.length > 1 ? 
         `Найдено ${foundParkings.length} парковок` : 
         'Парковка не найдена'
     };
   }
 };
 
 const getters = {
   isListening: state => state.isListening,
   lastResult: state => state.lastResult,
   lastSuccess: state => state.lastSuccess
 };
 
 export default {
   namespaced: true,
   state,
   mutations,
   actions,
   getters
 };