;(async function () {
  function listenNodeChange(targetNode, callback) {
    new MutationObserver(callback).observe(targetNode, {
      subtree: true,
      attributes: true
    })
  }

  function insertStyle() {
    let styleElement = document.createElement('style')

    styleElement.innerText = `
      .el-message {
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        min-width: 380px;
        position: fixed;
        left: 50%;
        top: 20px;
        -webkit-transform: translateX(-50%);
        transform: translateX(-50%);
        -webkit-transition: opacity .3s,top .4s,-webkit-transform .4s;
        transition: opacity .3s,top .4s,-webkit-transform .4s;
        transition: opacity .3s,transform .4s,top .4s;
        transition: opacity .3s,transform .4s,top .4s,-webkit-transform .4s;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        background-color: #f0f9eb;
        border: 1px solid #e1f3d8;
        padding: 15px;
        margin: 0;
        color: #67C23A;
        font-size: 14px;
        line-height: 1;
      }
      .el-message-fade-enter,.el-message-fade-leave-active {
        opacity: 0;
        -webkit-transform: translate(-50%,-100%);
        transform: translate(-50%,-100%);
      }
    `
    document.head.appendChild(styleElement)
  }

  function toast(text) {
    const num = document.querySelectorAll('.el-message').length
    const height = num > 0 ? 46 : 0
    const top = 20 * (num + 1) + height * num
    const htmlStr = `<div role="alert" class="el-message" style="top:${top}px; z-index:2000;">${text}</div>`
    let divElement = document.createElement('div')
    let toastElement

    divElement.innerHTML = htmlStr
    toastElement = divElement.firstChild
    document.body.appendChild(toastElement)

    setTimeout(() => {
      toastElement.classList.add('el-message-fade-leave-active')
    }, 1500)

    setTimeout(() => {
      document.body.removeChild(toastElement)
    }, 2000)
  }

  function copyContent(text) {
    let inputElement = document.createElement('input')

    inputElement.value = text
    document.body.appendChild(inputElement)
    inputElement.select()
    document.execCommand('copy')
    toast('复制成功！')

    document.body.removeChild(inputElement)
  }

  function createButton(text) {
    return new Promise(resolve => {
      let buttonElement = document.createElement('button')
      buttonElement.innerText = text
      buttonElement.style.cssText = 'border-color:#67c23a; background-color:#67c23a; color:#fff; margin-left:10px;'
      resolve(buttonElement)
    })
  }

  function getApiHost() {
    return new Promise(resolve => {
      const timer = setInterval(() => {
        let schemeContainer = document.querySelector('[class*=scheme]')

        if (schemeContainer) {
          clearInterval(timer)
          resolve(schemeContainer)
        }
      }, 1000)
    })
  }

  async function runHelper(again = false) {
    console.log('%cSwagger助手运行中', 'color: green')

    let schemeContainer = await getApiHost()
    let container = document.querySelector('[id*=swagger-ui]')
    let apis = container.querySelectorAll('[class*=summary-path]')

    let select = schemeContainer.querySelector('select')
    const apiHostValue = select.options[select.selectedIndex].value

    insertStyle()

    if (!again) {
      // 复制Host
      createButton('复制Host').then(button => {
        select.parentElement.parentElement.appendChild(button)
        button.onclick = function () {
          copyContent(apiHostValue)
        }
      })
    }

    apis.forEach(ele => {
      let path = ele.dataset.path

      // 复制Path
      createButton('复制Path').then(button => {
        ele.parentElement.parentElement.appendChild(button)
        button.onclick = function () {
          copyContent(path)
        }
      })

      // 复制Url
      createButton('复制Url').then(button => {
        ele.parentElement.parentElement.appendChild(button)
        button.onclick = function () {
          copyContent(apiHostValue + path)
        }
      })
    })

    listenNodeChange(container, (mutationsList, observer) => {
      observer.disconnect()
      runHelper(true)
    })
  }

  let { power } = await chrome.storage.sync.get('power')

  if (power && location.hostname.includes('swagger')) {
    runHelper()
  }

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.power) {
      const power = changes.power.newValue
      console.log('swagger助手状态：', `${power ? '开启' : '关闭'}`)

      if (power && location.hostname.includes('swagger')) {
        runHelper()
      }
    }
  })
})()
