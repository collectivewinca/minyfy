import { Resend } from 'resend';
import { PurchaseEmail } from '@/utils/PurchaseEmail';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { name, title, shortenedLink, email } = req.body;

    const data = {
      from: 'Miny Vinyl <orders@subwaymusician.xyz>',
      to: email, 
      subject: `Your Miny Order with ${title}'s Mixtape is Confirmed!`,
      react: PurchaseEmail({ name, title, shortenedLink })
    };

    console.log(`Sending email to: ${email}`);

    await resend.emails.send(data);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).json({ error: 'Error sending email' });
  }
}