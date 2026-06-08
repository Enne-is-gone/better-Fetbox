const toggle = document.getElementById('enabledToggle');
const lowerInput = document.getElementById('lowerAgeBound');
const upperInput = document.getElementById('upperAgeBound');
const ignoreAnonInput = document.getElementById('ignoreAnonAges');

const DEFAULT_SETTINGS = {
  enabled: false,
  lowerAge: 18,
  upperAge: 99,
  ignoreAnonAges: false,
};

const sanitizeNumberInput = (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 3);
};

const enforceBounds = (event) => {
  const id = event.target.id;
  const defaultValue = id === 'lowerAgeBound' ? DEFAULT_SETTINGS.lowerAge : DEFAULT_SETTINGS.upperAge;
  let value = parseInt(event.target.value, 10);

  if (Number.isNaN(value)) {
    event.target.value = defaultValue;
    value = defaultValue;
  }

  value = Math.max(DEFAULT_SETTINGS.lowerAge, Math.min(100, value));

  const other = id === 'lowerAgeBound' ? upperInput : lowerInput;
  let otherVal = parseInt(other.value, 10);
  if (Number.isNaN(otherVal)) {
    otherVal = id === 'lowerAgeBound' ? DEFAULT_SETTINGS.upperAge : DEFAULT_SETTINGS.lowerAge;
  }

  if (id === 'lowerAgeBound' && value > otherVal) {
    value = otherVal;
  } else if (id === 'upperAgeBound' && value < otherVal) {
    value = otherVal;
  }

  event.target.value = String(value);
};

const savePopupSettings = () => {
  chrome.storage.local.set({
    popupSettings: {
      enabled: toggle.checked,
      lowerAge: Number(lowerInput.value) || DEFAULT_SETTINGS.lowerAge,
      upperAge: Number(upperInput.value) || DEFAULT_SETTINGS.upperAge,
      ignoreAnonAges: ignoreAnonInput.checked,
    },
  });
};

const loadPopupSettings = () => {
  chrome.storage.local.get(['popupSettings'], (result) => {
    const settings = result.popupSettings || DEFAULT_SETTINGS;
    toggle.checked = settings.enabled ?? DEFAULT_SETTINGS.enabled;
    lowerInput.value = settings.lowerAge ?? DEFAULT_SETTINGS.lowerAge;
    upperInput.value = settings.upperAge ?? DEFAULT_SETTINGS.upperAge;
    ignoreAnonInput.checked = settings.ignoreAnonAges ?? DEFAULT_SETTINGS.ignoreAnonAges;
  });
};

const allowDigitKeys = (event) => {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (allowed.includes(event.key)) {
    return;
  }
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    return;
  }
  const selectionStart = event.target.selectionStart;
  if (event.target.value.length >= 3 && selectionStart !== null && event.target.selectionStart === event.target.selectionEnd) {
    event.preventDefault();
  }
};

loadPopupSettings();

toggle.addEventListener('change', savePopupSettings);
ignoreAnonInput.addEventListener('change', savePopupSettings);

[lowerInput, upperInput].forEach((input) => {
  input.addEventListener('input', sanitizeNumberInput);
  input.addEventListener('blur', (event) => {
    enforceBounds(event);
    savePopupSettings();
  });
  input.addEventListener('keydown', allowDigitKeys);
});
