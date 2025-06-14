const STORAGE_KEY = 'userBookings'

export default {
  namespaced: true,

  state: () => ({
    userBookings: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  }),

  mutations: {
    SET_USER_BOOKINGS(state, bookings) {
      state.userBookings = bookings
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    },

    ADD_USER_BOOKING(state, { parkingId, slotNumber }) {
      if (!state.userBookings[parkingId]) {
        state.userBookings[parkingId] = []
      }
      if (!state.userBookings[parkingId].includes(slotNumber)) {
        state.userBookings[parkingId].push(slotNumber)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userBookings))
    },

    REMOVE_USER_BOOKING(state, { parkingId, slotNumber }) {
      if (state.userBookings[parkingId]) {
        state.userBookings[parkingId] = state.userBookings[parkingId].filter(num => num !== slotNumber)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userBookings))
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
