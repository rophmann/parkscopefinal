import { createStore, createLogger } from 'vuex'
import geolocation from './modules/geolocation'
import parking from './modules/parking'
import voiceInput from './modules/voiceInput';
import user from './modules/user';

const plugins = [createLogger()]

const store = createStore({
   modules: {
      geolocation,
      parking,
      voiceInput,
      user
   },
   plugins
})

export default store