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

function insertData(fn) {
  return async function (element) {
    element.innerHTML = (typeof fn === 'function') ? await fn() : fn;
    ramdaInit();
  }
}