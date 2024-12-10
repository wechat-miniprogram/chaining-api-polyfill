import * as adapter from 'glass-easel-miniprogram-adapter'

export const renderComponent: (
  path: string | undefined,
  template: string,
  f: (env: adapter.ComponentEnv) => void,
) => adapter.component.GeneralComponent

export const defineComponent: (
  path: string | undefined,
  template: string,
  f: (env: adapter.ComponentEnv) => void,
) => adapter.component.GeneralComponent

export const waitTick: () => Promise<void>
