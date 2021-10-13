const knex = require("../db/connection");

const tableName = "reservations";

function list(date) {
  return knex(tableName)
    .where("reservation_date", date)
    .orderBy("reservation_time");
}

function create(reservation) {
  return knex(tableName)
    .insert(reservation, "*")
    .then((createdReservations) => createdReservations[0]);
}

module.exports = {
  create,
  list,
};