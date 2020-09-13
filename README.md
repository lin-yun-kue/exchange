# vue-coinexchange-rollback

[CoinExchange](https://gitee.com/cexchange/CoinExchange) Web_Front
http://118.25.133.182/  
[huobi](https://www.huobi.com/zh-cn/exchange/)

## charting_library

pages\exchange\Exchange.vue

```js
getKline() {
      ...
        library_path:
          process.env.NODE_ENV === "production"
            ? "/assets/charting_library/"
            : "/src/assets/js/charting_library/",
```
