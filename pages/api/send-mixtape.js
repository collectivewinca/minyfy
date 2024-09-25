import { Resend } from 'resend';
import { LaterMixtapeEmail } from '@/utils/LaterMixtapeEmail';
import { FirstMixtapeEmail } from '@/utils/FirstMixtapeEmail';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { name, imageUrl, shortenedLink, email, displayName, isFirstLogin } = req.body;

    const EmailComponent = isFirstLogin ? FirstMixtapeEmail : LaterMixtapeEmail;

    const data = {
      from: 'Miny Vinyl <mixtapes@subwaymusician.xyz>',
      to: email,
      subject: isFirstLogin ? 'Your First Mixtape is Ready to Rock!' : 'Your New Mixtape is Ready to Rock!',
      react: EmailComponent({ name, imageUrl, shortenedLink, displayName })
    };

    console.log(`Sending ${isFirstLogin ? 'first-time' : 'returning'} user email to: ${email}`);

    await resend.emails.send(data);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).json({ error: 'Error sending email' });
  }
}