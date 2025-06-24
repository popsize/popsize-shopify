import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  //await registerWebhooks({ session });

  // Always send user to /app; let /app handle onboarding logic
  return redirect("/app?_force_reload=true");
};
