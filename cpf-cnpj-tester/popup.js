let currentTab = null;
let currentSitePattern = null;

document.addEventListener("DOMContentLoaded", init);

function getElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Elemento não encontrado no popup.html: #${id}`);
  }

  return element;
}

function setStatus(message) {
  getElement("status").innerText = message || "";
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0];
}

function getPatternFromUrl(urlValue) {
  if (!urlValue) {
    throw new Error("Não foi possível obter a URL da aba atual.");
  }

  const url = new URL(urlValue);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Este tipo de página não pode ser configurado. Abra um site http/https.");
  }

  return `${url.protocol}//${url.host}/*`;
}

function normalizeManualPattern(value) {
  let pattern = value.trim();

  if (!pattern) {
    throw new Error("Informe um site.");
  }

  if (!pattern.includes("://")) {
    pattern = `https://${pattern}`;
  }

  if (!pattern.endsWith("/*")) {
    const url = new URL(pattern);
    pattern = `${url.protocol}//${url.host}/*`;
  }

  return pattern;
}

function patternToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp(`^${escaped}$`);
}

function isUrlAllowed(url, patterns) {
  return patterns.some((pattern) => patternToRegex(pattern).test(url));
}

async function getSites() {
  const result = await chrome.storage.sync.get({
    sites: []
  });

  return result.sites;
}

async function saveSites(sites) {
  const uniqueSites = [...new Set(sites)].sort();

  await chrome.storage.sync.set({
    sites: uniqueSites
  });

  await chrome.runtime.sendMessage({
    type: "SYNC_CONTENT_SCRIPTS"
  });
}

async function requestHostPermission(pattern) {
  return chrome.permissions.request({
    origins: [pattern]
  });
}

async function injectContentScriptIntoCurrentTab() {
  if (!currentTab?.id) {
    return;
  }

  await chrome.scripting.executeScript({
    target: {
      tabId: currentTab.id
    },
    files: ["content.js"]
  });
}

async function addSite(pattern, injectNow = false) {
  const granted = await requestHostPermission(pattern);

  if (!granted) {
    setStatus("Permissão não concedida para este site.");
    return;
  }

  const sites = await getSites();

  if (!sites.includes(pattern)) {
    sites.push(pattern);
  }

  await saveSites(sites);

  if (injectNow) {
    await injectContentScriptIntoCurrentTab();
  }

  await renderSites();
  await updateCurrentSiteState();

  setStatus(`Site habilitado: ${pattern}`);
}

async function removeSite(pattern) {
  const sites = await getSites();
  const updatedSites = sites.filter((site) => site !== pattern);

  await saveSites(updatedSites);

  try {
    await chrome.permissions.remove({
      origins: [pattern]
    });
  } catch (error) {
    console.warn(error);
  }

  await renderSites();
  await updateCurrentSiteState();

  setStatus(`Site removido: ${pattern}`);
}

async function renderSites() {
  const sitesListElement = getElement("sitesList");
  const sites = await getSites();

  sitesListElement.innerHTML = "";

  if (!sites.length) {
    const emptyItem = document.createElement("li");
    emptyItem.innerText = "Nenhum site habilitado.";
    sitesListElement.appendChild(emptyItem);
    return;
  }

  for (const site of sites) {
    const item = document.createElement("li");

    const text = document.createElement("span");
    text.innerText = site;

    const removeButton = document.createElement("button");
    removeButton.innerText = "Remover";
    removeButton.className = "remove";
    removeButton.addEventListener("click", () => removeSite(site));

    item.appendChild(text);
    item.appendChild(removeButton);

    sitesListElement.appendChild(item);
  }
}

async function updateCurrentSiteState() {
  const siteStateElement = document.getElementById("siteState");

  if (!siteStateElement || !currentTab?.url) {
    return;
  }

  const sites = await getSites();
  const enabled = isUrlAllowed(currentTab.url, sites);

  siteStateElement.innerText = enabled
    ? "Status: habilitado neste site"
    : "Status: desabilitado neste site";
}

async function init() {
  const currentSiteElement = getElement("currentSite");
  const enableCurrentSiteButton = getElement("enableCurrentSite");
  const manualSiteInput = getElement("manualSite");
  const addManualSiteButton = getElement("addManualSite");

  try {
    currentTab = await getActiveTab();
    currentSitePattern = getPatternFromUrl(currentTab.url);

    currentSiteElement.innerText = `Site atual: ${currentSitePattern}`;
    enableCurrentSiteButton.disabled = false;

    await updateCurrentSiteState();
  } catch (error) {
    currentSiteElement.innerText = error.message;
    enableCurrentSiteButton.disabled = true;
  }

  enableCurrentSiteButton.addEventListener("click", async () => {
    try {
      if (!currentSitePattern) {
        throw new Error("Nenhum site atual válido encontrado.");
      }

      await addSite(currentSitePattern, true);
    } catch (error) {
      setStatus(error.message);
    }
  });

  addManualSiteButton.addEventListener("click", async () => {
    try {
      const pattern = normalizeManualPattern(manualSiteInput.value);

      await addSite(pattern, false);

      manualSiteInput.value = "";
    } catch (error) {
      setStatus(error.message);
    }
  });

  await renderSites();
}