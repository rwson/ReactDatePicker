### ReactDatePicker

📅
React时间选择组件

#### ScreenShoot



#### Usage

    npm install ReactDatePicker --save
    
    //  ...
    
    //  ES6
    
    import React, { Component } from "react";
    import ReactDOM from "react-dom";
    
    import ReactDatePicker from "ReactDatePicker";
    
    class App extends Component {
    
        constructor(props) {
            super(props);
        }
        
        handleDateChange(date) {
            //  ...
        }
        
        handleClose(date) {
            //  ...
        }
        
        render() {
        
            const config = {
                initDate: "2016-09-12",
                format: "YYYY-mm-dd",
                onClose: this.handleClose.bind(this),
                onChange: this.handleDateChange.bind(this)
            };
        
            return (<div class="app">
                <ReactDatePicker config={config} />
            </div>);
        }
        
    }
    

#### API


属性名 | 意义 | 类型 | 默认 | 是否必须
---|---|---|---|---
el | 选择器(input框的class/id之类的) | String | N/A | 是
trigger | 在什么事件下显示选择器 | Array.&lt;String&gt; | N/A | 是
initDate | 默认时间 | Date/String | N/A | 是
format | 输出时间的格式 | String | N/A | 是
onOpen | 时间选择器刚显示的回调 | Fnnction | N/A | 否
onClose | 时间选择器关闭后的回调 | Fnnction | N/A | 否
onChange | 选择时间发生变化的回调 | Fnnction | N/A | 否