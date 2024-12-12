import * as adapter from 'glass-easel-miniprogram-adapter'
import { TmplGroup } from 'glass-easel-template-compiler'

const compileTemplate = (src: string) => {
  const group = new TmplGroup()
  group.addTmpl('', src)
  const genObjectSrc = `return ${group.getTmplGenObjectGroups()}`
  group.free()
  const genObjectGroupList = new Function(genObjectSrc)() as {
    [key: string]: any
  }
  return {
    groupList: genObjectGroupList,
    content: genObjectGroupList[''],
  }
}

const setup = () => {
  const env = new adapter.MiniProgramEnv()
  const codeSpace = env.createCodeSpace('', true)
  codeSpace.getComponentSpace().updateComponentOptions({ useMethodCallerListeners: true })
  const backend = env.associateBackend()
  codeSpace.componentEnv('', (env) => {
    ;(globalThis as any).Behavior = env.Behavior
  })
  ;(globalThis as any).__defineComponent = (
    path: string,
    template: string,
    f: (_: any) => void,
  ) => {
    const compPath = path || 'TEST'
    codeSpace.addCompiledTemplate(compPath, compileTemplate(template))
    codeSpace.componentEnv(compPath, (env) => {
      ;(globalThis as any).Component = env.Component
      f(env)
    })
    const def = codeSpace.getComponentSpace().getComponentByUrl(compPath, '')
    codeSpace.getComponentSpace().setGlobalUsingComponent(compPath, def)
  }
  ;(globalThis as any).__renderComponent = (
    path: string,
    template: string,
    f: (_: any) => void,
  ) => {
    const compPath = path || 'TEST'
    codeSpace.addCompiledTemplate(compPath, compileTemplate(template))
    codeSpace.componentEnv(compPath, (env) => {
      ;(globalThis as any).Component = env.Component
      f(env)
    })
    const root = backend.createRoot('glass-easel-root', codeSpace, compPath)
    const placeholder = document.createElement('div')
    document.body.appendChild(placeholder)
    root.attach(document.body as any, placeholder as any)
    return root.getComponent().getMethodCaller()
  }
}

module.exports = setup
