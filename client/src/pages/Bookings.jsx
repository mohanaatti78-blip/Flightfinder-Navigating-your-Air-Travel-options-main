import React, { useEffect, useState } from 'react'
import '../styles/Bookings.css'
import axios from 'axios';
import { jsPDF } from "jspdf"; 

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [userRole, setUserRole] = useState(""); 
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User details to verify role string
        const userRes = await axios.get(`http://localhost:6001/fetch-user/${userId}`);
        setUserRole(userRes.data.usertype);
        
        // 2. Fetch All Bookings from database
        const bookingsRes = await axios.get('http://localhost:6001/fetch-bookings');
        setBookings(bookingsRes.data.reverse());
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    fetchData();
  }, [userId]);

  const downloadTicket = (booking) => {
    const doc = new jsPDF();
    doc.text("FLIGHT TICKET", 80, 20);
    doc.text(`Booking ID: ${booking._id}`, 20, 40);
    doc.text(`Flight: ${booking.flightName}`, 20, 50);
    doc.text(`Seats: ${booking.seats}`, 20, 60);
    doc.save(`Ticket_${booking._id}.pdf`);
  };

  return (
    <div className="user-bookingsPage">
      {/* DEBUG HEADER: Shows you what the code sees. Remove this once fixed. */}
      <div style={{background: '#333', color: '#fff', padding: '5px', textAlign: 'center', fontSize: '12px'}}>
        System Role Detected: <b>"{userRole}"</b> | If this doesn't say "flight-operator", that is why it's failing.
      </div>

      <h1 style={{textAlign:'center', color: '#366878', margin: '20px 0'}}>
        {userRole === 'flight-operator' || userRole === 'admin' ? "Operator Management" : "My Bookings"}
      </h1>

      <div className="user-bookings">
        {bookings
          .filter(booking => {
            // THE FIX: If role matches operator or admin, return TRUE for all bookings
            const hasPrivileges = (userRole === 'admin' || userRole === 'flight-operator');
            
            if (hasPrivileges) {
              return true; // Show everything to Operator
            }
            return booking.user === userId; // Show only personal bookings to regular User
          })
          .map((booking) => (
            <div className="user-booking" key={booking._id}>
                <p><b>Booking ID:</b> {booking._id}</p>
                
                {/* Visual indicator for Operator global view */}
                {(userRole === 'admin' || userRole === 'flight-operator') && (
                  <p className="badge bg-primary">Customer ID: {booking.user}</p>
                )}

                <div className="booking-info">
                  <p><b>Flight:</b> {booking.flightName} ({booking.flightId})</p>
                  <p><b>Route:</b> {booking.departure} to {booking.destination}</p>
                  <p><b>Email:</b> {booking.email}</p>
                  <p><b>Seats:</b> <span style={{color: 'green', fontWeight: 'bold'}}>{booking.seats}</span></p>
                </div>

                <div className="passengers">
                  <b>Passengers:</b>
                  <ul>
                    {booking.passengers.map((p, i) => (
                      <li key={i}>{p.name} (Age: {p.age})</li>
                    ))}
                  </ul>
                </div>

                <p><b>Status:</b> 
                  <span style={{color: booking.bookingStatus === 'cancelled' ? 'red' : 'green', marginLeft: '5px'}}>
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

export default Bookings;