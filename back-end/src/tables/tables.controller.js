const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationService = require("../reservations/reservations.service");

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      next();
    }
    return next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

const has_table_name = bodyDataHas("table_name");
const has_capacity_property = bodyDataHas("capacity");
const has_reservation_id = bodyDataHas("reservation_id");

function isValidTableName(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    return next({ status: 400, message: `table_name length is too short.` });
  }
  next();
}

function isValidNumber(req, res, next) {
  const { capacity } = req.body.data;
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
  const data = await reservationService.read(reservation_id);
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
  res.status(201).json({
    data: data,
  });
  console.log(res.status);
}

function hasTableId(req, res, next) {
  const table = req.params.table_id;
  console.log(table);
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
  console.log(reservation);
  const data = await service.read(reservation);
  res.status(200).json({ data: data });
}

function hasCapacity(req, res, next) {
  console.log(res.locals);
  const tableCapacity = res.locals.table.capacity;
  console.log(tableCapacity);
  const guests = res.locals.reservation.people;
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
  const { reservation_id } = res.locals.reservation;
  const { table_id } = req.params;
  const updatedTableData = {
    ...table,
    table_id: table_id,
    reservation_id: reservation_id,
    status: "Occupied",
  };
  const updatedTable = await service.seat(updatedTableData);
  // set reservation status to "seated" using reservation id
  const updatedReservation = {
    status: "seated",
    reservation_id: reservation_id,
  };
  await reservationService.update(updatedReservation);
  res.json({ data: updatedTable });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  if (table) {
    res.locals.table = table;
    next();
  } else {
    return next({ status: 404, message: `Table: ${table_id} does not exist.` });
  }
}

// finish an occupied table
async function finish(req, res) {
  const { table_id } = req.params;
  const { table } = res.locals;
  const updatedTableData = {
    ...table,
    status: "Free",
  };
  const updatedTable = await service.finish(updatedTableData);
  // set reservation status to "finished" using reservation id
  const updatedReservation = {
    status: "finished",
    reservation_id: table.reservation_id,
  };
  await reservationService.update(updatedReservation);
  res.json({ data: updatedTable });
}

function isOccupied(req, res, next) {
  const { status } = res.locals.table;
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
  const { status } = res.locals.table;
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
  if (res.locals.reservation.status === "booked") {
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
    has_reservation_id,
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
