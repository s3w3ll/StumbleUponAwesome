'use strict';

/**
 * Keep track of the StumbleUponAwesome tab
 */
var stumbleTabId = null;

/**
 * The focused window ID
 */
var windowId = null;

var totalUrls = 0; // to be counted on first run
var os = 'mac'; // mac", "win", "android", "cros", "linux"

/**
 * @typedef {Object} StumbleURL
 * @property {string} url
 * @property {string=} title
 * @property {string} listUrl The URL of the collection.
 * @property {string=} listTitle The title of the collection.
 */

/**
* @type {StumbleURL}
*/
var stumbleUrl;

/**
 * Rabbithole mode. When not null, the mode is enabled 
 * and each stumble is on the same category. 
 * 
 * It is persisted in local storage. 
 * @type {string|null} 
 */
var rabbitHoleCategory = null;

var isPendingStumble = false;

chrome.runtime.getPlatformInfo(function (info) {
  os = info.os;
});


/**
 * 
 * @param {string} filepath Path to the file
 * @returns {Array} a random line, token separated
 */
async function getRandomLineFromFile(filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allText = await response.text();
    const lines = allText.split('\n').filter(ln => ln.trim().length > 0);
    totalUrls = lines.length;
    const randomNum = Math.floor(Math.random() * totalUrls);
    const randomLine = lines[randomNum].split(',');
    return randomLine;
  } catch (error) {
    throw error;
  }
}

async function findUrl(source, category) {
  const defaultSource = 'awesome-cleaned';

  // Rabbithole mode ON
  if (category) {
    // Only one source for now, 'awesome'
    const randomUrl = await getRandomLineFromFile(`./data/urls/${defaultSource}/${category}.txt`);
    return randomUrl;
  }
  // Rabbithole mode OFF - Random
  const randomCategory = await getRandomLineFromFile(`./data/sources/awesome.txt`);
  const randomUrl = await getRandomLineFromFile(`./data/urls/${defaultSource}/${randomCategory[0]}.txt`);
  return randomUrl;

}


/**
 * Find a random URL and load it
 * 
 * The URLs have been scraped from each README pages collected
 * in https://github.com/sindresorhus/awesome/blob/master/readme.md
 * 
 * Huge props to @sindresorhus for curating all that content
 */
async function stumble() {

  const randomLine = await findUrl('awesome', rabbitHoleCategory);

  stumbleUrl = {
    url: randomLine[0],
    title: randomLine[1] ? randomLine[1].trim() : undefined,
    listUrl: randomLine[2],
    listTitle: randomLine[3]
  }

  await set('lastStumbleUrl', stumbleUrl);

  // Switch to exiting tab 
  if (stumbleTabId !== null) {
    try {
      chrome.tabs.update(stumbleTabId, {
        url: stumbleUrl.url,
        active: true
      }, function (tab) {
      })
    } catch (exception) {
      chrome.tabs.update({
        url: stumbleUrl.url,
      }, async function (tab) {
        await saveStumbleTabId(tab.id);
      })
    }
  }
  // or Open New tab
  else {
    chrome.tabs.create({
      url: stumbleUrl.url,
    }, async function (tab) {
      await saveStumbleTabId(tab.id);
    })
  }
}

var interval = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateIcon() {
  const size = 48;
  var canvas = new OffscreenCanvas(size, size);

  var context = canvas.getContext('2d');
  var lines = 8;

  var boxWidth = size;
  var boxHeight = size;

  var iconWidth = boxWidth * 0.7;
  var iconHeight = boxHeight * 0.9;
  var iconHalfHeight = iconHeight / 2;
  var iconHalfWidth = iconWidth / 2;

  context.beginPath();
  context.fillStyle = "red";
  context.strokeRect(0, 0, boxWidth, boxHeight);
  context.strokeStyle = "green"
  context.strokeRect((boxWidth - iconWidth) / 2, (boxHeight - iconHeight) / 2, iconWidth, iconHeight);
  context.translate(((boxWidth - iconWidth) / 2), (boxHeight - iconHeight) / 2)

  for (var i = 0; i < lines; i++) {
    await sleep(20);
    context.clearRect(0, 0, boxWidth, boxHeight);
    // Within icon bounds now
    switch (i) {
      case 0:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        break;
      case 1:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        break;
      case 2:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        break;
      case 3:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.strokeStyle = '#27d7dd';
        break;
      case 4:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.strokeStyle = "#8b27dd";
        break;
      case 5:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.lineTo(iconWidth, iconHalfHeight);
        context.strokeStyle = "#e6f7de";
        break;
      case 6:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.lineTo(iconWidth, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.strokeStyle = "#e6f7de";
        break;
      case 7:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.lineTo(iconWidth, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.closePath()
        context.strokeStyle = "#e07128";
        break;
    }
    context.lineWidth = 2.5;
    // context.strokeStyle = 'rgba(216, 151, 131, 1)';
    context.stroke();

    var imageData = context.getImageData((boxWidth - iconWidth) / 2, (boxHeight - iconHeight) / 2, iconWidth, iconHeight);

    chrome.action.setIcon({
      imageData: imageData
    });
  }

  await sleep(200);
  context.fillStyle = 'rgba(216, 151, 131, 1)';
  context.fill();

  var imageData = context.getImageData((boxWidth - iconWidth) / 2, (boxHeight - iconHeight) / 2, iconWidth, iconHeight);
  chrome.action.setIcon({
    imageData: imageData
  });

  await sleep(400);
  chrome.action.setIcon({
    imageData: null,
    path: "./images/icon_16.png"
  });
}


/**
 * Get a value from storage.
 * @param {string} key Key
 * @param {any} defaultVal The default value
 */
const get = async (key, defaultVal) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ [key]: defaultVal }, result => {
      resolve(result[key]);
    });
  })
}

/**
* Set a value.
* @param {string} key Key
* @param {any} val Value
*/
const set = async (key, val) => {
  const item = { [key]: val };
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(item, () => {
      resolve();
    });
  })
}

const getRabbitHoleCategory = async () => {
  return await get('rabbitHoleCategory', null);
}

const setRabbitHoleCategory = async category => {
  await set('rabbitHoleCategory', category);
  rabbitHoleCategory = category;
}

const enterRabbitHole = async () => {
  await setRabbitHoleCategory(stumbleUrl.listTitle);
  chrome.storage.local.get(['visited', 'totalUrls', 'welcome_seen'], function (result) {
    notifyTabStumble(result.visited, result.totalUrls, rabbitHoleCategory !== null);
  });
}

const exitRabbitHole = async () => {
  await setRabbitHoleCategory(null);
  
  chrome.storage.local.get(['visited', 'totalUrls', 'welcome_seen'], function (result) {
    notifyTabStumble(result.visited, result.totalUrls, rabbitHoleCategory !== null);
  });
}

const saveStumbleTabId = async tabId => {
  await set('stumbleTabId', tabId);
  stumbleTabId = tabId;
}

const getStumbleTabId = async () => {
  return await get('stumbleTabId', null);
}

const saveLastWindowId = async windowId => {
  await set('lastWindowId', windowId);
}

const getLastWindowId = async () => {
  return await get('lastWindowId', null);
}

function update() {
  chrome.storage.local.get(['visited', 'totalUrls', 'welcome_seen', 'show_update'], function (result) {

    if (result.welcome_seen === undefined || result.welcome_seen === false || result.welcome_seen === null) {
      chrome.scripting.insertCSS({
        target: { tabId: stumbleTabId },
        files: ['styles.css']
      }).then(() => {
        chrome.scripting.executeScript({
          target: { tabId: stumbleTabId },
          files: ['content.js']
        }).then(() => {
          notifyTabWelcome();
        });
      });
    } else if (result.show_update) {
      notifyTabUpdate();
    } else {
      const count = result.visited === undefined ? 0 : parseInt(result.visited)
      const incremented = count + 1;
      // Set new value
      chrome.storage.local.set({ 'visited': incremented, 'totalUrls': totalUrls }, function () {
        notifyTabStumble(incremented, totalUrls, rabbitHoleCategory !== null);
      });
    }
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // make sure the status is 'complete' and it's the right tab
  if (isPendingStumble && tabId === stumbleTabId && changeInfo.status === 'complete') {
    update();
    isPendingStumble = false;
  }
});

function notifyTabStumble(visited, totalUrls, isRabbitHoleEnabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(stumbleTabId, { "message": "stumble", 'visited': visited, 'totalUrls': totalUrls, stumbleUrl, isRabbitHoleEnabled });
  });
}

function notifyTabWelcome() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(stumbleTabId, { "message": "welcome", "os": os });
  });
}

function notifyTabUpdate() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(stumbleTabId, { "message": "update" });
    chrome.storage.local.set({'show_update': false});
  });
}

// Load a page on click
chrome.action.onClicked.addListener(
  async function (tab) {

    const currentWindowId = await getFocusedWindowId();
    // Get stumble tab Id
    const savedStumbleTabId = await getStumbleTabId();
    const tabs = await getBrowserTabs();
    const tabIds = tabs.map(t => t.id);

    // Reset if necessary
    if (windowId !== currentWindowId || !savedStumbleTabId || !tabIds.includes(savedStumbleTabId)) {
      windowId = currentWindowId;
      await saveLastWindowId(windowId);
      chrome.storage.local.remove(['stumbleTabId'], () => {
        stumbleTabId = null;
      })
    }

    isPendingStumble = true;
    stumble();
    animateIcon();
  }
);

// When a tab closes, if it's the Stumble tab, clear the id
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId === stumbleTabId) {
    stumbleTabId = null;
  }
})

function clearCounter() {
  chrome.storage.local.remove(['visited'])
}

chrome.runtime.onInstalled.addListener(function (details) {
  // For development purposes only, uncomment when needed
  // chrome.storage.local.remove(['visited', 'welcome_seen', 'totalUrls'])
  
  // Check for update
  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    chrome.storage.local.set({'show_update': true});
  }

  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: "sax-show",
      title: 'Show info bubbles',
      contexts: ["action"]
    });
    chrome.contextMenus.create({
      id: "sax-rabbit-hole",
      title: 'Down the rabbit hole!',
      contexts: ["action"]
    });
    chrome.contextMenus.create({
      id: "sax-feedback",
      title: 'Give feedback to improve the extension',
      contexts: ["action"]
    });
  })
});

/**
 * Return the list of Chrome tabs
 * @returns {Promise<Array<chrome.tabs.Tab>>}
 */
const getBrowserTabs = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      resolve(tabs);
    });
  })
}

/**
 * Return the recently focused window id.
 * @returns {Promise<number>}
 */
const getFocusedWindowId = () => {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent(window => {
      resolve(window.id);
    });
  });
}

/*
Context menu
*/
chrome.contextMenus.onClicked.addListener(async function (event) {
  if (event.menuItemId === "sax-feedback") {
    chrome.tabs.create({
      url: 'mailto:stumbleuponawesome@gmail.com?subject=Feedback on StumbleUponAwesome&body=Tell me! :)',
    }, function (tab) {
    })
  } else if (event.menuItemId === "sax-show") {
    chrome.storage.local.get(['visited', 'totalUrls', 'welcome_seen'], function (result) {
      notifyTabStumble(result.visited, result.totalUrls, rabbitHoleCategory !== null);
    });
  } else if (event.menuItemId === "sax-rabbit-hole") {
    if (rabbitHoleCategory) {
      await exitRabbitHole();
    } else {
      await enterRabbitHole();
    }
  }
});

/** Messages from content script */

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {
      if (request.message === "rabbit-hole-enter") {
          await enterRabbitHole();
      } else if (request.message === "rabbit-hole-exit") {
          await exitRabbitHole();
      }
  }
);

/**
 * Restore values into memory. 
 * Background script can go idle at anytime, so we need to persist these. 
 */
async function init() {
  windowId = await getLastWindowId();
  stumbleTabId = await getStumbleTabId();
  stumbleUrl = await get('lastStumbleUrl', null);
  rabbitHoleCategory = await getRabbitHoleCategory();
}

init();