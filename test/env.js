exports.renderComponent = globalThis.__renderComponent

exports.defineComponent = globalThis.__defineComponent

exports.waitTick = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 100)
  })
}

exports.innerHTML = (component) => {
  return component._$.$$.innerHTML
}
