import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.prototype.NumberAdd = function (arg1, arg2) {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split(".")[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split(".")[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2))
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m + arg2 * m) / m).toFixed(n);
}
new Vue({
  render: h => h(App),
}).$mount('#app')
