const homePage = document.getElementById("homePage");
const pageView = document.getElementById("pageView");
const pageFrame = document.getElementById("pageFrame");
const pageLoading = document.getElementById("pageLoading");

const urlInput = document.getElementById("urlInput");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");

const newTabBtn = document.getElementById("newTabBtn");
const favoriteBtn = document.getElementById("favoriteBtn");

const tabsContainer = document.getElementById("tabs");
const status = document.getElementById("status");

let tabs = [
    {
        id: 1,
        title: "Miguel Games",
        url: "",
        history: [],
        historyIndex: -1,
        favorite: false
    }
];

let activeTab = 1;
let nextTabId = 2;


/* =========================
   URL NORMALIZATION
   ========================= */

function normalizeUrl(value) {
    value = value.trim();

    if (!value) {
        return "";
    }

    if (
        !value.includes(".") &&
        !value.startsWith("http://") &&
        !value.startsWith("https://")
    ) {
        return "https://www.google.com/search?q=" +
            encodeURIComponent(value);
    }

    if (
        !value.startsWith("http://") &&
        !value.startsWith("https://")
    ) {
        value = "https://" + value;
    }

    return value;
}


/* =========================
   ACTIVE TAB
   ========================= */

function getActiveTab() {
    return tabs.find(tab => tab.id === activeTab);
}


/* =========================
   BUILD PROXY URL
   ========================= */

function getProxyUrl(targetUrl) {
    return "/proxy?url=" + encodeURIComponent(targetUrl);
}


/* =========================
   NAVIGATE
   ========================= */

function navigate(url, addHistory = true) {
    const tab = getActiveTab();

    if (!tab) {
        return;
    }

    const finalUrl = normalizeUrl(url);

    if (!finalUrl) {
        return;
    }

    homePage.style.display = "none";
    pageView.classList.remove("hidden");

    pageLoading.classList.remove("hidden");

    status.textContent = "Connecting...";

    urlInput.value = finalUrl;

    if (addHistory) {
        tab.history = tab.history.slice(
            0,
            tab.historyIndex + 1
        );

        tab.history.push(finalUrl);

        tab.historyIndex++;
    }

    tab.url = finalUrl;

    updateTabTitle(tab, finalUrl);

    pageFrame.src = getProxyUrl(finalUrl);

    renderTabs();
}


/* =========================
   PAGE LOADED
   ========================= */

pageFrame.addEventListener("load", () => {
    pageLoading.classList.add("hidden");

    status.textContent = "Connected";
});


/* =========================
   PAGE ERROR
   ========================= */

pageFrame.addEventListener("error", () => {
    pageLoading.classList.add("hidden");

    status.textContent = "Connection error";
});


/* =========================
   TAB TITLE
   ========================= */

function updateTabTitle(tab, url) {
    try {
        const parsed = new URL(url);

        let hostname = parsed.hostname;

        hostname = hostname.replace(/^www\./, "");

        tab.title = hostname || "Website";

    } catch {
        tab.title = "Website";
    }
}


/* =========================
   BACK
   ========================= */

backBtn.addEventListener("click", () => {
    const tab = getActiveTab();

    if (!tab) {
        return;
    }

    if (tab.historyIndex > 0) {
        tab.historyIndex--;

        const previousUrl =
            tab.history[tab.historyIndex];

        tab.url = previousUrl;

        urlInput.value = previousUrl;

        pageLoading.classList.remove("hidden");

        status.textContent = "Going back...";

        pageFrame.src =
            getProxyUrl(previousUrl);
    }
});


/* =========================
   FORWARD
   ========================= */

forwardBtn.addEventListener("click", () => {
    const tab = getActiveTab();

    if (!tab) {
        return;
    }

    if (
        tab.historyIndex <
        tab.history.length - 1
    ) {
        tab.historyIndex++;

        const nextUrl =
            tab.history[tab.historyIndex];

        tab.url = nextUrl;

        urlInput.value = nextUrl;

        pageLoading.classList.remove("hidden");

        status.textContent = "Going forward...";

        pageFrame.src =
            getProxyUrl(nextUrl);
    }
});


/* =========================
   RELOAD
   ========================= */

reloadBtn.addEventListener("click", () => {
    const tab = getActiveTab();

    if (!tab || !tab.url) {
        return;
    }

    pageLoading.classList.remove("hidden");

    status.textContent = "Reloading...";

    pageFrame.src =
        getProxyUrl(tab.url);
});


/* =========================
   ADDRESS BAR
   ========================= */

urlInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        navigate(urlInput.value);
    }
});


/* =========================
   HOME SEARCH
   ========================= */

function performSearch() {
    const value = searchInput.value.trim();

    if (!value) {
        return;
    }

    navigate(value);

    searchInput.value = "";
}

searchBtn.addEventListener(
    "click",
    performSearch
);

searchInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            performSearch();
        }
    }
);


/* =========================
   QUICK LINKS
   ========================= */

document
    .querySelectorAll(".quick-link[data-url]")
    .forEach(button => {

        button.addEventListener("click", () => {
            navigate(button.dataset.url);
        });

    });


/* =========================
   NEW TAB
   ========================= */

function createTab() {

    const newTab = {
        id: nextTabId++,
        title: "New Tab",
        url: "",
        history: [],
        historyIndex: -1,
        favorite: false
    };

    tabs.push(newTab);

    activeTab = newTab.id;

    showHome();

    renderTabs();

    urlInput.value = "";

    status.textContent = "Ready";
}

newTabBtn.addEventListener(
    "click",
    createTab
);


/* =========================
   CLOSE TAB
   ========================= */

function closeTab(id) {

    if (tabs.length === 1) {

        showHome();

        tabs[0].title = "Miguel Games";
        tabs[0].url = "";
        tabs[0].history = [];
        tabs[0].historyIndex = -1;

        renderTabs();

        return;
    }

    const index =
        tabs.findIndex(tab => tab.id === id);

    tabs = tabs.filter(
        tab => tab.id !== id
    );

    if (id === activeTab) {

        const newIndex =
            Math.max(0, index - 1);

        activeTab =
            tabs[newIndex].id;

        const tab =
            getActiveTab();

        if (tab.url) {
            navigate(tab.url, false);
        } else {
            showHome();
        }
    }

    renderTabs();
}


/* =========================
   SWITCH TAB
   ========================= */

function switchTab(id) {

    activeTab = id;

    const tab = getActiveTab();

    if (!tab) {
        return;
    }

    if (tab.url) {

        homePage.style.display = "none";

        pageView.classList.remove(
            "hidden"
        );

        urlInput.value = tab.url;

        pageLoading.classList.remove(
            "hidden"
        );

        status.textContent =
            "Connecting...";

        pageFrame.src =
            getProxyUrl(tab.url);

    } else {

        showHome();
    }

    renderTabs();
}


/* =========================
   RENDER TABS
   ========================= */

function renderTabs() {

    tabsContainer.innerHTML = "";

    tabs.forEach(tab => {

        const tabElement =
            document.createElement("div");

        tabElement.className =
            "tab" +
            (tab.id === activeTab
                ? " active"
                : "");

        const icon =
            document.createElement("span");

        icon.textContent =
            tab.favorite
                ? "★"
                : "🌐";

        const title =
            document.createElement("span");

        title.textContent =
            tab.title;

        const close =
            document.createElement("button");

        close.className =
            "close-tab";

        close.textContent = "×";

        close.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                closeTab(tab.id);
            }
        );

        tabElement.appendChild(icon);
        tabElement.appendChild(title);
        tabElement.appendChild(close);

        tabElement.addEventListener(
            "click",
            () => switchTab(tab.id)
        );

        tabsContainer.appendChild(
            tabElement
        );
    });

    const addButton =
        document.createElement("button");

    addButton.className = "add-tab";

    addButton.textContent = "＋";

    addButton.addEventListener(
        "click",
        createTab
    );

    tabsContainer.appendChild(
        addButton
    );
}


/* =========================
   SHOW HOME
   ========================= */

function showHome() {

    homePage.style.display = "flex";

    pageView.classList.add(
        "hidden"
    );

    pageFrame.src =
        "about:blank";

    urlInput.value = "";

    status.textContent =
        "Ready";
}


/* =========================
   FAVORITE
   ========================= */

favoriteBtn.addEventListener(
    "click",
    () => {

        const tab =
            getActiveTab();

        if (!tab) {
            return;
        }

        tab.favorite =
            !tab.favorite;

        favoriteBtn.textContent =
            tab.favorite
                ? "★"
                : "☆";

        renderTabs();
    }
);


/* =========================
   KEYBOARD SHORTCUTS
   ========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "l"
        ) {
            event.preventDefault();

            urlInput.focus();
            urlInput.select();
        }

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "r"
        ) {
            event.preventDefault();

            reloadBtn.click();
        }

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "t"
        ) {
            event.preventDefault();

            createTab();
        }

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "w"
        ) {
            event.preventDefault();

            closeTab(activeTab);
        }
    }
);


/* =========================
   START MIGUEL GAMES
   ========================= */

renderTabs();

showHome();

console.log(
    "Miguel Games proxy viewer loaded."
);
