import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { User, Booking, Flight } from './schemas.js';

const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

const PORT = 6001;
mongoose.connect('mongodb://localhost:27017/FlightBookingMERN', { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(()=>{

    app.post('/register', async (req, res) => {
        const { username, email, usertype, password } = req.body;
        let approval = 'approved';
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            if(usertype === 'flight-operator'){
                approval = 'not-approved'
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username, email, usertype, password: hashedPassword, approval
            });
            const userCreated = await newUser.save();
            return res.status(201).json(userCreated);
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            } else{
                return res.json(user);
            }
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/approve-operator', async(req, res)=>{
        const {id} = req.body;
        try{
            const user = await User.findById(id);
            user.approval = 'approved';
            await user.save();
            res.json({message: 'approved!'})
        }catch(err){
            res.status(500).json({ message: 'Server Error' });
        }
    })

    app.post('/reject-operator', async(req, res)=>{
        const {id} = req.body;
        try{
            const user = await User.findById(id);
            user.approval = 'rejected';
            await user.save();
            res.json({message: 'rejected!'})
        }catch(err){
            res.status(500).json({ message: 'Server Error' });
        }
    })

    app.get('/fetch-user/:id', async (req, res)=>{
        try{
            const user = await User.findById(req.params.id);
            res.json(user);
        }catch(err){
            console.log(err);
        }
    })

    app.get('/fetch-users', async (req, res)=>{
        try{
            const users = await User.find();
            res.json(users);
        }catch(err){
            res.status(500).json({message: 'error occured'});
        }
    })

    app.post('/add-flight', async (req, res)=>{
        const {flightName, flightId, origin, destination, departureTime, 
               arrivalTime, basePrice, totalSeats} = req.body;
        try{
            const flight = new Flight({
                flightName, flightId, origin, destination, 
                departureTime, arrivalTime, basePrice, totalSeats,
                bookedSeats: [] 
            });
            await flight.save();
            res.json({message: 'flight added'});
        }catch(err){
            console.log(err);
        }
    })

    app.put('/update-flight', async (req, res)=>{
        const {_id, flightName, flightId, origin, destination, 
                    departureTime, arrivalTime, basePrice, totalSeats} = req.body;
        try{
            const flight = await Flight.findById(_id)
            flight.flightName = flightName;
            flight.flightId = flightId;
            flight.origin = origin;
            flight.destination = destination;
            flight.departureTime = departureTime;
            flight.arrivalTime = arrivalTime;
            flight.basePrice = basePrice;
            flight.totalSeats = totalSeats;
            await flight.save();
            res.json({message: 'flight updated'});
        }catch(err){
            console.log(err);
        }
    })

    app.get('/fetch-flights', async (req, res)=>{
        try{
            const flights = await Flight.find();
            res.json(flights);
        }catch(err){
            console.log(err);
        }
    })

    app.get('/fetch-flight/:id', async (req, res)=>{
        try{
            const flight = await Flight.findById(req.params.id);
            res.json(flight);
        }catch(err){
            console.log(err);
        }
    })

    // UPDATED: ENRICHED FETCH BOOKINGS FOR OPERATOR CHART
    app.get('/fetch-bookings', async (req, res)=>{
        try{
            const bookings = await Booking.find();
            
            // For each booking, find the associated flight to get totalSeats
            const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
                const flightData = await Flight.findById(booking.flight);
                return {
                    ...booking._doc,
                    totalCapacity: flightData ? flightData.totalSeats : 60 // Default if flight deleted
                };
            }));
            
            res.json(enrichedBookings);
        }catch(err){
            console.log(err);
            res.status(500).json({message: 'Error fetching bookings'});
        }
    })

    app.post('/book-ticket', async (req, res)=>{
        const {user, flight, flightName, flightId, departure, destination, 
                    email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass, manualSeats} = req.body;
        try{
            const booking = new Booking({
                user, flight, flightName, flightId, departure, destination, 
                email, mobile, passengers, totalPrice, journeyDate, journeyTime, 
                seatClass, seats: manualSeats 
            });
            await booking.save();

            const seatsToLock = manualSeats.split(", ");
            await Flight.findByIdAndUpdate(flight, {
                $push: { bookedSeats: { $each: seatsToLock } }
            });

            res.json({message: 'Booking successful!!'});
        }catch(err){
            console.log(err);
            res.status(500).json({message: 'Booking failed'});
        }
    })

    app.put('/cancel-ticket/:id', async (req, res)=>{
        try{
            const booking = await Booking.findById(req.params.id);
            if(booking.seats) {
                const seatsToRelease = booking.seats.split(", ");
                await Flight.findByIdAndUpdate(booking.flight, {
                    $pull: { bookedSeats: { $in: seatsToRelease } }
                });
            }
            booking.bookingStatus = 'cancelled';
            await booking.save();
            res.json({message: "booking cancelled"});
        }catch(err){
            console.log(err);
        }
    })

    app.listen(PORT, ()=>{
        console.log(`Running @ ${PORT}`);
    });
}).catch((e)=> console.log(`Error in db connection ${e}`));