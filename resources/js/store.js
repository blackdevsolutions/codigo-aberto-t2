import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import cretePersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        user: {}
    },
    mutations: {
        setUserState: (state, value) => state.user = value
    },
    actions: {
        userStateAction: ({commit}) => {
            axios.get('api/user/me').then(response => {
                const userResponse = response.data.user
                commit('setUserState', userResponse)
            })
        }
    },
    plugins: [ cretePersistedState() ]
})
