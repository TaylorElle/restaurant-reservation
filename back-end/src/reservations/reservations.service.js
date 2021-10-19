const knex = require("../db/connection");

const tableName = "reservations";

function list(date) {
  return knex(tableName)
    .select("*")
    .where("reservation_date", date)
    .whereNotIn("status", ["finished", "cancelled"])
    .orderBy("reservation_time");
}

function create(reservation) {
  return knex(tableName)
    .insert(reservation, "*")
    .then((createdRecords) => createdRecords[0]);
}

function read(reservationId) {
  return knex(tableName)
    .where({ reservation_id: reservationId })
    .then((records) => records[0]);
}

function status(reservation) {
  // console.log("26from status reservation", reservation);
  update(reservation);
  return validStatus(reservation);
}

function update(updatedReservation) {
  return knex(tableName)
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((updatedReservations) => updatedReservations[0]);
}

function validStatus(reservation) {
  if (
    ["booked", "seated", "finished", "cancelled"].includes(reservation.status)
  ) {
    return reservation;
  }
  const error = new Error(`Invalid status:"${reservation.status}"`);
  error.status = 400;
  throw error;
}

module.exports = {
  create,
  list,
  read,
  status,
};

/*

TODO: do a test with a good id and bad id and undefined id  etc USE postman
*/
