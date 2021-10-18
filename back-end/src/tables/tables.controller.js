const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

//* Validation vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

async function hasReservationId(req, res, next) {
  if (req.body?.data?.reservation_id) {
    return next();
  }
  next({
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
  next({
    status: 404,
    message: `Reservation with id: ${reservation_id} was not found`,
  });
}

async function reservationIsBooked(req, res, next) {
  const { reservation } = res.locals;
  if (reservation.status !== "seated") {
    return next();
  }
  next({
    status: 400,
    message: `Reservation is already 'seated'`,
  });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table with id: ${table_id} was not found`,
  });
}

function tableIsBigEnough(req, res, next) {
  const { table, reservation } = res.locals;
  if (table.capacity >= reservation.people) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} does not have the capacity to seat this reservation: capacity must be at least ${reservation.people}`,
  });
}

function tableIsFree(req, res, next) {
  const { table } = res.locals;
  if (!table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} is already occupied`,
  });
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
  next({
    status: 400,
    message: `Table with id: ${table.table_id} could not be assigned reservation id ${table.reservation_id}  for some reason. Please contact backend engineer for assistance`,
  });
}

function tableIsOccupied(req, res, next) {
  const { table } = res.locals;
  if (table.reservation_id) {
    return next();
  }
  next({
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
  next({
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
  next();
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
  next();
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
  res.json({ data });
}

//! CRUDL ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidValues,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  assignReservationId: [
    asyncErrorBoundary(hasReservationId),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(reservationIsBooked),
    asyncErrorBoundary(tableExists),
    tableIsBigEnough,
    tableIsFree,
    occupyTable,
    asyncErrorBoundary(update),
  ],
  deleteReservationId: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    deOccupyTable,
    asyncErrorBoundary(update),
  ],
  list: asyncErrorBoundary(list),
};

// const service = require("./tables.service");
// const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
// const reservationService = require("../reservations/reservations.service");

// function bodyDataHas(propertyName) {
//   return function (req, res, next) {
//     const { data = {} } = req.body;
//     console.log("bodyDataHas 8 data", data);
//     if (data[propertyName]) {
//       return next();
//     }
//     return next({ status: 400, message: `Must include a ${propertyName}` });
//   };
// }

// const has_table_name = bodyDataHas("table_name");
// const has_capacity_property = bodyDataHas("capacity");

// function isValidTableName(req, res, next) {
//   const { table_name } = req.body.data;
//   console.log("isValidTableName 20 table_name", table_name);
//   if (table_name.length < 2) {
//     return next({ status: 400, message: `table_name length is too short.` });
//   }
//   return next();
// }

// function isValidNumber(req, res, next) {
//   const { capacity } = req.body.data;
//   console.log("isValidNumber 28 capacity", capacity);

//   if (isNaN(capacity)) {
//     return next({
//       status: 400,
//       message: `capacity field formatted incorrectly: ${capacity}. Needs to be a number.`,
//     });
//   } else {
//     return next();
//   }
// }

// async function hasReservationId(req, res, next) {
//   if (req.body?.data?.reservation_id) {
//     return next();
//   }
//   next({
//     status: 400,
//     message: `reservation_id is missing from request`,
//   });
// }

// // validation middleware: checks that reservation exists
// async function reservationExists(req, res, next) {
//   const { reservation_id } = req.body.data;
//   console.log("reservationExists 41 reservation_id", reservation_id);
//   const data = await reservationService.read(reservation_id);
//   console.log("reservationExists 43 data", data);
//   //   if (data && data.status !== "seated") {
//   //     res.locals.reservation = data;
//   //     next();
//   //   }
//   //   else if (data && data.status === "seated") {
//   //     return next({
//   //       status: 400,
//   //       message: `reservation_id: ${reservation_id} is already seated.`,
//   //     });
//   //   }

//   if (data) return next();
//   else {
//     return next({
//       status: 404,
//       message: `reservation_id: ${reservation_id} does not exist.`,
//     });
//   }
// }

// async function reservationIsBooked(req, res, next) {
//   const { reservation } = res.locals;
//   if (reservation.status !== "seated") {
//     return next();
//   }
//   next({
//     status: 400,
//     message: `Reservation is already 'seated'`,
//   });
// }

// async function list(req, res) {
//   res.json({ data: await service.listbyName() });
// }

// async function create(req, res) {
//   const data = await service.create(req.body.data);
//   console.log("create 74 data", data);
//   res.status(201).json({
//     data,
//   });
// }

// function hasTableId(req, res, next) {
//   const table = req.params.table_id;
//   console.log("hasTableId 82 table", table);
//   if (table) {
//     res.locals.reservation = table;
//     return next();
//   } else {
//     return next({
//       status: 400,
//       message: `missing table_id`,
//     });
//   }
// }

// async function read(req, res) {
//   const reservation = res.locals.reservation;
//   console.log("read 96 reservation", reservation);
//   const data = await service.read(reservation);
//   res.status(200).json({ data: data });
// }

// function tableIsBigEnough(req, res, next) {
//   const { table, reservation } = res.locals;
//   if (table.capacity >= reservation.people) {
//     return next();
//   }
//   next({
//     status: 400,
//     message: `Table with id: ${table.table_id} does not have the capacity to seat this reservation: capacity must be at least ${reservation.people}`,
//   });
// }
// // seat a reservation at a table
// async function seat(req, res) {
//   const { table } = res.locals;
//   console.log("seat 119 table", table);
//   const { reservation_id } = res.locals.reservation;
//   console.log("seat 121 table", reservation_id);
//   const { table_id } = req.params;
//   console.log("seat 123 table_id", table_id);

//   const updatedTableData = {
//     ...table,
//     table_id: table_id,
//     reservation_id: reservation_id,
//     status: "Occupied",
//   };
//   console.log("seat 131 updatedTableData", updatedTableData);
//   const updatedTable = await service.seat(updatedTableData);
//   console.log("seat 133 updatedTable", updatedTable);
//   // set reservation status to "seated" using reservation id

//   const updatedReservation = {
//     status: "seated",
//     reservation_id: reservation_id,
//   };
//   console.log("seat 140 updatedReservation", updatedReservation);
//   await reservationService.update(updatedReservation);
//   res.json({ data: updatedTable });
// }

// async function tableExists(req, res, next) {
//   const { table_id } = req.params;
//   const table = await service.read(table_id);
//   if (table) {
//     res.locals.table = table;
//     return next();
//   }
//   next({
//     status: 404,
//     message: `Table with id: ${table_id} was not found`,
//   });
// }

// // finish an occupied table
// async function finish(req, res) {
//   const { table_id } = req.params;
//   const { table } = res.locals;
//   console.log("finish 163 table", table);
//   const updatedTableData = {
//     ...table,
//     status: "Free",
//   };
//   console.log("finish 168 updatedTableData", updatedTableData);
//   const updatedTable = await service.finish(updatedTableData);
//   // set reservation status to "finished" using reservation id
//   const updatedReservation = {
//     status: "finished",
//     reservation_id: table.reservation_id,
//   };
//   console.log("finish 175 updatedReservation", updatedReservation);
//   //NOT SURE ABOUT THIS FUNCTION. I THINK IT NEEDS TO BE CHANGED TO HAVE THE RES.JSON GET THE UPDATED DATA
//   await reservationService.update(updatedReservation);
//   res.json({ data: updatedTable });
// }

// function isOccupied(req, res, next) {
//   console.log("182 isOccupied");
//   const { status } = res.locals.table;
//   console.log("isOccupied 184 status", status);
//   if (status === "Occupied") {
//     return next();
//   } else {
//     return next({
//       status: 200,
//       message: "Table is not occupied.",
//     });
//   }
// }

// function isAvailable(req, res, next) {
//   console.log("196 isAvailable");

//   const { status } = res.locals.table;
//   console.log("isAvailable 199 status", status);
//   if (status === "Free") {
//     return next();
//   } else {
//     return next({
//       status: 400,
//       message: "Table is currently occupied.",
//     });
//   }
// }

// function isBooked(req, res, next) {
//   console.log("211 isBooked");

//   if (res.locals.reservation.status === "booked") {
//     console.log(
//       "isBooked 214 res.locals.reservation.status",
//       res.locals.reservation.status
//     );
//     return next();
//   } else {
//     // if it is seated:
//     return next({
//       status: 400,
//       message: `Reservation is ${res.locals.reservation.status}.`,
//     });
//   }
// }
// module.exports = {
//   create: [
//     has_table_name,
//     has_capacity_property,
//     isValidTableName,
//     isValidNumber,
//     //      hasValidFields,
//     asyncErrorBoundary(create),
//   ],
//   read: [hasTableId, asyncErrorBoundary(read)],
//   list: [asyncErrorBoundary(list)],
//   update: [
//     asyncErrorBoundary(hasReservationId),
//     asyncErrorBoundary(reservationExists),
//     asyncErrorBoundary(reservationIsBooked),
//     asyncErrorBoundary(tableExists),
//     isAvailable,

//     hasTableId,
//     // has_reservation_id,

//     isBooked,
//     asyncErrorBoundary(seat),
//   ],
//   finish: [
//     asyncErrorBoundary(tableExists),
//     isOccupied,
//     asyncErrorBoundary(finish),
//   ],
// };
