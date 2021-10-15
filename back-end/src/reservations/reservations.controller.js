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

  if (invalidFields.length)
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  next();
}

function bodyDataHas(propertyName) {
  console.log("bodydatahas");

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
  console.log("isvaliddate");

  const { data = {} } = req.body;
  const reservation_date = new Date(data["reservation_date"]);
  const day = reservation_date.getUTCDay();
  console.log(
    "server:",
    "reservation_date",
    reservation_date,
    "new Date()",
    new Date(),
    "day",
    day
  );
  if (isNaN(Date.parse(data["reservation_date"]))) {
    console.log("isNaN");
    return next({ status: 400, message: `Invalid reservation_date` });
  }
  if (day === 2) {
    console.log("its a tuesday");
    return next({ status: 400, message: `Restaurant is closed on Tuesdays` });
  }
  if (Date.parse(reservation_date) < Date.now()) {
    console.log("is less than");
    return next({
      status: 400,
      message: `Reservation must be set in the future`,
    });
  }
  next();
}

function isTime(req, res, next) {
  console.log("istime");

  const { data = {} } = req.body;
  if (
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(data["reservation_time"]) ||
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
      data["reservation_time"]
    )
  ) {
    return next();
  }
  next({ status: 400, message: `Invalid reservation_time` });
}

// function checkStatus(req, res, next) {
//   const { data = {} } = req.body;
//   if (data["status"] === "seated" || data["status"] === "finished") {
//     return next({ status: 400, message: `status is ${data["status"]}` });
//   }
//   next();
// }

function isValidNumber(req, res, next) {
  console.log("isvalidnumber");

  const { data = {} } = req.body;
  if (data["people"] === 0 || !Number.isInteger(data["people"])) {
    return next({ status: 400, message: `Invalid number of people` });
  }
  next();
}

async function list(req, res) {
  const data = await service.list(req.query.date);

  res.json({
    data: [...data],
  });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

const has_first_name = bodyDataHas("first_name");
const has_last_name = bodyDataHas("last_name");
const has_mobile_number = bodyDataHas("mobile_number");
const has_reservation_date = bodyDataHas("reservation_date");
const has_reservation_time = bodyDataHas("reservation_time");
const has_people = bodyDataHas("people");

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
    isValidNumber,
    // checkStatus,
    asyncErrorBoundary(create),
  ],
  list: [asyncErrorBoundary(list)],
};
