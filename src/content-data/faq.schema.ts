import { z } from 'zod';

const faqSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    }),
  ),
});

export default faqSchema;
