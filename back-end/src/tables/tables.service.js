const knex = require("../db/connection");

const tableName = "tables";

// list all tables - sorted by table_name

function listbyName() {
  return knex(tableName).select("*").orderBy("table_name");
}

// post a new table
function create(table) {
  return knex(tableName)
    .insert(table)
    .returning("*")
    .then((createdTables) => createdTables[0]);
}

// read a table by table_id - exists for validation purposes only
function read(table_id) {
  return knex(tableName).where("table_id", table_id).returning("*").first();
}

// seat a reservation at a table
function seat(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedTables) => updatedTables[0]);
}

// finish a table
function finish(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedTables) => updatedTables[0]);
}

module.exports = {
  listbyName,
  create,
  read,
  seat,
  finish,
};
