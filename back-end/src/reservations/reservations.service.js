const knex = require("../db/connection");

const tableName = "reservations";

function list(reservation_date) {
  return knex(tableName)
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .orderBy("reservation_time", "asc");
}

function create(newReservation) {
  return knex(tableName)
    .insert(newReservation, "*")
    .then((createdReservation) => createdReservation[0]);
}

function read(reservation_id) {
  return knex(tableName).where({ reservation_id }).first();
}

function updateStatus(reservation_id, status) {
  return knex(tableName)
    .where({ reservation_id })
    .update("status", status)
    .returning("*")
    .then((updatedResult) => updatedResult[0]);
}

function updateReservation(reservation) {
  return knex(tableName)
    .select("*")
    .where({ reservation_id: reservation.reservation_id })
    .update(reservation, "*")
    .then((updatedResult) => updatedResult[0]);
}

function search(mobile_phone) {
  return knex(tableName)
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_phone.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  create,
  list,
  read,
  updateStatus,
  updateReservation,
  search,
};
