const JOBS_PATH = '/jobs/search/';
const PATH_OBSERVER = new MutationObserver(checkPathChanges);
const JOB_LIST_OBSERVER = new MutationObserver(run);

let enabled;
let oldPath;
let tags;

function setEnabled(nextEnabled) {
  enabled = nextEnabled;
  document.documentElement.dataset.hidePromotedJobs = enabled
    ? 'enabled'
    : 'disabled';
}

function checkPathChanges() {
  if (oldPath !== window.location.pathname) {
    oldPath = window.location.pathname;
    connectJobListObserver();
  }
}

function run() {
  if (!tags || !window.location.pathname.startsWith(JOBS_PATH)) {
    return;
  }

  const display = enabled ? 'none' : 'initial';
  const liElements = document.querySelectorAll('li');
  liElements.forEach((li) => {
    const innerText = li.innerText.trim().toLowerCase();
    if (tags.indexOf(innerText) === -1) {
      return;
    }

    const jobItem = li.parentElement.closest('ul > li');
    if (jobItem) {
      jobItem.style.display = display;
    }
  });
}

function connectPathObserver() {
  PATH_OBSERVER.disconnect();
  PATH_OBSERVER.observe(document.body, { childList: true, subtree: true });
}

function connectJobListObserver() {
  JOB_LIST_OBSERVER.disconnect();
  if (window.location.pathname.startsWith(JOBS_PATH)) {
    const JOB_LIST = document.querySelector('.scaffold-layout__list');
    if (JOB_LIST && tags) {
      JOB_LIST_OBSERVER.observe(JOB_LIST, { childList: true, subtree: true });
      run();
    } else {
      setTimeout(connectJobListObserver, 300);
    }
  }
}

function initialize() {
  if (!tags) {
    const langsFile = chrome.runtime.getURL('js/langs.json');
    fetch(langsFile)
      .then((response) => response.json())
      .then((json) => {
        const locale = document.documentElement.lang
          .toLowerCase()
          .split('-')[0];
        tags = [json[locale] || json.en].flat().map((tag) => tag.toLowerCase());
      });
  }

  chrome.storage.local.get({ enabled: true }, (options) => {
    setEnabled(options.enabled);
    connectPathObserver();
    connectJobListObserver();
  });
}

function handleStorageChange(changes, areaName) {
  if (areaName !== 'local' || !changes.enabled) {
    return;
  }

  setEnabled(changes.enabled.newValue);
  run();
}

chrome.storage.onChanged.addListener(handleStorageChange);
initialize();
