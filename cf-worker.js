addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

/**
 * Many more examples available at:
 *   https://developers.cloudflare.com/workers/examples
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const { pathname, search } = new URL(request.url);

  if (pathname.match(/\/repos\/Grasscutters\/Grasscutter\/actions\/artifacts\/[0-9]+\/zip/)){
    let response = await fetch(`https://api.github.com${pathname}${search}`, {
      headers: {
        "Authorization": `token ${PRIVILEDGED_GITHUB_TOKEN}`,
        "User-Agent": "Cloudflare Worker"
      }, redirect: "manual",
      cf: {cacheTtl: 3600, cacheEverything: true}
    });
    let location = response.headers.get("Location");
    return new Response("", {status: 302, headers: {"Location": location}});
  }

  if (pathname.startsWith('/landscaper')){
    let res = await fetch(`https://raw.githubusercontent.com/gc-mojoconsole/landscaper-depot/main/metadata${pathname.replace(/^\/landscaper/,'')}${search}`, {
        cf: {cacheTtl: 300, cacheEverything: true},
        headers: {"User-Agent": "Cloudflare Worker"},
        redirect: "follow"
      });
    return new Response(res.body, {headers: {"Access-Control-Allow-Origin": "*"}});
  }
  return fetch(
    `https://api.github.com${pathname}${search}`, 
    {
      headers: {"User-Agent": "Cloudflare Worker", "Authorization": `token ${NORMAL_GITHUB_TOKEN}`},
      cf: {
          // Always cache this fetch regardless of content type
          // for a max of 30 seconds before revalidating the resource
          cacheTtl: 30,
          cacheEverything: true,
        },
    }
  );
}
