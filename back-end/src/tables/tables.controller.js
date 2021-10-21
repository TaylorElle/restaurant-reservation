const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

//* Validation vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

function hasData(req, res, next) {
  if (!req.body.data) {
    return next({
      status: 400,
      message: `data is missing from request`,
    });
  }
  return next();
}

function hasReservationId(req, res, next) {
  if (req.body.data.reservation_id) {
    return next();
  }
  return next({
    status: 400,
    message: `reservation_id is missing from request`,
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await reservationsService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: `Reservation with id: ${reservation_id} was not found`,
  });
}

async function reservationIsBooked(req, res, next) {
  const reservation = res.locals.reservation;
  if (reservation.status !== "seated") {
    return next();
  }
  return next({
    status: 400,
    message: `Reservation is already 'seated'`,
  });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  if (table) {
    res.locals.table = table;
    return next();
  }
  return next({
    status: 404,
    message: `Table with id: ${table_id} was not found`,
  });
}

function tableIsBigEnough(req, res, next) {
  const tableCapacity = res.locals.table.capacity;
  const guests = res.locals.reservation.people;
  if (tableCapacity < guests) {
    return next({
      status: 400,
      message: `Too many guests ( ${guests} ) for table size. Please choose table with capacity.`,
    });
  } else {
    return next();
  }
}

function tableIsFree(req, res, next) {
  if (res.locals.table.reservation_id) {
    return next({
      status: 400,
      message: `Table id is occupied: ${res.locals.table.table_id}`,
    });
  } else {
    return next();
  }
}

function occupyTable(req, res, next) {
  const { table } = res.locals;
  const { reservation_id } = req.body.data;
  table.reservation_id = reservation_id;
  res.locals.resId = reservation_id;
  res.locals.resStatus = "seated";
  if (table.reservation_id) {
    return next();
  }
  return next({
    status: 400,
    message: `Table with id: ${table.table_id} could not be assigned reservation id ${table.reservation_id}  for some reason. Please contact backend engineer for assistance`,
  });
}

function tableIsOccupied(req, res, next) {
  const { table } = res.locals;
  if (table.reservation_id) {
    return next();
  }
  return next({
    status: 400,
    message: `Table with id: ${table.table_id} is not occupied`,
  });
}

function deOccupyTable(req, res, next) {
  const { table } = res.locals;
  res.locals.resId = table.reservation_id;
  table.reservation_id = null;
  res.locals.resStatus = "finished";
  if (!table.reservation_id) {
    return next();
  }
  return next({
    status: 400,
    message: `Table with id: ${table.table_id} could not remove reservation id ${table.reservation_id}  for some reason. Please contact backend engineer for assistance`,
  });
}

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  return next();
}

const hasRequiredProperties = hasProperties(...["table_name", "capacity"]);

function tableNameIsValid(tableName) {
  return tableName.length > 1;
}

function capacityIsValid(capacity) {
  return Number.isInteger(capacity) && capacity >= 1;
}

function hasValidValues(req, res, next) {
  const { table_name, capacity } = req.body.data;

  if (!capacityIsValid(capacity)) {
    return next({
      status: 400,
      message: "capacity must be a whole number greater than or equal to 1",
    });
  }
  if (!tableNameIsValid(table_name)) {
    return next({
      status: 400,
      message: "table_name must be more than one character",
    });
  }
  return next();
}

//! Validation ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//* CRUDL vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

async function list(req, res) {
  const tables = await service.list();
  res.locals.data = tables;
  const { data } = res.locals;
  res.json({ data: data });
}

// Create handler for a new table
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Read a table
async function read(req, res) {
  //* res.locals.table is being set from tableExists()
  const { table } = res.locals;
  res.json({ data: table });
}

// update handler for either assigning or removing a reservation from a table
//* resId and resStatus are coming from last middleware (occupy and deoccupy table) before update for BOTH adding and deleting reservation_ids from tables. They are needed for the knex transaction in tables.service.js
async function update(req, res) {
  const { table, resId, resStatus } = res.locals;
  const updatedTable = { ...table };
  const data = await service.update(updatedTable, resId, resStatus);
  res.status(200).json({ data });
}

//! CRUDL ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidValues,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  assignReservationId: [
    hasData,
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(reservationIsBooked),
    asyncErrorBoundary(tableExists),
    tableIsFree,
    tableIsBigEnough,
    occupyTable,
    asyncErrorBoundary(update),
  ],
  deleteReservationId: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    deOccupyTable,
    asyncErrorBoundary(update),
  ],
};
