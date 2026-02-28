import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AllFlights.css';

const AllFlights = () => {
    const [flights, setFlights] = useState([]);
    const navigate = useNavigate();

    const fetchAllFlights = async () => {
        try {
            const response = await axios.get('http://localhost:6001/fetch-flights');
            setFlights(response.data);
        } catch (error) {
            console.error("Error fetching flights:", error);
        }
    };

    useEffect(() => {
        fetchAllFlights();
    }, []);

    return (
        <div className="AllFlightsPage">
            <h1>All Flights</h1>
            <div className="flights-container">
                {flights.length > 0 ? (
                    flights.map((flight) => (
                        <div key={flight._id} className="flight-card">
                            <h3>{flight.flightName} ({flight.flightId})</h3>
                            <p>From: {flight.origin} To: {flight.destination}</p>
                            <p>Price: {flight.basePrice}</p>
                            <button onClick={() => navigate(`/edit-flight/${flight._id}`)}>Edit</button>
                        </div>
                    ))
                ) : (
                    <p>No flights found in database.</p>
                )}
            </div>
        </div>
    );
};

export default AllFlights;