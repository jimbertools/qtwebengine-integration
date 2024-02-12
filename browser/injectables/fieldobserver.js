// This script checks if there are any possible forms dynamically loaded on to the page so we can autofill them.

(function () {
    if (observer) return;
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var nodes = Array.prototype.slice.call(mutation.addedNodes);
            nodes.forEach(function (node) {
                if (node.type === "password" ||
                    node.type === "email" ||
                    node.type === "text") {
                    console.log("retriggerautofill");
                    //notify c++ of possible autofill
                }
            });
        });
    });
    observer.observe(document.querySelector("body"), {
        childList: true,
        subtree: true,
        attributes: false,
    });

})()