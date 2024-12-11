import { Behavior, Component } from '../src'
import { innerHTML, renderComponent } from './env'

describe('chaining calls', () => {
  test('`implement` in init function', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text }}</div>`,
      () => {
        interface BehTrait {
          behFunc: (a: number) => number
        }
        const behTrait = Behavior.trait<BehTrait>()
        const beh = Behavior()
          .init(({ implement }) => {
            implement(behTrait, {
              behFunc(a: number) {
                return a * 2
              },
            })
          })
          .register()
        Component()
          .behavior(beh)
          .staticData({
            text: 0,
          })
          .init(({ self, setData, lifetime }) => {
            lifetime('attached', () => {
              const behTraitImpl = self.traitBehavior(behTrait)!
              setData({ text: behTraitImpl.behFunc(123) })
            })
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>246</div>')
  })
  test('`method` in init function', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text }}</div>`,
      () => {
        Component()
          .staticData({
            text: 'abc',
          })
          .init(function ({ method }) {
            const ev = method(() => {
              this.setData({ text: 'def' })
            })
            return { ev }
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc</div>')
    component._$.getShadowRoot()!.querySelector('#child')?.triggerEvent('customEv')
    expect(innerHTML(component)).toBe('<div>def</div>')
  })

  test('`listener` in init function', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text }}</div>`,
      () => {
        Component()
          .staticData({
            text: 'abc',
          })
          .init(({ self, listener }) => {
            const ev = listener(() => {
              self.setData({ text: 'def' })
            })
            return { ev }
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc</div>')
    component._$.getShadowRoot()!.querySelector('#child')?.triggerEvent('customEv')
    expect(innerHTML(component)).toBe('<div>def</div>')
  })

  test('`observer` in init function', () => {
    const component = renderComponent(
      undefined,
      `<div id="child" bind:customEv="ev">{{ text2 }}</div>`,
      () => {
        Component()
          .staticData({
            text: 'abc',
            text2: 'abc!',
          })
          .observer('text', () => {})
          .init(({ data, setData, observer }) => {
            observer('text', () => {
              setData({ text2: data.text + '!' })
            })
          })
          .register()
      },
    )
    expect(innerHTML(component)).toBe('<div>abc!</div>')
    component.setData({ text: 'def' })
    expect(innerHTML(component)).toBe('<div>def!</div>')
  })

  test('`observer` (multiple fields) in init function', () => {
    const component = renderComponent(undefined, `<div id="child">{{ c }}</div>`, () => {
      Component()
        .staticData({
          a: 1,
          b: 2,
          c: 3,
        })
        .observer(['a', 'b'], () => {})
        .init(({ data, setData, observer }) => {
          observer(['a', 'b'], () => {
            setData({ c: data.a + data.b })
          })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>3</div>')
    component.setData({ b: 4 })
    expect(innerHTML(component)).toBe('<div>5</div>')
    component.setData({ a: 6 })
    expect(innerHTML(component)).toBe('<div>10</div>')
  })

  test('`lifetime` in init function', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .staticData({
          text: 'hello',
        })
        .init(({ data, setData, lifetime }) => {
          lifetime('attached', () => {
            setData({
              text: data.text + ' world',
            })
          })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>hello world</div>')
  })

  test('`pageLifetimes` configuration segment', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .staticData({
          text: 0,
        })
        .init(({ setData, pageLifetime }) => {
          pageLifetime(
            'resize',
            function (args: { size: { windowWidth: number; windowHeight: number } }) {
              const size = args.size
              setData({
                text: size.windowWidth * size.windowHeight,
              })
            },
          )
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>0</div>')
    const size = { windowWidth: 800, windowHeight: 600 }
    component._$.triggerPageLifetime('resize', [{ size }])
    expect(innerHTML(component)).toBe('<div>480000</div>')
  })

  test('extra this fields', () => {
    const component = renderComponent(undefined, `<div>{{ text }}</div>`, () => {
      Component()
        .extraThisFieldsType<{ _extra: () => string }>()
        .staticData({
          text: '',
        })
        .init(function ({ setData, lifetime }) {
          lifetime('created', () => {
            this._extra = () => 'abc'
          })
          lifetime('attached', () => {
            setData({ text: this._extra() })
          })
        })
        .register()
    })
    expect(innerHTML(component)).toBe('<div>abc</div>')
  })
})
