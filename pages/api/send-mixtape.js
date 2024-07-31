import { Resend } from 'resend';
import { MixtapeEmail } from '@/utils/MixtapeEmail';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { name, imageUrl, shortenedLink, email } = req.body;

    const data = {
      from: 'Miny Vinyl <mixtapes@subwaymusician.xyz>',
      to: email,
      subject: 'Your Miny Mixtape is Ready!',
      react: MixtapeEmail({ name, imageUrl, shortenedLink })
    };

    console.log(`Sending email to: ${email}`);

    await resend.emails.send(data);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).json({ error: 'Error sending email' });
  }
}
