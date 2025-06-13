import axios from "axios";
import L from "leaflet";
const state = {
  userLocation: null,
  userCity: null,
  cityCoordinates: {
    Москва: [55.7558, 37.6176],
    "Санкт-Петербург": [59.9343, 30.3351],
    "Ростов-на-Дону": [47.2225, 39.7187],
    Казань: [55.7963, 49.1088],
    Новосибирск: [55.0084, 82.9357],
  },
  error: null,
  isLoading: false,
};

const mutations = {
  SET_LOCATION(state, location) {
    if (location && Array.isArray(location)) {
      state.userLocation = location;
    }
  },
  SET_ERROR(state, error) {
    state.error = error;
    state.isLoading = false;
  },
  SET_LOADING(state) {
    state.isLoading = true;
    state.error = null;
  },
  SET_CITY(state, city) {
    if (city && typeof city === "string") {
      state.userCity = city;
    }
  },
  SET_CITY_COORDINATES(state, { city, coordinates }) {
    state.cityCoordinates = {
      ...state.cityCoordinates,
      [city]: coordinates,
    };
    localStorage.setItem(
      "cityCoordinates",
      JSON.stringify(state.cityCoordinates)
    );
  },
};

function getGeolocationErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Пользователь запретил доступ к геолокации";
    case error.POSITION_UNAVAILABLE:
      return "Информация о местоположении недоступна";
    case error.TIMEOUT:
      return "Время ожидания определения местоположения истекло";
    default:
      return "Произошла неизвестная ошибка геолокации";
  }
}

const actions = {
  async fetchUserLocation({ commit, dispatch }) {
    commit("SET_LOADING");

    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation не поддерживается в этом браузере"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => reject(new Error(getGeolocationErrorMessage(error))),
          { timeout: 10000 }
        );
      });

      const coords = [position.coords.latitude, position.coords.longitude];

      commit("SET_LOCATION", coords);
      await dispatch("fetchCityByCoordinates", coords);
    } catch (error) {
      commit("SET_ERROR", error.message || error);
      console.error("Ошибка определения геолокации:", error);

      // Фоллбэк — попытка определения по IP через ipinfo.io
      try {
        const response = await axios.get(
          "https://ipinfo.io/json?token=b0f91993194d55"
        );

        if (response.data.loc) {
          const [lat, lon] = response.data.loc.split(",");
          const coords = [parseFloat(lat), parseFloat(lon)];

          commit("SET_LOCATION", coords);
        }

        if (response.data.city) {
          commit("SET_CITY", response.data.city);
        }
      } catch (ipError) {
        commit("SET_ERROR", "Не удалось определить местоположение по IP");
        console.error("Ошибка IP-геолокации:", ipError);
      }
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchCityByCoordinates({ commit }, [lat, lon]) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { "Accept-Language": "ru" } }
      );

      const address = response.data?.address;
      const city =
        address?.city || address?.town || address?.village || address?.county;

      if (city) {
        commit("SET_CITY", city);
      } else {
        throw new Error("Город не найден в ответе");
      }
    } catch (error) {
      commit("SET_ERROR", "Не удалось определить город по координатам");
      throw error;
    }
  },

  async selectCity({ commit, state, dispatch }, cityName) {
    commit("SET_CITY", cityName);

    if (state.cityCoordinates[cityName]) {
      return {
        coordinates: state.cityCoordinates[cityName],
        zoom: 12,
      };
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          cityName
        )}&format=json&limit=1`
      );

      if (response.data?.length > 0) {
        const coordinates = [
          parseFloat(response.data[0].lat),
          parseFloat(response.data[0].lon),
        ];

        commit("SET_CITY_COORDINATES", {
          city: cityName,
          coordinates,
        });

        return { coordinates, zoom: 12 };
      }
    } catch (error) {
      console.error("Ошибка геокодинга:", error);
      throw new Error("Не удалось определить координаты города");
    }

    return null;
  },

  async initCityCoordinates({ commit }) {
    const savedCoordinates = localStorage.getItem("cityCoordinates");
    if (savedCoordinates) {
      commit("SET_CITY_COORDINATES", {
        city: "",
        coordinates: JSON.parse(savedCoordinates),
      });
    }
  },
};

const getters = {
  coordinates: (state) => state.userLocation,
  hasLocation: (state) => !!state.userLocation,
  userCity: (state) => state.userCity,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
