const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

/*
    Miguel Games

    This proxy:
    - fetches normal public HTTP/HTTPS pages
    - does NOT bypass authentication
    - does NOT bypass CAPTCHAs
    - does NOT remove security protections
    - only proxies normal web requests
*/

app.use(express.static(__dirname));

/*
    Home page
*/

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


/*
    Proxy endpoint

    Example:

    http://localhost:3000/proxy?url=https://example.com
*/

app.get("/proxy", async (req, res) => {
    const target = req.query.url;

    if (!target) {
        return res.status(400).send("Missing URL.");
    }

    let targetUrl;

    try {
        targetUrl = new URL(target);
    } catch {
        return res.status(400).send("Invalid URL.");
    }

    /*
        Only HTTP and HTTPS are allowed.
    */

    if (
        targetUrl.protocol !== "http:" &&
        targetUrl.protocol !== "https:"
    ) {
        return res.status(400).send("Only HTTP and HTTPS URLs are supported.");
    }

    try {
        const response = await fetch(targetUrl.href, {
            redirect: "follow",
            headers: {
                "User-Agent": "MiguelGames/1.0"
            }
        });

        /*
            Preserve the remote response status.
        */

        res.status(response.status);

        /*
            Copy useful content headers.

            We intentionally do NOT remove security
            headers from the remote website.
        */

        const contentType = response.headers.get("content-type");

        if (contentType) {
            res.setHeader("content-type", contentType);
        }

        const cacheControl = response.headers.get("cache-control");

        if (cacheControl) {
            res.setHeader("cache-control", cacheControl);
        }

        /*
            Send the response body.
        */

        const body = await response.arrayBuffer();

        res.send(Buffer.from(body));

    } catch (error) {
        console.error("Proxy error:", error);

        res.status(502).send(
            "Miguel Games could not connect to that website."
        );
    }
});


/*
    Start server
*/

app.listen(PORT, () => {
    console.log(
        `Miguel Games running at http://localhost:${PORT}`
    );
});
