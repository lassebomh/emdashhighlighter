const regex = new RegExp(/(—)/gim);

const stylesElement = document.createElement("style");
stylesElement.innerHTML = `[data-hightlight] { background-color: red; color: white; font-weight: bolder; }`;
document.head.appendChild(stylesElement);

function update() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      return regex.test(node.nodeValue ?? "") &&
        node.parentElement !== null &&
        !["SCRIPT", "STYLE", "TEXTAREA", "TITLE"].includes(node.parentElement.tagName)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  let currentNode;
  let textNodes = [];

  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  /**@type {HTMLElement[]} */
  let nodes = [];

  for (const currentNode of textNodes) {
    const text = /** @type {string} */ (currentNode.nodeValue);
    const parent = /** @type {HTMLElement} */ (currentNode.parentElement);

    const matches = [...text.matchAll(regex)];

    if (matches === null) continue;

    if (matches.length === 1 && matches.at(0)?.[0]?.length === text.length && parent.tagName === "SPAN") {
      nodes.push(parent);
    } else {
      let lastIndex = 0;

      for (const match of matches) {
        const textNode = document.createTextNode(text.slice(lastIndex, match.index));
        parent.insertBefore(textNode, currentNode);

        const spanNode = document.createElement("span");

        spanNode.textContent = match[0];
        parent.insertBefore(spanNode, currentNode);
        nodes.push(spanNode);

        lastIndex = match.index + match[0].length;
      }
      const textNode = document.createTextNode(text.slice(lastIndex, text.length));
      parent.insertBefore(textNode, currentNode);

      parent.removeChild(currentNode);
    }
  }

  for (const node of nodes) {
    node.dataset.hightlight = "";
  }
}

update();
setInterval(() => update(), 1000);
