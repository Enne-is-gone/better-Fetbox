function deconstructRoleString(input = "") {
  const age = input.match(/^\d+/)?.[0] ?? "";
  const gender = input.slice(age.length).match(/^[A-Za-z]+/)?.[0] ?? "";
  const role = input.slice(age.length + gender.length).trimStart();

  return { age, gender, role };
}

function filterOutAge(minAge = 18, maxAge = 99, entry, ignoreAnonAges) {
  if (!entry) {
    return;
  }

  const roleSpan = entry.querySelector("span");

  if (!roleSpan) {
    return;
  }

  const text = roleSpan.textContent.trim();
  const { age, gender, role } = deconstructRoleString(text);
  const ageNum = parseInt(age, 10);

  if (ignoreAnonAges && ageNum >= 100) {
    return;
  }

  if (ageNum < minAge || ageNum > maxAge) {
    entry.remove();
    return;
  }
}


function getSettings(callback) {
  chrome.storage.local.get(['popupSettings'], (result) => {
    const settings = result.popupSettings || {};
    const minAge = Number.isInteger(settings.lowerAge) ? settings.lowerAge : 18;
    const maxAge = Number.isInteger(settings.upperAge) ? settings.upperAge : 99;
    const ignoreAnonAges = Boolean(settings.ignoreAnonAges);
    const enabled = Boolean(settings.enabled);

    callback({ minAge, maxAge, ignoreAnonAges });
  });
}

const observer = new MutationObserver((mutations) => {
  getSettings(({ minAge, maxAge, ignoreAnonAges }) => {

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          filterOutAge(minAge, maxAge, node, ignoreAnonAges);
        }
      }
    }
  });
});

chrome.storage.local.get(['popupSettings'], (result) => {
  const settings = result.popupSettings || {};
  if (settings.enabled) {
    observer.observe(document.querySelector('#conversations-list > div:nth-child(3)'), {
      childList: true
    });
  }
});