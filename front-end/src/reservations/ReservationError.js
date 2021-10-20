import React from "react";

function ReservationErrors({ errors = [] }) {
  if (errors !== null)
    if (errors.length) {
      return (
        <div className="alert alert-danger">
          Error:
          {errors.map((error) => (
            <p key={error.index}>{error.message}</p>
          ))}
        </div>
      );
    }
  return null;
}

export default ReservationErrors;
