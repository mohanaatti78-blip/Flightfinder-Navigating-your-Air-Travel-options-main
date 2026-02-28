import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/FlightAdmin.css'
import { useNavigate } from 'react-router-dom';

const FlightAdmin = () => {

  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState();
  const [bookingCount, setbookingCount] = useState(0);
  const [flightsCount, setFlightsCount] = useState(0);

  useEffect(()=>{
    fetchUserData();
    fetchData(); // Ensures data is fetched when component loads
  }, [])

  const fetchUserData = async () =>{
    try{
      const id = localStorage.getItem('userId');
      await axios.get(`http://localhost:6001/fetch-user/${id}`).then(
        (response)=>{
          setUserDetails(response.data);
        }
      )
    }catch(err){
       console.log("Error fetching user data:", err);
    }
  } 

  const fetchData = async () =>{
    const currentUsername = localStorage.getItem('username');

    // Fetch Bookings
    await axios.get('http://localhost:6001/fetch-bookings').then(
      (response)=>{
        // Filtering bookings by checking if flightName matches the logged-in username
        const filteredBookings = response.data.filter(booking => 
            booking.flightName?.toString().toLowerCase().trim() === currentUsername?.toLowerCase().trim()
        );
        setbookingCount(filteredBookings.length);
      }
    ).catch(err => console.log(err));

    // Fetch Flights
    await axios.get('http://localhost:6001/fetch-flights').then(
      (response)=>{
        // LOGIC UPDATE: Filtering flights that belong to THIS operator
        // Using lowercase and trim to prevent "0" count due to spaces or capital letters
        const filteredFlights = response.data.filter(flight => 
            flight.flightName?.toString().toLowerCase().trim() === currentUsername?.toLowerCase().trim()
        );
        
        setFlightsCount(filteredFlights.length);
        
        // Debugging: View this in F12 Console if it still shows 0
        console.log("Flights from DB:", response.data);
        console.log("Matching with Username:", currentUsername);
      }
    ).catch(err => console.log(err));
  }

  return (
    <div className="flightAdmin-page">

      {userDetails ?
        <>
          {userDetails.approval === 'not-approved' ?
            <div className="notApproved-box">
              <h3>Approval Required!!</h3>
              <p>Your application is under processing. It needs an approval from the administrator. Kindly please be patience!!</p>
            </div>

          : userDetails.approval === 'rejected' ?
            <div className="notApproved-box">
              <h3>Application Rejected!!</h3>
              <p>We are sorry to inform you that your application has been rejected!!</p>
          </div>
          : userDetails.approval === 'approved' ?
            
          <div className="admin-page-cards">

          <div className="card admin-card transactions-card">
              <h4>Bookings</h4>
              <button className="btn btn-primary" onClick={()=>navigate('/flight-bookings')}>View all</button>
          </div>

          <div className="card admin-card deposits-card">
              <h4>Flights</h4>
              <button className="btn btn-primary" onClick={()=>navigate('/flights')}>View all</button>
          </div>

          <div className="card admin-card loans-card">
              <h4>New Flight</h4>
              <button className="btn btn-primary" onClick={()=>navigate('/new-flight')}>Add now</button>
          </div>

      </div>

          :
            ""
          }
        </>
      :
       ""
      }

    </div>
  )
}

export default FlightAdmin