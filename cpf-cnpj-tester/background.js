const CONTENT_SCRIPT_ID = "cpf-cnpj-test-generator-content";

const DEFAULT_ICON = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png"
};

const ENABLED_ICON = {
  16: "icons/icon16-enabled.png",
  32: "icons/icon32-enabled.png",
  48: "icons/icon48-enabled.png",
  128: "icons/icon128-enabled.png"
};

async function getConfiguredSites() {
  const result = await chrome.storage.sync.get({
    sites: []
  });

  return result.sites;
}

async function syncContentScripts() {
  try {
    await chrome.scripting.unregisterContentScripts({
      ids: [CONTENT_SCRIPT_ID]
    });
  } catch (error) {
    // ignora se ainda não existir
  }

  const sites = await getConfiguredSites();

  if (!sites.length) {
    return;
  }

  await chrome.scripting.registerContentScripts([
    {
      id: CONTENT_SCRIPT_ID,
      matches: sites,
      js: ["content.js"],
      runAt: "document_idle"
    }
  ]);
}

function patternToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp(`^${escaped}$`);
}

function isUrlAllowed(url, patterns) {
  if (!url) {
    return false;
  }

  return patterns.some((pattern) => {
    try {
      return patternToRegex(pattern).test(url);
    } catch (error) {
      return false;
    }
  });
}

async function updateTabIcon(tabId, url) {
  const sites = await getConfiguredSites();
  const enabled = isUrlAllowed(url, sites);

  await chrome.action.setIcon({
    tabId,
    path: enabled ? ENABLED_ICON : DEFAULT_ICON
  });
}

async function refreshAllTabsIcons() {
  const tabs = await chrome.tabs.query({});

  for (const tab of tabs) {
    if (tab.id && tab.url) {
      try {
        await updateTabIcon(tab.id, tab.url);
      } catch (error) {
        // ignora páginas onde não dá para mexer
      }
    }
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await syncContentScripts();
  await refreshAllTabsIcons();
});

chrome.runtime.onStartup.addListener(async () => {
  await syncContentScripts();
  await refreshAllTabsIcons();
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.id && tab.url) {
      await updateTabIcon(tab.id, tab.url);
    }
  } catch (error) {
    // ignora
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      await updateTabIcon(tabId, tab.url);
    } catch (error) {
      // ignora
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SYNC_CONTENT_SCRIPTS") {
    Promise.all([syncContentScripts(), refreshAllTabsIcons()])
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }

  if (message?.type === "REFRESH_CURRENT_TAB_ICON") {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(async (tabs) => {
        const tab = tabs[0];
        if (tab?.id && tab.url) {
          await updateTabIcon(tab.id, tab.url);
        }
        sendResponse({ ok: true });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }
});