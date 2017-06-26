const output = document.getElementById('output');

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
  }
}
