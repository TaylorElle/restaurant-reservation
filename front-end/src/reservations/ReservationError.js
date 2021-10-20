import React from "react";

function ReservationErrors({ errors = [] }) {
  if (errors !== null)
    if (errors.length) {
      console.log("errors:", errors);
      return (
        <div className="alert alert-danger">
          Error:
          {errors.map((error) => (
            <p key={error}>{error.message}</p>
          ))}
        </div>
      );
    }
  return null;
}

export default ReservationErrors;
