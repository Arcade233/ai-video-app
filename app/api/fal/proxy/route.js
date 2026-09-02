import { route } from "@fal-ai/server-proxy/nextjs";

export const POST = (req) => {
  return route(req, {
    credentials: process.env.FAL_KEY,
  });
};
