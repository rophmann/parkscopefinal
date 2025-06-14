// store/modules/user.js
export default {
   namespaced: true,
 
   state: () => ({
     userBookings: {
       // Пример структуры: { parkingId1: [slotNumbers], parkingId2: [slotNumbers] }
     }
   }),
 
   mutations: {
     SET_USER_BOOKINGS(state, bookings) {
       state.userBookings = bookings
     },
 
     ADD_USER_BOOKING(state, { parkingId, slotNumber }) {
       if (!state.userBookings[parkingId]) {
         state.userBookings[parkingId] = []
       }
       if (!state.userBookings[parkingId].includes(slotNumber)) {
         state.userBookings[parkingId].push(slotNumber)
       }
     },
 
     REMOVE_USER_BOOKING(state, { parkingId, slotNumber }) {
       if (state.userBookings[parkingId]) {
         state.userBookings[parkingId] = state.userBookings[parkingId].filter(num => num !== slotNumber)
       }
     }
   },
 
   actions: {
     addBooking({ commit }, payload) {
       commit('ADD_USER_BOOKING', payload)
     },
 
     removeBooking({ commit }, payload) {
       commit('REMOVE_USER_BOOKING', payload)
     },
 
     setBookings({ commit }, bookings) {
       commit('SET_USER_BOOKINGS', bookings)
     }
   },
 
   getters: {
     getUserSlotsForParking: (state) => (parkingId) => {
       return state.userBookings[parkingId] || []
     }
   }
 }
 