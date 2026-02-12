import { Request, Response, NextFunction } from 'express';
import * as contactMessageService from '../services/contactMessageService.js';
import { sendContactFormEmail } from '../utils/email.js';

/**
 * Public contact form submission: save to contact_messages and send email to CONTACT_MAIL_TO.
 * Reply-To is set to the submitter's email. Email failure is logged but does not fail the request.
 */
export const submitContactMessage = async (
  req: Request<{}, {}, { name: string; email: string; phone?: string; subject: string; message: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body;
    await contactMessageService.create({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
    });
    await sendContactFormEmail({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
    });
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    next(error);
  }
};
