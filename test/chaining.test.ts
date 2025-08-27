import { Component, Behavior } from '../src'
import { defineComponent, innerHTML, renderComponent } from './env'

describe('chaining calls', () => {
  test('`.options`', () => {
    defineComponent(
      'parent-comp',
      '<div><slot name="a" /></div><span><slot name="b" /></span>',
      () => {
        Component()
          .options({
            multipleSlots: true,
            virtualHost: true,
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

  test('`.behavior`', () => {
    const component = renderComponent(undefined, `<div>{{ text }}{{ text2 }}</div>`, () => {
      const beh = Behavior()
        .staticData({
          text2: 'abc',
        })
        .lifetime('attached', function () {
          this.setData({ text: 'def', text2: 'def' })
        })
        .register()
      const beh2 = Behavior().behavior(beh).register()
      Component()
        .behavior(beh2)
        .property('propA', String)
        .staticData({
          text: 'abc',
        })
        .lifetime('attached', function () {
          this.setData({
            text: 'ghi',
          })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>ghidef</div>')
  })

  test('`.behavior (with definition API)`', () => {
    const component = renderComponent(undefined, `<div>{{ text }}{{ text2 }}</div>`, () => {
      const beh = Behavior({
        data: { text2: 'abc' },
        properties: { propB: String },
        lifetimes: {
          attached() {
            this.setData({ text: 'def', text2: 'def' })
          },
        },
      })
      Component()
        .behavior(beh)
        .property('propA', String)
        .staticData({
          text: 'abc',
        })
        .lifetime('attached', function () {
          this.setData({
            text: 'ghi',
          })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>ghidef</div>')
  })

  test('`.externalClasses`', () => {
    defineComponent('parent-comp', '<div class="external" />', () => {
      Component().externalClasses(['external']).register()
    })
    const component = renderComponent(undefined, `<parent-comp external="outer" />`, () => {
      Component().register()
    })
    expect(innerHTML(component)).toBe('<parent-comp><div class="outer"></div></parent-comp>')
  })

  test('`.export`', () => {
    defineComponent('parent-comp', '<slot />', () => {
      Component()
        .staticData({
          childField: 'abc',
        })
        .export(function () {
          return { f: () => this.data.childField }
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

  test('`.properties`', () => {
    defineComponent('parent-comp', '{{ propA }}', () => {
      Component()
        .property('propA', String)
        .property('propB', { type: Object, value: { abc: 123 } })
        .lifetime('attached', function () {
          this.setData({ propA: this.data.propB.abc })
        })
        .register()
    })
    const component = renderComponent(undefined, `<parent-comp prop-b={{ abc: 456 }} />`, () => {
      Component().register()
    })
    expect(innerHTML(component)).toBe('<parent-comp>456</parent-comp>')
  })

  test('`.methods`', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text }}</div>`,
      () => {
        Component()
          .staticData({
            text: 'abc',
          })
          .methods({
            ev() {
              this.setData({ text: 'def' })
            },
          })
          .definition({
            data: {
              text: 'abc',
            },
            methods: {},
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc</div>')
    component._$.getShadowRoot()!.querySelector('#child')?.triggerEvent('customEv')
    expect(innerHTML(component)).toBe('<div>def</div>')
  })

  test('`.observers`', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text2 }}</div>`,
      () => {
        Component()
          .staticData({
            text: 'abc',
            text2: 'abc!',
          })
          .observer('text', function () {
            this.setData({ text2: this.data.text + '!' })
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc!</div>')
    component.setData({ text: 'def' })
    expect(innerHTML(component)).toBe('<div>def!</div>')
  })

  test('`.lifetime`', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .staticData({
          text: 'hello',
        })
        .lifetime('attached', function () {
          this.setData({
            text: this.data.text + ' world',
          })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>hello world</div>')
  })

  test('`.pageLifetime`', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .staticData({
          text: 0,
        })
        .pageLifetime(
          'resize',
          function (args: { size: { windowWidth: number; windowHeight: number } }) {
            const size = args.size
            this.setData({
              text: size.windowWidth * size.windowHeight,
            })
          },
        )
        .register()
    })
    expect(innerHTML(component)).toBe('<div>0</div>')
    const size = { windowWidth: 800, windowHeight: 600 }
    component._$.triggerPageLifetime('resize', [{ size }])
    expect(innerHTML(component)).toBe('<div>480000</div>')
  })

  test('`.relation`', () => {
    defineComponent('custom-list', '<slot />', () => {
      Component()
        .staticData({
          text: '',
        })
        .relation('custom-item', {
          type: 'child',
        })
        .register()
    })
    defineComponent('custom-item', '{{ text }}', () => {
      Component()
        .staticData({
          text: '',
        })
        .relation('custom-list', {
          type: 'parent',
          linked() {
            this.setData({ text: '!' })
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
        .staticData({
          text: '',
        })
        .lifetime('created', function () {
          this._extra = () => 'abc'
        })
        .lifetime('attached', function () {
          this.setData({ text: this._extra() })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>abc</div>')
  })
})
