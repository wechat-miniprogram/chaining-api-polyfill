import { hello } from '../src'

test('hello', () => {
  expect(hello(1, 2)).toBe(3)
})
