# AIAgentWeb

编写中

## 项目简介

AIAgentWeb是基于Vue的项目，通过调用智谱清言的API，实现了创建和使用多个智能代理的功能，用户可以在类GPT的页面进行交互，支持不同Agent的创建、管理和记忆共享
同时针对几个特殊的Agent实现了组件支持更复杂的显示

## 目录结构

- **aiAgent-b**
  app.py: 简单的后端逻辑，Flask实现
- **aiAgent-f**
  - src
    App.vue
    main.js
    - components
    - composableso
    - services
    - store

## 安装与运行

### 安装依赖

```shell
cd aiAgent-f
npm install

cd aiAgent-b
pip install -r requirements.txt
```

还需在aiAgent-b目录补充config.py文件
内容如下

```python
your_api_key = "UR_ZHIPU_API_KEY"
zhipuai_api_base = "https://open.bigmodel.cn/api/paas/v4/"
```

其中your_api_key可以从[智谱AI开放平台](https://maas.aminer.cn/)处获取
因为使用langchain的形式调用，也可使用GPT等API

### 运行

```shell
cd aiAgent-f
npm run dev

cd aiAgent-b
flask run
```

## 功能

## 技术亮点
