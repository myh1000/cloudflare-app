addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
    let cookies = request.headers.get("cookie");
    var choice;
    if (cookies) {
        // console.log(cookies.split(";"));
        for (let cookie of cookies.split(";")) {
            let cookiePair = cookie.split("=");
            if ("choice" == cookiePair[0].trim()) {
                choice = cookiePair[1]
            }
        }
        // console.log(choice);
    }
    const variant = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            var variants = data["variants"];
            if (!choice) {
                choice = (Math.random() < 0.5) * 1
            }
            return variants[choice]
        });
    // console.log(choice);
    const res = await fetch (variant)
    const html = new HTMLRewriter()
        .on('title', new ElementHandler(choice))
        .on('h1#title', new ElementHandler(choice))
        .on('p#description', new ElementHandler(choice))
        .on('a#url', new ElementHandler(choice))
        .transform(res)
    const html_raw = await html.text()
    return new Response(html_raw, {
        headers: {'content-type': 'text/html', 'Set-Cookie': `choice=${choice}`},
    })
}

class ElementHandler {
    constructor(choice) {
        this.choice = choice
    }
    element(element) {
        // for (let value of element.attributes) {
        //     console.log(value);
        // }
        switch (element.tagName) {
            case "title":
                element.prepend("Michael's App: ")
                break;
            case "h1":
                if (this.choice == 0) {
                    element.setInnerContent("Hi!, I'm Michael Huang.")
                } else {
                    element.setInnerContent("Hi!, I'm Michael Huang!")
                }
                break;
            case "p":
                if (this.choice == 0) {
                    element.setInnerContent("I'm a rising junior at UC Berkeley.")
                } else {
                    element.setInnerContent("In my free time, I love playing cards.")
                }
                break;
            case "a":
                element.setInnerContent("Check out my site: michaelyh.com")
                element.setAttribute('href', 'https://michaelyh.com')
                break;
        }
    }
}
