import React, { useEffect, useState } from 'react'
import '../styles/Bookings.css' // Use the same CSS as the main bookings page
import axios from 'axios';
import { jsPDF } from "jspdf"; 

const FlightBookings = () => {
  const [bookings, setBookings] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchBookings();
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-bookings');
      // For Operator, we show ALL bookings, so we don't filter by userId here
      setBookings(response.data.reverse());
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
  }

  const downloadTicket = (booking) => {
    const doc = new jsPDF();
    doc.text("FLIGHT TICKET", 80, 20);
    doc.text(`Booking ID: ${booking._id}`, 20, 40);
    doc.text(`Passenger: ${booking.email}`, 20, 50);
    doc.save(`Ticket_${booking._id}.pdf`);
  };

  return (
    <div className="user-bookingsPage">
      <h1 style={{textAlign: 'center', margin: '20px 0'}}>Operator Booking Management</h1>
      
      <div className="user-bookings">
        {bookings.map((booking) => (
          <div className="user-booking" key={booking._id}>
            <p><b>Booking ID:</b> {booking._id}</p>
            <span>
                <p><b>Email:</b> {booking.email}</p>
                <p><b>Flight:</b> {booking.flightName} ({booking.flightId})</p>
            </span>
            <span>
                <p><b>Route:</b> {booking.departure} → {booking.destination}</p>
                <p><b>Journey Date:</b> {booking.journeyDate.slice(0, 10)}</p>
            </span>
            <div>
                <p><b>Passengers & Seats:</b></p>
                <ul>
                    {booking.passengers.map((p, i) => (
                        <li key={i}>{p.name} (Age: {p.age})</li>
                    ))}
                </ul>
                <p style={{color: 'green', fontWeight: 'bold'}}>Seats: {booking.seats}</p>
            </div>
            <p><b>Status:</b> 
                <span style={{color: booking.bookingStatus === 'cancelled' ? 'red' : 'green'}}>
                     {booking.bookingStatus}
                </span>
            </p>
            {booking.bookingStatus === 'confirmed' && (
                <button className="btn btn-success btn-sm mt-2" onClick={() => downloadTicket(booking)}>
                    Download PDF
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlightBookings;