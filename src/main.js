import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

const books = createApp(App).mount('#app')

books.getUserInfo()
books.fetch() // initially fill list of books

document.addEventListener('keydown', (event) => {
    // hide user info on request
    if (event.key === 'u') books.user = undefined
})

axios.interceptors.request.use(csrfToken)
function csrfToken(request) {
    if (request.method === 'head' || request.method === 'get') return request
    if ('csrfToken' in document) {
        request.headers['x-csrf-token'] = document.csrfToken
        return request
    }
    return fetchToken().then(token => {
        document.csrfToken = token
        request.headers['x-csrf-token'] = document.csrfToken
        return request
        // eslint-disable-next-line no-unused-vars
    }).catch(_ => {
        document.csrfToken = null // set mark to not try again
        return request
    })

    function fetchToken() {
        return axios.get('/', { headers: { 'x-csrf-token': 'fetch' } })
            .then(res => res.headers['x-csrf-token'])
    }
}