const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function hasValidFields(req, res, next) {
  console.log("hasvalidfields");
  const { data = {} } = req.body;
  const validFields = new Set([
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
    "status",
    "created_at",
    "updated_at",
    "reservation_id",
  ]);

  const invalidFields = Object.keys(data).filter(
    (field) => !validFields.has(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}
const has_first_name = bodyHasData("first_name");
const has_last_name = bodyHasData("last_name");
const has_mobile_number = bodyHasData("mobile_number");
const has_reservation_date = bodyHasData("reservation_date");
const has_reservation_time = bodyHasData("reservation_time");
const has_people = bodyHasData("people");

function bodyHasData(propertyName) {
  // console.log("bodyHasData- property name:", propertyName);
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}
//convert to UTC format and then compare
function isValidDate(req, res, next) {
  console.log("43 isvaliddate");
  const { data = {} } = req.body;
  const reservationDateTime = new Date(
    `${data.reservation_date}T${data.reservation_time}`
  );
  console.log("line49 reservationDateTime", reservationDateTime);
  // const reservation_date = new Date(data["reservation_date"]);
  const day = reservationDateTime.getUTCDay();
  console.log("51 day ", day);
  console.log("52 reservation_date", data.reservation_date);
  console.log("53 new Date()", new Date());
  console.log("54 day", day);
  if (isNaN(Date.parse(data["reservation_date"]))) {
    console.log("56 isNaN");
    return next({ status: 400, message: `Invalid reservation_date` });
  }
  if (day === 2) {
    console.log("60 day =2");
    return next({ status: 400, message: `Restaurant is closed on Tuesdays` });
  }
  if (reservationDateTime < Date.now()) {
    console.log("64 reservationDateTime < Date.now()");
    return next({
      status: 400,
      message: `Reservation must be set in the future`,
    });
  }
  next();
}

function isTime(req, res, next) {
  console.log("line 74 istime");

  const { data = {} } = req.body;
  if (
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(data["reservation_time"]) ||
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
      data["reservation_time"]
    )
  ) {
    console.log(
      "line 83--",
      /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(data["reservation_time"]) ||
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
          data["reservation_time"]
        )
    );
    return next();
  }
  next({ status: 400, message: `Invalid reservation_time` });
}

function duringOperatingHours(req, res, next) {
  console.log(" line 89 durinOperatingHours");
  const { reservation_time } = req.body.data;
  console.log(reservation_time);
  const open = 1030;
  const close = 2130;
  const reservation =
    reservation_time.substring(0, 2) + reservation_time.substring(3);
  console.log(reservation);
  if (reservation > open && reservation < close) {
    console.log("line 98", reservation > open && reservation < close);
    return next();
  } else {
    return next({
      status: 400,
      message: "Reservations are only allowed between 10:30am and 9:30pm",
    });
  }
}

function checkStatus(req, res, next) {
  const { data = {} } = req.body;
  console.log("127 data[status]", data["status"]);
  if (data["status"] === "seated" || data["status"] === "finished") {
    return next({ status: 400, message: `status is ${data["status"]}` });
  }
  next();
}
async function unfinishedStatus(req, res, next) {
  if ("booked" !== res.locals.reservation.status) {
    next({
      status: 400,
      message: `Reservation status: '${res.locals.reservation.status}'.`,
    });
  } else {
    next();
  }
}

function isValidNumber(req, res, next) {
  console.log(" line 116 isvalidnumber");

  const { data = {} } = req.body;
  console.log(data);
  if (data["people"] === 0 || !Number.isInteger(data["people"])) {
    console.log(data["people"] === 0 || !Number.isInteger(data["people"]));
    return next({ status: 400, message: `Invalid number of people` });
  }
  next();
}

function hasReservationId(req, res, next) {
  const reservation = req.params.reservation_id || req.body.data.reservation_id;
  console.log("147 reservation", reservation);
  if (reservation) {
    res.locals.reservation_id = reservation;
    return next();
  } else {
    return next({
      status: 400,
      message: `missing reservation_id`,
    });
  }
}

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  console.log("160 reservationId", reservationId);
  const reservation = await service.read(Number(reservationId));
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    next({ status: 404, message: `Reservation not found: ${reservationId}` });
  }
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

async function list(req, res) {
  console.log("list line 128");
  const data = await service.list(req.query.date);

  res.json({
    data: [...data],
  });
}

async function read(req, res) {
  const reservation = res.locals.reservation;
  res.status(200).json({
    data: reservation,
  });
}

async function status(req, res) {
  res.locals.reservation.status = req.body.data.status;
  console.log(
    "192  res.locals.reservation.status",
    res.locals.reservation.status
  );
  const data = await service.status(Number(res.locals.reservation));
  res.json({ data });
}

module.exports = {
  create: [
    hasValidFields,
    has_first_name,
    has_last_name,
    has_mobile_number,
    has_reservation_date,
    has_reservation_time,
    has_people,
    isValidDate,
    isTime,
    duringOperatingHours,
    isValidNumber,
    checkStatus,
    asyncErrorBoundary(create),
  ],
  list: [asyncErrorBoundary(list)],
  read: [reservationExists, asyncErrorBoundary(read)],
  status: [
    hasReservationId,
    reservationExists,
    unfinishedStatus,
    asyncErrorBoundary(status),
  ],
};
