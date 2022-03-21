module.exports = {
  apps : [{
    name   : "cash-book-service",
    script : "server.js",
    watch: ["server"],
    ignore_watch : ["wasession*.json", "wasessions.json", "test/**/*.js"],
    watch : true
  }]
}