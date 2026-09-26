export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.svg") {
      return env.ASSETS.fetch(
        new Request(new URL("/index.svg", request.url))
      );
    }

    return new Response("Not Found", {
      status: 404
    });
  }
};
