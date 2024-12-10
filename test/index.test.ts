import * as adapter from 'glass-easel-miniprogram-adapter'
import { Component, Behavior } from '../src'
import { defineComponent, renderComponent } from './env'

const innerHTML = (component: adapter.component.GeneralComponent) => {
  return (component._$.$$ as unknown as HTMLElement).innerHTML
}

describe('classic definition', () => {
  test('`lifetimes`', () => {
    const component = renderComponent(
      undefined,
      `<div>{{ text }}</div>`,
      () => {
        Component()
          .definition({
            // properties: {},
            data: {
              text: 'hello',
            },
            lifetimes: {
              attached() {
                this.setData({
                  text: this.data.text + ' world',
                })
              },
            },
          })
          .register()
      },
    )

    expect(innerHTML(component)).toBe('<div>hello world</div>')
  })
})
