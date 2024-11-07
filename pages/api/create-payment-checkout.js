// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, amount, docId, crateId } = req.body;
    const originalAmount = amount; // Amount in cents (e.g., 4999 for $49.99)

    try {
      const origin = "http://localhost:3000";

      // Create a customer
      const customer = await stripe.customers.create({
        email,
      });

      // Create a Checkout session
      const sessionParams = {
        customer: customer.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: originalAmount,
              product_data: {
                name: `${name}'s Mixtape Order`
              }
            },
          },
        ],
        mode: 'payment',
        success_url: `${origin}/crates?session_id={CHECKOUT_SESSION_ID}&crateId=${crateId}&status=success`,
        cancel_url: `${origin}/play/${docId}`,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'JP'], // Allowed countries
        },
        payment_intent_data: {
          metadata: {
            order_name: `${name}'s Mixtape Order`,
            crateId: crateId,
            docId: docId,
          },
        },
      };

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
