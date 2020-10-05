var $ = require('jquery');

var WebsockFeed = function(coin,proxy,scale){
    this.coin = coin;
    this.proxy = proxy;
    this.lastBar = null;
    this.currentBar = null;
    this.subscribe = true;
    this.scale = scale;
    this.mapperObj = {
      "1" : "1M",
      "5" : "5M",
      "30": "30M",
      "60": "1H",
      "1D": "1D",
      "1W": "1W",
      "1M": "1MTH"
    };
};


WebsockFeed.prototype.onReady=function(callback){
    var config = {};
    config.exchanges = [];
    config.supported_resolutions = ["1M","5M","30M","1H", "1D","1W","1MTH"];
    config.supports_group_request = false;
    config.supports_marks = false;
    config.supports_search = false;
    config.supports_time = true;
    config.supports_timescale_marks = false;

    $("#"+window.tvWidget.id).contents().on("click",".date-range-list>a",function(){
      if (window.tvWidget) {
        if ($(this).html() == "分时") {
          $(this).parent().addClass("real-op").removeClass("common-op");
          window.tvWidget.chart().setChartType(3);
        }else {
          $(this).parent().addClass("common-op").removeClass("real-op");
          window.tvWidget.chart().setChartType(1);
        }
      }
    });

    setTimeout(function() {
        callback(config);
    }, 0);
};

WebsockFeed.prototype.subscribeBars = function(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
    var that = this;
    this.proxy
    .on("SendExchangeDataByNationID", result => {
      var data = JSON.parse(result);
      console.log("SendExchangeDataByNationID", data);
      that.lastBar = {time:data[5]*1000,open:data[0],high:data[1],low:data[2],close:data[3],volume:data[4]};
      that.currentBar = that.lastBar;
      onRealtimeCallback(that.lastBar);
    })
};

WebsockFeed.prototype.unsubscribeBars = function(subscriberUID){
    this.subscribe = false;
    
}

WebsockFeed.prototype.resolveSymbol = function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){
    // var data = {"name":this.coin.symbol,"exchange-traded":"","exchange-listed":"","minmov":1,"minmov2":0,"pointvalue":1,"has_intraday":true,"has_no_volume":false,"description":this.coin.symbol,"type":"bitcoin","session":"24x7","supported_resolutions":["1","5","15","30","60","240","1D","1W","1M"],"pricescale":500,"ticker":"","timezone":"Asia/Shanghai"};
  // var data = {"name":this.coin.symbol,"exchange-traded":"","exchange-listed":"","minmov":1,"volumescale":10000,"has_daily":true,"has_weekly_and_monthly":true,"has_intraday":true,"description":this.coin.symbol,"type":"bitcoin","session":"24x7","supported_resolutions":["1","5","15","30","60","240","1D","1W","1M"],"pricescale":100,"ticker":"","timezone":"Asia/Shanghai"};
  var data = {"name":this.coin.symbol,"exchange-traded":"","exchange-listed":"","minmov":1,"volumescale":10000,"has_daily":true,"has_weekly_and_monthly":true,"has_intraday":true,"description":this.coin.symbol,"type":"bitcoin","session":"24x7","supported_resolutions":["1","5","15","30","60","1D","1W","1M"],"pricescale":Math.pow(10,this.scale || 2),"ticker":"","timezone":"Asia/Shanghai"};
    setTimeout(function() {
        onSymbolResolvedCallback(data);
    }, 0);
};


WebsockFeed.prototype.getBars = function(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest){
    var bars = [];
    var that = this;

    var pairID = this.coin.pairID;
    
    var gap = this.mapperObj[resolution];
    
    this.proxy
      .invoke('UnsubscribeExchangeDataByNationID', '' + pairID, gap, '1')
      .done(result => {
        console.log("UnsubscribeExchangeDataByNationID", result);
      })
      .fail(error => {
        console.log("UnsubscribeExchangeDataByNationID fail")
      })

    this.proxy
      .invoke('SubscribeExchangeDataByNationID', '' + pairID, gap, "1")
      .done(result => {
        var temp = JSON.parse(result);
        temp.exchangeData.reverse();
        console.log('SubscribeExchangeDataByNationID', temp);
        var data = [];

        for(var i = 0; i < temp.exchangeData.length; i++){
          var record = temp.exchangeData[i];
          data.push([
            record[5] * 1000,
            record[0],
            record[1],
            record[2],
            record[3],
            record[4],
          ])
        }

        for(var i = 0;i<data.length;i++){
            var item = data[i];
            bars.push({time:item[0],open:item[1],high:item[2],low:item[3],close:item[4],volume:item[5]})
        }
        that.lastBar = bars.length > 0 ? bars[bars.length-1]:null;
        that.currentBar = that.lastBar;
        var noData = bars.length == 0;
        var retBars = onHistoryCallback(bars,{noData:noData});
      })
      .fail(function(reason) {
        onErrorCallback(reason);
      });
};

export default {WebsockFeed}
