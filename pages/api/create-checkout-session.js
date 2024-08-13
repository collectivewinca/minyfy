// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
const allowedCountries = ['US', 'CA', 'GB'];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, signed, docId, crateId } = req.body;
    const originalAmount = 4999; // $49.99 in cents

    try {
      const origin = req.headers.origin;

      // Create a customer
      const customer = await stripe.customers.create({
        email,
      });

      // Define coupon details
      const couponCode = 'SINGLECOUPON'; // The coupon code to apply
      const couponDiscount = 90; // Discount percentage

      let couponId = null;

      if (signed) {
        try {
          // Attempt to retrieve the coupon from Stripe
          const existingCoupons = await stripe.coupons.list({ limit: 100 });
          const existingCoupon = existingCoupons.data.find(coupon => coupon.id === couponCode);

          if (existingCoupon) {
            couponId = existingCoupon.id; // Use existing coupon ID
          } else {
            // Create a new coupon if it doesn't exist
            const newCoupon = await stripe.coupons.create({
              percent_off: couponDiscount,
              duration: 'once',
              id: couponCode,
            });
            couponId = newCoupon.id;
          }
        } catch (error) {
          console.error('Error checking or creating coupon:', error);
          res.status(500).json({ error: 'Error checking or creating coupon.' });
          return;
        }
      }

      // Create a Checkout session
      const sessionParams = {
        customer: customer.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${name}'s Mixtape Order`,
              },
              unit_amount: originalAmount,
            },
          },
        ],
        mode: 'payment',
        success_url: `${origin}/crates?session_id={CHECKOUT_SESSION_ID}&crateId=${crateId}&status=success`,
        cancel_url: `${origin}/play/${docId}`,
        // shipping_address_collection: {
        //   allowed_countries: allowedCountries,
        // },
      };

      // Add discount if signed is true and couponId exists
      if (signed && couponId) {
        sessionParams.discounts = [{
          coupon: couponId,
        }];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}