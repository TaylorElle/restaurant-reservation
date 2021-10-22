import React, { useState } from "react";
import { listReservations } from "../utils/api";
import Reservations from "../dashboard/Reservations";

function Search() {
  const [reservations, setReservations] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [showResults, setShowResults] = useState(false);

  function changeHandler({ target: { value } }) {
    setMobileNumber(value);
  }

  function submitHandler(event) {
    const abortController = new window.AbortController();

    event.preventDefault();

    setShowResults(false);
    listReservations({ mobile_number: mobileNumber }, abortController.signal)
      .then(setReservations)
      .then(() => setShowResults(true));
  }

  return (
    <main>
      <h1>Search reservations</h1>
      <form onSubmit={submitHandler}>
        <div className="row">
          <div className="form-group col-md-4 col-sm-12">
            <label htmlFor="mobile_number">Mobile Number:</label>
            <div className="input-group">
              <input
                type="text"
                id="mobile_number"
                name="mobile_number"
                className="form-control"
                value={mobileNumber}
                placeholder="Enter a customer's phone number"
                onChange={changeHandler}
              />
              <div className="input-group-append">
                <button type="submit" className="btn-primary">
                  Find
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      {showResults && <Reservations reservations={reservations} />}
    </main>
  );
}

export default Search;
