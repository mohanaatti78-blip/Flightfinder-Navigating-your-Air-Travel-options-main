import React, { useEffect, useState, useCallback } from 'react';
import '../styles/NewFlight.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditFlight = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Initialize state with default values
    const [flightName, setFlightName] = useState('');
    const [flightId, setFlightId] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [startTime, setStartTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [totalSeats, setTotalSeats] = useState(0);
    const [basePrice, setBasePrice] = useState(0);

    // Fetch existing data to populate the form
    const fetchFlightData = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:6001/fetch-flight/${id}`);
            const data = response.data;
            setFlightName(data.flightName || '');
            setFlightId(data.flightId || '');
            setOrigin(data.origin || '');
            setDestination(data.destination || '');
            setTotalSeats(data.totalSeats || 0);
            setBasePrice(data.basePrice || 0);
            setStartTime(data.departureTime || '');
            setArrivalTime(data.arrivalTime || '');
        } catch (error) {
            console.error("Error loading flight data:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchFlightData();
    }, [fetchFlightData]);

    const handleSubmit = async () => {
        const inputs = {
            _id: id,
            flightName,
            flightId,
            origin,
            destination,
            departureTime: startTime,
            arrivalTime,
            basePrice,
            totalSeats
        };

        try {
            // Update the flight in the database
            await axios.put('http://localhost:6001/update-flight', inputs);
            alert('Flight updated successfully!!');
            
            // Redirect to the "All Flights" page to see updated data
            navigate('/flights'); 
        } catch (err) {
            console.error("Update failed:", err);
            alert('Could not update flight details.');
        }
    };

    return (
        <div className='NewFlightPage'>
            <div className="NewFlightPageContainer">
                <h2>Edit Flight</h2>
                <span className='newFlightSpan1'>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control" value={flightName} onChange={(e) => setFlightName(e.target.value)} />
                        <label>Flight Name</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
                        <label>Flight Id</label>
                    </div>
                </span>
                <span>
                    <div className="form-floating mb-3">
                        <select className="form-select" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                            <option value="" disabled>Select Departure</option>
                            <option value="Jaipur">Jaipur</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                        </select>
                        <label>Departure City</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        <label>Departure Time</label>
                    </div>
                </span>
                <span>
                    <div className="form-floating mb-3">
                        <select className="form-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
                            <option value="" disabled>Select Destination</option>
                            <option value="Jaipur">Jaipur</option>
                            <option value="varanasi">varanasi</option>
                            <option value="Mumbai">Mumbai</option>
                        </select>
                        <label>Destination City</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="time" className="form-control" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
                        <label>Arrival time</label>
                    </div>
                </span>
                <span className='newFlightSpan2'>
                    <div className="form-floating mb-3">
                        <input type="number" className="form-control" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
                        <label>Total seats</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="number" className="form-control" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
                        <label>Base price</label>
                    </div>
                </span>
                <button className='btn btn-primary w-100' onClick={handleSubmit}>Update</button>
            </div>
        </div>
    );
};

export default EditFlight;