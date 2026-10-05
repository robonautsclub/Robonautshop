import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  message: z.string().trim().min(10, "Message is too short.").max(4000),
  // Hidden honeypot field — real visitors never fill it in. Deliberately not
  // constrained here: the route checks it and fakes a success response for
  // bots that do fill it, rather than returning an error that would tip
  // them off to retry without it.
  company: z.string().optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
