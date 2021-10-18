// const knex = require("../db/connection");

// const tableName = "tables";

// // list all tables - sorted by table_name

// function listbyName() {
//   return knex(tableName).select("*").orderBy("table_name");
// }

// // post a new table
// function create(table) {
//   return knex(tableName)
//     .insert(table)
//     .returning("*")
//     .then((createdTables) => createdTables[0]);
// }

// // read a table by table_id - exists for validation purposes only
// function read(table_id) {
//   return knex(tableName).where("table_id", table_id).returning("*").first();
// }

// // seat a reservation at a table
// function seat(updatedTable) {
//   return knex("tables")
//     .select("*")
//     .where({ table_id: updatedTable.table_id })
//     .update(updatedTable, "*")
//     .then((updatedTables) => updatedTables[0]);
// }

// // finish a table
// function finish(updatedTable) {
//   return knex("tables")
//     .select("*")
//     .where({ table_id: updatedTable.table_id })
//     .update(updatedTable, "*")
//     .then((updatedTables) => updatedTables[0]);
// }

// module.exports = {
//   listbyName,
//   create,
//   read,
//   seat,
//   finish,
// };

const knex = require("../db/connection");

// returns all tables
function list() {
  return knex("tables").select("*").orderBy("table_name");
}

// posts new table
function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((newTables) => newTables[0]);
}

// returns a reservation for the specified id
function read(id) {
  return knex("tables")
    .select("*")
    .where({ table_id: id })
    .then((result) => result[0]);
}

// updates table after being assigned a reservation - also updates reservation status
async function update(updatedTable, resId, updatedResStatus) {
  try {
    await knex.transaction(async (trx) => {
      const returnedUpdatedTable = await trx("tables")
        .where({ table_id: updatedTable.table_id })
        .update(updatedTable, "*")
        .then((updatedTables) => updatedTables[0]);

      const returnedUpdatedReservation = await trx("reservations")
        .where({ reservation_id: resId })
        .update({ status: updatedResStatus }, "*")
        .then((updatedReservations) => updatedReservations[0]);
    });
  } catch (error) {
    // If we get here, neither the reservation nor table updates have taken place.
    console.error(error);
  }
}

module.exports = {
  create,
  read,
  update,
  list,
};
