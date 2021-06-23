<template>
    <app-layout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Chat
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg flex" style="min-height: 400px; max-height: 400px;">

                    <!-- list users -->
                    <div class="w-3/12 bg-gray-200 bg-opacity-25 border-r border-gray-200 overflow-y-scroll">
                        <ul>
                            <li
                                v-for="user in users" :key="user.id"
                                @click="() => {loadMessages(user.id)}"
                                :class="(userActive && userActive.id == user.id) ? 'bg-gray-200 bg-opacity-50' : ''"
                                class="p-6 text-lg text-gray-600 leading-7  font-semibold border-b border-gray-200 hover:bg-gray-200 hover:bg-opacity-50 hover:cursor-pointer">
                                <p class="flex items-center">
                                    {{ user.name }}
                                    <span v-if="user.notification" class="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                </p>
                            </li>
                        </ul>
                    </div>

                    <!-- box message -->
                    <div class="w-9/12 flex flex-col justify-between">

                        <!-- message -->
                        <div class="w-full p-6 flex flex-col overflow-y-scroll">
                            <div
                                v-for="message in messages" :key="message.id"
                                :class="(message.from == $page.auth.user.id) ? 'text-right' : ''"
                                class="w-full mb-3 message">
                                <p
                                    :class="(message.from == $page.auth.user.id) ? 'messageFromMe' : 'messageToMe'"
                                    class="inline-block p-2 rounded-md" style="max-width: 75%;">
                                    {{ message.content }}
                                </p>
                                <span class="block mt-1 text-xs text-gray-500">{{ message.created_at | formatDate }}</span>
                            </div>
                        </div>

                        <!-- form -->
                        <div v-if="userActive" class="w-full bg-gray-200 bg-opacity-25 p-6 border-t border-gray-200">
                        <form v-on:submit.prevent="sendMessage">
                            <div class="flex rounded-md overflow-hidden border border-gray-300">
                            <input v-model="message" type="text" class="flex-1 px-4 py-2 text-sm focus:outline-none">
                            <button type="submit" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2">Enviar</button>
                            </div>
                        </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </app-layout>
</template>

<script>
    import Vue from 'vue'
    import AppLayout from '@/Layouts/AppLayout'
    import store from '../store'

    export default {
        components: {
            AppLayout,
        },
        data() {
            return {
                users: [],
                messages: [],
                userActive: null,
                message: ''
            }
        },
        computed: {
            user() {
                return store.state.user
            }
        },
        methods: {
            scrollToBottom: function() {
                if(this.messages.length) {
                    document.querySelectorAll('.message:last-child')[0].scrollIntoView()
                }
            },
            loadMessages: async function(userId) {

                axios.get(`api/users/${userId}`).then(response => {
                    this.userActive = response.data.user
                })

                await axios.get(`api/messages/${userId}`).then(response => {
                    this.messages = response.data.messages
                })

                const user = this.users.filter((user) => {
                    if (user.id === userId) {
                        return user
                    }
                })

                if (user) {
                    //user.notificaion = true [Deveria ser reativo, mas não vai funcionar... então...]
                    Vue.set(user[0], 'notification', false)
                }

                this.scrollToBottom()
            },
            sendMessage: async function() {

                await axios.post('api/messages/store', {
                    'content': this.message,
                    'to': this.userActive.id
                }).then(response => {

                    this.messages.push({
                        'from': this.user.id,
                        'to': this.userActive.id,
                        'content': this.message,
                        'created_at': new Date().toISOString(),
                        'updated_at': new Date().toISOString()
                    })

                    this.message = ''
                })

                this.scrollToBottom()
            },
        },
        mounted() {

            axios.get('api/users').then(response => {
                this.users = response.data.users
            })

            Echo.private(`user.${this.user.id}`).listen('.SendMessage', async (e) => {

                if(this.userActive && this.userActive.id === e.message.from) {
                    await this.messages.push(e.message)
                    this.scrollToBottom()
                } else {
                    const user = this.users.filter((user) => {
                        if (user.id === e.message.from) {
                            return user
                        }
                    })

                    if (user) {
                        //user.notificaion = true [Deveria ser reativo, mas não vai funcionar... então...]
                        Vue.set(user[0], 'notification', true)
                    }
                }
                console.log(e)
            })
        }
    }
</script>

<style>
.messageFromMe {
    @apply bg-indigo-300 bg-opacity-25;
}

.messageToMe {
    @apply bg-gray-300 bg-opacity-25;
}
</style>
