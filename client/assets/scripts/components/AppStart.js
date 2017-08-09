

//server test
function checkTingPai(seatData,begin,end){
	for(var i = begin; i < end; ++i){
		//如果这牌已经在和了，就不用检查了
		if(seatData.tingMap[i] != null){
			continue;
		}
		//将牌加入到计数中
		var old = seatData.countMap[i];
		if(old == null){
			old = 0;
			seatData.countMap[i] = 1;
		}
		else{
			seatData.countMap[i] ++;		
		}

		seatData.holds.push(i);
		//逐个判定手上的牌
		var ret = checkCanHu(seatData);
		if(ret){
			//平胡 0番
			seatData.tingMap[i] = {
				pattern:"normal",
                fan:0
			};
		}
		
		//搞完以后，撤消刚刚加的牌
		seatData.countMap[i] = old;
		seatData.holds.pop();
	}	
}

var kanzi = [];
var record = false;
function debugRecord(pai){
	if(record){
		kanzi.push(pai);
	}
}

function matchSingle(seatData,selected){
	//分开匹配 A-2,A-1,A
	var matched = true;
	var v = selected % 9;
	if(v < 2){
		matched = false;
	}
	else{
		for(var i = 0; i < 3; ++i){
			var t = selected - 2 + i;
			var cc = seatData.countMap[t];
			if(cc == null){
				matched = false;
				break;
			}
			if(cc == 0){
				matched = false;
				break;
			}
		}		
	}


	//匹配成功，扣除相应数值
	if(matched){
		seatData.countMap[selected - 2] --;
		seatData.countMap[selected - 1] --;
		seatData.countMap[selected] --;
		var ret = checkSingle(seatData);
		seatData.countMap[selected - 2] ++;
		seatData.countMap[selected - 1] ++;
		seatData.countMap[selected] ++;
		if(ret == true){
			debugRecord(selected - 2);
			debugRecord(selected - 1);
			debugRecord(selected);
			return true;
		}		
	}

	//分开匹配 A-1,A,A + 1
	matched = true;
	if(v < 1 || v > 7){
		matched = false;
	}
	else{
		for(var i = 0; i < 3; ++i){
			var t = selected - 1 + i;
			var cc = seatData.countMap[t];
			if(cc == null){
				matched = false;
				break;
			}
			if(cc == 0){
				matched = false;
				break;
			}
		}		
	}

	//匹配成功，扣除相应数值
	if(matched){
		seatData.countMap[selected - 1] --;
		seatData.countMap[selected] --;
		seatData.countMap[selected + 1] --;
		var ret = checkSingle(seatData);
		seatData.countMap[selected - 1] ++;
		seatData.countMap[selected] ++;
		seatData.countMap[selected + 1] ++;
		if(ret == true){
			debugRecord(selected - 1);
			debugRecord(selected);
			debugRecord(selected + 1);
			return true;
		}		
	}
	
	
	//分开匹配 A,A+1,A + 2
	matched = true;
	if(v > 6){
		matched = false;
	}
	else{
		for(var i = 0; i < 3; ++i){
			var t = selected + i;
			var cc = seatData.countMap[t];
			if(cc == null){
				matched = false;
				break;
			}
			if(cc == 0){
				matched = false;
				break;
			}
		}		
	}

	//匹配成功，扣除相应数值
	if(matched){
		seatData.countMap[selected] --;
		seatData.countMap[selected + 1] --;
		seatData.countMap[selected + 2] --;
		var ret = checkSingle(seatData);
		seatData.countMap[selected] ++;
		seatData.countMap[selected + 1] ++;
		seatData.countMap[selected + 2] ++;
		if(ret == true){
			debugRecord(selected);
			debugRecord(selected + 1);
			debugRecord(selected + 2);
			return true;
		}		
	}
	return false;
}

function checkSingle(seatData){
	var holds = seatData.holds;
	var selected = -1;
	var c = 0;
	for(var i = 0; i < holds.length; ++i){
		var pai = holds[i];
		c = seatData.countMap[pai];
		if(c != 0){
			selected = pai;
			break;
		}
	}
	//如果没有找到剩余牌，则表示匹配成功了
	if(selected == -1){
		return true;
	}
	//否则，进行匹配
	if(c == 3){
		//直接作为一坎
		seatData.countMap[selected] = 0;
		debugRecord(selected);
		debugRecord(selected);
		debugRecord(selected);
		var ret = checkSingle(seatData);
		//立即恢复对数据的修改
		seatData.countMap[selected] = c;
		if(ret == true){
			return true;
		}
	}
	else if(c == 4){
		//直接作为一坎
		seatData.countMap[selected] = 1;
		debugRecord(selected);
		debugRecord(selected);
		debugRecord(selected);
		var ret = checkSingle(seatData);
		//立即恢复对数据的修改
		seatData.countMap[selected] = c;
		//如果作为一坎能够把牌匹配完，直接返回TRUE。
		if(ret == true){
			return true;
		}
	}
	
	//按单牌处理
	return matchSingle(seatData,selected);
}

function checkCanHu(seatData){
	for(var k in seatData.countMap){
		k = parseInt(k);
		var c = seatData.countMap[k];
		if(c < 2){
			continue;
		}
		//如果当前牌大于等于２，则将它选为将牌
		seatData.countMap[k] -= 2;
		//逐个判定剩下的牌是否满足　３Ｎ规则,一个牌会有以下几种情况
		//1、0张，则不做任何处理
		//2、2张，则只可能是与其它牌形成匹配关系
		//3、3张，则可能是单张形成 A-2,A-1,A  A-1,A,A+1  A,A+1,A+2，也可能是直接成为一坎
		//4、4张，则只可能是一坎+单张
		kanzi = [];
		var ret = checkSingle(seatData);
		seatData.countMap[k] += 2;
		if(ret){
			//kanzi.push(k);
			//kanzi.push(k);
			//console.log(kanzi);
			return true;
		}
	}
}

/*
console.log(Date.now());
//检查筒子
checkTingPai(seatData,0,9);
//检查条子
checkTingPai(seatData,9,18);
//检查万字
checkTingPai(seatData,18,27);
console.log(Date.now());

for(k in seatData.tingMap){
	console.log(nameMap[k]);	
}
*/

exports.checkTingPai = checkTingPai;

exports.getMJType = function(pai){
      if(id >= 0 && id < 9){
          return 0;
      }
      else if(id >= 9 && id < 18){
          return 1;
      }
      else if(id >= 18 && id < 27){
          return 2;
      }
}

function urlParse(){
    var params = {};
    if(window.location == null){
        return params;
    }
    var name,value; 
    var str=window.location.href; //取得整个地址栏
    var num=str.indexOf("?") 
    str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

    var arr=str.split("&"); //各个参数放到数组里
    for(var i=0;i < arr.length;i++){ 
        num=arr[i].indexOf("="); 
        if(num>0){ 
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            params[name]=value;
        } 
    }
    return params;
}

function initMgr(){
    cc.vv = {};
    var UserMgr = require("UserMgr");
    cc.vv.userMgr = new UserMgr();
    
    var ReplayMgr = require("ReplayMgr");
    cc.vv.replayMgr = new ReplayMgr();
    
    cc.vv.http = require("HTTP");
    cc.vv.global = require("Global");
    cc.vv.net = require("Net");
    
    var GameNetMgr = require("GameNetMgr");
    cc.vv.gameNetMgr = new GameNetMgr();
    cc.vv.gameNetMgr.initHandlers();
    
    var AnysdkMgr = require("AnysdkMgr");
    cc.vv.anysdkMgr = new AnysdkMgr();
    cc.vv.anysdkMgr.init();
    
    var VoiceMgr = require("VoiceMgr");
    cc.vv.voiceMgr = new VoiceMgr();
    cc.vv.voiceMgr.init();
    
    var AudioMgr = require("AudioMgr");
    cc.vv.audioMgr = new AudioMgr();
    cc.vv.audioMgr.init();
    
    var Utils = require("Utils");
    cc.vv.utils = new Utils();
    
    //var MJUtil = require("MJUtil");
    //cc.vv.mjutil = new MJUtil();
    
    cc.args = urlParse();
}
    

    
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        label: {
            default: null,
            type:cc.Label
        },

        loadingProgess:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        initMgr();
        console.log('haha'); 
        this._mainScene = 'loading';
        this.showSplash(function(){
            var url = cc.url.raw('resources/ver/cv.txt');
            cc.loader.load(url,function(err,data){
                cc.VERSION = data;
                console.log('current core version:' + cc.VERSION);
                this.getServerInfo();
            }.bind(this));
        }.bind(this));
        this.testButton = cc.find("Canvas/testButton");
        cc.vv.utils.addClickEvent(this.testButton,this.node,"AppStart","onBtnClicked");
    },

    onBtnClicked:function(event) {
        console.log("qiyisi");
        var data = [0,0,1,1,1,2,2,2,3,3,3,4,4,4];
        var seatData = {};
        seatData.holds = data;
        seatData.countMap = [];
        for (var i = 0; i < data.length; i++) {
            if (seatData.countMap[data[i]] == null) {
                seatData.countMap[data[i]] = 0;
            }
            seatData.countMap[i]++;
        }
        console.log(checkCanHu(seatData));
    },

    onBtnDownloadClicked:function(){
        cc.sys.openURL(cc.vv.SI.appweb);
    },
    
    showSplash:function(callback){
        var self = this;
        var SHOW_TIME = 3000;
        var FADE_TIME = 500;
        this._splash = cc.find("Canvas/splash");
        if(true || cc.sys.os != cc.sys.OS_IOS || !cc.sys.isNative){
            this._splash.active = true;
            if(this._splash.getComponent(cc.Sprite).spriteFrame == null){
                callback();
                return;
            }
            var t = Date.now();
            var fn = function(){
                var dt = Date.now() - t;
                if(dt < SHOW_TIME){
                    setTimeout(fn,33);
                }
                else {
                    var op = (1 - ((dt - SHOW_TIME) / FADE_TIME)) * 255;
                    if(op < 0){
                        self._splash.opacity = 0;
                        callback();   
                    }
                    else{
                        self._splash.opacity = op;
                        setTimeout(fn,33);   
                    }
                }
            };
            setTimeout(fn,33);
        }
        else{
            this._splash.active = false;
            callback();
        }
    },
    
    getServerInfo:function(){
        return;

        var self = this;
        var onGetVersion = function(ret){
            if(ret.version == null){
                console.log("error.");
            }
            else{
                cc.vv.SI = ret;
                if(ret.version != cc.VERSION){
                    cc.find("Canvas/alert").active = true;
                }
                else{
                    cc.director.loadScene(self._mainScene);
                }
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self.loadingProgess.string = "正在连接服务器";
            xhr = cc.vv.http.sendRequest("/get_serverinfo",null,function(ret){
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn,5000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self.loadingProgess.string = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    log:function(content){
        this.label.string += content + '\n';
    },
});
