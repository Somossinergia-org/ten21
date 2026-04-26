import { z } from "zod";

export const retryOutboundSchema = z.object({
  messageId: z.string().min(1),
});

export const cancelOutboundSchema = z.object({
  messageId: z.string().min(1),
});
