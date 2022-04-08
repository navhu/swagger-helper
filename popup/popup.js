let $power = document.getElementById('power')

chrome.storage.sync.get('power', ({ power }) => {
  $power.checked = !!power
})

$power.addEventListener('click', async function () {
  let power = $power.checked

  chrome.storage.sync.set({ power })
})
