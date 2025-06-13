import { createStore, createLogger } from 'vuex'
import geolocation from './modules/geolocation'
import parking from './modules/parking'
import voiceInput from './modules/voiceInput';

const plugins = [createLogger()]

const store = createStore({
   modules: {
      geolocation,
      parking,
      voiceInput
   },
   plugins
})

export default store