/**
 * Namespace for SVG elements.
 */
const svgNS = "http://www.w3.org/2000/svg";

/**
 * CSS classes and ID constants.
 */
const copyButtonClass = 'jira-copy-issue-id-btn';
const successIconId = 'copy-jira-issue-id-success-icon';
const copyIconId = 'copy-jira-issue-id-copy-icon';
const iconClass = 'jira-copy-issue-id-icon';
const hideIconClass = 'jira-copy-issue-id-icon-hide';
const showIconClass = 'jira-copy-issue-id-icon-show';

let animationTimer = undefined;
let isProcessing = false; // Indicates if a copy process is in progress.

/**
 * Refresh the copy button functionality by removing any existing buttons and adding a new one if on a Jira issue page.
 */
function refresh() {
    clearTimeout(animationTimer);
    isProcessing = false;

    const currentUrl = window.location.href;

    if (isJiraIssueUrl(currentUrl)) {
        // Remove existing copy buttons (relevant in SPA environments)
        const existingCopyButtons = document.getElementsByClassName(copyButtonClass);
        Array.from(existingCopyButtons).forEach(button => button.remove());

        // Create a new copy button with icons
        const copyButton = document.createElement('button');
        copyButton.classList.add(copyButtonClass);
        copyButton.appendChild(createCopyIcon());
        copyButton.appendChild(createSuccessIcon());

        // Register click listener to copy Jira issue ID
        const jiraIssueId = findJiraIssueId() || '';
        copyButton.onclick = () => copyTextToClipboard(jiraIssueId);

        // Add the copy button to the DOM
        const containerElement = getContainerElement();
        if (containerElement) {
            containerElement.append(copyButton);
        }
    }
}

/**
 * Creates and returns an SVG element for the copy icon.
 * @returns {SVGElement} The copy icon SVG.
 */
function createCopyIcon() {
    const copyIcon = document.createElementNS(svgNS, "svg");
    copyIcon.id = copyIconId;
    copyIcon.classList.add(iconClass, showIconClass);
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

/**
 * Creates and returns an SVG element for the success icon.
 * @returns {SVGElement} The success icon SVG.
 */
function createSuccessIcon() {
    const successIcon = document.createElementNS(svgNS, "svg");
    successIcon.id = successIconId;
    successIcon.classList.add(iconClass, hideIconClass);
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

/**
 * Finds and returns the Jira Issue ID from the page title.
 * @returns {string|null} The Jira Issue ID or null if not found.
 */
function findJiraIssueId() {
    // Get the page title
    const pageTitle = document.title;

    // Define the regex pattern to match Jira issue IDs (e.g., PROJECT-123)
    const issueIdRegex = /[A-Z]+-\d+/;

    // Extract the first matching Jira issue ID from the title
    const issueId = pageTitle.match(issueIdRegex);

    if (!issueId) {
        alert("eOCS Copy Jira Issue ID: No Jira Issue ID found in the title.");
    }

    return issueId ? issueId[0] : null;
}

/**
 * Copies the provided text to the clipboard and triggers the success animation.
 * @param {string} text The text to be copied to the clipboard.
 */
function copyTextToClipboard(text) {
    if (isProcessing) {
        return; // Do nothing if the copy action is already in progress
    }

    isProcessing = true;

    navigator.clipboard.writeText(text).then(() => {
        animateIcon();
    }).catch(err => {
        isProcessing = false;
        alert(`Could not copy Jira Issue ID: ${err}`);
    });
}

/**
 * Animates the switch between the copy icon and success icon after copying.
 */
function animateIcon() {
    const copyIcon = document.getElementById(copyIconId);
    const successIcon = document.getElementById(successIconId);

    copyIcon.classList.replace(showIconClass, hideIconClass);
    successIcon.classList.replace(hideIconClass, showIconClass);

    animationTimer = setTimeout(() => {
        successIcon.classList.replace(showIconClass, hideIconClass);
        copyIcon.classList.replace(hideIconClass, showIconClass);

        isProcessing = false;
    }, 1500);
}

/**
 * Retrieves the container element where the copy button will be inserted.
 * @returns {HTMLElement|undefined} The container element or undefined if not found.
 */
function getContainerElement() {
    const idContainers = document.getElementsByClassName('aui-nav-breadcrumbs');
    if (!idContainers || !idContainers.length) {
        return undefined;
    }

    const containers = idContainers[idContainers.length - 1].getElementsByTagName('li');
    return containers.length ? containers[containers.length - 1] : undefined;
}

/**
 * Checks whether the current URL corresponds to a Jira issue page.
 * @param {string} url The current URL.
 * @returns {boolean} True if the URL is a Jira issue page, false otherwise.
 */
function isJiraIssueUrl(url) {
    const regexList = [/browse\/[A-Z]+-\d+/, /projects\/[A-Z]+\/issues\/[A-Z]+-\d+/];
    return regexList.some(regex => regex.test(new URL(url).pathname));
}

/**
 * Observes changes to the page's title element and refreshes the copy button when a change is detected.
 */
const targetNode = document.querySelector('title');
const observer = new MutationObserver(refresh);

// Configuration of the observer.
let config = {
    childList: true // Listen for changes to child nodes (additions/removals)
};

observer.observe(targetNode, config);

// Initial start when opening Jira for the first time.
refresh();