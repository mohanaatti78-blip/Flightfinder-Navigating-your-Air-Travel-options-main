import React, { useContext, useEffect, useState } from 'react'
import '../styles/BookFlight.css'
import { GeneralContext } from '../context/GeneralContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BookFlight = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [flightName, setFlightName] = useState('');
    const [flightId, setFlightId] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [StartCity, setStartCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [startTime, setStartTime] = useState();
    
    const [bookedSeats, setBookedSeats] = useState([]); 
    const [selectedSeats, setSelectedSeats] = useState([]); 
    const [totalSeats, setTotalSeats] = useState(0);

    const {ticketBookingDate} = useContext(GeneralContext);
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [coachType, setCoachType] = useState('');
    const [journeyDate, setJourneyDate] = useState(ticketBookingDate);
    const [numberOfPassengers, setNumberOfPassengers] = useState(0);
    const [passengerDetails, setPassengerDetails] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const price = {'economy': 1, 'premium-economy': 2, 'business': 3, 'first-class': 4}

    useEffect(()=>{
      fetchFlightData();
    }, [])

    const fetchFlightData = async () =>{
      try {
        const response = await axios.get(`http://localhost:6001/fetch-flight/${id}`);
        setFlightName(response.data.flightName);
        setFlightId(response.data.flightId);
        setBasePrice(response.data.basePrice);
        setStartCity(response.data.origin);
        setDestinationCity(response.data.destination);
        setStartTime(response.data.departureTime);
        setTotalSeats(response.data.totalSeats);
        setBookedSeats(response.data.bookedSeats || []);
      } catch (err) {
        console.error("Error fetching flight data", err);
      }
    }

    const handleSeatClick = (seatId) => {
        if (bookedSeats.includes(seatId)) return; 

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            if (selectedSeats.length < numberOfPassengers) {
                setSelectedSeats([...selectedSeats, seatId]);
            } else {
                alert(`You can only select ${numberOfPassengers} seats`);
            }
        }
    };

    const handlePassengerChange = (event) => {
      const value = parseInt(event.target.value) || 0;
      setNumberOfPassengers(value);
      setSelectedSeats([]); 
      setPassengerDetails(Array.from({ length: value }, () => ({ name: '', age: '' })));
    };
  
    const handlePassengerDetailsChange = (index, key, value) => {
      setPassengerDetails((prevDetails) => {
        const updatedDetails = [...prevDetails];
        updatedDetails[index] = { ...updatedDetails[index], [key]: value };
        return updatedDetails;
      });
    };
  
    useEffect(()=>{
      if(coachType && basePrice && numberOfPassengers){
        setTotalPrice(price[coachType] * basePrice * numberOfPassengers);
      }
    },[numberOfPassengers, coachType, basePrice])
  
    const bookFlight = async ()=>{
      if (selectedSeats.length !== numberOfPassengers) {
          alert(`Please select all ${numberOfPassengers} seats!`);
          return;
      }

      const inputs = {
          user: localStorage.getItem('userId'), 
          flight: id, 
          flightName, 
          flightId, 
          departure: StartCity, 
          journeyTime: startTime, 
          destination: destinationCity, 
          email, 
          mobile, 
          passengers: passengerDetails, 
          totalPrice, 
          journeyDate, 
          seatClass: coachType,
          manualSeats: selectedSeats.join(", ") 
      } 
      
      await axios.post('http://localhost:6001/book-ticket', inputs).then(
        (response)=>{
          alert("Booking successful!");
          navigate('/bookings');
        }
      ).catch((err)=>{
        alert("Booking failed!!")
      })
    }
  
    return (
      <div className='BookFlightPage'>
        <div className="BookingFlightPageContainer">
          <h2>Book ticket</h2>
          <div className="flight-info-summary">
            <p><b>Flight:</b> {flightName} ({flightId})</p>
            <p><b>Route:</b> {StartCity} to {destinationCity}</p>
          </div>
          
          <div className="booking-form-grid">
            <div className="form-floating mb-3">
                <input type="email" className="form-control" value={email} onChange={(e)=> setEmail(e.target.value)} />
                <label>Email</label>
            </div>
            <div className="form-floating mb-3">
                <input type="text" className="form-control" value={mobile} onChange={(e)=> setMobile(e.target.value)} />
                <label>Mobile</label>
            </div>
          </div>

          <div className='span3'>
            <div className="form-floating mb-3">
                <input type="number" className="form-control" value={numberOfPassengers} onChange={handlePassengerChange} />
                <label>No of passengers</label>
            </div>
            <div className="form-floating mb-3">
                <input type="date" className="form-control" value={journeyDate} onChange={(e)=>setJourneyDate(e.target.value)} />
                <label>Journey date</label>
            </div>
            <div className="form-floating">
                <select className="form-select" value={coachType} onChange={(e) => setCoachType(e.target.value) }>
                    <option value="" disabled>Select Class</option>
                    <option value="economy">Economy</option>
                    <option value="premium-economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first-class">First Class</option>
                </select>
                <label>Seat Class</label>
            </div>
          </div>

          {numberOfPassengers > 0 && coachType && (
              <div className="seat-selection-section">
                  <h4 className="text-center">Select Your Seats ({selectedSeats.length}/{numberOfPassengers})</h4>
                  
                  {/* SEAT LEGEND */}
                  <div className="seat-legend">
                    <div className="legend-item"><span className="legend-box available"></span> Available</div>
                    <div className="legend-item"><span className="legend-box selected"></span> Selected</div>
                    <div className="legend-item"><span className="legend-box booked"></span> Booked</div>
                  </div>

                  <div className="seat-grid">
                      {Array.from({ length: Math.ceil(totalSeats / 4) }).map((_, rowIndex) => (
                          <div key={rowIndex} className="seat-row">
                              {[1, 2, 3, 4].map((colIndex) => {
                                  const seatNum = (rowIndex * 4) + colIndex;
                                  if (seatNum > totalSeats) return null;

                                  const seatId = `${coachType.charAt(0).toUpperCase()}-${seatNum}`;
                                  const isBooked = bookedSeats.includes(seatId);
                                  const isSelected = selectedSeats.includes(seatId);

                                  return (
                                      <div 
                                          key={seatId} 
                                          className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                                          onClick={() => handleSeatClick(seatId)}
                                      >
                                          {seatId}
                                      </div>
                                  );
                              })}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="scrollable-passenger-list">
            {passengerDetails.map((_, index) => (
              <div className='new-passenger' key={index}>
                <h4>Passenger {index + 1}</h4>
                <div className="new-passenger-inputs">
                    <div className="form-floating mb-3">
                      <input type="text" className="form-control" value={passengerDetails[index]?.name || ''} onChange={(event) => handlePassengerDetailsChange(index, 'name', event.target.value) } />
                      <label>Name</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input type="number" className="form-control" value={passengerDetails[index]?.age || ''} onChange={(event) => handlePassengerDetailsChange(index, 'age', event.target.value) } />
                      <label>Age</label>
                    </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="booking-summary-footer">
            <h6><b>Total price:</b> ₹{totalPrice}</h6>
            <button className='btn btn-primary w-100' onClick={bookFlight}>Book Now</button>
          </div>
        </div>
      </div>
    )
}
export default BookFlight;