# Chaining API Polyfill

为在非 glass-easel 组件框架下运行的小程序提供 Chaining API 支持。


## 为什么要使用 Chaining API ？

小程序使用传统的 `Page` 或 `Component` 构造器时，在复杂情况下会很不好用。

例如，如果页面或组件有个复杂的私有变量，只能选择将它写入到 `this` 的某个字段上，或者 setData 到 `this.data` 上。无论哪种处理方式，对 TypeScript 都不太友好，而且可能带来较大的性能开销。

为了解决这类问题，小程序的 [glass-easel 组件框架](https://github.com/wechat-miniprogram/glass-easel)提供了 [Chaining API](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/glass-easel/chaining-api.html) 。其中最重要的是提供了 `init` 函数。使用 Chaining API 可以编写出更易于维护、对 TypeScript 更友好的组件代码。

然而，在未激活 glass-easel 组件框架时，或在旧版本的小程序基础库中， Chaining API 不被支持。这个 polyfill 可以在这些时候补上 Chaining API 支持。


## 基础用法

基本示例可参考 [这个代码片段](https://developers.weixin.qq.com/s/IFJUZtmU7qWW) 。

首先在 npm 中引入：

```shell
npm install --save miniprogram-chaining-api-polyfill
```

npm install 之后，需要点一下小程序开发者工具菜单中的“工具”——“构建 npm ”。

另外，需要确认 `tsconfig` 中的 `noImplicitThis` 选项已经打开。

在想要使用 Chaining API 的页面或组件文件中，引入 polyfill 过的 `Component` 构造器：

```ts
import { Component } from 'miniprogram-chaining-api-polyfill'

// 然后就可以使用 Chaining API 了
Component()
  // ...
  .register()
```

注意：如果这个组件本身只用在 glass-easel 组件框架下，最好不要在这个组件文件中引入 polyfill 。

类似地，也有：

```ts
import { Behavior } from 'miniprogram-chaining-api-polyfill'
```


## 这个 Polyfill 对 Chaining API 的支持度

这个 Polyfill 支持提供绝大多数 Chaining API 系列接口。但受限于旧版小程序框架，仍有少量接口无法支持。

以下是不支持的接口列表及相应的修改建议。

### 不支持 `.data(...)`

使用 `.staticData(...)` 代替，例如：

```ts
Comopnent()
  .data(() => ({ hello: 'world' })) // 不支持
  .register()
```

改为：

```ts
Component()
  .staticData({ hello: 'world' })
  .register()
```

### `.init(...)` 中的 `observer` 需要在外部有相应定义

`.init(...)` 中不直接支持 `observer` 。如需使用，需要在链式调用上预留一个空函数。例如：

```ts
Comopnent()
  .init(({ observer }) => {
    observer('hello', () => { // 不支持
      // do something
    })
  })
  .register()
```

改为：

```ts
Comopnent()
  .observer('hello', () => {}) // 预留一个空函数作为定义
  .init(({ observer }) => {
    observer('hello', () => {
      // do something
    })
  })
  .register()
```

### `.init(...)` 中不支持 `relation`

`.init(...)` 中不能使用 `relation` 。如需使用，需要写在链式调用上。例如：

```ts
Component()
  .init(({ relation }) => {
    relation('another', { type: 'parent' }) // 不支持
  })
  .register()
```

改为：

```ts
Component()
  .relation('another', { type: 'parent' })
  .register()
```

### 关于 Trait Behaviors

这个 Polyfill 提供了对 trait behaviors 的支持。

但是，不能使用 `this.hasBehavior(...)` 来判定 trait behaviors ，应使用 `this.traitBehavior(...)` 。例如：

```ts
const helloTrait = Behavior.trait<{ hello: () => string }>()

Component()
  .init(({ self, implement, lifetime }) => {
    implement(helloTrait, { hello: () => 'world' } })
    lifetime('attached', () => {
      const hello = self.traitBehavior(helloTrait).hello()
      console.info(hello)
    })
  })
```

### 其他不支持的细节

* 链式调用上的 `lifetime` `pageLifetime` `observer` 不支持设置 `once` 参数。
* 不支持 `.chainingFilter(...)` 。


## LICENSE

MIT
