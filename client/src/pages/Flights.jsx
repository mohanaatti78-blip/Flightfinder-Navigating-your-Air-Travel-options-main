import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AllFlights.css';

const Flights = () => {
    const [flights, setFlights] = useState([]);
    const navigate = useNavigate();

    const fetchAllFlights = async () => {
        try {
            // Fetch the updated list from backend
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
            <h1 className="ms-4 mt-3">All Flights</h1>
            <div className="container mt-4">
                {flights.length > 0 ? (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Flight Name</th>
                                <th>Flight Id</th>
                                <th>On-Boarding</th>
                                <th>Destination</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flights.map((flight) => (
                                <tr key={flight._id}>
                                    <td>{flight.flightName}</td>
                                    <td>{flight.flightId}</td>
                                    <td>{flight.origin}</td>
                                    <td>{flight.destination}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-warning" 
                                            onClick={() => navigate(`/edit-flight/${flight._id}`)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center mt-5">
                        <h4>No flights found. Ensure your backend server is running.</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Flights;