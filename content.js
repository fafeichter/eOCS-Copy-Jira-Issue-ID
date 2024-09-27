const svgNS = "http://www.w3.org/2000/svg"; // Namespace for SVG elements

const copyButtonClass = 'jira-copy-issue-id-btn';

const successIconId = 'copy-jira-issue-id-success-icon';
const copyIconId = 'copy-jira-issue-id-copy-icon';
const iconClass = 'jira-copy-issue-id-icon';
const hideIconClass = 'jira-copy-issue-id-icon-hide';

const showIconClass = 'jira-copy-issue-id-icon-show';

let animationTimer = undefined;

let isProcessing = false; // Indicates if a copy process is running (includes any animations)

function refresh() {
    clearTimeout(animationTimer);
    isProcessing = false;

    const currentUrl = window.location.href;

    if (isJiraIssueUrl(currentUrl)) {
        // Remove probably existing copy button (only relevent in SPA)
        let existingCopyButtons = document.getElementsByClassName(copyButtonClass);
        for (const existingCopyButton of existingCopyButtons) {
            existingCopyButton.remove();
        }

        // Create new copy button
        const copyButton = document.createElement('button');
        copyButton.classList.add(copyButtonClass);
        copyButton.appendChild(createCopyIcon());
        copyButton.appendChild(createSuccessIcon());

        // Register click listener to copy button
        let jiraIssueId = findJiraIssueId() || '';
        copyButton.onclick = () => copyTextToClipboard(jiraIssueId);

        // Add copy button to DOM
        const containerElement = getContainerElement();
        if (containerElement) {
            containerElement.append(copyButton)
        } else {
            console.log('eOCS Copy Jira Issue ID: Current UI is not supported.')
        }
    }
}

function createCopyIcon() {
    const copyIcon = document.createElementNS(svgNS, "svg");
    copyIcon.id = copyIconId;
    copyIcon.classList.add(iconClass, showIconClass)
    copyIcon.setAttribute("xmlns", svgNS);
    copyIcon.setAttribute("width", "15");
    copyIcon.setAttribute("height", "15");
    copyIcon.setAttribute("fill", "currentColor");
    copyIcon.setAttribute("viewBox", "0 0 16 16");
    copyIcon.setAttribute("part", "svg");

    const copyIconPath = document.createElementNS(svgNS, "path");
    copyIconPath.setAttribute("fill-rule", "evenodd");
    copyIconPath.setAttribute("d", "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z");
    copyIcon.appendChild(copyIconPath);

    return copyIcon;
}

function createSuccessIcon() {
    const successIcon = document.createElementNS(svgNS, "svg");
    successIcon.id = successIconId;
    successIcon.classList.add(iconClass, hideIconClass)
    successIcon.setAttribute("xmlns", svgNS);
    successIcon.setAttribute("width", "15");
    successIcon.setAttribute("height", "15");
    successIcon.setAttribute("viewBox", "0 0 16 16");
    successIcon.setAttribute("part", "svg");

    const gOuter = document.createElementNS(svgNS, "g");
    gOuter.setAttribute("stroke", "none");
    gOuter.setAttribute("stroke-width", "1.5");
    gOuter.setAttribute("fill", "none");
    gOuter.setAttribute("fill-rule", "evenodd");
    gOuter.setAttribute("stroke-linecap", "round");

    const gMiddle = document.createElementNS(svgNS, "g");
    gMiddle.setAttribute("stroke", "var(--aui-message-success-icon-color)");

    const gInner = document.createElementNS(svgNS, "g");
    gInner.setAttribute("transform", "translate(3.428571, 3.428571)");

    const path1 = document.createElementNS(svgNS, "path");
    path1.setAttribute("d", "M0,5.71428571 L3.42857143,9.14285714");

    const path2 = document.createElementNS(svgNS, "path");
    path2.setAttribute("d", "M9.14285714,0 L3.42857143,9.14285714");

    gInner.appendChild(path1);
    gInner.appendChild(path2);
    gMiddle.appendChild(gInner);
    gOuter.appendChild(gMiddle);
    successIcon.appendChild(gOuter);

    return successIcon;
}

function findJiraIssueId() {
    // Get the page title
    const pageTitle = document.title;

    // Define the regex pattern to match Jira issue IDs (e.g., PROJECT-123)
    const issueIdRegex = /[A-Z]+-\d+/;

    // Extract the first matching Jira issue ID from the title
    const issueId = pageTitle.match(issueIdRegex);

    if (!issueId) {
        console.log("eOCS Copy Jira Issue ID: No Jira Issue ID found in the title");
    }

    return issueId;
}

function copyTextToClipboard(text) {
    if (isProcessing) {
        return; // Do nothing if the copy action is already in progress
    }

    isProcessing = true;

    navigator.clipboard.writeText(text).then(function () {
        animateIcon();
    }, function (err) {
        isProcessing = false;
        alert(`Could not copy Jira Issue ID: ${err}`);
    });
}

function animateIcon() {
    const copyIcon = document.getElementById(copyIconId);
    const successIcon = document.getElementById(successIconId);

    copyIcon.classList.remove(showIconClass);
    copyIcon.classList.add(hideIconClass);
    successIcon.classList.remove(hideIconClass);
    successIcon.classList.add(showIconClass);

    animationTimer = setTimeout(() => {
        successIcon.classList.remove(showIconClass);
        successIcon.classList.add(hideIconClass);
        copyIcon.classList.remove(hideIconClass);
        copyIcon.classList.add(showIconClass);

        isProcessing = false;
    }, 1500);
}

function getContainerElement() {
    let idContainers = document.getElementsByClassName('aui-nav-breadcrumbs');
    if (!idContainers || !idContainers.length) {
        return undefined;
    }

    const containers = idContainers[idContainers.length - 1].getElementsByTagName('li');
    if (containers && containers.length) {
        return containers[containers.length - 1];
    }
}

function isJiraIssueUrl(url) {
    // Jira issue URL regular expressions
    const regexList = [/browse\/[A-Z]+-\d+/, /projects\/[A-Z]+\/issues\/[A-Z]+-\d+/];

    // check if the url path matches any regex in the list
    return regexList.some(regex => regex.test(new URL(url).pathname));
}

// Select the target node to observe
const targetNode = document.querySelector('title'); // Can be any element to observe

// Define the mutation observer callback function
let observerCallback = function () {
    refresh();
};

// Create a new MutationObserver instance
const observer = new MutationObserver(observerCallback);

// Configuration of the observer
let config = {
    childList: true // Listen for changes to child nodes (additions/removals)
};

// Start observing the target node (for the SPA parts of Jira)
observer.observe(targetNode, config);

// Initial start (when opening Jira for the first time)
refresh();