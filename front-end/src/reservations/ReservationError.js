import React from "react";

function ReservationErrors({ errors }) {
  if (errors) {
    return (
      <div className="alert alert-danger m-2">
        Error:{" "}
        {errors.map((error) => (
          <p key={error}>{error.message}</p>
        ))}
      </div>
    );
  } else return <div></div>;
}

export default ReservationErrors;
