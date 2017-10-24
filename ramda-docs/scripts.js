const output = document.getElementById('output');
const RAMDA_SITE = 'http://ramdajs.com';

chrome.storage.local.get('RLayout', data => {
  if (!!data.RLayout) {
    insertData(data.RLayout)(output);
  }
  else {
    insertData(getData)(output);
  }
});

async function getData() {
  const URL = 'http://ramdajs.com/docs';
  let response = await fetch(URL);
  let fullData = await response.text();
  let layout = '';
  
  layout = fullData.substr(fullData.indexOf('<body>') + 6);
  layout = layout.split('</body>')[0];

  chrome.storage.local.set({'RLayout': layout})

  return layout;
}

function fixHeaderLinks(doc) {
  const menuLinks = [...doc.querySelectorAll('header.navbar a')]
    .map(a => {
      const href = a.getAttribute('href');
      if (/^(\/|#|\.\.)/i.test(href)) {
        // make the relative link absolute
        const externalHref = `http://ramdajs.com/docs/${ href.replace(/^\//, '../') }`;
        // fix paths like '/docs/../repl' to '/repl'
        a.setAttribute('href', externalHref.replace(/\/[^\/]+\/\.\./, ''));
      }
      // When clicked, open in new tab
      a.setAttribute('target', '_blank');
    });

  return menuLinks;
}

function insertData(fn) {
  return async function (element) {
    element.innerHTML = (typeof fn === 'function') ? await fn() : fn;
    ramdaInit();
    fixHeaderLinks(document);
    fixCodeExample(document);
    openInREPL(document);
  }
}

function openInREPL(doc) {
  [...doc.querySelectorAll('button')]
    .map(filtration);
}

function filtration(node) {
  if (node.matches('.run-here')) node.remove();

  node.addEventListener('click', tryInREPL);
}

function tryInREPL(event) {
  const target = event.target;
  const isREPL = target.matches('.send-repl');

  if (!isREPL) return;
  
  const codeElement = target.parentNode.nextElementSibling;
  const version = event.target.dataset && event.target.dataset.ramdaVersion;
  const versionParam = version ? '?v=' + version : '';
  const code = codeElement.textContent;
  const encoded = fixedEncodeURIComponent(code);

  return window.open(RAMDA_SITE + '/repl/' +
    versionParam + '#;' + encoded);
}

// https://goo.gl/Zbejtc
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

function fixCodeExample(doc) {
  [...doc.querySelectorAll('code')]
    .map(addPadding);
}

function addPadding(element) {
  if (element.matches('.javascript')) element.style.paddingTop = '35px';
}
