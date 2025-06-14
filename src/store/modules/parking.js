import axios from "axios";

const state = {
  parkings: [
    {
      id: 1,
      name: "Парковка тц",
      position: [47.2253, 39.7189],
      price: 50,
      address: "ул. Большая Садовая, 10",
      places: 24,
      selected: false,
      distance: null,
      availablePlaces: 2
    },
    {
      id: 2,
      name: "Парковка тц",
      position: [47.2301, 39.7235],
      price: 120,
      address: "пер. Соборный, 5",
      places: 12,
      selected: false,
      distance: null,
      availablePlaces: 1
    },
    {
      id: 3,
      name: "Парковка тц",
      position: [47.2208, 39.7123],
      price: 30,
      address: "ул. Пушкинская, 115",
      places: 32,
      selected: false,
      distance: null,
      availablePlaces: 0
    },
  ],
  selectedParking: null,
  selectedParkingDetail: null,
  bookingView: false,
  userPosition: null,
  isRouting: false,
  routeControl: null,
  filters: {
    maxDistance: 10,
    maxPrice: 500,
    onlyAvailable: false,
  },
};

const mutations = {
  SELECT_PARKING(state, { id }) {
    state.parkings.forEach((p) => (p.selected = false));
    const parking = state.parkings.find((p) => p.id === id);
    if (parking) {
      parking.selected = true;
      state.selectedParking = { ...parking };
    } else {
      state.selectedParking = null;
    }
  },

  SET_SELECTED_PARKING_DETAIL(state, payload) {
    state.selectedParkingDetail = payload;
  },
  SET_BOOKING_VIEW(state, payload) {
    state.bookingView = payload;
    if (payload === true) {
      state.selectedParkingDetail = null;
    }
  },

  CLEAR_SELECTED_PARKING(state) {
    state.selectedParking = null;
    state.parkings.forEach((p) => (p.selected = false));
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  SET_PARKINGS(state, parkings) {
    state.parkings = parkings;
  },  

  SET_USER_POSITION(state, position) {
    state.userPosition = position;
  },

  UPDATE_PARKING_DISTANCES(state, { userPosition }) {
    if (!userPosition) return;
  
    state.parkings.forEach((parking) => {
      if (parking.position) {
        const distance = calculateDistance(userPosition, parking.position); // в км (число)
        parking.distanceValue = distance; // <-- добавляем число для фильтрации
        parking.distance = `${distance.toFixed(1)} км`; // строка для отображения
      }
    });
  },

  SET_ROUTING(state, isRouting) {
    state.isRouting = isRouting;
  },

  SET_ROUTE_CONTROL(state, control) {
    // if (state.routeControl) {
    //   state.routeControl.remove();
    // }
    state.routeControl = control;
  },

  // CLEAR_ROUTE(state) {
  //   if (state.routeControl) {
  //     state.routeControl.remove();
  //     state.routeControl = null;
  //   }
  //   state.isRouting = false;
  // },
  CLEAR_ROUTE(state) {
    if (state.routeControl) {
      state.routeControl.off();  // удаляем все слушатели маршрута
      state.routeControl.remove(); // удаляем контрол с карты
      state.routeControl = null;
    }
    state.isRouting = false;
  },

  SET_SELECTED_PARKING_DETAIL(state, parking) {
    state.selectedParkingDetail = parking;
  },
  CLEAR_SELECTED_PARKING_DETAIL(state) {
    state.selectedParkingDetail = null;
  },
};

const actions = {
  async updateParkingDistances({ commit, rootState }) {
    if (rootState.geolocation.userLocation) {
      commit("UPDATE_PARKING_DISTANCES", {
        userPosition: rootState.geolocation.userLocation,
      });
    }
  },
  applyFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },
  loadParkings({ commit }, parkings) {
    commit('SET_PARKINGS', parkings);
  },

  selectParking({ commit }, payload) {
    commit('SELECT_PARKING', payload)
  },

  setUserPosition({ commit }, position) {
    commit("SET_USER_POSITION", position);
  },

  async buildRoute({ commit, state, rootState }) {
    if (!rootState.geolocation.userLocation || !state.selectedParking) {
      throw new Error("Location or parking not selected");
    }

    const isValidCoord = (coord) =>
      Array.isArray(coord) &&
      coord.length === 2 &&
      !isNaN(coord[0]) &&
      !isNaN(coord[1]);

    if (
      !isValidCoord(rootState.geolocation.userLocation) ||
      !isValidCoord(state.selectedParking.position)
    ) {
      throw new Error("Invalid coordinates");
    }

    commit("SET_ROUTING", true);

    try {
      const routeControl = L.Routing.control({
        waypoints: [
          L.latLng(rootState.geolocation.userLocation),
          L.latLng(state.selectedParking.position),
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "#0b02fd", opacity: 0.7, weight: 3 }],
        },
        createMarker: () => null,

        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
      });

      commit("SET_ROUTE_CONTROL", routeControl);
      return routeControl;
    } catch (error) {
      commit("CLEAR_ROUTE");
      commit("CLEAR_SELECTED_PARKING");
      console.error("Routing error:", error);
      throw error;
    }
  },

  cancelRoute({ commit }) {
    commit("CLEAR_ROUTE");
    commit("CLEAR_SELECTED_PARKING_DETAIL");
    commit("CLEAR_SELECTED_PARKING");
    commit("CLEAR_SELECTED_PARKING_DETAIL");
  }
};

const getters = {
  allParkings: (state) => state.parkings,
  selectedParking: (state) => state.selectedParking,
  isRouting: (state) => state.isRouting,
  searchParkings: (state) => (searchText) => {
    if (!searchText || searchText.trim() === "") return [];

    const query = searchText.toLowerCase().trim();
    return state.parkings.filter((parking) => {
      return (
        parking.address.toLowerCase().includes(query) ||
        `парковка ${parking.id}`.includes(query) ||
        parking.id.toString().includes(query)
      );
    });
  },
  filteredParkings: (state) => {
    return state.parkings.filter(parking => {
      const distance = parking.distance || 0;
      const matchesDistance = distance <= state.filters.maxDistance;
      const matchesPrice = parking.price <= state.filters.maxPrice;
      const matchesAvailability = state.filters.onlyAvailable ? parking.availablePlaces > 0 : true;
  
      return matchesDistance && matchesPrice && matchesAvailability;
    });
  }
};

function calculateDistance(pos1, pos2) {
  const R = 6371;
  const dLat = ((pos2[0] - pos1[0]) * Math.PI) / 180;
  const dLon = ((pos2[1] - pos1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1[0] * Math.PI) / 180) *
      Math.cos((pos2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
