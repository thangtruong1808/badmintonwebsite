import { Request, Response, NextFunction } from 'express';
import * as serviceRequestService from '../services/serviceRequestService.js';
import { sendServiceRequestEmail } from '../utils/email.js';

/**
 * Public stringing service request submission: save to service_requests and send email to CONTACT_MAIL_TO.
 * Reply-To is set to the submitter's email. Email failure is logged but does not fail the request.
 */
export const submitServiceRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as {
      name: string;
      email: string;
      phone: string;
      racket_brand: string;
      racket_model: string;
      string_type: string;
      string_colour?: string | null;
      tension: string;
      stencil: boolean;
      grip: boolean;
      message?: string | null;
    };
    await serviceRequestService.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      racket_brand: data.racket_brand,
      racket_model: data.racket_model,
      string_type: data.string_type,
      string_colour: data.string_colour ?? null,
      tension: data.tension,
      stencil: data.stencil,
      grip: data.grip,
      message: data.message ?? null,
    });
    await sendServiceRequestEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      racket_brand: data.racket_brand,
      racket_model: data.racket_model,
      string_type: data.string_type,
      string_colour: data.string_colour ?? null,
      tension: data.tension,
      stencil: data.stencil,
      grip: data.grip,
      message: data.message ?? null,
    });
    res.status(201).json({ message: 'Service request submitted successfully.' });
  } catch (error) {
    next(error);
  }
};
