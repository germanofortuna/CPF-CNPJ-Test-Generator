(() => {
  if (window.__cpfCnpjTestGeneratorLoaded) {
    return;
  }

  window.__cpfCnpjTestGeneratorLoaded = true;
  const FORMAT_OUTPUT = true;

  const DOCUMENT_KEYWORDS = [
    "cpf",
    "cnpj",
    "cpfcnpj",
    "cpf_cnpj",
    "documento",
    "document",
    "taxid",
    "tax_id",
    "identification"
  ];

  let menu = null;
  let currentInput = null;

  function onlyDigits(value) {
    return value.replace(/\D/g, "");
  }

  function randomDigit() {
    return Math.floor(Math.random() * 10);
  }

  function allSameDigits(numbers) {
    return numbers.every((n) => n === numbers[0]);
  }

  function calcCpfDigit(numbers) {
    const weightStart = numbers.length + 1;

    const sum = numbers.reduce((acc, number, index) => {
      return acc + number * (weightStart - index);
    }, 0);

    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  function generateCpf() {
    let base;

    do {
      base = Array.from({ length: 9 }, randomDigit);
    } while (allSameDigits(base));

    const digit1 = calcCpfDigit(base);
    const digit2 = calcCpfDigit([...base, digit1]);

    const cpf = [...base, digit1, digit2].join("");

    if (!FORMAT_OUTPUT) {
      return cpf;
    }

    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function calcCnpjDigit(numbers) {
    const weights =
      numbers.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = numbers.reduce((acc, number, index) => {
      return acc + number * weights[index];
    }, 0);

    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  function generateCnpj() {
    let root;

    do {
      root = Array.from({ length: 8 }, randomDigit);
    } while (allSameDigits(root));

    // Gera CNPJ de matriz: XXXXXXXX/0001-XX
    const base = [...root, 0, 0, 0, 1];

    const digit1 = calcCnpjDigit(base);
    const digit2 = calcCnpjDigit([...base, digit1]);

    const cnpj = [...base, digit1, digit2].join("");

    if (!FORMAT_OUTPUT) {
      return cnpj;
    }

    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  function getAssociatedLabelText(input) {
    if (input.id) {
      const label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
      if (label) {
        return label.innerText || "";
      }
    }

    const parentLabel = input.closest("label");
    return parentLabel ? parentLabel.innerText || "" : "";
  }

  function getInputMetadata(input) {
    return [
      input.id,
      input.name,
      input.placeholder,
      input.getAttribute("aria-label"),
      input.getAttribute("autocomplete"),
      getAssociatedLabelText(input)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function detectDocumentType(input) {
    const text = getInputMetadata(input);

    if (!DOCUMENT_KEYWORDS.some((keyword) => text.includes(keyword))) {
      return null;
    }

    const hasCpf = text.includes("cpf");
    const hasCnpj = text.includes("cnpj");

    if (hasCpf && hasCnpj) {
      return "both";
    }

    if (hasCpf) {
      return "cpf";
    }

    if (hasCnpj) {
      return "cnpj";
    }

    // Campo genérico "documento"
    return "both";
  }

  function setNativeValue(input, value) {
    const inputSetter =
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
        ?.set;

    const textareaSetter =
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")
        ?.set;

    const setter = input instanceof HTMLTextAreaElement ? textareaSetter : inputSetter;

    if (setter) {
      setter.call(input, value);
    } else {
      input.value = value;
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
  }

  function createButton(label, onClick) {
	  const button = document.createElement("button");

	  button.type = "button";
	  button.textContent = label;

	  button.style.border = "1px solid #ccc";
	  button.style.background = "#ffffff";
	  button.style.color = "#111827";
	  button.style.borderRadius = "6px";
	  button.style.padding = "6px 10px";
	  button.style.fontSize = "12px";
	  button.style.fontWeight = "600";
	  button.style.lineHeight = "1";
	  button.style.cursor = "pointer";
	  button.style.boxShadow = "0 2px 8px rgba(0,0,0,.15)";
	  button.style.fontFamily = "Arial, sans-serif";
	  button.style.minWidth = "56px";
	  button.style.textAlign = "center";

	  button.addEventListener("mousedown", (event) => {
		event.preventDefault();
		event.stopPropagation();
		onClick();
		hideMenu();
	  });

	  return button;
	}

  function showMenu(input, type) {
    hideMenu();

    currentInput = input;

    const rect = input.getBoundingClientRect();

    menu = document.createElement("div");
    menu.style.position = "fixed";
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.zIndex = "999999";
    menu.style.display = "flex";
    menu.style.gap = "6px";
    menu.style.background = "rgba(255,255,255,.95)";
    menu.style.padding = "4px";
    menu.style.borderRadius = "8px";
    menu.style.boxShadow = "0 4px 16px rgba(0,0,0,.2)";

    if (type === "cpf" || type === "both") {
	  menu.appendChild(
		createButton("Gerar CPF", () => {
		  setNativeValue(currentInput, generateCpf());
		})
	  );
	}

	if (type === "cnpj" || type === "both") {
	  menu.appendChild(
		createButton("Gerar CNPJ", () => {
		  setNativeValue(currentInput, generateCnpj());
		})
	  );
	}

    document.body.appendChild(menu);
  }

  function hideMenu() {
    if (menu) {
      menu.remove();
      menu = null;
    }
  }

  function isEditableInput(element) {
    if (
      element instanceof HTMLInputElement &&
      !["hidden", "button", "submit", "checkbox", "radio"].includes(element.type)
    ) {
      return true;
    }

    return element instanceof HTMLTextAreaElement;
  }

  document.addEventListener("focusin", (event) => {
    const target = event.target;

    if (!isEditableInput(target)) {
      hideMenu();
      return;
    }

    const type = detectDocumentType(target);

    if (!type) {
      hideMenu();
      return;
    }

    showMenu(target, type);
  });

  document.addEventListener("click", (event) => {
    if (menu && !menu.contains(event.target) && event.target !== currentInput) {
      hideMenu();
    }
  });

  window.addEventListener("scroll", hideMenu, true);
  window.addEventListener("resize", hideMenu);
})();