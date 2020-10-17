<template>
  <div class="container exchange" :class="skin">

    <div class="main">
      <div class="right">
        <div class="coin-menu">
          <div style="padding: 8px 10px;height:48px;">
            <Input search :placeholder="$t('common.searchplaceholder')" @on-change="seachInputChange" v-model="searchKey"/>
          </div>
          <div class="sc_filter">
            <!-- <span v-show="isLogin" @click="changeBaseCion('favor')" :class="{active:basecion==='favor'}">{{$t('service.CUSTOM')}}</span> -->
            <span @click="changeBaseCion('usdt', 'COIN')" :class="{active:basecion==='usdt'}">USDT</span>
            <span @click="changeBaseCion('btc', 'COIN')" :class="{active:basecion==='btc'}">BTC</span>
            <span @click="changeBaseCion('twd', 'TW')" :class="{active:basecion==='twd'}">TWD</span>
          </div>
          <Table @on-current-change="gohref" highlight-row id="USDT" v-show="basecion==='usdt'" :columns="coins.columns" :data="dataIndex"></Table>
          <Table @on-current-change="gohref" highlight-row id="BTC" v-show="basecion==='btc'" :columns="coins.columns" :data="dataIndex"></Table>
          <Table @on-current-change="gohref" highlight-row id="TWD" v-show="basecion==='twd'" :columns="coins.columns" :data="dataIndex"></Table>
          <!-- <Table @on-current-change="gohref" highlight-row v-show="basecion==='favor'" :no-data-text="$t('common.nodata')" id="collect" :columns="favorColumns" :data="dataIndex"></Table> -->
        </div>
      </div>
      <div class="center">
        <div class="symbol">
          <div class="item">
              <span class="coin">{{currentCoin.coin}}
                <small>/{{currentCoin.base}}</small>
              </span>
          </div>
          <div class="item">
            <span class="text">{{$t('service.NewPrice')}}</span>
            <span class="num" :class="{buy:currentCoin.change>0,sell:currentCoin.change<0}">{{currentCoin.close | toFixed(baseCoinScale)}}</span>
            <span class="price-cny">≈ ￥{{currentCoin.usdRate*CNYRate | toFixed(2)}}</span>
          </div>
          <div class="item">
            <span class="text">{{$t('service.Change')}}</span>
            <span class="num" :class="{buy:currentCoin.change>0,sell:currentCoin.change<0}">{{currentCoin.rose}}</span>
          </div>
          <div class="item">
            <span class="text">{{$t('service.high')}}</span>
            <span class="num ">{{currentCoin.high | toFixed(baseCoinScale)}}</span>
          </div>
          <div class="item">
            <span class="text">{{$t('service.low')}}</span>
            <span class="num ">{{currentCoin.low | toFixed(baseCoinScale)}}</span>
          </div>
          <div class="item">
            <span class="text">{{$t('service.ExchangeNum')}}</span>
            <span class="num ">{{currentCoin.volume}} {{currentCoin.coin}}</span>
          </div>
          <div class="item">
          </div>
        </div>
        <div class="imgtable">
          <div class="handler">
            <span @click="changeImgTable('k')" :class="{active:currentImgTable==='k'}">{{$t("exchange.kline")}}</span>
            <span @click="changeImgTable('s')" :class="{active:currentImgTable==='s'}">{{$t("exchange.depth")}}</span>
          </div>
          <div id="kline_container" :class="{hidden:currentImgTable==='s'}">
          </div>
          <DepthGraph :class="{hidden:currentImgTable==='k'}" ref="depthGraph"></DepthGraph>
        </div>
        <!-- todo connect api -->
        <div class="tradingArea">
          <div class="history_container">
            <div class="history_tab">
              <span>我的訂單</span>
              <div class="tab_list">
                  <span class="tab_item" :class="{active:historyActiveTab=='cur'}" @click="myOrderChange('cur')">當前訂單</span>
                  <span class="tab_item" :class="{active:historyActiveTab=='his'}" @click="myOrderChange('his')">歷史訂單</span>
              </div>
            </div>
            <div class="history_title">
                <span>市場/建立時間</span>
                <span class="mid">類別/價格</span>
                <span :class="historyActiveTab == 'cur' ? 'last' : 'last his'">成交/訂單量</span>
            </div>
            <div v-if="historyActiveTab == 'cur'" class="history_record">
              <div v-for="(item, index) in currentOrder" class="record_row" :key="index">
                  <div class="record_info">
                    <div class="row_c1">
                      <span>{{ item.pairName }}</span>
                      <span>{{ item.createDate }}</span>
                    </div>
                    <div :class="item.transType == 'bid'? 'row_c2 buy' : 'row_c2 sell'">
                      <span>{{ item.transType == "bid" ? "買入" : "賣出" }}</span>
                      <span>{{ item.unitPrice }}</span>
                    </div>
                    <div class="row_c3">
                      <span>{{ item.filledAmount }}</span>
                      <span>{{ item.totalAmount }}</span>
                    </div>
                  </div>
                  <div class="cancel_btn" @click="cancel(index)">
                    <span >X</span>
                  </div>
              </div>
            </div>
            <div v-if="historyActiveTab == 'his'" class="history_record">
              <div v-for="(item, index) in historyOrder" class="record_row" :key="index">
                  <div class="record_info">
                    <div class="row_c1">
                      <span>{{ item.pairName }}</span>
                      <span>{{ item.createDate }}</span>
                    </div>
                    <div :class="item.transType == 'bid'? 'row_c2 buy' : 'row_c2 sell'">
                      <span>{{ item.transType == "bid" ? "買入" : "賣出" }}</span>
                      <span>{{ item.unitPrice }}</span>
                    </div>
                    <div class="row_c3">
                      <span>{{ item.filledAmount }}</span>
                      <span>{{ item.totalAmount }}</span>
                    </div>
                  </div>
              </div>
            </div>
            <div class="history_footer">
              <input  @change="getCurrentOrder()" type="checkbox" id="hide_other" v-model="isHideOther">
              <label for="hide_other">隱藏其他交易對</label>
            </div>
          </div>
          <div class="trading_container">
            <div class="trading_tab">
              <span>買入/賣出</span>
              <div class="tab_list">
                  <span class="tab_item" :class="{active:orderType=='LimitPrice'}" @click="tradeTabChange('limit')">限價</span>
                  <span class="tab_item" :class="{active:orderType=='MarketPrice'}" @click="tradeTabChange('market')">市價</span>
              </div>
            </div>
            <div class="trading_main">
                <div class="trading_buy">
                  <div class="trading_row" v-show="orderType=='LimitPrice'">
                    <input v-model.number="bidForm.price" @change="formChange('b', 'p')">
                    <span class="title">限價</span>
                    <span class="unit" v-text="currentCoin.base"></span>
                  </div>
                  <div class="trading_row" style="margin-bottom: 40px;">
                    <input v-model.number="bidForm.unit" @change="formChange('b', 'u')">
                    <span class="title">數量</span>
                    <span class="unit" v-text="currentCoin.coin"></span>
                  </div>
                  <div class="trading_row">
                    <span class="title">餘額</span>
                    <span class="unit" v-text="wallet.base + currentCoin.base"></span>
                  </div>
                  <div class="trading_row">
                    <input v-model.number="bidForm.total" @change="formChange('b', 't')">
                    <span class="title">金額</span>
                    <span class="unit" v-text="currentCoin.base"></span>
                  </div>
                  <div class="trading_btn" @click="createOrder('b')">
                    <span>買入</span>
                  </div>
                </div>
                  
                <div class="trading_sell">
                  <div class="trading_row" v-show="orderType=='LimitPrice'">
                    <input v-model.number="askForm.price" @change="formChange('s', 'p')">
                    <span class="title">限價</span>
                    <span class="unit" v-text="currentCoin.base"></span>
                  </div>
                  <div class="trading_row" style="margin-bottom: 40px;">
                    <input v-model.number="askForm.unit" @change="formChange('s', 'u')">
                    <span class="title">數量</span>
                    <span class="unit" v-text="currentCoin.coin"></span>
                  </div>
                  <div class="trading_row">
                    <span class="title">餘額</span>
                    <span class="unit" v-text="wallet.coin + currentCoin.coin"></span>
                  </div>
                  <div class="trading_row">
                    <input v-model.number="askForm.total" @change="formChange('s', 't')">
                    <span class="title">金額</span>
                    <span class="unit" v-text="currentCoin.base"></span>
                  </div>
                  <div class="trading_btn" @click="createOrder('s')">
                    <span>賣出</span>
                  </div>
                </div>
            </div>
            <!-- <div class="trading_footer">
              
            </div> -->
          </div>
        </div>
      </div>
      <div class="left plate-wrap" style="position:relative;">
        <Table v-show="selectedPlate!='buy'" @on-current-change="buyPlate" highlight-row ref="currentRowTable" class="sell_table" :columns="plate.columns" :data="plate.askRows" :no-data-text="$t('common.nodata')"></Table>
        <div class="plate-nowprice">
          <span class="price" :class="{buy:currentCoin.change>0,sell:currentCoin.change<0}">{{currentCoin.price | toFixed(baseCoinScale)}}</span>
        </div>
        <Table v-show="selectedPlate!='sell'" @on-current-change="sellPlate" highlight-row class="buy_table" :class="{hidden:selectedPlate==='all'}" :columns="plate.columns" :data="plate.bidRows" :no-data-text="$t('common.nodata')"></Table>
      </div>
    </div>
    </div>
</template>
<style scoped lang="scss">
@import url(../../assets/css/exchange.css);
$night-bg: #0b1520;
$night-headerbg: #27313e;
$night-contentbg: #192330;
$night-color: #fff;

.exchange {
  color: #fff;
  background-color: #0b1520;
  .main {
    width: 99%;
    margin-left: 0.5%;
    display: flex;
    margin-top: 5px;
    .left {
      flex: 0 0 20%;
      border-radius: 0px;
      margin-right: 10px;
      .handlers {
        font-size: 0;
        padding: 10px 20px;
        background-color: #192330;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        .handler {
          display: inline-block;
          margin-right: 10px;
          width: 20px;
          height: 20px;
          background-size: 100% 100%;
          cursor: pointer;
          &.handler-all {
            background-image: url("../../assets/images/exchange/plate_all.png");
            &.active {
              background-image: url("../../assets/images/exchange/plate_all_active.png");
            }
          }
          &.handler-green {
            background-image: url("../../assets/images/exchange/plate_green.png");
            &.active {
              background-image: url("../../assets/images/exchange/plate_green_active.png");
            }
          }
          &.handler-red {
            background-image: url("../../assets/images/exchange/plate_red.png");
            &.active {
              background-image: url("../../assets/images/exchange/plate_red_active.png");
            }
          }
        }
      }
      .plate-nowprice {
        text-align: center;
        background-color: #27313e;
        line-height: 1;
        display: flex;
        align-items: center;
        height: 40px;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        .price {
          font-size: 18px;
          margin-right: 10px;
        }
        .price-cny {
          font-size: 12px;
          margin-left: 10px;
          font-weight: 400;
          color: rgba(219, 222, 246, 0.3);
        }
      }
    }
    .center {
      flex: 0 0 60%;
      margin-right: 5px;
      .imgtable {
        height: 350px;
        position: relative;
        overflow: hidden;
        margin-bottom: 5px;
        .handler {
          position: absolute;
          top: 10px;
          right: 40px;
          z-index: 1000;
          > span {
            background-color: #2c3b59;
            color: #c7cce6;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 13px;
            opacity: 0.5;
            &.active {
              opacity: 1;
            }
          }
        }
      }
      .trade_wrap {
        .trade_menu {
          position: relative;
          background-color: #192330;
          border-top-left-radius: 0px;
          border-top-right-radius: 0px;
          border-bottom: 1px solid #27313e;
          font-size: 0;
          height: 40px;
          line-height: 40px;
          > span {
            font-size: 16px;
            padding: 11px 20px;
            cursor: pointer;
            &.active {
              color: #fff;
              border-bottom: 2px solid #f0a70a;
            }
            &:first-child {
              border-top-left-radius: 0px;
            }
          }
          .fee-wrap {
            position: absolute;
            top: 0;
            right: 20px;
            font-size: 12px;
            > span {
              margin-right: 10px;
              color: #7c7f82;
            }
            > a {
              vertical-align: middle;
            }
          }
        }
        .trade_panel {
          position: relative;
          .mask {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            background-color: rgba(0, 52, 77, 0.8);
            justify-content: center;
            align-items: center;
            z-index: 100;
            font-size: 24px;
            border-radius: 0px;
            // color: #bcd7e6;
          }
          .publish-mask {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 37, 64, 0.93);
            justify-content: center;
            align-items: center;
            z-index: 101;
            font-size: 24px;
            border-radius: 0px;
            // color: #bcd7e6;
          }
        }
        .trade_panel .panel .hd {
          border-bottom: none;
          b {
            color: #fff;
          }
          a {
            color: #f0a70a;
          }
        }
      }
      .tradingArea {
        display: flex;
        height: 375px;
        justify-content: space-between;
        font-size: 12px;
        .history_container {
          flex: 0 0 57%;
          .history_tab {
            background-color: #192330;
            padding: 0 9px;
            line-height: 33px;
            height: 33px;
            margin-bottom: 5px;
            .tab_list {
              float: right;
              display: flex;
              .tab_item {
                margin-left: 5px;
                cursor: pointer;
              }
              .active {
                border-bottom: 2px solid #ffa800;
              }
            }
          }
          .history_title {
            display: flex;
            background-color: #192330;
            padding: 0 9px;
            line-height: 33px;
            height: 33px;
            justify-content: space-between;
            margin-bottom: 5px;
            .last {
              margin-right: 20px;
              text-align: right;
            }
            .last.his {
              margin-right: unset;
            }
            .mid {
              text-align: center;
            }
            span {
              flex: 1 1 33%;
            }
          }
          .history_record {
            background-color: #192330;
            margin-bottom: 5px;
            height: 260px;
            overflow-y: auto;
            .record_row {
              display: flex;
              justify-content: space-between;
              padding: 0 9px;
              margin-bottom: 5px;
              .record_info {
                display: flex;
                flex-grow: 1;
                flex-shrink: 0;
                justify-content: space-between;
                .row_c1,
                .row_c2,
                .row_c3 {
                  flex: 1 1 33%;
                  display: flex;
                  flex-direction: column;
                  span {
                    flex-basis: 50%;
                  }
                }
                .row_c2 span {
                  text-align: center;
                }
                .row_c3 span {
                  text-align: right;
                }
              }
              .cancel_btn {
                flex: 0 0 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                span {
                  flex-basis: unset;
                  border-radius: 50%;
                  background-color: grey;
                  color: white;
                  display: block;
                  width: 20px;
                  height: 20px;
                  text-align: center;
                }
              }
              .row_c2.buy {
                color: rgb(74, 156, 83);
              }
              .row_c2.sell {
                color: rgb(207, 78, 79);
              }
            }
          }
          .history_footer {
            background-color: #192330;
            line-height: 33px;
            height: 33px;
          }
        }
        .trading_container {
          flex: 0 0 42%;
          .trading_tab {
            background-color: #192330;
            padding: 0 9px;
            line-height: 33px;
            height: 33px;
            margin-bottom: 5px;
            .tab_list {
              float: right;
              display: flex;
              .tab_item {
                margin-left: 5px;
                cursor: pointer;
              }
              .active {
                border-bottom: 2px solid #ffa800;
              }
            }
          }
          .trading_main {
            display: flex;
            justify-content: space-between;
            height: 295px;
            margin-bottom: 5px;
            .trading_buy,
            .trading_sell {
              background-color: #192330;
              flex: 0 0 49%;
              padding: 10px 5px;
              .trading_row {
                display: flex;
                position: relative;
                width: 95%;
                margin: 0 auto 20px auto;
                color: white;
                .title {
                  position: absolute;
                  left: 5px;
                }
                input {
                  background-color: unset;
                  width: 100%;
                  padding-left: 35px;
                  border: 1px solid #aaaaaa;
                }
                .unit {
                  position: absolute;
                  right: 5px;
                }
              }
              .trading_btn {
                text-align: center;
              }
            }
            .trading_buy {
              .trading_row {
                input {
                  color: rgb(74, 156, 83);
                }
              }
              .trading_btn {
                background-color: rgb(74, 156, 83);
              }
            }
            .trading_sell {
              .trading_row {
                input {
                  color: rgb(207, 78, 79);
                }
              }
              .trading_btn {
                background-color: rgb(207, 78, 79);
              }
            }
          }
          .trading_footer {
            line-height: 33px;
            height: 33px;
            background-color: #192330;
          }
        }
      }
    }
    .right {
      flex: 0 0 19%;
      margin-right: 5px;
      .coin-menu {
        height: 785px;
        background-color: #192330;
        margin-bottom: 10px;
        border-radius: 0px;
      }
    }
  }
  .symbol {
    display: flex;
    justify-content: space-between;
    padding: 15px 30px;
    margin-bottom: 5px;
    align-items: center;
    background-color: #192330;
    line-height: 1;
    border-radius: 0px;
    .item {
      .price-cny {
        font-size: 12px;
        color: #546886;
      }
      .coin {
        font-size: 20px;
      }
      .text {
        width: 100%;
        display: block;
        font-size: 12px;
        color: #999;
        margin-bottom: 5px;
      }
      .num {
        font-size: 12px;
        color: #fff;
      }
      > img {
        display: block;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }
  }
  .order {
    width: 98.6%;
    margin-left: 0.5%;
    min-height: 227px;
    margin-bottom: 10px;
    .order-handler {
      // background-color: #192330;
      background-color: #192330;
      font-size: 0;
      border-radius: 6px;
      // line-height: 38px;
      > span {
        padding: 0 20px;
        font-size: 14px;
        display: inline-block;
        color: #fff;
        cursor: pointer;
        line-height: 40px;
        background-color: #192330;
        &.active {
          color: #f0a70a;
          background-color: #27313e;
        }
        &:first-child {
          border-top-left-radius: 0px;
        }
        &:last-child {
          border-top-right-radius: 0px;
        }
      }
    }
  }
}
.exchange.day {
  color: #333;
  background-color: #fff;
  .main {
    .left {
      background-color: #fff;
      box-shadow: 0 0 2px #ccc;
      .handlers {
        background-color: #fff;
      }
      .plate-nowprice {
        background-color: #fff;
        border-top: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
      }
    }
    .imgtable {
      border-radius: 6px;
      box-shadow: 0 0 2px #ccc;
      .handler {
        > span {
          border: 1px solid #333;
        }
      }
    }
    .trade_wrap {
      box-shadow: 0 0 2px #ccc;
      .trade_menu {
        background-color: #fafafa;
        > span {
          background-color: #fafafa;
          border-right: 1px solid #f0f0f0;
          &.active {
            background-color: #fff;
            color: #f0a70a;
          }
          &:last-child {
            border-top-right-radius: 6px;
          }
        }
        .ivu-icon {
          color: #333 !important;
        }
      }
      .trade_panel {
        box-shadow: 0 0 2px #ccc;
        .mask {
          background-color: rgba(0, 52, 77, 0.8);
          color: #fff;
        }
      }
      .trade_panel .panel .hd {
        border-bottom: none;
        b {
          color: #333;
        }
        a {
          color: #f0a70a;
        }
      }
    }
    .right {
      .coin-menu {
        background-color: #fff;
        box-shadow: 0 2px 2px #ccc;
      }
      .trade-wrap {
        box-shadow: 0 0 2px #ccc;
        border-radius: 6px;
      }
      // .ivu-table-wrapper{
      //         box-shadow:0 0 2px #ccc;
      //       }
    }
  }
  .symbol {
    background-color: #fff;
    box-shadow: 0 0 2px #ccc;
    .item {
      .text {
        color: #999;
      }
      .num {
        color: #333;
      }
    }
  }
  .order {
    box-shadow: 0 2px 2px #ccc;
    min-height: 227px;
    .order-handler {
      margin-right: -2px;
      background-color: #fff;
      > span {
        color: #333;
        background-color: #fafafa;
        box-shadow: 0 0 2px #ccc;
        &.active {
          color: #f0a70a;
          background-color: #fff;
        }
      }
    }
  }
}
#kline_container {
  background: #192330;
}

.coin-info {
  color: #8f9ca5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
  padding-top: 15px;
}
</style>
<script>
import Datafeeds from "@js/charting_library/datafeed/bitrade.js";
var Stomp = require("stompjs");
var SockJS = require("sockjs-client");
var moment = require("moment");
import DepthGraph from "@components/exchange/DepthGraph.vue";
// import $ from "@js/jquery.min.js";
import "signalr";

export default {
  components: { DepthGraph },
  data() {
    let self = this;
    return {
      sliderStep: [25, 50, 75, 100],
      sliderBuyLimitPercent: 0,
      sliderSellLimitPercent: 0,
      sliderBuyMarketPercent: 0,
      sliderSellMarketPercent: 0,
      memberRate: 0,
      // userRealVerified: false, //是否实名认证
      collecRequesting: false,
      currentCoinIsFavor: false,
      isUseBHB: false,
      skin: "night", //皮肤样式day&night
      currentImgTable: "k",
      selectedOrder: "current", //当前显示的委托记录
      selectedPlate: "all", //当前显示的买卖盘
      CNYRate: null,
      datafeed: null,
      defaultPath: "btc_usdt",
      basecion: "usdt",
      coinScale: 6,
      baseCoinScale: 6,
      symbolFee: 0.001,
      dataIndex: [],
      dataIndex2: [],
      searchKey: "",
      coinInfo: {},
      currentCoin: {
        base: "",
        coin: "",
        symbol: "",
        price: 0,
      },
      enableMarketBuy: 1, // 0:禁用  1:启用
      enableMarketSell: 1,
      exchangeable: 1, // 0:可交易   1:不可交易
      publishType: "NONE",
      currentTime: 0,
      publishAmount: 0,
      publishPrice: 0,
      startTime: "2000-01-01 00:00:00",
      endTime: "2000-01-01 00:00:00",
      clearTime: "2000-01-01 00:00:00",
      showPublish: false,
      showCountDown: false,
      countDownBgColor: "#003478",
      publishState: 0,
      favorColumns: [
        {
          title: this.$t("exchange.coin"),
          key: "coin",
          sortable: false,
          width: 120,
          className: "coin-menu-symbol",
          render: (h, params) => {
            return h("div", [
              h("Icon", {
                props: {
                  // color:"red",
                  type: params.row.isFavor ? "ios-star" : "ios-star-outline",
                },
                nativeOn: {
                  click: () => {
                    event.stopPropagation(); //阻止事件冒泡
                    if (this.isLogin) {
                      if (
                        event.currentTarget.className ==
                        "ivu-icon ivu-icon-ios-star"
                      ) {
                        this.cancelCollect(params.index, params.row);
                        event.currentTarget.className ==
                          "ivu-icon ivu-icon-ios-star-outline";
                      } else {
                        this.collect(params.index, params.row);
                        event.currentTarget.className =
                          "ivu-icon ivu-icon-ios-star";
                      }
                    } else {
                      this.$Message.warning("请先登录");
                    }
                  },
                },
              }),
              h("span", params.row.symbol),
            ]);
          },
        },
        {
          title: this.$t("exchange.lastprice"),
          key: "close",
          sortable: true,
          sortMethod: function (a, b, type) {
            let a1 = parseFloat(a);
            let b1 = parseFloat(b);
            if (type == "asc") {
              return a1 - b1;
            } else {
              return b1 - a1;
            }
          },
        },
        {
          title: this.$t("exchange.daychange"),
          key: "rose",
          sortable: true,
          sortMethod: function (a, b, type) {
            let a1 = a.replace(/[^\d|.|-]/g, "") - 0;
            let b1 = b.replace(/[^\d|.|-]/g, "") - 0;
            if (type == "asc") {
              return a1 - b1;
            } else {
              return b1 - a1;
            }
          },
          render: (h, params) => {
            const row = params.row;
            const className = parseFloat(row.rose) < 0 ? "sell" : "buy";
            return h(
              "span",
              {
                attrs: {
                  class: className,
                },
              },
              row.rose
            );
          },
        },
      ],
      //当前市场上的交易币种，按交易对分
      coins: {
        _map: [],
        USDT: [],
        BTC: [],
        ETH: [],
        USDT2: [],
        BTC2: [],
        ETH2: [],
        favor: [],
        columns: [
          {
            title: this.$t("exchange.coin"),
            key: "coin",
            sortable: false,
            width: 110,
            className: "coin-menu-symbol",
            render: (h, params) => {
              if (params.row.coin == "BZB") {
                return h("div", [
                  h("Icon", {
                    props: {
                      // color:"red",
                      type: params.row.isFavor
                        ? "ios-star"
                        : "ios-star-outline",
                    },
                    nativeOn: {
                      click: () => {
                        event.stopPropagation(); //阻止事件冒泡
                        if (this.isLogin) {
                          if (
                            event.currentTarget.className ==
                            "ivu-icon ivu-icon-ios-star"
                          ) {
                            this.cancelCollect(params.index, params.row);
                            event.currentTarget.className ==
                              "ivu-icon ivu-icon-ios-star-outline";
                          } else {
                            this.collect(params.index, params.row);
                            event.currentTarget.className =
                              "ivu-icon ivu-icon-ios-star";
                          }
                        } else {
                          this.$Message.warning("请先登录");
                        }
                      },
                    },
                  }),
                  h("span", params.row.coin),
                  h(
                    "span",
                    {
                      style: {
                        fontSize: "8px",
                        padding: "2px 5px 1px 5px",
                        color: "#FFF",
                        marginLeft: "5px",
                        background: "#F30",
                        borderRadius: "4px",
                      },
                    },
                    "HOT"
                  ),
                ]);
              }
              return h("div", [
                h("Icon", {
                  props: {
                    // color:"red",
                    type: params.row.isFavor ? "ios-star" : "ios-star-outline",
                  },
                  nativeOn: {
                    click: () => {
                      event.stopPropagation(); //阻止事件冒泡
                      if (this.isLogin) {
                        if (
                          event.currentTarget.className ==
                          "ivu-icon ivu-icon-ios-star"
                        ) {
                          this.cancelCollect(params.index, params.row);
                          event.currentTarget.className ==
                            "ivu-icon ivu-icon-ios-star-outline";
                        } else {
                          this.collect(params.index, params.row);
                          event.currentTarget.className =
                            "ivu-icon ivu-icon-ios-star";
                        }
                      } else {
                        this.$Message.warning("请先登录");
                      }
                    },
                  },
                }),
                h("span", params.row.coin),
              ]);
            },
          },
          {
            title: this.$t("exchange.lastprice"),
            key: "close",
            sortable: true,
            sortMethod: function (a, b, type) {
              let a1 = parseFloat(a);
              let b1 = parseFloat(b);
              if (type == "asc") {
                return a1 - b1;
              } else {
                return b1 - a1;
              }
            },
          },
          {
            title: this.$t("exchange.daychange"),
            key: "rose",
            sortable: true,
            sortMethod: function (a, b, type) {
              let a1 = a.replace(/[^\d|.|-]/g, "") - 0;
              let b1 = b.replace(/[^\d|.|-]/g, "") - 0;
              if (type == "asc") {
                return a1 - b1;
              } else {
                return b1 - a1;
              }
            },
            render: (h, params) => {
              const row = params.row;
              const className = parseFloat(row.rose) < 0 ? "sell" : "buy";
              return h(
                "span",
                {
                  attrs: {
                    class: className,
                  },
                },
                row.rose
              );
            },
          },
        ],
      },
      wallet: {
        base: 0.0,
        coin: 0.0,
      },
      showMarket: false,
      fixHistoryHeight: 295,
      // rechargeUrl:'#/finance/recharge',
      // rechargeUSDTUrl:'#/finance/recharge?name=USDT',
      // form: {
      //   buy: {
      //     limitPrice: 0.0,
      //     limitAmount: 0.0,
      //     marketAmount: 0.0,
      //     limitTurnover: 0.0
      //   },
      //   sell: {
      //     limitPrice: 0.0,
      //     limitAmount: 0.0,
      //     marketAmount: 0.0,
      //     limitTurnover: 0.0
      //   }
      // },
      trade: {
        rows: [],
        columns: [
          {
            title: self.$t("exchange.price"),
            key: "price",
            render: (h, params) => {
              const row = params.row;
              const className = row.direction == "BUY" ? "buy" : "sell";

              return h(
                "span",
                {
                  attrs: {
                    class: className,
                  },
                },
                params.row.price.toFixed(this.baseCoinScale)
              );
            },
            renderHeader: (h, params) => {
              const title =
                self.$t("exchange.price") + "(" + self.currentCoin.base + ")";
              return h("span", {}, title);
            },
          },
          {
            title: self.$t("exchange.num"),
            key: "amount",
            render: (h, params) => {
              return h("span", {}, params.row.amount.toFixed(this.coinScale));
            },
            renderHeader: (h, params) => {
              const title =
                self.$t("exchange.num") + "(" + self.currentCoin.coin + ")";
              return h("span", {}, title);
            },
          },
          {
            title: self.$t("exchange.time"),
            key: "time",
            render: (h, params) => {
              return h("span", {}, this.timeFormat(params.row.time));
            },
          },
        ],
      },
      //   最新价的 table 数据;
      plate: {
        maxPostion: 10,
        columns: [
          // {
          //   title: self.$t("exchange.stall"),
          //   key: "postion",
          //   render: (h, params) => {
          //     const row = params.row;
          //     const className = row.direction.toLowerCase();
          //     const title =
          //       (row.direction == "BUY"
          //         ? self.$t("exchange.buyin")
          //         : self.$t("exchange.sellout")) +
          //       " " +
          //       row.position;
          //     return h(
          //       "span",
          //       {
          //         attrs: {
          //           class: className
          //         }
          //       },
          //       title
          //     );
          //   }
          // },
          {
            //   价格;
            title: self.$t("exchange.price"),
            key: "price",
            render: (h, params) => {
              let str = "";
              let price = "";
              const className = params.row.direction.toLowerCase();
              params.row.price == 0 && (str = h("span", {}, "--"));
              params.row.price != 0 &&
                (price = params.row.price.toFixed(this.baseCoinScale)) &&
                (str = h(
                  "span",
                  {
                    attrs: {
                      class: className,
                    },
                  },
                  price
                ));
              return str;
            },
            renderHeader: (h, params) => {
              const title =
                self.$t("exchange.price") + "(" + self.currentCoin.base + ")";
              return h("span", {}, title);
            },
          },
          {
            title: self.$t("exchange.num"),
            key: "amount",
            render: (h, params) => {
              let str = "";
              params.row.amount == 0 && (str = h("span", {}, "--"));
              params.row.amount != 0 &&
                (str = h(
                  "span",
                  {},
                  params.row.amount.toFixed(this.coinScale)
                ));
              return str;
            },
            renderHeader: (h, params) => {
              const title =
                self.$t("exchange.num") + "(" + self.currentCoin.coin + ")";
              return h("span", {}, title);
            },
          },
          {
            title: self.$t("exchange.total"),
            key: "totalAmount",
            render: (h, params) => {
              if (params.row.price == 0 || params.row.totalAmount == 0) {
                return h("span", {}, "--");
              } else {
                return h(
                  "span",
                  {},
                  params.row.totalAmount.toFixed(this.coinScale)
                );
              }
            },
            renderHeader: (h, params) => {
              const title =
                self.$t("exchange.total") + "(" + self.currentCoin.coin + ")";
              return h("span", {}, title);
            },
          },
          {
            className: "percenttd",
            width: 1,
            render: (h, params) => {
              let width = "0",
                backgroundColor =
                  params.row.direction === "BUY" ? "#00b275" : "#f15057",
                totle =
                  params.row.direction === "BUY"
                    ? this.plate.bidTotle
                    : this.plate.askTotle;
              if (params.row.totalAmount) {
                width = (params.row.totalAmount / totle).toFixed(4) * 100 + "%";
              }
              return h(
                "div",
                {
                  style: {
                    width,
                    backgroundColor,
                  },
                  attrs: {
                    class: "percentdiv",
                  },
                },
                " "
              );
            },
          },
        ],
        askRows: [],
        bidRows: [],
      },
      currentOrder: [],
      historyOrder: [],
      fullTrade: {},
      historyActiveTab: "cur",
      tradingActiveTab: "limit",
      hub: null,
      proxy: null,
      sideCountryID: "COIN",
      pairID: null,
      currentHref: "btc_usdt",
      orderType: "LimitPrice",
      bidForm: {
        transType: "bid",
        price: 0,
        unit: 0,
        total: 0,
      },
      askForm: {
        transType: "ask",
        price: 0,
        unit: 0,
        total: 0,
      },
      isHideOther: false,
    };
  },
  filters: {
    toFixedPublishAmount: function (value) {
      var tem = value.toFixed(7);
      if (value >= 10) {
        tem = value.toFixed(6);
      }
      if (value >= 100) {
        tem = value.toFixed(5);
      }
      if (value >= 1000) {
        tem = value.toFixed(4);
      }
      if (value >= 10000) {
        tem = value.toFixed(3);
      }
      if (value >= 100000) {
        tem = value.toFixed(2);
      }
      if (value >= 1000000) {
        tem = value.toFixed(1);
      }
      if (value >= 10000000) {
        tem = value.toFixed(0);
      }
      return tem;
    },
    toFixedPublishPrice: function (value) {
      var tem = value.toFixed(5).replace(/0+$/g, "");
      if (value >= 1) {
        tem = value.toFixed(4);
      }
      if (value >= 10) {
        tem = value.toFixed(3);
      }
      if (value >= 100) {
        tem = value.toFixed(2);
      }
      if (value >= 1000) {
        tem = value.toFixed(1);
      }
      if (value >= 10000) {
        tem = value.toFixed(1);
      }
      return tem;
    },
  },
  computed: {
    rechargeUSDTUrl: function () {
      return "/uc/recharge?name=" + this.currentCoin.base;
      // return "#/finance/recharge?name=" + this.currentCoin.base;
    },
    rechargeCoinUrl: function () {
      return "/uc/recharge?name=" + this.currentCoin.coin;
      // return "#/finance/recharge?name=" + this.currentCoin.coin;
    },
    isLogin: function () {
      return this.$store.getters.isLogin;
    },
    member: function () {
      return this.$store.getters.member;
    },
    lang: function () {
      return this.$store.state.lang;
    },
    sliderBuyDisabled() {
      let account = this.wallet.base,
        min = this.toFloor(1 / Math.pow(10, this.baseCoinScale));
      return account < min;
    },
    sliderSellDisabled() {
      let account = this.wallet.coin,
        min = this.toFloor(1 / Math.pow(10, this.coinScale));
      return account < min;
    },
  },
  watch: {
    "form.buy.limitPrice": function (val) {
      let price = this.form.buy.limitPrice,
        account = this.wallet.base,
        amount = 0;
      if (val > 0) {
        amount = this.toFloor(
          account.div(price).mul(this.sliderBuyLimitPercent).mul(0.01),
          this.coinScale
        );
      }
      this.form.buy.limitAmount = amount;
      this.form.buy.limitTurnover = this.toFloor(
        val.mul(amount),
        this.baseCoinScale
      );
    },
    "form.buy.limitAmount": function (val) {
      this.form.buy.limitTurnover = this.toFloor(
        val.mul(this.form.buy.limitPrice),
        this.baseCoinScale
      );
    },
    "form.sell.limitPrice": function (val) {
      this.form.sell.limitTurnover = this.toFloor(
        val.mul(this.form.sell.limitAmount),
        this.coinScale
      );
    },
    "form.sell.limitAmount": function (val) {
      this.form.sell.limitTurnover = this.toFloor(
        val.mul(this.form.sell.limitPrice),
        this.coinScale
      );
    },
    lang: function () {
      this.updateLangData();
    },
    $route(to, from) {
      this.init();
    },
    sliderBuyLimitPercent() {
      let price = this.form.buy.limitPrice,
        account = this.wallet.base,
        amount = 0;
      if (price > 0) {
        amount = this.toFloor(
          account.div(price).mul(this.sliderBuyLimitPercent).mul(0.01),
          this.coinScale
        );
      }
      this.form.buy.limitAmount = amount;
    },
    sliderSellLimitPercent() {
      let account = this.wallet.coin;
      this.form.sell.limitAmount = this.toFloor(
        account.mul(this.sliderSellLimitPercent).mul(0.01),
        this.coinScale
      );
    },
    sliderBuyMarketPercent() {
      let account = this.wallet.base;
      this.form.buy.marketAmount = this.toFloor(
        account.mul(this.sliderBuyMarketPercent).mul(0.01),
        this.baseCoinScale
      );
    },
    sliderSellMarketPercent() {
      let account = this.wallet.coin;
      this.form.sell.marketAmount = this.toFloor(
        account.mul(this.sliderSellMarketPercent).mul(0.01),
        this.coinScale
      );
    },
  },
  created: function () {
    this.init();
  },
  methods: {
    seachInputChange() {
      this.searchKey = this.searchKey.toUpperCase();
      // if(this.basecion == "favor"){
      //     this.dataIndex = this.coins.favor.filter(item => item["coin"].indexOf(this.searchKey) == 0);
      // }else
      if (this.basecion == "usdt") {
        this.dataIndex = this.coins.USDT.filter(
          (item) => item["coin"].indexOf(this.searchKey) == 0
        );
      } else if (this.basecion == "btc") {
        this.dataIndex = this.coins.BTC.filter(
          (item) => item["coin"].indexOf(this.searchKey) == 0
        );
      } else if (this.basecion == "eth") {
        this.dataIndex = this.coins.ETH.filter(
          (item) => item["coin"].indexOf(this.searchKey) == 0
        );
      }
    },
    silderGo(silder, val) {
      this[silder] = val;
    },
    init() {
      var params = this.$route.params.pair;
      if (params == undefined) {
        this.$router.push("/exchange/" + this.defaultPath);
        params = this.defaultPath;
      }
      const basecion = params.split("_")[1];
      if (basecion) {
        this.basecion = basecion;
      }
      var coin = params.toUpperCase().split("_")[0];
      var base = params.toUpperCase().split("_")[1];
      this.currentCoin.symbol = coin + "/" + base;
      this.currentCoin.coin = coin;
      this.currentCoin.base = base;
      this.$store.commit("navigate", "nav-exchange");
      this.$store.commit("setSkin", this.skin);
      // this.getCNYRate();
      this.getSymbolScale();
      this.getCoinInfo();
      this.getSymbol(); //包含 K线图、getFavor、startWebsock等
      // this.getPlateFull();
      this.getTrade();
      this.sliderBuyLimitPercent = 0;
      this.sliderSellLimitPercent = 0;
      this.sliderBuyMarketPercent = 0;
    },
    tipFormat(val) {
      return val + "%";
    },
    changeBaseCion(str, sideCountryID) {
      this.basecion = str;
      this.connectTickerSignal(sideCountryID, this.sideCountryID);
      this.sideCountryID = sideCountryID;
      console.log("changeBaseCion", str, this.coins);
      if (str == "usdt") {
        this.dataIndex = this.coins.USDT;
        this.dataIndex2 = this.coins.USDT2;
      } else if (str == "btc") {
        this.dataIndex = this.coins.BTC;
        this.dataIndex2 = this.coins.BTC2;
      } else if (str == "eth") {
        this.dataIndex = this.coins.ETH;
        this.dataIndex2 = this.coins.ETH2;
      } else if (str == "favor") {
        this.dataIndex = this.coins.favor;
      }
    },
    // changePlate(str) {
    //   if (str != "all") {
    //     this.plate.maxPostion = 20;
    //   } else {
    //     this.plate.maxPostion = 10;
    //   }
    //   this.getPlate(str);
    //   //this.selectedPlate = str;
    // },
    changeImgTable(str) {
      this.currentImgTable = str;
    },
    changeOrder(str) {
      this.selectedOrder = str;
    },
    setback() {
      var obk = document.getElementsByClassName("container")[0];
      var height = 0;
      var doc = document;
      window.innerHeight && (height = window.innerHeight);
      !window.innerHeight &&
        doc.body.clientHeight &&
        (height = doc.body.clientHeight);
      !window.innerHeight &&
        !doc.body.clientHeight &&
        doc.documentElement.clientHeight &&
        (height = doc.documentElement.clientHeight);
      obk.style.minHeight = height - 100 + "px";
    },
    updateLangData() {
      this.favorColumns[0].title = this.$t("exchange.coin");
      this.favorColumns[1].title = this.$t("exchange.lastprice");
      this.favorColumns[2].title = this.$t("exchange.daychange");

      this.coins.columns[0].title = this.$t("exchange.coin");
      this.coins.columns[1].title = this.$t("exchange.lastprice");
      this.coins.columns[2].title = this.$t("exchange.daychange");
      // this.coins.columns[3].title = this.$t("exchange.favorite");

      this.trade.columns[0].title = this.$t("exchange.num");
      this.trade.columns[1].title = this.$t("exchange.price");
      this.trade.columns[2].title = this.$t("exchange.time");

      this.plate.columns[0].title = this.$t("exchange.stall");
      this.plate.columns[1].title = this.$t("exchange.price");
      this.plate.columns[2].title = this.$t("exchange.num");
      this.plate.columns[3].title = this.$t("exchange.total");

      this.currentOrder.columns[1].title = this.$t("exchange.time");
      this.currentOrder.columns[2].title = this.$t("exchange.symbol");
      this.currentOrder.columns[3].title = this.$t("exchange.type");
      this.currentOrder.columns[4].title = this.$t("exchange.direction");
      this.currentOrder.columns[5].title = this.$t("exchange.price");
      this.currentOrder.columns[6].title = this.$t("exchange.num");
      this.currentOrder.columns[7].title = this.$t("exchange.traded");
      this.currentOrder.columns[8].title = this.$t("exchange.dealamount");
      this.currentOrder.columns[9].title = this.$t("exchange.action");

      this.historyOrder.columns[1].title = this.$t("exchange.time");
      this.historyOrder.columns[2].title = this.$t("exchange.symbol");
      this.historyOrder.columns[3].title = this.$t("exchange.type");
      this.historyOrder.columns[4].title = this.$t("exchange.direction");
      this.historyOrder.columns[5].title = this.$t("exchange.price");
      this.historyOrder.columns[6].title = this.$t("exchange.num");
      this.historyOrder.columns[7].title = this.$t("exchange.done");
      this.historyOrder.columns[8].title = this.$t("exchange.dealamount");
      this.historyOrder.columns[9].title = this.$t("exchange.status");

      // window.tvWidget.options.time_frames[0].title = this.$t("exchange.realtime");
    },
    getCNYRate() {
      this.$http
        .post(this.host + "/market/exchange-rate/usd-cny")
        .then((response) => {
          var resp = response.body;
          this.CNYRate = resp.data;
        });
    },
    getCoin(symbol) {
      return this.coins._map[symbol];
    },
    getKline() {
      var that = this;
      let config = {
        autosize: true,
        height: 320,
        fullscreen: true,
        symbol: that.symbol,
        interval: "60", // 默认K线周期
        timezone: "Asia/Shanghai",
        toolbar_bg: "#18202a",
        container_id: "kline_container",
        datafeed: that.datafeed,
        library_path:
          process.env.NODE_ENV === "production"
            ? "/assets/charting_library/"
            : "/src/assets/js/charting_library/",
        locale: "zh",
        debug: false,
        drawings_access: {
          type: "black",
          tools: [{ name: "Regression Trend" }],
        },
        disabled_features: [
          "header_resolutions",
          "timeframes_toolbar",
          "header_symbol_search",
          "header_chart_type",
          "header_compare",
          "header_undo_redo",
          "header_screenshot",
          "header_saveload",
          "use_localstorage_for_settings",
          "left_toolbar",
          "volume_force_overlay",
        ],
        enabled_features: [
          "hide_last_na_study_output",
          "move_logo_to_main_pane",
        ],
        custom_css_url: "bundles/common.css",
        supported_resolutions: ["1", "5", "30", "60", "1D", "1W", "1M"],
        charts_storage_url: "http://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        overrides: {
          "paneProperties.background": "#1B1E2E",
          "paneProperties.vertGridProperties.color": "rgba(0,0,0,.1)",
          "paneProperties.horzGridProperties.color": "rgba(0,0,0,.1)",
          //"scalesProperties.textColor" : "#AAA",
          "scalesProperties.textColor": "#61688A",
          "mainSeriesProperties.candleStyle.upColor": "#00b275",
          "mainSeriesProperties.candleStyle.downColor": "#f15057",
          "mainSeriesProperties.candleStyle.drawBorder": false,
          "mainSeriesProperties.candleStyle.wickUpColor": "#589065",
          "mainSeriesProperties.candleStyle.wickDownColor": "#AE4E54",
          "paneProperties.legendProperties.showLegend": false,

          "mainSeriesProperties.areaStyle.color1": "rgba(71, 78, 112, 0.5)",
          "mainSeriesProperties.areaStyle.color2": "rgba(71, 78, 112, 0.5)",
          "mainSeriesProperties.areaStyle.linecolor": "#9194a4",
          volumePaneSize: "small",
        },
        time_frames: [
          {
            text: "1min",
            resolution: "1",
            description: "realtime",
            title: that.$t("exchange.realtime"),
          },
          { text: "1min", resolution: "1", description: "1min" },
          { text: "5min", resolution: "5", description: "5min" },
          { text: "30min", resolution: "30", description: "30min" },
          {
            text: "1hour",
            resolution: "60",
            description: "1hour",
            title: "1hour",
          },
          /*{ text: "4hour", resolution: "240", description: "4hour",title: "4hour" },*/
          {
            text: "1day",
            resolution: "1D",
            description: "1day",
            title: "1day",
          },
          {
            text: "1week",
            resolution: "1W",
            description: "1week",
            title: "1week",
          },
          { text: "1mon", resolution: "1M", description: "1mon" },
        ],
      };
      if (that.skin === "day") {
        config.toolbar_bg = "#fff";
        config.custom_css_url = "bundles/common_day.css";
        config.overrides["paneProperties.background"] = "#fff";
        config.overrides["mainSeriesProperties.candleStyle.upColor"] =
          "#a6d3a5";
        config.overrides["mainSeriesProperties.candleStyle.downColor"] =
          "#ffa5a6";
      }
      require(["@js/charting_library/charting_library.min.js"], function (tv) {
        var widget = (window.tvWidget = new TradingView.widget(config));
        widget.onChartReady(function () {
          widget.chart().executeActionById("drawingToolbarAction");
          widget
            .chart()
            .createStudy("Moving Average", false, false, [5], null, {
              "plot.color": "#EDEDED",
            });
          widget
            .chart()
            .createStudy("Moving Average", false, false, [10], null, {
              "plot.color": "#ffe000",
            });
          widget
            .chart()
            .createStudy("Moving Average", false, false, [30], null, {
              "plot.color": "#ce00ff",
            });
          widget
            .chart()
            .createStudy("Moving Average", false, false, [60], null, {
              "plot.color": "#00adff",
            });
          widget
            .createButton()
            .attr("title", "realtime")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(3);
              widget.setSymbol("", "1");
            })
            .append("<span>分时</span>");

          widget
            .createButton()
            .attr("title", "M1")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "1");
            })
            .append("<span>M1</span>");

          widget
            .createButton()
            .attr("title", "M5")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "5");
            })
            .append("<span>M5</span>");

          widget
            .createButton()
            .attr("title", "M15")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "15");
            })
            .append("<span>M15</span>");

          widget
            .createButton()
            .attr("title", "M30")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "30");
            })
            .append("<span>M30</span>");

          widget
            .createButton()
            .attr("title", "H1")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "60");
            })
            .append("<span>H1</span>")
            .addClass("selected");

          widget
            .createButton()
            .attr("title", "D1")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "1D");
            })
            .append("<span>D1</span>");

          widget
            .createButton()
            .attr("title", "W1")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "1W");
            })
            .append("<span>W1</span>");

          widget
            .createButton()
            .attr("title", "M1")
            .on("click", function () {
              if ($(this).hasClass("selected")) return;
              $(this)
                .addClass("selected")
                .parent(".group")
                .siblings(".group")
                .find(".button.selected")
                .removeClass("selected");
              widget.chart().setChartType(1);
              widget.setSymbol("", "1M");
            })
            .append("<span>M1</span>");
        });
      });
    },
    getFavor() {
      //查询自选(收藏)
      this.$http
        .post(this.host + this.api.exchange.favorFind, {})
        .then((response) => {
          this.coins.favor = [];
          this.currentCoinIsFavor = false;
          var resp = response.body;
          for (var i = 0; i < resp.length; i++) {
            var coin = this.getCoin(resp[i].symbol);
            if (coin != null) {
              coin.isFavor = true;
              this.coins.favor.push(coin);
            }
            if (this.currentCoin.symbol == resp[i].symbol) {
              this.currentCoinIsFavor = true;
            }
          }
        });
    },
    getSymbol() {
      $.ajax({
        type: "GET",
        url: process.env.apiURL + "/zh-tw/Common/systemSettingEX",
        headers: {
          NationID: 1,
        },
      }).done((response) => {
        var resp = [];

        var exchangeData = response.data.find((x) => x.key == "exchange");
        var cryptos = exchangeData.value.cryptos.filter(
          (x) => x.fromCoinName == "BTC" || x.fromCoinName == "USDT"
        );
        var flatMoney = exchangeData.value.flatMoneys.filter(
          (x) => x.fromCoinName == "TWD"
        );
        var targetData = [...cryptos, ...flatMoney];

        for (var i = 0; i < targetData.length; i++) {
          var record = targetData[i];
          for (var j = 0; j < record.pairs.length; j++) {
            var pair = record.pairs[j];
            resp.push({
              symbol: pair.toCoinName + "/" + record.fromCoinName,
              open: 0,
              high: 0,
              low: 0,
              close: 0,
              chg: 0,
              change: 0,
              volume: 0,
              turnover: 0,
              lastDayClose: 0,
              usdRate: 0,
              baseUsdRate: 0,
              zone: 0,
              pairID: pair.pairID,
              minAmt: pair.minAmt,
              minPrice: pair.minPrice,
              minDeal: pair.minDeal,
              baseID: record.fromCoinID,
              coinID: pair.toCoinID,
            });
          }
        }

        //先清空已有数据
        for (var i = 0; i < resp.length; i++) {
          var coin = resp[i];
          coin.base = resp[i].symbol.split("/")[1];
          this.coins[coin.base] = [];
          this.coins[coin.base + "2"] = [];
          this.coins._map = [];
          this.coins.favor = [];
        }

        for (var i = 0; i < resp.length; i++) {
          var coin = resp[i];
          coin.price = resp[i].close = resp[i].close.toFixed(
            this.baseCoinScale
          );
          coin.rose =
            resp[i].chg > 0
              ? "+" + (resp[i].chg * 100).toFixed(2) + "%"
              : (resp[i].chg * 100).toFixed(2) + "%";
          coin.coin = resp[i].symbol.split("/")[0];
          coin.base = resp[i].symbol.split("/")[1];
          coin.href = (coin.coin + "_" + coin.base).toLowerCase();
          coin.isFavor = false;
          this.coins._map[coin.symbol] = coin;
          if (coin.zone == 0) {
            this.coins[coin.base].push(coin);
          } else {
            this.coins[coin.base + "2"].push(coin);
          }
          if (coin.symbol == this.currentCoin.symbol) {
            this.currentCoin = coin;
          }
        }
        console.log("getSymbol", this.coins);
        require(["../../assets/js/exchange.js"], function (e) {
          e.clickScTab();
        });
        this.getCurrentOrder(); //当前委托
        this.getHistoryOrder(); //历史委托
        this.startWebsock();
        this.getWallet();
      });
    },
    getCoinInfo() {
      //获取精度
      this.$http
        .post(this.host + this.api.market.coinInfo, {
          unit: this.currentCoin.coin,
        })
        .then((response) => {
          var resp = response.body;
          if (resp != null) {
            this.coinInfo = resp;
          }
        });
    },
    getSymbolScale() {
      //获取精度
      this.$http
        .post(this.host + this.api.market.symbolInfo, {
          symbol: this.currentCoin.symbol,
        })
        .then((response) => {
          var resp = response.body;
          if (resp != null) {
            this.currentCoin.coinScale = resp.coinScale;
            this.currentCoin.baseCoinScale = resp.baseCoinScale;

            this.baseCoinScale = resp.baseCoinScale;
            this.coinScale = resp.coinScale;
            this.symbolFee = resp.fee;

            this.enableMarketBuy = resp.enableMarketBuy;
            this.enableMarketSell = resp.enableMarketSell;

            this.exchangeable = resp.exchangeable;

            this.publishType = resp.publishType;
            this.startTime = resp.startTime;
            this.endTime = resp.endTime;
            this.clearTime = resp.clearTime;
            this.currentTime = parseInt(resp.currentTime / 1000);
            this.publishAmount = resp.publishAmount;
            this.publishPrice = resp.publishPrice;

            var temCurT = moment(resp.currentTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            if (temCurT < this.clearTime) {
              if (
                this.publishType == "QIANGGOU" ||
                this.publishType == "FENTAN"
              ) {
                this.showPublish = true;
                this.showCountDown = true;
              } else {
                this.showPublish = false;
                this.showCountDown = false;
              }
            } else {
              this.showPublish = false;
              this.showCountDown = false;
            }

            // 获取币种信息
          }
        });
    },
    getPlate() {
      const record = this.coins[this.basecion.toUpperCase()].find(
        (x) => x.href == this.currentHref
      );
      if (!record) {
        console.warn("record undefined");
        return;
      }
      this.subscribeOrderProxy(record.pairID).then((result) => {
        console.log("getPlate", result);

        this.currentCoin.price = result.unitPrice;
        this.bidForm.price = result.unitPrice;
        this.askForm.price = result.unitPrice;

        this.plate.askRows = [];
        this.plate.bidRows = [];
        let resp = {
          skin: "night",
          ask: {
            items: [],
          },
          bid: {
            items: [],
          },
        };

        for (var i = 0; i < result.askPreOrders.length; i++) {
          const ask = result.askPreOrders[i];
          resp.ask.items.push({
            price: ask.unitPrice,
            amount: ask.volume,
          });
        }
        resp.ask.items.reverse();
        for (var i = 0; i < result.bidPreOrders.length; i++) {
          const bid = result.bidPreOrders[i];
          resp.bid.items.push({
            price: bid.unitPrice,
            amount: bid.volume,
          });
        }

        if (resp.ask && resp.ask.items) {
          for (var i = 0; i < resp.ask.items.length; i++) {
            if (i == 0) {
              resp.ask.items[i].totalAmount = resp.ask.items[i].amount;
            } else {
              resp.ask.items[i].totalAmount =
                resp.ask.items[i - 1].totalAmount + resp.ask.items[i].amount;
            }
          }
          if (resp.ask.items.length >= this.plate.maxPostion) {
            for (var i = this.plate.maxPostion; i > 0; i--) {
              var ask = resp.ask.items[i - 1];
              ask.direction = "SELL";
              ask.position = i;
              this.plate.askRows.push(ask);
            }
            const rows = this.plate.askRows,
              len = rows.length,
              totle = rows[0].totalAmount;
            this.plate.askTotle = totle;
          } else {
            for (
              var i = this.plate.maxPostion;
              i > resp.ask.items.length;
              i--
            ) {
              var ask = { price: 0, amount: 0 };
              ask.direction = "SELL";
              ask.position = i;
              ask.totalAmount = ask.amount;
              this.plate.askRows.push(ask);
            }
            for (var i = resp.ask.items.length; i > 0; i--) {
              var ask = resp.ask.items[i - 1];
              ask.direction = "SELL";
              ask.position = i;
              this.plate.askRows.push(ask);
            }
            var askItemIndex =
              resp.ask.items.length - 1 > 0 ? resp.ask.items.length - 1 : 0;
            const rows = this.plate.askRows,
              len = rows.length,
              totle = rows[askItemIndex].totalAmount;
            this.plate.askTotle = totle;
          }
        }
        if (resp.bid && resp.bid.items) {
          for (var i = 0; i < resp.bid.items.length; i++) {
            if (i == 0)
              resp.bid.items[i].totalAmount = resp.bid.items[i].amount;
            else
              resp.bid.items[i].totalAmount =
                resp.bid.items[i - 1].totalAmount + resp.bid.items[i].amount;
          }
          for (var i = 0; i < resp.bid.items.length; i++) {
            var bid = resp.bid.items[i];
            bid.direction = "BUY";
            bid.position = i + 1;
            this.plate.bidRows.push(bid);
            if (i == this.plate.maxPostion - 1) break;
          }
          if (resp.bid.items.length < this.plate.maxPostion) {
            for (
              var i = resp.bid.items.length;
              i < this.plate.maxPostion;
              i++
            ) {
              var bid = { price: 0, amount: 0 };
              bid.direction = "BUY";
              bid.position = i + 1;
              bid.totalAmount = 0;
              this.plate.bidRows.push(bid);
            }
            var bidItemIndex =
              resp.bid.items.length - 1 > 0 ? resp.bid.items.length - 1 : 0;
            const rows = this.plate.bidRows,
              len = rows.length,
              totle = rows[bidItemIndex].totalAmount;
            this.plate.bidTotle = totle;
          } else {
            const rows = this.plate.bidRows,
              len = rows.length,
              totle = rows[len - 1].totalAmount;
            this.plate.bidTotle = totle;
          }
        }
        this.$refs.depthGraph.draw(resp);
      });
    },
    getPlateFull() {
      //深度图
      var params = {};
      params["symbol"] = this.currentCoin.symbol;
      this.$http
        .post(this.host + this.api.market.platefull, params)
        .then((response) => {
          var resp = response.body;
          this.fullTrade = resp;
          resp.skin = this.skin;
          this.$refs.depthGraph.draw(resp);
        });
    },
    updatePlate(type, row) {
      //发现该方法未被使用
      if (type == "sell") {
        for (var i = 0; i < this.plate.askRows.length; i++) {
          if (
            row.price > this.plate.askRows[i].price &&
            i != 0 &&
            this.plate.askRows[i].price > 0
          ) {
            this.plate.askRows.splice(i, 0, row);
            this.plate.askRows.shift();
            break;
          } else if (
            i == this.plate.askRows.length - 1 &&
            (row.price < this.plate.askRows[i].price ||
              this.plate.askRows[i].price == 0)
          ) {
            this.plate.askRows.push(row);
            this.plate.askRows.shift();
            break;
          }
        }
      } else if (type == "buy") {
        for (var i = 0; i < this.plate.bidRows.length; i++) {
          if (row.price > this.plate.bidRows[i].price) {
            this.plate.bidRows.splice(i, 0, row);
            this.plate.bidRows.pop();
            break;
          }
        }
      }
    },
    getTrade() {
      var params = {};
      params["symbol"] = this.currentCoin.symbol;
      params["size"] = 20;
      this.$http
        .post(this.host + this.api.market.trade, params)
        .then((response) => {
          this.trade.rows = [];
          var resp = response.body;
          for (var i = 0; i < resp.length; i++) {
            this.trade.rows.push(resp[i]);
          }
        });
    },
    startWebsock() {
      var that = this;
      this.hub = $.hubConnection(process.env.signalR);
      this.proxy = this.hub.createHubProxy("TickerHub");
      this.hub
        .start()
        .done(() => {
          console.log("socket connet suc");
          this.subscribeTickersProxy(this.sideCountryID).then((result) => {
            var targetData = result.find(
              (x) => x.currencyCode == this.basecion.toUpperCase()
            );
            this.coins[this.basecion.toUpperCase()].forEach((item) => {
              var target = targetData.marketPriceList.find(
                (x) => x.pair == item.symbol
              );
              item.close = target.buyPrice;
              item.rose = target.upDownPercentage.toFixed(2) + "%";
              item.high = target.high;
              item.low = target.low;
              item.volume = target.volume;
            });
            this.changeBaseCion(this.basecion, this.sideCountryID);
          });
          this.getPlate(); //买卖盘
          //   this.datafeed = new Datafeeds.WebsockFeed(
          //     that.host + "/market",
          //     that.currentCoin,
          //     // stompClient,
          //     that.baseCoinScale
          // );

          this.datafeed = new Datafeeds.WebsockFeed(
            that.currentCoin,
            that.proxy,
            that.baseCoinScale
          );
          this.getKline();
        })
        .fail(() => console.log("socket connet fail"));

      this.proxy
        .on("SendTickersByNationID", (result) => {
          const data = JSON.parse(result);
          console.log("SendTickersByNationID", data);
          var targetData = data.find(
            (x) => x.currencyCode == this.basecion.toUpperCase()
          );
          this.coins[this.basecion.toUpperCase()].forEach((item) => {
            var target = targetData.marketPriceList.find(
              (x) => x.pair == item.symbol
            );
            item.close = target.buyPrice;
            item.rose = target.upDownPercentage.toFixed(2) + "%";
            item.high = target.high;
            item.low = target.low;
            item.volume = target.volume;
          });
        })
        .on("SendPreOrderByNationID", (data) => {
          const result = JSON.parse(data);
          console.log("SendPreOrderByNationID", data);
          this.plate.askRows = [];
          this.plate.bidRows = [];
          let resp = {
            skin: "night",
            ask: {
              direction: "SELL",
              items: [],
            },
            bid: {
              direction: "BUY",
              items: [],
            },
          };

          for (var i = 0; i < result.askPreOrders.length; i++) {
            const ask = result.askPreOrders[i];
            resp.ask.items.push({
              price: ask.unitPrice,
              amount: ask.volume,
            });
          }
          for (var i = 0; i < result.bidPreOrders.length; i++) {
            const bid = result.bidPreOrders[i];
            resp.bid.items.push({
              price: bid.unitPrice,
              amount: bid.volume,
            });
          }

          if (resp.ask && resp.ask.items) {
            for (var i = 0; i < resp.ask.items.length; i++) {
              if (i == 0) {
                resp.ask.items[i].totalAmount = resp.ask.items[i].amount;
              } else {
                resp.ask.items[i].totalAmount =
                  resp.ask.items[i - 1].totalAmount + resp.ask.items[i].amount;
              }
            }
            if (resp.ask.items.length >= this.plate.maxPostion) {
              for (var i = this.plate.maxPostion; i > 0; i--) {
                var ask = resp.ask.items[i - 1];
                ask.direction = "SELL";
                ask.position = i;
                this.plate.askRows.push(ask);
              }
              const rows = this.plate.askRows,
                len = rows.length,
                totle = rows[0].totalAmount;
              this.plate.askTotle = totle;
            } else {
              for (
                var i = this.plate.maxPostion;
                i > resp.ask.items.length;
                i--
              ) {
                var ask = { price: 0, amount: 0 };
                ask.direction = "SELL";
                ask.position = i;
                ask.totalAmount = ask.amount;
                this.plate.askRows.push(ask);
              }
              for (var i = resp.ask.items.length; i > 0; i--) {
                var ask = resp.ask.items[i - 1];
                ask.direction = "SELL";
                ask.position = i;
                this.plate.askRows.push(ask);
              }
              var askItemIndex =
                resp.ask.items.length - 1 > 0 ? resp.ask.items.length - 1 : 0;
              const rows = this.plate.askRows,
                len = rows.length,
                totle = rows[askItemIndex].totalAmount;
              this.plate.askTotle = totle;
            }
          }
          if (resp.bid && resp.bid.items) {
            for (var i = 0; i < resp.bid.items.length; i++) {
              if (i == 0)
                resp.bid.items[i].totalAmount = resp.bid.items[i].amount;
              else
                resp.bid.items[i].totalAmount =
                  resp.bid.items[i - 1].totalAmount + resp.bid.items[i].amount;
            }
            for (var i = 0; i < resp.bid.items.length; i++) {
              var bid = resp.bid.items[i];
              bid.direction = "BUY";
              bid.position = i + 1;
              this.plate.bidRows.push(bid);
              if (i == this.plate.maxPostion - 1) break;
            }
            if (resp.bid.items.length < this.plate.maxPostion) {
              for (
                var i = resp.bid.items.length;
                i < this.plate.maxPostion;
                i++
              ) {
                var bid = { price: 0, amount: 0 };
                bid.direction = "BUY";
                bid.position = i + 1;
                bid.totalAmount = 0;
                this.plate.bidRows.push(bid);
              }
              var bidItemIndex =
                resp.bid.items.length - 1 > 0 ? resp.bid.items.length - 1 : 0;
              const rows = this.plate.bidRows,
                len = rows.length,
                totle = rows[bidItemIndex].totalAmount;
              this.plate.bidTotle = totle;
            } else {
              const rows = this.plate.bidRows,
                len = rows.length,
                totle = rows[len - 1].totalAmount;
              this.plate.bidTotle = totle;
            }
          }
          resp.skin = this.skin;
          this.$refs.depthGraph.draw(resp);
        });
    },
    subscribeTickersProxy(id) {
      return new Promise((resolve, reject) => {
        this.proxy
          .invoke("SubscribeTickersByNationID", "" + id, "1")
          .done((result) => {
            const data = JSON.parse(result);
            console.log("subscribeTickersProxy", data);
            resolve(data);
          })
          .fail((error) => {
            reject(error);
          });
      });
    },
    unsubscribeTickersProxy(id) {
      return new Promise((resolve, reject) => {
        this.proxy
          .invoke("UnsubscribeTickersByNationID", "" + id, "1")
          .done((result) => {
            resolve(result);
          })
          .fail((error) => {
            reject(error);
          });
      });
    },
    subscribeOrderProxy(id) {
      return new Promise((resolve, reject) => {
        this.proxy
          .invoke("SubscribePreOrdersByNationID", "" + id, "1")
          .done((result) => {
            const data = JSON.parse(result);
            resolve(data);
          })
          .fail((error) => {
            reject(error);
          });
      });
    },
    unsubscribeOrderProxy(id) {
      return new Promise((resolve, reject) => {
        this.proxy
          .invoke("UnsubscribePreOrdersByNationID", "" + id, "1")
          .done((result) => {
            // this.hub.stop()
            resolve(result);
          })
          .fail((error) => {
            reject(error);
          });
      });
    },
    connectTickerSignal(newCountryID, oldCountryID) {
      if (!this.proxy || !this.hub) return;

      if (oldCountryID) {
        this.unsubscribeTickersProxy(oldCountryID).catch(this.showError);
      }
      if (newCountryID) {
        this.subscribeTickersProxy(newCountryID)
          .then((result) => {
            var targetData = result.find(
              (x) => x.currencyCode == this.basecion.toUpperCase()
            );
            this.coins[this.basecion.toUpperCase()].forEach((item) => {
              var target = targetData.marketPriceList.find(
                (x) => x.pair == item.symbol
              );
              item.close = target.buyPrice;
              item.rose = target.upDownPercentage.toFixed(2) + "%";
              item.high = target.high;
              item.low = target.low;
              item.volume = target.volume;
            });
          })
          .catch(this.showError);
      }
    },
    limited_price() {
      this.showMarket = false;
    },
    market_price() {
      this.showMarket = true;
    },
    collect(index, row) {
      if (!this.isLogin) {
        this.$Message.info(this.$t("common.logintip"));
        return;
      }
      var params = {};
      params["symbol"] = row.symbol;
      this.$http
        .post(this.host + this.api.exchange.favorAdd, params)
        .then((response) => {
          var resp = response.body;
          if (resp.code == 0) {
            this.$Message.info(this.$t("exchange.do_favorite"));
            this.getCoin(row.symbol).isFavor = true;
            row.isFavor = true;
            this.coins.favor.push(row);
            if (this.currentCoin.symbol == row.symbol) {
              this.currentCoinIsFavor = true;
            }
          }
        });
    },
    cancelCollect(index, row) {
      if (!this.isLogin) {
        this.$Message.info(this.$t("common.logintip"));
        return;
      }
      var params = {};
      params["symbol"] = row.symbol;
      this.$http
        .post(this.host + this.api.exchange.favorDelete, params)
        .then((response) => {
          var resp = response.body;
          if (resp.code == 0) {
            this.$Message.info(this.$t("exchange.cancel_favorite"));
            this.getCoin(row.symbol).isFavor = false;
            for (var i = 0; i < this.coins.favor.length; i++) {
              var favorCoin = this.coins.favor[i];
              if (favorCoin.symbol == row.symbol) {
                this.coins.favor.splice(i, 1);
                break;
              }
            }
            if (this.currentCoin.symbol == row.symbol) {
              this.currentCoinIsFavor = false;
            }
          }
        });
    },
    gohref(currentRow, oldCurrentRow) {
      this.currentHref = currentRow.href;
      this.$router.push({
        name: "ExchangePair",
        params: {
          pair: currentRow.href,
        },
      });
    },
    buyPlate(currentRow) {
      this.form.buy.limitPrice = currentRow.price;
      this.form.sell.limitPrice = currentRow.price;
    },
    sellPlate(currentRow) {
      this.form.buy.limitPrice = currentRow.price;
      this.form.sell.limitPrice = currentRow.price;
    },
    /**
     *
     */
    getWallet() {
      $.ajax({
        method: "GET",
        url:
          process.env.apiURL +
          "/zh-tw/EXHotWallet/Asset/" +
          this.currentCoin.baseID,
        headers: {
          Accept: "application/json",
          NationID: 1,
          "Content-Type": "application/json",
          Authorization:
            "bearer GscVUUYoH2NegDuaY5JZEkxEdPdHpFkZW5OVojtSTVDwIUkKUSnSQEHd8DGG6PCzGy2ZKjgEG-F-VlYDlLJkej2Jl8NXHEU0C93yU_stgWIf12wb_sJ6BWmlJIEncFfeG5AsPy4rF572gLd8f_SGAtRkoGnbrsPCiRn1KeKJLLOeT1DMaq1vqUa0UJhORmttatXI-ai3hOgDFJfQgQvsLpCn1lc",
        },
      })
        .done((rep) => {
          this.wallet.base = rep.data.totalAmount;
        })
        .fail((err) => console.log("get base amount fail"));
      $.ajax({
        method: "GET",
        url:
          process.env.apiURL +
          "/zh-tw/EXHotWallet/Asset/" +
          this.currentCoin.coinID,
        headers: {
          Accept: "application/json",
          NationID: 1,
          "Content-Type": "application/json",
          Authorization:
            "bearer GscVUUYoH2NegDuaY5JZEkxEdPdHpFkZW5OVojtSTVDwIUkKUSnSQEHd8DGG6PCzGy2ZKjgEG-F-VlYDlLJkej2Jl8NXHEU0C93yU_stgWIf12wb_sJ6BWmlJIEncFfeG5AsPy4rF572gLd8f_SGAtRkoGnbrsPCiRn1KeKJLLOeT1DMaq1vqUa0UJhORmttatXI-ai3hOgDFJfQgQvsLpCn1lc",
        },
      })
        .done((rep) => {
          this.wallet.coin = rep.data.totalAmount;
        })
        .fail((err) => console.log("get base amount fail"));
    },
    getCurrentOrder() {
      const pageNow = 1;
      const pageSize = 1000;
      const url = this.isHideOther
        ? process.env.apiURL +
          `/zh-tw/Order/TradingOrderByPair?pageNow=${pageNow}&pageSize=${pageSize}&pairID=${this.currentCoin.pairID}`
        : process.env.apiURL +
          `/zh-tw/Order/TradingOrder?pageNow=${pageNow}&pageSize=${pageSize}`;
      $.ajax({
        method: "GET",
        url: url,
        headers: {
          Accept: "application/json",
          NationID: 1,
          "Content-Type": "application/json",
          Authorization:
            "bearer GscVUUYoH2NegDuaY5JZEkxEdPdHpFkZW5OVojtSTVDwIUkKUSnSQEHd8DGG6PCzGy2ZKjgEG-F-VlYDlLJkej2Jl8NXHEU0C93yU_stgWIf12wb_sJ6BWmlJIEncFfeG5AsPy4rF572gLd8f_SGAtRkoGnbrsPCiRn1KeKJLLOeT1DMaq1vqUa0UJhORmttatXI-ai3hOgDFJfQgQvsLpCn1lc",
        },
      })
        .done((rep) => {
          console.log("getCurrentOrder Suc", rep);
          this.currentOrder = rep.data.rows;
          this.currentOrder.forEach(item => {
            item.createDate = item.createDate.replace("T", " ").split(".")[0];
          })
        })
        .fail((err) => console.log("getCurrentOrderFail", err));
    },
    getHistoryOrder(pageNo) {
      const pageNow = 1;
      const pageSize = 1000;
      const url = process.env.apiURL +
          `/zh-tw/Order/TradingOrderHistory?pageNow=${pageNow}&pageSize=${pageSize}`;
      $.ajax({
        method: "GET",
        url: url,
        headers: {
          Accept: "application/json",
          NationID: 1,
          "Content-Type": "application/json",
          Authorization:
            "bearer GscVUUYoH2NegDuaY5JZEkxEdPdHpFkZW5OVojtSTVDwIUkKUSnSQEHd8DGG6PCzGy2ZKjgEG-F-VlYDlLJkej2Jl8NXHEU0C93yU_stgWIf12wb_sJ6BWmlJIEncFfeG5AsPy4rF572gLd8f_SGAtRkoGnbrsPCiRn1KeKJLLOeT1DMaq1vqUa0UJhORmttatXI-ai3hOgDFJfQgQvsLpCn1lc",
        },
      })
        .done((rep) => {
          console.log("getTradingOrderHistory Suc", rep);
          this.historyOrder = rep.data.rows;
          this.historyOrder.forEach(item => {
            item.createDate = item.createDate.replace("T", " ").split(".")[0];
          })
        })
        .fail((err) => console.log("getTradingOrderHistoryFail", err));
    },
    cancel(index) {
      var order = this.currentOrder[index];
       $.ajax({
        method: "DELETE",
        url: process.env.apiURL + `/zh-tw/Order/Cancel/${order.orderID}?transType=${order.transType}`,
        headers: {
          Accept: "application/json",
          NationID: 1,
          "Content-Type": "application/json",
          Authorization:
            "bearer GscVUUYoH2NegDuaY5JZEkxEdPdHpFkZW5OVojtSTVDwIUkKUSnSQEHd8DGG6PCzGy2ZKjgEG-F-VlYDlLJkej2Jl8NXHEU0C93yU_stgWIf12wb_sJ6BWmlJIEncFfeG5AsPy4rF572gLd8f_SGAtRkoGnbrsPCiRn1KeKJLLOeT1DMaq1vqUa0UJhORmttatXI-ai3hOgDFJfQgQvsLpCn1lc",
        },
      })
        .done((rep) => {
          console.log("cancel Suc", rep);
          alert("掛單取消成功");
          this.getCurrentOrder();
        })
        .fail((err) => console.log("cancelFail", err));
    },
    refreshAccount: function () {
      this.getCurrentOrder();
      this.getHistoryOrder();
      this.getWallet();
    },
    timeFormat: function (tick) {
      return moment(tick).format("HH:mm:ss");
    },
    dateFormat: function (tick) {
      return moment(tick).format("YYYY-MM-DD HH:mm:ss");
    },
    keyEvent(event) {
      var re1 = new RegExp(
        "([0-9]+.[0-9]{" + this.baseCoinScale + "})[0-9]*",
        ""
      );
      this.form.buy.limitPrice = this.form.buy.limitPrice
        .toString()
        .replace(re1, "$1");
      this.form.sell.limitPrice = this.form.sell.limitPrice
        .toString()
        .replace(re1, "$1");
      this.form.buy.marketAmount = this.form.buy.marketAmount
        .toString()
        .replace(re1, "$1");

      var re2 = new RegExp("([0-9]+.[0-9]{" + this.coinScale + "})[0-9]*", "");
      this.form.buy.limitAmount = this.form.buy.limitAmount
        .toString()
        .replace(re2, "$1");
      this.form.sell.limitAmount = this.form.sell.limitAmount
        .toString()
        .replace(re2, "$1");
      this.form.sell.marketAmount = this.form.sell.marketAmount
        .toString()
        .replace(re2, "$1");
    },
    showPublishMask() {
      if (!this.showPublish) {
        this.showPublish = true;
        console.log("show");
      }
    },
    hidePublishMask() {
      if (this.showPublish) {
        this.showPublish = false;
        console.log("hide");
      }
    },
    hideCountDown() {
      if (this.showCountDown) {
        this.showCountDown = false;
      }
    },
    setPublishProgress() {},
    tradeTabChange(type) {
      if (type == "limit") {
        this.orderType = "LimitPrice";
      } else {
        this.orderType = "MarketPrice";
      }
    },
    formChange(type, column) {
      var priceLimit = this.currentCoin.minPrice.toString().split(".")[1]
        .length;
      var amountLimit = this.currentCoin.minAmt.toString().split(".")[1].length;
      if (type == "b") {
        this.bidForm.price = parseFloat(this.bidForm.price).toFixed(priceLimit);
        this.bidForm.unit = parseFloat(this.bidForm.unit).toFixed(amountLimit);
        switch (column) {
          case "p":
          case "u":
            this.bidForm.total = this.bidForm.price * this.bidForm.unit;
            break;
          case "t":
            this.bidForm.unit = this.bidForm.total / this.bidForm.price;
            break;
        }
      }
      if (type == "s") {
        this.askForm.price = parseFloat(this.askForm.price).toFixed(priceLimit);
        this.askForm.unit = parseFloat(this.askForm.unit).toFixed(amountLimit);
        switch (column) {
          case "p":
          case "u":
            this.askForm.total = this.askForm.price * this.askForm.unit;
            break;
          case "t":
            this.askForm.unit = this.askForm.total / this.askForm.price;
            break;
        }
      }
    },
    createOrder(type) {
      const obj = {};
      if (type == "b") {
        obj.transType = this.bidForm.transType;
        obj.orderType = this.orderType == "LimitPrice" ? 1 : 2;
        obj.pairID = this.currentCoin.pairID;
        obj.amount = this.bidForm.unit;
        obj.unitPrice = this.orderType == "LimitPrice" ? this.bidForm.price : 0;
      }
      if (type == "s") {
        obj.transType = this.askForm.transType;
        obj.orderType = this.orderType == "LimitPrice" ? 1 : 2;
        obj.pairID = this.currentCoin.pairID;
        obj.amount = this.askForm.unit;
        obj.unitPrice = this.orderType == "LimitPrice" ? this.askForm.price : 0;
      }
      if (
        this.orderType == "LimitPrice" &&
        obj.amount * obj.unitPrice < this.currentCoin.minDeal
      ) {
        alert("lower than min deal " + this.currentCoin.minDeal);
        return;
      }

      $.ajax({
        method: "POST",
        url: process.env.apiURL + "/zh-tw/Order/Create",
        data: JSON.stringify(obj),
        contentType: "application/json",
        headers: {
          Accept: "application/json",
          NationID: 1,
          "Content-Type": "application/json",
          Authorization:
            "bearer GscVUUYoH2NegDuaY5JZEkxEdPdHpFkZW5OVojtSTVDwIUkKUSnSQEHd8DGG6PCzGy2ZKjgEG-F-VlYDlLJkej2Jl8NXHEU0C93yU_stgWIf12wb_sJ6BWmlJIEncFfeG5AsPy4rF572gLd8f_SGAtRkoGnbrsPCiRn1KeKJLLOeT1DMaq1vqUa0UJhORmttatXI-ai3hOgDFJfQgQvsLpCn1lc",
        },
      })
        .done((rep) => {
          console.log("createOrderSuc", rep);
          if (rep.status != 0) {
            alert(rep.message);
          } else {
            alert("訂單建立成功");
            this.getCurrentOrder();
            this.getWallet();
          }
        })
        .fail((err) => {
          console.log("createOrderFail", err);
        });
    },
    myOrderChange(type) {
      this.historyActiveTab = type;
      if(type=="cur"){
        this.getCurrentOrder();
      }else{
        this.getHistoryOrder();
      }
    },
  },
};
</script>

