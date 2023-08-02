/* eslint-disable */
import Stripe from 'stripe';
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NUuTmKvazlnbjidqv6cFWtjVX44a4pV72JDjweTeWjxesmgsDtbikXOeE26KxrDN9jUseCFkKm4zloXMhiZWwcE00rU0KrVPj'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge card  (REDIRECT TO CHECKOUT PAGE)
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
