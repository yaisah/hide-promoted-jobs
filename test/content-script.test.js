const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const contentSource = fs.readFileSync(
  path.join(__dirname, '..', 'ext', 'js', 'hide.js'),
  'utf8'
);

class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  disconnect() {
    this.disconnected = true;
  }

  observe() {
    this.observed = true;
  }
}

test('initializes on LinkedIn Jobs with Chrome APIs and reacts to storage', async () => {
  const timers = [];
  const storageChangedListeners = [];
  const jobItem = { style: {} };
  const promotedLabel = {
    innerText: 'Promoted',
    parentElement: {
      closest() {
        return jobItem;
      },
    },
  };
  const jobList = {};
  let requestedResource;

  const chrome = {
    runtime: {
      getURL(resource) {
        requestedResource = resource;
        return `chrome-extension://test/${resource}`;
      },
    },
    storage: {
      local: {
        get(defaults, callback) {
          callback({ enabled: defaults.enabled });
        },
      },
      onChanged: {
        addListener(listener) {
          storageChangedListeners.push(listener);
        },
      },
    },
  };

  const context = {
    chrome,
    document: {
      body: {},
      documentElement: { dataset: {}, lang: 'en-US' },
      querySelector(selector) {
        return selector === '.scaffold-layout__list' ? jobList : null;
      },
      querySelectorAll(selector) {
        return selector === 'li' ? [promotedLabel] : [];
      },
    },
    fetch: async () => ({
      json: async () => ({ en: 'Promoted' }),
    }),
    MutationObserver: MockMutationObserver,
    setTimeout(callback) {
      timers.push(callback);
    },
    window: {
      location: { pathname: '/jobs/search/' },
    },
  };

  vm.runInNewContext(contentSource, context);
  await new Promise((resolve) => {
    setImmediate(resolve);
  });
  timers.forEach((callback) => callback());

  assert.equal(requestedResource, 'js/langs.json');
  assert.equal(storageChangedListeners.length, 1);
  assert.equal(
    context.document.documentElement.dataset.hidePromotedJobs,
    'enabled'
  );
  assert.equal(jobItem.style.display, 'none');

  storageChangedListeners[0](
    { enabled: { oldValue: true, newValue: false } },
    'local'
  );
  assert.equal(
    context.document.documentElement.dataset.hidePromotedJobs,
    'disabled'
  );
  assert.equal(jobItem.style.display, 'initial');

  context.window.location.pathname = '/feed/';
  jobItem.style.display = 'sentinel';
  storageChangedListeners[0](
    { enabled: { oldValue: false, newValue: true } },
    'local'
  );
  assert.equal(jobItem.style.display, 'sentinel');
});

test('fails open when storage changes before labels finish loading', () => {
  const storageChangedListeners = [];

  const context = {
    chrome: {
      runtime: {
        getURL: () => 'chrome-extension://test/js/langs.json',
      },
      storage: {
        local: {
          get(defaults, callback) {
            callback({ enabled: defaults.enabled });
          },
        },
        onChanged: {
          addListener(listener) {
            storageChangedListeners.push(listener);
          },
        },
      },
    },
    document: {
      body: {},
      documentElement: { dataset: {}, lang: 'en' },
      querySelector: () => null,
      querySelectorAll: () => {
        throw new Error('Cards must not be scanned before labels are ready.');
      },
    },
    fetch: () => new Promise(() => {}),
    MutationObserver: MockMutationObserver,
    setTimeout() {},
    window: {
      location: { pathname: '/jobs/search/' },
    },
  };

  vm.runInNewContext(contentSource, context);

  assert.doesNotThrow(() => {
    storageChangedListeners[0](
      { enabled: { oldValue: true, newValue: false } },
      'local'
    );
  });
});
