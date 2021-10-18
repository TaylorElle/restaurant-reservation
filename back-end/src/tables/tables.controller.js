const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationService = require("../reservations/reservations.service");

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    console.log("bodyDataHas 8 data", data);
    if (data[propertyName]) {
      next();
    }
    return next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

const has_table_name = bodyDataHas("table_name");
const has_capacity_property = bodyDataHas("capacity");

function isValidTableName(req, res, next) {
  const { table_name } = req.body.data;
  console.log("isValidTableName 20 table_name", table_name);
  if (table_name.length < 2) {
    return next({ status: 400, message: `table_name length is too short.` });
  }
  next();
}

function isValidNumber(req, res, next) {
  const { capacity } = req.body.data;
  console.log("isValidNumber 28 capacity", capacity);

  if (!isNaN(capacity)) {
    next();
  } else {
    return next({
      status: 400,
      message: `capacity field formatted incorrectly: ${capacity}. Needs to be a number.`,
    });
  }
}

// validation middleware: checks that reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  console.log("reservationExists 41 reservation_id", reservation_id);
  const data = await reservationService.read(reservation_id);
  console.log("reservationExists 43 data", data);
  //   if (data && data.status !== "seated") {
  //     res.locals.reservation = data;
  //     next();
  //   }
  //   else if (data && data.status === "seated") {
  //     return next({
  //       status: 400,
  //       message: `reservation_id: ${reservation_id} is already seated.`,
  //     });
  //   }

  if (data) next();
  else {
    return next({
      status: 404,
      message: `reservation_id: ${reservation_id} does not exist.`,
    });
  }
}

async function list(req, res) {
  res.json({ data: await service.listbyName() });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  console.log("create 74 data", data);
  res.status(201).json({
    data,
  });
}

function hasTableId(req, res, next) {
  const table = req.params.table_id;
  console.log("hasTableId 82 table", table);
  if (table) {
    res.locals.reservation = table;
    next();
  } else {
    next({
      status: 400,
      message: `missing table_id`,
    });
  }
}

async function read(req, res) {
  const reservation = res.locals.reservation;
  console.log("read 96 reservation", reservation);
  const data = await service.read(reservation);
  res.status(200).json({ data: data });
}

function hasCapacity(req, res, next) {
  console.log("hasCapacity 102 res.locals", res.locals);
  const tableCapacity = res.locals.table.capacity;
  console.log("hasCapacity 104 tableCapacity", tableCapacity);
  const guests = res.locals.reservation.people;
  console.log("hasCapacity 99 guests", guests);
  if (tableCapacity < guests) {
    return next({
      status: 400,
      message: "Table does not have sufficient capacity.",
    });
  } else {
    next();
  }
}
// seat a reservation at a table
async function seat(req, res) {
  const { table } = res.locals;
  console.log("seat 119 table", table);
  const { reservation_id } = res.locals.reservation;
  console.log("seat 121 table", reservation_id);
  const { table_id } = req.params;
  console.log("seat 123 table_id", table_id);

  const updatedTableData = {
    ...table,
    table_id: table_id,
    reservation_id: reservation_id,
    status: "Occupied",
  };
  console.log("seat 131 updatedTableData", updatedTableData);
  const updatedTable = await service.seat(updatedTableData);
  console.log("seat 133 updatedTable", updatedTable);
  // set reservation status to "seated" using reservation id

  const updatedReservation = {
    status: "seated",
    reservation_id: reservation_id,
  };
  console.log("seat 140 updatedReservation", updatedReservation);
  await reservationService.update(updatedReservation);
  res.json({ data: updatedTable });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  console.log("tableExists 147 table_id", table_id);
  const table = await service.read(Number(table_id));
  console.log("tableExists 149 table", table);
  if (table) {
    res.locals.table = table;
    console.log("tableExists 152 res.locals.table", res.locals.table);
    next();
  } else {
    return next({ status: 404, message: `Table: ${table_id} does not exist.` });
  }
}

// finish an occupied table
async function finish(req, res) {
  const { table_id } = req.params;
  const { table } = res.locals;
  console.log("finish 163 table", table);
  const updatedTableData = {
    ...table,
    status: "Free",
  };
  console.log("finish 168 updatedTableData", updatedTableData);
  const updatedTable = await service.finish(updatedTableData);
  // set reservation status to "finished" using reservation id
  const updatedReservation = {
    status: "finished",
    reservation_id: table.reservation_id,
  };
  console.log("finish 175 updatedReservation", updatedReservation);
  //NOT SURE ABOUT THIS FUNCTION. I THINK IT NEEDS TO BE CHANGED TO HAVE THE RES.JSON GET THE UPDATED DATA
  await reservationService.update(updatedReservation);
  res.json({ data: updatedTable });
}

function isOccupied(req, res, next) {
  console.log("182 isOccupied");
  const { status } = res.locals.table;
  console.log("isOccupied 184 status", status);
  if (status === "Occupied") {
    next();
  } else {
    return next({
      status: 200,
      message: "Table is not occupied.",
    });
  }
}

function isAvailable(req, res, next) {
  console.log("196 isAvailable");

  const { status } = res.locals.table;
  console.log("isAvailable 199 status", status);
  if (status === "Free") {
    next();
  } else {
    return next({
      status: 400,
      message: "Table is currently occupied.",
    });
  }
}

function isBooked(req, res, next) {
  console.log("211 isBooked");

  if (res.locals.reservation.status === "booked") {
    console.log(
      "isBooked 214 res.locals.reservation.status",
      res.locals.reservation.status
    );
    next();
  } else {
    // if it is seated:
    return next({
      status: 400,
      message: `Reservation is ${res.locals.reservation.status}.`,
    });
  }
}
module.exports = {
  create: [
    has_table_name,
    has_capacity_property,
    isValidTableName,
    isValidNumber,
    //      hasValidFields,
    asyncErrorBoundary(create),
  ],
  read: [hasTableId, asyncErrorBoundary(read)],
  list: [asyncErrorBoundary(list)],
  update: [
    asyncErrorBoundary(tableExists),
    hasTableId,
    // has_reservation_id,
    asyncErrorBoundary(reservationExists),
    hasCapacity,
    isBooked,
    isAvailable,
    asyncErrorBoundary(seat),
  ],
  finish: [
    asyncErrorBoundary(tableExists),
    isOccupied,
    asyncErrorBoundary(finish),
  ],
};
