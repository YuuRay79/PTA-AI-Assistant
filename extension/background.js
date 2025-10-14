chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openComposer") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("composer.html")
        });
    }
});
