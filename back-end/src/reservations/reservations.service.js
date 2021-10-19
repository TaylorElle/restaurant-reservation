const knex = require("../db/connection");

const tableName = "reservations";

function list(date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
    .andWhereNot({ status: "finished" })
    .orderBy("reservation_time");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation, "*")
    .then((createdRecords) => createdRecords[0]);
}

function read(reservationId) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservationId })
    .then((records) => records[0]);
}
function update(updatedReservation) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((updatedReservations) => updatedReservations[0]);
}

function status(reservation) {
  update(reservation);
  return validStatus(reservation);
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
