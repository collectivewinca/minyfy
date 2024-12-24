// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { origin, dropType, DesignUrl, DesignFee, quantity } = req.body;
    
    // Calculate originalAmount in cents for Stripe
    const pricePerUnit = 4.99;
    let originalAmount = Math.round(quantity * pricePerUnit * 100); // Convert to cents

    // Add $1,000 design fee in cents if DesignFee is true
    if (DesignFee) {
      originalAmount += 100000; // Adding 100000 cents for the $1,000 design fee
    }

    try {
      // Create a customer (without pre-filling the email)
      const customer = await stripe.customers.create();

      // Create a descriptive name and description for the product
      const productName = `MINY Drop Order for ${dropType}`;
      const productDescription = `${quantity} MINYs @ $4.99 each for ${dropType}${
        DesignFee ? ' : Design Fee Included ($1,000.00)' : ''
      }`;

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
                name: productName,
                description: productDescription,
                images: ["https://minyfy.minyvinyl.com/9.png", DesignUrl],
                metadata: {
                  dropType: dropType,
                  quantity: quantity,
                  DesignFee: DesignFee ? "Included" : "Not Included",
                  DesignUrl: DesignUrl
                }
              }
            },
          },
        ],
        mode: 'payment',
        success_url: `${origin}/success?status=success`,
        cancel_url: `${origin}`,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'JP'], // Allowed countries
        },
        payment_intent_data: {
          metadata: {
            order_name: productName,
            dropType: dropType,
            quantity: quantity,
            DesignFee: DesignFee ? "Included" : "Not Included",
            DesignUrl: DesignUrl
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
