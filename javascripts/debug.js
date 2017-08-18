/**
 * Created by huchunbo on 2017/7/23.
 */
var deviceData = [
    /*
    {
        "key": "WorkMode",
        "value": "0"
    },
    {
        "key": "WorkStatus",
        "value": "1"
    }
    */
];

var addDataItem = function (key, value) {
    deviceData.push({
        key: key, value: value
    });
};

// addDataItem("WorkTime", "100");
// addDataItem("KG_Start", "0");

var deviceType = {};

// 油烟机 TRD
var fotileKeys = ["cur_windVolume", "WindSpeed", "WorkStatus", "CleanSwitch", "LightSwitch", "Switch", "elecMachineMode", "CookSwitch", "CookTime_set", "CookTime_left", "PowerVolume", "RoomTemp", "DelayedSwitch"];
deviceType["油烟机"] = fotileKeys;

// 消毒柜 TRD
var dcKeys = ["WorkStatus", "ClockSwitch", "Switch", "WorkMode", "AppointSwitch", "Appoint_StartTime", "CabinetStatus", "UpperRoom_Humi", "UpperRoom_Temp", "LowerRoom_Temp", "LeftTime_Hour", "LeftTime_Minute", "error",
    'AppointSwitch_Hour', 'AppointSwitch_Minute'
];
deviceType["消毒柜"] = dcKeys;

for (var i=0,len=fotileKeys.length; i<len; i++) {
    var item = fotileKeys[i];
    addDataItem(item, "0");
}


var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        deviceData: deviceData,
        debugMode: false,
        deviceType: deviceType,
        currentDeviceType: '',
        ws: undefined
    },
    methods: {
        uploadDeviceStatus: function () {
            console.log(new Date() + " -> uploadDeviceStatus");
            this.sendObject(this.packagedData);
        },
        addRow: function () {
            this.deviceData.push({
                "key": "",
                "value": ""
            })
        },
        toggleDebugMode: function () {
            this.debugMode = !this.debugMode;
        },
        switchTRD: function (targetKey) {
            this.updateTRD(targetKey);
        },
        updateTRD: function (targetKey) {
            this.currentDeviceType = targetKey;
            var _deviceData = [];
    
            for (var i=0,len=this.deviceType[targetKey].length; i<len; i++) {
                var item = this.deviceType[targetKey][i];
                _deviceData.push({
                    key: item, value: "0"
                });
            }
    
            this.deviceData = _deviceData;
        },
        sendObject: function (data) {
            var packageData = {
                from: "device",
                data: data
            };
            var dataToString = JSON.stringify(packageData);
            console.log(">>> send: " + dataToString);
            this.ws.send(dataToString);
        },
        setupWebSocket: function () {
            this.ws = new WebSocket("ws://localhost:8000");
    
            var self = this;
    
            this.ws.onopen = function(evt) {
                console.log("Connection open ...");
                self.ws.send("Hello WebSockets!");
            };
    
            this.ws.onmessage = function(evt) {
                console.log(new Date() + " Received Message: " + evt.data);
        
                try {
                    var data = JSON.parse(evt.data);
                    // 若收到 app 消息，则执行状态改变
                    if (data.from == 'app' && data.type == 'setDeviceStatus') {
                        var command = data.data;
                        for (var i=0,len=self.deviceData.length; i<len; i++) {
                            var item = self.deviceData[i];
                            if (command[item.key]) {
                                if (command[item.key].value) {
                                    self.deviceData[i].value = command[item.key].value;
                                } else {
                                    self.deviceData[i].value = command[item.key];
                                }
                                
                            }
                        }
                        self.uploadDeviceStatus();
                    }
                    
                } catch (error) {
            
                }
        
                // ws.close();
            };
    
            this.ws.onclose = function(evt) {
                console.log("Connection closed.");
            };
        }
    },
    computed: {
        packagedData: function () {
            var result = {};
            for (var i=0,len=this.deviceData.length; i<len; i++) {
                var item = this.deviceData[i];
                if (item.key.length===0 || item.value.length===0) {continue;}
                result[item.key] = {
                    value: item.value
                }
            }
            return result;
        }
    },
    mounted: function () {
        console.log('on mount');
        
        this.updateTRD('消毒柜');
        
        // setup websocket
        this.setupWebSocket();
    }
});

// var ws = new WebSocket("ws://localhost:8000");




