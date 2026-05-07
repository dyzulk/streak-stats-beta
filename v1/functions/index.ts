interface Env {
  ASSETS: { fetch: typeof fetch };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // If there are no query params and it's root, just serve the landing page
  // (In a real scenario, context.env.ASSETS.fetch(request) would do this)
  return env.ASSETS.fetch(request);
};
