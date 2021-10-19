import React from "react";
import { a } from "react-router-dom";

function Reservations({ reservations = [] }) {
  const rows = reservations.length ? (
    reservations.map((reservation) => {
      return (
        <div className="form-group row" key={reservation.reservation_id}>
          <div className="col-sm-1">{reservation.reservation_id}</div>
          <div className="col-sm-1">
            {reservation.first_name}, {reservation.last_name}
          </div>
          <div className="col-sm-1">{reservation.mobile_number}</div>
          <div className="col-sm-1">{reservation.reservation_date}</div>
          <div className="col-sm-1">{reservation.reservation_time}</div>
          <div className="col-sm-1">{reservation.people}</div>
          <div
            className="col-sm-1"
            data-reservation-id-status={reservation.reservation_id}
          >
            {reservation.status}
          </div>

          {/* {reservation.status === "booked" ?  */}
          <div className="col-sm-1">
            <a
              className="btn btn-secondary mr-1"
              href={`/reservations/${reservation.reservation_id}/seat`}
            >
              seat
            </a>
            {/* <a
                className="btn btn-secondary mr-1"
                href={`/reservations/${reservation.reservation_id}/edit`}
              >
                edit
              </a>
              <a
                className="btn btn-danger"
                href={`/reservations/${reservation.reservation_id}/cancel`}
              >
                cancel
              </a> */}
          </div>
          {/* } */}
        </div>
      );
    })
  ) : (
    <div>No reservations found</div>
  );
  return <div className="table">{rows}</div>;
}

export default Reservations;
