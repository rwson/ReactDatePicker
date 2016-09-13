/**
 * DatePicker.js
 * build by rwson @9/13/16
 * mail:rw_Song@sina.com
 */

"use strict";

import React, {Component} from "react";
import classname from "classname";

import "./DatePicker.css";

//  store the viewport size of window
const winWidth = screen.width,
    winHeight = screen.height,
    monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

/**
 * store events config
 */
let eventMap = {};

/**
 * store the finally HTML DOM Element
 */
let finalEl;

/**
 * fixed the date bug under safri browser
 */
function _Date(date) {
    return date instanceof Date ? date :
        !date ? new Date() : new Date(date.toString().replace(/\-/g, "/"));
}

/**
 * get week order of a day
 */
function _getDay(year, month, day) {
    //  if day param passed in undefined/null/empty string
    day = (day !== 0 && !day) ? 1 : day;
    return _Date(`${year}/${month}/${day}`).getDay();
}

/**
 * generate month days array according to year
 */
function _generateMonthDays(year) {
    return ((year % 4 === 0 && year % 100 != 0) || (year % 400 === 0)) ? [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] : [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

/**
 * transform one single to two
 */
function _toDouble(num) {
    return num < 10 ? ("0" + num) : num;
}

/**
 *  add a event on an element
 */
function _addEvent(el, type, callback) {
    el.addEventListener(type, callback, false);
}

/**
 * remove a event on an element
 */
function _removeEvent(el, type, callback) {
    el.removeEventListener(type, callback, false);
}

/**
 * get DOM element's position info at the webpage
 */
function _getBoundClientReact(el) {
    let info;
    if (el) {
        var xy = el.getBoundingClientRect();
        var top = xy.top - document.documentElement.clientTop + document.documentElement.scrollTop,
            bottom = xy.bottom,
            left = xy.left - document.documentElement.clientLeft + document.documentElement.scrollLeft,
            right = xy.right,
            width = xy.width || right - left,
            height = xy.height || bottom - top;

        info = {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height
        }
    }
    return info;
}

/**
 * generate a year array to render
 */
function _generateYears(year) {
    let yearArr = [];
    for (let i = year - 5, end = year + 6; i <= end; i++) {
        yearArr.push({
            num: i,
            value: i,
            picked: i === year
        });
    }
    return yearArr;
}

/**
 * generate a month array to render
 */
function _generateMonths(year, month, selected) {
    const sYear = selected.year;
    month = month - 1;
    return monthNames.map((name, index) => {
        return {
            name: name,
            value: index + 1,
            picked: index === month && year === sYear
        };
    });
}

/**
 * get info about a day
 */
function _getDateInfo(date) {
    date = _Date(date);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate()
    };
}

/**
 * generate a day array(42 days) to render
 */
function _generateDays(year, month, selected) {
    const curMonth = month,
        lastMonth = curMonth - 1,
        nextMonth = curMonth + 1,
        sYear = selected.year,
        sMonth = selected.month,
        sDate = selected.date;
    month = month - 1;

    let daysCounts = _generateMonthDays(year),
        firstDay = _getDay(year, curMonth),
        resArr = [],
        len = 0,
        days, lastDays;
    days = daysCounts[month];
    if (month === 0) {
        lastDays = 31;
    } else {
        lastDays = daysCounts[month - 1];
    }

    for (let iLast = lastDays, lastEnd = lastDays - firstDay; iLast > lastEnd; iLast--) {
        resArr.unshift({
            muted: true,
            type: "prev",
            month: lastMonth,
            value: iLast
        });
    }

    for (let i = 1; i <= days; i++) {
        resArr.push({
            muted: false,
            type: "current",
            month: curMonth,
            value: i,
            picked: year === sYear && curMonth === sMonth && i === sDate
        });
    }

    len = resArr.length;
    if (len < 42) {
        for (let start = 1, end = 42 - len; start <= end; start++) {
            resArr.push({
                muted: true,
                type: "next",
                month: nextMonth,
                value: start
            });
        }
    }

    return resArr;
}

/**
 * generate a unique id
 */
function _randomId() {
    return Math.random().toString(16).slice(2);
}

/**
 * return a formatted date string
 * @param date
 * @param format
 * @private
 */
function _getFormattedString(date, format) {
    const o = {
        "m+": date.getMonth() + 1,
        "d+": date.getDate()
    };
    if (/(y+)/gi.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")", "gi").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return format;
}

/**
 * Component Class
 */
export default class DatePicker extends Component {

    /**
     * constructor of this component
     */
    constructor(props) {
        super(props);
        this.state = {
            level: "day",
            year: null,
            month: null,
            day: null,
            dateObj: _Date(),
            today: _Date(),
            selected: {},
            isShow: false,
            target: null,
            position: {},
            years: [],
            months: [],
            days: []
        };
    }

    /**
     * component after mount
     */
    componentDidMount() {
        const {el, trigger, initDate} = this.props.config;
        let {dateObj} = this.state;
        let dateInfo;

        finalEl = el;
        if (finalEl && typeof finalEl === "string") {
            finalEl = document.querySelector(el);
        }

        //  the HTML DOM Elements do not exists
        if (finalEl === null) {
            return;
        }

        if (initDate) {
            dateInfo = _getDateInfo(initDate);
        } else {
            dateInfo = _getDateInfo(dateObj);
        }

        //  initialize the year array
        this.setState({
            selected: dateInfo,
            year: dateInfo.year,
            years: _generateYears(dateInfo.year),
            month: dateInfo.month,
            months: _generateMonths(dateInfo.year, dateInfo.month, dateInfo),
            day: dateInfo.date,
            days: _generateDays(dateInfo.year, dateInfo.month, dateInfo)
        });

        //  bind events
        trigger.forEach((eventName) => {
            _addEvent(finalEl, eventName, this.handleTrigger.bind(this));
            if (!eventMap[el]) {
                eventMap[el] = [];
            }

            //  store event key with events
            eventMap[el].push({
                el: finalEl,
                type: eventName,
                callback: this.handleTrigger.bind(this)
            });
        });
    }

    /**
     * handle passed in events
     * @param ev
     */
    handleTrigger(ev) {
        const {isShow} = this.state;
        const {onOpen} = this.props.config;
        const {target} = ev;
        let targetPos;
        targetPos = _getBoundClientReact(target);
        if (!isShow) {
            this.setState({
                isShow: true,
                target: target,
                position: {
                    top: targetPos.bottom + 230 > winHeight ? winHeight - 260 : targetPos.bottom + 10,
                    left: targetPos.left + 230 > winWidth ? winWidth - 260 : targetPos.left
                }
            });
            if (typeof onOpen === "function") {
                onOpen();
            }
        }
    }

    /**
     * handle passed in events, the event type is opposite
     */
    hidePicker(ev) {
        this.setState({
            isShow: false
        });
    }

    /**
     * prev btn click callback
     */
    handlePrevClicked() {
        let {level, year, month, selected} = this.state;
        switch (level) {
            case "year":
                year -= 12;
                this.setState({
                    year: year,
                    years: _generateYears(year),
                    days: _generateDays(year, month, selected)
                });
                break;
            case "month":
                year -= 1;
                this.setState({
                    year: year,
                    month: month,
                    months: _generateMonths(year, month, selected),
                    days: _generateDays(year, month, selected)
                });
                break;
            case "day":
                month -= 1;
                if (month < 0) {
                    month = 11;
                    year -= 1;
                }
                this.setState({
                    year: year,
                    month: month,
                    days: _generateDays(year, month, selected)
                });
                break;
            default:
                break;
        }
    }

    /**
     * next btn click callback
     */
    handleNextClicked() {
        let {level, year, month, selected} = this.state;
        switch (level) {
            case "year":
                year += 12;
                this.setState({
                    year: year,
                    years: _generateYears(year),
                    days: _generateDays(year, month, selected)
                });
                break;
            case "month":
                year += 1;
                this.setState({
                    year: year,
                    month: month,
                    months: _generateMonths(year, month, selected),
                    days: _generateDays(year, month, selected)
                });
                break;
            case "day":
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
                this.setState({
                    year: year,
                    month: month,
                    days: _generateDays(year, month, selected)
                });
                break;
            default:
                break;
        }
    }

    /**
     * click each year/month/day item
     * @param type
     * @param value
     * @param monthDis
     */
    handleItemClicked(type, value, monthDis = "") {
        const {onClose, onChange, autoClose, format} = this.props.config;
        let {selected, year, month, day} = this.state,
            tMonth = month, tSelected = {};
        switch (type) {
            case "year":
                this.setState({
                    level: "month",
                    year: value,
                    dateObj: _Date(`${year}/${value}/${day}`),
                    years: _generateYears(value),
                    days: _generateDays(value, month, selected)
                });
                break;
            case "month":
                this.setState({
                    level: "day",
                    month: value,
                    dateObj: _Date(`${year}/${value}/${day}`),
                    months: _generateMonths(year, value, selected),
                    days: _generateDays(year, value, selected)
                });
                break;
            case "day":
                if (monthDis === "prev") {
                    tMonth -= 1;
                    if (tMonth < 0) {
                        tMonth = 12;
                        year -= 1;
                    }
                } else if (monthDis === "next") {
                    tMonth += 1;
                    if (tMonth > 12) {
                        tMonth = 0;
                        year += 1;
                    }
                } else {
                    tMonth = month;
                }
                tSelected = _getDateInfo(`${year}/${tMonth}/${value}`);
                this.setState({
                    selected: tSelected,
                    dateObj: _Date(`${tSelected.year}/${tSelected.month}/${value}`),
                    year: tSelected.year,
                    month: tSelected.month,
                    day: value,
                    months: _generateMonths(tSelected.year, tSelected.month, tSelected),
                    days: _generateDays(tSelected.year, tSelected.month, tSelected)
                });
                if (typeof onChange === "function") {
                    onChange(tSelected);
                }

                this.setState({
                    isShow: false
                });
                if (typeof onClose === "function") {
                    onClose(tSelected);
                }
                break;
            default:
                break;
        }
        finalEl.value = _getFormattedString(this.state.dateObj, format);
    }

    /**
     * change the level of calendar
     * @param level target level
     */
    changeLevel(level) {
        this.setState({
            level: level
        });
    }

    /**
     * render years item
     * @returns {Array.<XML>}
     */
    renderYears() {
        const {years} = this.state;
        return !!(years && years.length) ? years.map((year) => {
            return (
                <li
                    className={classname({
                        picked: year.picked
                    })}
                    data-view={classname("year", {
                        picked: year.picked
                    })}
                    key={_randomId()}
                    onClick={this.handleItemClicked.bind(this, "year", year.value)}
                >{year.num}</li>
            );
        }) : null;
    }

    /**
     * render month item
     * @returns {Array.<XML>}
     */
    renderMonth() {
        const {months} = this.state;
        return !!(months && months.length) ? months.map((month) => {
            return (
                <li
                    className={classname({
                        picked: month.picked
                    })}
                    data-view={classname("month", {
                        picked: month.picked
                    })}
                    key={_randomId()}
                    onClick={this.handleItemClicked.bind(this, "month", month.value)}
                >{month.name}</li>
            );
        }) : null;
    }

    /**
     * render day items
     */
    renderDays() {
        const {days} = this.state;
        return !!(days && days.length) ? days.map((day) => {
            return (
                <li
                    className={classname({
                        muted: day.muted,
                        picked: day.picked
                    })}
                    data-view={classname(`day ${day.type}`, {
                        picked: day.picked
                    })}
                    onClick={this.handleItemClicked.bind(this, "day", day.value, day.type)}
                    key={_randomId()}
                >{day.value}</li>
            );
        }) : null;
    }

    /**
     * render the layout of Component
     * @returns {XML}
     */
    render() {
        const {isShow, position, level, years, year, month, day} = this.state;
        const style = {
            ...position,
            display: isShow ? "block" : "none"
        };
        const {todayBtn, confirmBtn, cancelBtn} = this.props.config;

        return (
            <div className="datepicker-container datepicker-dropdown datepicker-top-left" style={style}>
                <div className={classname("datepicker-panel", {
                    "datepicker-hide": level !== "year"
                })} data-view="years picker">
                    <ul>
                        <li data-view="years prev" onClick={this.handlePrevClicked.bind(this)}>‹</li>
                        {!!(years && years.length) ? <li data-view="years current">
                            {`${years[0].value} - ${years[years.length - 1].value}`}
                        </li> : null}
                        <li data-view="years next" onClick={this.handleNextClicked.bind(this)}>›</li>
                    </ul>
                    <ul data-view="years">
                        {this.renderYears()}
                    </ul>
                </div>
                <div className={classname("datepicker-panel", {
                    "datepicker-hide": level !== "month"
                })} data-view="months picker">
                    <ul>
                        <li data-view="year prev" onClick={this.handlePrevClicked.bind(this)}>‹</li>
                        <li data-view="year current" onClick={this.changeLevel.bind(this, "year")}>{year}</li>
                        <li data-view="year next" onClick={this.handleNextClicked.bind(this)}>›</li>
                    </ul>
                    <ul data-view="months">
                        {this.renderMonth()}
                    </ul>
                </div>
                <div className={classname("datepicker-panel", {
                    "datepicker-hide": level !== "day"
                })} data-view="days picker">
                    <ul>
                        <li data-view="month prev" onClick={this.handlePrevClicked.bind(this)}>‹</li>
                        <li data-view="month current"
                            onClick={this.changeLevel.bind(this, "month")}>{`${monthNames[month - 1]} ${day}`}</li>
                        <li data-view="month next" onClick={this.handleNextClicked.bind(this)}>›</li>
                    </ul>
                    <ul data-view="week">
                        <li>日</li>
                        <li>一</li>
                        <li>二</li>
                        <li>三</li>
                        <li>四</li>
                        <li>五</li>
                        <li>六</li>
                    </ul>
                    <ul data-view="days">
                        {this.renderDays()}
                    </ul>
                </div>
            </div>
        );
    }

    componentWillUnmount() {
        if (Object.keys(eventMap).length > 0) {
            Object.keys(eventMap).forEach((key) => {
                _removeEvent(eventMap[key][i].el, eventMap[key].type, eventMap[key].callback);
            });
        }
    }

}
