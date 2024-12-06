# Chaining API Polyfill

为在非 glass-easel 组件框架下运行的小程序提供 Chaining API 支持。


## 为什么要使用 Chaining API ？

小程序使用传统的 `Page` 或 `Component` 构造器时，在复杂情况下会很不好用。

例如，如果页面或组件有个复杂的私有变量，只能选择将它写入到 `this` 的某个字段上，或者 setData 到 `this.data` 上。无论哪种处理方式，对 TypeScript 都不太友好，而且可能带来较大的性能开销。

为了解决这类问题，小程序的 [glass-easel 组件框架](https://github.com/wechat-miniprogram/glass-easel)提供了 [Chaining API](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/glass-easel/chaining-api.html) 。其中最重要的是提供了 `init` 函数。使用 Chaining API 可以编写出更易于维护、对 TypeScript 更有好的组件代码。

然而，在未激活 glass-easel 组件框架时，或在旧版本的小程序基础库中， Chaining API 不被支持。这个 polyfill 可以在这些时候补上 Chaining API 支持。


## 这个 Polyfill 对 Chaining API 的支持度

这个 Polyfill 支持提供绝大多数 Chaining API 系列接口。

但受限于旧版小程序框架，仍有少量接口无法支持，主要包括：

* `.data(...)` 中不能使用函数形式，只能使用对象形式。
* `.init(ctx)` 中不支持 `ctx.relation` 。

最好在 TypeScript 下使用这个模块。（这样可以准确知道可用的接口。）


## 基础用法

首先在 npm 中引入：

```shell
npm install --save miniprogram-chaining-api-polyfill
```

npm install 之后，需要点一下小程序开发者工具菜单中的“工具”——“构建 npm ”。

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


## LICENSE

MIT
