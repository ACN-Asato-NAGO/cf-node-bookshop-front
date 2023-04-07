<template>
  <div id='app' class="small-container" style="margin-top: 70px;">
    <form class="user" @submit.prevent="login">
      <div v-if="user">
        <div v-if="user.tenant">Tenant: {{ user.tenant }}</div>
        <div> User: {{ user.id }}</div>
        <div>Locale: {{ user.locale }}</div>
      </div>
      <div v-else>
        <input type="submit" value="Login" class="muted-button">
        <!-- <a href="/user/login()">Login</a> -->
      </div>
    </form>

    <h1> Capire Books </h1>

    <input type="text" placeholder="Search..." @input="search">

    <table id='books' class="hovering">
      <thead>
        <th> Book </th>
        <th> Author </th>
        <th> Genre </th>
        <th> Rating </th>
        <th> Price </th>
      </thead>
      <tr v-for="book in list" v-bind:key="book.ID" v-bind:id="book.ID" v-on:click="inspect">
        <td>{{ book.title }}</td>
        <td>{{ book.author }}</td>
        <td>{{ book.genre.name }}</td>
        <td class="rating-stars">
          {{ ('★'.repeat(Math.round(book.rating)) + '☆☆☆☆☆').slice(0, 5) }} ({{ book.numberOfReviews }})
        </td>
        <td>{{ book.currency && book.currency.symbol }} {{ book.price }}</td>
      </tr>
    </table>

    <div v-if="book">
      <img v-bind:src="book.image" alt="" />
      <label style="text-align:right">
        <span class="succeeded"> {{ order.succeeded }} </span>
        <span class="failed"> {{ order.failed }} </span>
        &nbsp;&nbsp; {{ book.stock }} in stock
      </label>
      <form @submit.prevent="submitOrder" style="float:right; display:flex; flex-direction:row-reverse">
        <input type="number" v-model="order.quantity" v-bind:class="{ failed: order.failed }" style="width:5em">
        <input type="submit" value="Order:" class="muted-button">
      </form>
      <h4> {{ book.title }} </h4>
      <p> {{ book.descr }} </p>
    </div>
    <div v-else>
      ( click on a row to see details... )
    </div>

  </div>
</template>

<script>
import axios from 'axios'

const $ = sel => document.querySelector(sel)
const api = '/browse';
const GET = (url) => axios.get(`${api}/${url}`)
const POST = (cmd, data) => axios.post(`${api}/${cmd}`, data)


export default {
  name: 'App',
  data() {
    return {
      list: [],
      book: undefined,
      order: { quantity: 1, succeeded: '', failed: '' },
      user: undefined
    }
  },
  methods: {

    search({ target: { value: v } }) { this.fetch(v && '&$search=' + v) },

    async fetch(etc = '') {
      const { data } = await GET(`ListOfBooks?$expand=genre,currency${etc}`)
      this.$data.list = data.value
    },

    async inspect(eve) {
      const book = this.$data.book = this.$data.list[eve.currentTarget.rowIndex - 1]
      const res = await GET(`Books/${book.ID}?$select=descr,stock,image`)
      Object.assign(book, res.data)
      this.$data.order = { quantity: 1 }
      setTimeout(() => $('form > input').focus(), 111)
    },

    async submitOrder() {
      const { book, order } = this.$data, quantity = parseInt(order.quantity) || 1 // REVISIT: Okra should be less strict
      try {
        const res = await POST(`submitOrder`, { quantity, book: book.ID })
        book.stock = res.data.stock
        this.$data.order = { quantity, succeeded: `Successfully ordered ${quantity} item(s).` }
      } catch (e) {
        this.$data.order = { quantity, failed: e.response.data.error ? e.response.data.error.message : e.response.data }
      }
    },

    async login() {
      try {
        const { data: user } = await axios.post('/user/login', {})
        if (user.id !== 'anonymous') this.$data.user = user
      } catch (err) { this.$data.user = { id: err.message } }
    },

    async getUserInfo() {
      try {
        const { data: user } = await axios.get('/user/me')
        if (user.id !== 'anonymous') this.$data.user = user
      } catch (err) { this.$data.user = { id: err.message } }
    },
  }
}

</script>

<style>
.hovering tr:hover td {
  color: cyan;
  background: #123;
  cursor: pointer;
}

.rating-stars {
  color: teal
}

.succeeded {
  color: teal
}

.failed {
  color: red
}

.user {
  text-align: end;
  color: grey;
}
</style>