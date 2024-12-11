import { Component, Behavior } from '../src'
import { defineComponent, innerHTML, renderComponent } from './env'

describe('classic definition', () => {
  test('`options` configuration segment', () => {
    defineComponent(
      'parent-comp',
      '<div><slot name="a" /></div><span><slot name="b" /></span>',
      () => {
        Component()
          .definition({
            options: {
              multipleSlots: true,
              virtualHost: true,
            },
          })
          .register()
      },
    )
    const component = renderComponent(
      undefined,
      `<parent-comp><div slot="b" /><span slot="a" /></parent-comp>`,
      () => {
        Component().register()
      },
    )
    expect(innerHTML(component)).toBe('<div><span></span></div><span><div></div></span>')
  })

  test('`behavior` configuration segment', () => {
    const component = renderComponent(undefined, `<div>{{ text }}{{ text2 }}</div>`, () => {
      const beh = Behavior()
        .definition({
          data: {
            text2: 'abc',
          },
          lifetimes: {
            attached() {
              this.setData({ text: 'def', text2: 'def' })
            },
          },
        })
        .register()
      const beh2 = Behavior()
        .definition({
          behaviors: [beh],
        })
        .register()
      Component()
        .definition({
          behaviors: [beh2],
          data: {
            text: 'abc',
          },
          lifetimes: {
            attached() {
              this.setData({
                text: 'ghi',
              })
            },
          },
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>ghidef</div>')
  })

  test('`externalClasses` configuration segment', () => {
    defineComponent('parent-comp', '<div class="external" />', () => {
      Component()
        .definition({
          externalClasses: ['external'],
        })
        .register()
    })
    const component = renderComponent(undefined, `<parent-comp external="outer" />`, () => {
      Component().register()
    })
    expect(innerHTML(component)).toBe('<parent-comp><div class="outer"></div></parent-comp>')
  })

  test('`export` configuration segment', () => {
    defineComponent('parent-comp', '<slot />', () => {
      Component()
        .definition({
          data: {
            childField: 'abc',
          },
          export() {
            return { f: () => this.data.childField }
          },
        })
        .register()
    })
    const component = renderComponent(
      undefined,
      `<parent-comp id="a">{{ text }}</parent-comp>`,
      () => {
        Component()
          .definition({
            data: {
              text: '',
            },
            lifetimes: {
              attached() {
                const a = this.selectComponent('#a')!
                const text = a.f()
                this.setData({ text })
              },
            },
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<parent-comp>abc</parent-comp>')
  })

  test('`properties` configuration segment', () => {
    defineComponent('parent-comp', '{{ propA }}', () => {
      Component()
        .definition({
          properties: {
            propA: String,
            propB: { type: Object, value: { abc: 123 } },
          },
          lifetimes: {
            attached() {
              this.setData({ propA: this.data.propB.abc })
            },
          },
        })
        .register()
    })
    const component = renderComponent(undefined, `<parent-comp prop-b={{ abc: 456 }} />`, () => {
      Component().register()
    })
    expect(innerHTML(component)).toBe('<parent-comp>456</parent-comp>')
  })

  test('`methods` configuration segment', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text }}</div>`,
      () => {
        Component()
          .definition({
            data: {
              text: 'abc',
            },
            methods: {
              ev() {
                this.setData({ text: 'def' })
              },
            },
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc</div>')
    component._$.getShadowRoot()!.querySelector('#child')?.triggerEvent('customEv')
    expect(innerHTML(component)).toBe('<div>def</div>')
  })

  test('`observers` configuration segment', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text2 }}</div>`,
      () => {
        Component()
          .definition({
            data: {
              text: 'abc',
              text2: 'abc!',
            },
            observers: {
              text() {
                this.setData({ text2: this.data.text + '!' })
              },
            },
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc!</div>')
    component.setData({ text: 'def' })
    expect(innerHTML(component)).toBe('<div>def!</div>')
  })

  test('`lifetimes` configuration segment', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .definition({
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
    })
    expect(innerHTML(component)).toBe('<div>hello world</div>')
  })

  test('`pageLifetimes` configuration segment', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .definition({
          data: {
            text: 0,
          },
          pageLifetimes: {
            resize(args: { size: { windowWidth: number; windowHeight: number } }) {
              const size = args.size
              this.setData({
                text: size.windowWidth * size.windowHeight,
              })
            },
          },
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>0</div>')
    const size = { windowWidth: 800, windowHeight: 600 }
    component._$.triggerPageLifetime('resize', [{ size }])
    expect(innerHTML(component)).toBe('<div>480000</div>')
  })

  test('`relations` configuration segment', () => {
    defineComponent('custom-list', '<slot />', () => {
      Component()
        .definition({
          data: {
            text: '',
          },
          relations: {
            'custom-item': {
              type: 'child',
            },
          },
        })
        .register()
    })
    defineComponent('custom-item', '{{ text }}', () => {
      Component()
        .definition({
          data: {
            text: '',
          },
          relations: {
            'custom-list': {
              type: 'parent',
              linked() {
                this.setData({ text: '!' })
              },
            },
          },
        })
        .register()
    })
    const component = renderComponent(
      undefined,
      `<custom-list><custom-item></custom-item></custom-list>`,
      () => {
        Component().register()
      },
    )
    expect(innerHTML(component)).toBe('<custom-list><custom-item>!</custom-item></custom-list>')
  })

  test('extra this fields', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .extraThisFieldsType<{ _extra: () => string }>()
        .definition({
          data: {
            text: '',
          },
          lifetimes: {
            created() {
              this._extra = () => 'abc'
            },
            attached() {
              this.setData({ text: this._extra() })
            },
          },
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>abc</div>')
  })
})
