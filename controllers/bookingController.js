const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const createBooking = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;

  await Booking.create({ tour, user, price });
};

// Create a checkout session for the user to purchase a tour
// This checkout session will return a session object which
// will contain the URL where the user can make the payment
exports.getCheckoutSession = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);

    // Create a checkout session which will contain info about the product, the user, and the payment
    const session = await stripe.checkout.sessions.create({
      // the payment methods that the user can use to pay
      payment_method_types: ['card'],
      // Specify if its a one-time payment or a subscription
      mode: 'payment',
      // the URL where the user will be redirected after the payment is successful
      success_url: `${req.protocol}://${req.get('host')}/api/v1/tours`,
      // the URL where the user will be redirected after the payment is canceled
      cancel_url: `${req.protocol}://${req.get('host')}/api/v1/tours`,

      // the email of the customer (will be auto-filled on the checkout page)
      customer_email: req.user.email,
      // the client reference ID (will be used to create the booking in the webhook)
      client_reference_id: req.params.tourId,

      // the details of each product that the user is purchasing
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100, // amount in cents
            // name, description, and images will be displayed on the checkout page
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `https://github.com/shadab-iqbal/tour-booking-app-api/blob/main/` +
                  `public/img/tours/${tour.imageCover}?raw=true`
              ]
            }
          },

          // the quantity of the product
          quantity: 1
        }
      ]
    });

    // Send the session object as the response
    res.status(200).json({
      status: 'success',
      session
    });
  } catch (error) {
    return next(error);
  }
};

exports.handleStripeWebhook = async (req, res, next) => {
  try {
    // Get the signature sent by Stripe
    const sig = req.headers['stripe-signature'];

    // Verify that the event sent by Stripe is valid
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Create a booking in the database
      // Async operation so that the webhook doesn't time out
      createBooking(session);
    }

    // Send a response to acknowledge that the event was received
    res.json({ received: true });
  } catch (error) {
    return next(error);
  }
};
