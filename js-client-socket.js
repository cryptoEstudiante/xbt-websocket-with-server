/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";
/**
*@version Beta Version 1, released November 1, 2017
*@fileoverview js-client-socket.js -
*<header style="font-size:20px"><b>Source Code Documentation</b></header><br>
*The file js-client-socket.js is the source code file for the JavaScript client
*that runs in "Bitcoin Price in Real Time: A Programming Demo....A Demo with
* a <em font-size="14" style= "color:#ff6666;"><b>WebSocket!</b></em>"
* <br><br>
* The Web pages you are viewing are documentation of the functions in
* file js-client-socket.js. The documentation was generated using JSDoc, an API
* documentation generator.
<br><br>
*<header style="font-size:20px"><b>Using the Documentation</b></header>
* The sections that follow describe the audience, terminology, scope, and
* perspective of the documentation.<br><br>
* <header style="font-size:16px"><b>Audience</b></header>
* The audience of this document are recruiters, software developers,
* and technical writers.
* <br><br>
* <header style="font-size:16px"><b>Terminology</b></header>
* This section defines how certain terms are used in the documentation.
* <ul>
* <li><strong>server</strong>  - In this document, "server" describes
* the BitFinex WebSocket server.</li>
*<br>
* <li><strong>client</strong>  - In this document, "client" describes
* the JavaScript client that runs in the browser using
* file js-client-socket.js.</li>
* </ul>
* <header style="font-size:16px"><b>Scope</b></header>
* In the scope of this document is a description of how the client
* implements selected functions from the application programming interfaces
* (APIs) it implements. Complete documentation
* of these APIs is out of the scope of this document. Following is a list of
* the APIs the client implements, with links to their complete documentation
* sets:
* <ul>
* <li>The <a class="my-link" href="#" onclick="window.open('https://api.highcharts.com/highcharts/','_blank')">
* Highcharts</a> API:  to create the chart displayed on the Web page.</li>
* <li>The <a class="my-link" href="#"
* onclick="window.open('https://html.spec.whatwg.org/multipage/web-sockets.html#network','_blank')">
* WebSocket interface</a>:  to open a connection with the server. The interface
* includes the following functions: <i>onopen</i>,
* <i>onclose</i>, <i>onerror</i>, and <i>onmessage</i>.</li>
* <li>The <a class="my-link" href="https://bitfinex.readme.io/v2/docs/ws-general">
* BitFinex WebSocket API Version 2</a>:  to receive bitcoin price updates
* from the server.</li>
* </ul>
*<header style="font-size:16px"><b>Perspective</b></header>
* The perspective of the documentation is that of the programmer who programmed
* the implementation.<br><br>
* <strong>Note</strong>  The documentation does not document an API to be
* implemented. Instead, the documentation describes an implementation already
* programmed, and its supporting functions.
*/
//START vars for socket code
var CURRENCY_PAIR =  "BTCUSD";

var errorDisplayed = false;
var webSocketBitFinex = null;
var channelIdBitFinex = -1;  //channel number from subscribed success msg!
var channelNameBitFinex; // received when subcription success!
var missedIntervals = 0;  // Leave as global--two functions set this.
var /*milliseconds for setTimeoutInterval*/TIMEOUT_INTERVAL = 12000;
//end vars for socket code
//
// Vars for testViewportSize
var TEST_WIDTH = 420;  /*Minimum pixel width permitted for demo to run*/
var TEST_HEIGHT = 320;/*Minimum pixel height permitted for demo to run*/
var STR_TEST_WIDTH = '420';
var STR_TEST_HEIGHT = '320';  /*smart phones are at about 480 x 320px*/

// Browser compatibility constants used in function detectCompatibleBrowser
// and its helper functions.
var COMPATIBLE_YES = "1";/*for detectBrowser functions*/
var COMPATIBLE_UNKNOWN = "00";/*for detectBrowser functions*/
var COMPATIBLE_NO = "0";/*for detectBrowser functions*/

var XBT_VALID_LOWER_BOUND = 1000.0000; /*for function isValidData*/
var XBT_VALID_UPPER_BOUND = 30000.0000;/*for function isValidData*/

var JS_CHART; /*Highchart pointer to the chart on the main page.*/

var DEBUG = 1; //turn on/off console logging for debug
var MY_TRACE = 1; //turn on/off console logging for trace

var heartbeatInterval = null; // Timer var for functions setTimeout and
    // clearInterval. Used in functions onopen() and endDemo()

// Messages that appear in an alert or dialog.
var STR_BROWSER_DISCONNECTED_ESPANOL = " No hay conexion a Internet\n\
    Intenta: Comprobar los cables de red, el modem y el router \n\
    Volver a conectarte a Wi-Fi \n\
    Ejecucion del Diagnostico de red de Windows: ERR_INTERNET_DISCONNECTED";

var STR_CHECK_CONNECTION = "There seems to be an issue with network connectivity.\n\
    Check your Internet connection, and then refresh the web page.";
//var STR_BROWSER_DISCONNECTED = " Connect to the Internet,
//and then reload the web page.";
var STR_EITHER_NO_CONNECTION_OR_BUSY = "Either there is no network connection\n\
    or BitFinex is too \n\
    busy to send updates.  Check your Internet connection, \n\
    and then reload the web page.";

var STR_VIEW_LATER = " Try viewing the Web page later.";
// WebSocket could be created, or not created when we use the next string.
var STR_CLOSING_WEBSOCKET = " The JavaScript client will close \n\
    any open Websocket.";
var STR_BAD_DATA = " The data received from BitFinex \n\
    has errors." + STR_VIEW_LATER;
var STR_GENERIC_ERROR = " The JavaScript client received an error, \n\
    and cannot continue." + STR_VIEW_LATER;
// Messages that are exceptions and may also be warning messages to the user
var STR_BROWSER_VIEWPORT_TOO_SMALL = 'To see real-time price \n\
    updates to the chart, the Web page requires a larger viewing area.\n\
    Increase the size of your browser window, or use a device\n\
    with a larger viewing area. Thanks.';
var STR_BROWSER_UNTESTED = ' The requested Web page was not tested with your \n\
   version of the browser.';
var STR_SOFTWARE_PROVIDED_AS_IS = "Your browser may not be compatible with the\n\
    demo.";
// var STR_BROWSER_VERSION_TOO_EARLY = " Use the current version of a browser,
// or one of the following: Mozilla Firefox (version 38 or later),
// or Google Chrome (version 41 or later). Thanks!";
var STR_BROWSER_VERSION_TOO_EARLY = " The Web page cannot be \n\
    displayed in your browser. Upgrade your browser to the recent Chrome, \n\
    Internet Explorer, Opera, Firefox or Safari to view the page. Thanks!";
var STR_BROWSER_VERSION_TOO_EARLY_FOR_WEBSOCKETS = " To view real-time price \n\
    updates, your browser must support a WebSocket. Use the recent \n\
    Chrome, Internet Explorer, Opera, Firefox or Safari to view the page.";
var STR_ERROR_LOGGED_FOR_REVIEW = "This is error is being logged for \n\
    review.";
// The Web page is not compatible with your browser. Upgrade
// your browser.

//Errors or info messages that end the demo after it is started
 var STR_UPDATES_WILL_PAUSE = "BitFinex must pause price updates.";
 var STR_UPDATES_WILL_RESUME = "BitFinex will resume price updates. \n\
     Please resubscribe.";
 var STR_SUB_FAILED = "Failed to subscribe to BitFinex price updates." +
      STR_VIEW_LATER;
 var STR_SUB_CANCELLED =  "BitFinex has cancelled the price update \n\
     subscription."  + STR_VIEW_LATER;
 var STR_UNKNOWN_CURRENCY_PAIR = "Unknown currency pair: ";
 var STR_FAILURE_TO_PROCESS_MSG = "Failure to process message.";
 var STR_USER_ENDS_DEMO = "I hope you enjoyed the demo.";
 // Default base cases for value of reason to end demo
 var STR_NO_ERROR = "No error.";
 var STR_NO_REASON = "No reason.";

// Exception string for internal use!
var STR_UNEXPECTED_PROGRAM_RESULT = "Unexpected result from execution of \n\
    the JavaScript client.";
var STR_WEBSOCKET_INTERFACE_NOT_SUPPORTED = "The WebSocket interface is not \n\
    supported.";
var STR_WEBSOCKET_NULL = "The WebSocket is Null.";

//Messages that appear in the WebSocket Activity box.
//\u2014
var STR_ARRIVING_MSG_PREFIX = "Incoming:\n";
var ERROR_MSG_PREFIX = STR_ARRIVING_MSG_PREFIX + "Error Message";
var INFO_MSG_PREFIX = STR_ARRIVING_MSG_PREFIX + "Info message.";
var SUB_MSG_PREFIX = STR_ARRIVING_MSG_PREFIX + "Subscription message.";
var UNSUB_MSG_PREFIX = STR_ARRIVING_MSG_PREFIX + "Cancelled Subscription message.";
var HEARTBEAT_MSG_PREFIX = STR_ARRIVING_MSG_PREFIX + "Heartbeat!";
var PRICE_UPPATE_MSG_PREFIX = "Incoming: Price \n update!";
var SNAPSHOT_MSG_PREFIX = STR_ARRIVING_MSG_PREFIX + "Price Snapshot!";

// Messages that appear in the WebSocket Activity box.
var STR_USERWAIT = "Updating...";
var STR_NO_WEBSOCKET_CREATED = " No WebSocket created.";
var STR_WEBSOCKET_CREATED= "Success, Websocket created!";
var STR_WEBSOCKET_CLOSED = "The WebSocket has closed.";
var STR_NO_WEBSOCKET_CONNECTION = "There is no connection with the server.";
var STR_SPACE = " ";
/* Function change_ImageInTitle()
 * On roll-over, flips the image that appears in the
 * document.images array to signal that there is a new page that
 * can be opened.
 * */
function change_ImageInTitle() {
  document.images["Popscicle"].src = "=Cursor_newwindowSergeySokoloff.png";
  return true;
}
function change_ImageInTitleBack() {
  document.images["Popscicle"].src = "=Popicon_1.gif";
  return true;
}

// Code for drop-down panel in title bar.
$("#flip").click(function(){
  $("#panel").toggle("slow");
});

// Code for drop-down panel in the aside container (see .css file)
$("#flip-aside-left").click(function(){
 $("#panel-aside-left").toggle("slow");
});

/**
* @summary Detects Opera and its version. This function is called by
* <i>function detectCompatibleBrowser</i>. If the function detects the browser,
* the function verifies that the version of the browser can support the
* features required by the client.
* @description <b>Comments</b><br>
* <i>Function detectOpera</i> is customized to detect Opera, and its version.
* The function creates an object with browser information, and returns
* a reference to the object. If the browser is not compatible with
* the client, the function displays an error message, and sets the
* <i>compatible</i> property of the object to the constant COMPATIBLE_NO.
* <br><br>
* <b>Returns</b><br>A reference to an object with the following
* properties:
* <ul>
* <li><i><b>name</b></i> {string} The name of the browser; otherwise,
* an empty string if the browser is not detected.</li>
* <li><i><b>found</b></i> {boolean} Indicates whether the function
* detected the browser:<br>
* <ul>
*     <li><strong>true</strong>. The browser is detected.</li>
*     <li><strong>false</strong>. The browser is not detected.</li>
* </ul>
* <li><i><b>compatible</b></i> (string} Indicates whether the browser is
* compatible with the client, which can be any of the following constants:</li>
*    <ul>
*     <li>COMPATIBLE_YES </li>
*     <li>COMPATIBLE_UNKNOWN</li>
*     <li>COMPATIBLE_NO</li>
*   </ul>
* </ul>
*  @see <i>function detectCompatibleBrowser</i>
*/
function detectOpera() {
  try {
    if (MY_TRACE === 1) {writeToConsole('TRACE: at detectOpera');}
    // Because of a compiler error:  Added qualifier of window to
    //  window.opr.addons
    var browserInfo = { name: "",
                         found: false,
                         compatible: COMPATIBLE_UNKNOWN
                       };
    var isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera ||
        navigator.userAgent.indexOf(' OPR/') >= 0;
    if (isOpera === true) {
      browserInfo.name = 'Opera';
      browserInfo.found = true;
      browserInfo.compatible = COMPATIBLE_YES; // Not sure which versions of
                                              // Opera to permit
      if (DEBUG===1) {
        writeToConsole('User has Opera');
        writeToConsole('Opera user agent string: ' + navigator.userAgent);
        writeToConsole('Opera has appVersion: ' + navigator.appVersion);
      }
      var mIndex = -1;
      if (navigator.appVersion.indexOf("OPR/")!== -1) {
        mIndex = navigator.appVersion.indexOf("OPR\/");

        if (DEBUG === 1){writeToConsole('Parsed OPR version '  +
            (navigator.appVersion).substr(mIndex +4,3));}
        if (parseInt((navigator.appVersion).substr(mIndex +4, 3),10) < 41) {
          browserInfo.compatible = COMPATIBLE_YES; // not sure which
                                                // versions of Opera to deny.
        }
      } else {
         if (DEBUG === 1){writeToConsole('User has Opera. However,\n\
             I cannot tell which version.');}
         browserInfo.compatible = COMPATIBLE_YES;
      }
    } // end if (isOpera == true)

    return browserInfo;

    } catch(e){
      if (DEBUG===1){writeToConsole("EXCEPTION in detectOpera(), name\n\
         and message: " + e.name+ " " +e.message + " ");}
      if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
      return browserInfo;
    }
} //end detectOpera


/**
* @summary Detects Firefox and its version. This function is called by
* <i>function detectCompatibleBrowser</i>. If the function detects the browser,
* the function verifies that the version of the browser can support the
* features required by the client.
* @description <b>Comments</b><br>
* <i>Function detectFirefox</i> is customized to detect Firefox, and its version.
* The function creates an object with browser information, and returns
* a reference to the object. If the browser is not compatible with
* the client, the function displays an error message, and sets the
* <i>compatible</i> property of the object to the constant COMPATIBLE_NO.
* <br><br>
* <b>Returns</b><br>
* A reference to an object with the following
* properties:
* <ul>
* <li><i><b>name</b></i> {string} The name of the browser; otherwise,
* an empty string if the browser is not detected.</li>
* <li><i><b>found</b></i> {boolean} Indicates whether the function
* detected the browser:<br>
* <ul>
*     <li><strong>true</strong>. The browser is detected.</li>
*     <li><strong>false</strong>. The browser is not detected.</li>
* </ul>
* <li><i><b>compatible</b></i> (string} Indicates whether the browser is
* compatible with the client, which can be any of the following constants:</li>
*    <ul>
*     <li>COMPATIBLE_YES </li>
*     <li>COMPATIBLE_UNKNOWN</li>
*     <li>COMPATIBLE_NO</li>
*   </ul>
* </ul>
*  @see <i>function detectCompatibleBrowser</i>
*/
function detectFirefox() {
  try {
    if (MY_TRACE === 1) {writeToConsole('TRACE: in detectFireFox()');}
    var browserInfo = { name: "",
                         found: false,
                         compatible: COMPATIBLE_UNKNOWN
                       };
    if (navigator.userAgent.indexOf("Firefox") !== -1 ) { //Firefox valid at
                                                          // 38 and later!
      // Defer (just for one browser make!) to using the userAgent string :-(
      // for browser detection.
      browserInfo.name = 'Firefox';
      browserInfo.found = true;

      if (DEBUG === 1) {
        writeToConsole('User has Firefox user agent string: ' +
            navigator.userAgent);
        writeToConsole('User has Firefox appVersion: ' + navigator.appVersion);
      }
      var mIndex = -1;
      //-->look in user agent string for something like the following:
      //Firefox/54.0  //

      mIndex = navigator.userAgent.indexOf("Firefox\/");
      //substr(pos, len);
      if (DEBUG === 1){writeToConsole('Parsed Firefox version ' +
          (navigator.userAgent).substr(mIndex +8,4));}
      if (parseInt((navigator.userAgent).substr(mIndex +8, 4),10) < 38) {
        alert("For a better user experience, upgrade your browser \n\
              to Mozilla Firefox version 38 or later. Thanks.");
        browserInfo.compatible = COMPATIBLE_NO;
      } else {
          browserInfo.compatible = COMPATIBLE_YES;
      }
    } //end if Firefox detected
    return browserInfo;
  } catch(e){
    if (DEBUG===1){writeToConsole("EXCEPTION in detectFirefox(), name and \n\
        message: " + e.name+ " " +e.message + " ");}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    return browserInfo;
  }
} //end function detectFirefox

/**
* @summary Detects Edge and its version. This function is called by
* <i>function detectCompatibleBrowser</i>. If the function detects the browser,
* the function verifies that the version of the browser can support the
* features required by the client. The successor to Internet Explorer version
* 11 was Edge version 12. Internet Explorer versions 10 and 11 support the
* the WebSocket interface. Edge versions 12 and 13 do not support the
* WebSocket interface.
* @description <b>Comments</b><br>
* <i>Function detectEdge</i> is customized to detect Internet Explorer,
* and its successor Edge.
* The function creates an object with browser information, and returns
* a reference to the object. If the browser is not compatible with
* the client, the function displays an error message, and sets the
* <i>compatible</i> property of the object to the constant COMPATIBLE_NO.
* <br><br>
* <b>Returns</b><br>
* A reference to an object with the following properties:
* <ul>
* <li><i><b>name</b></i> {string} The name of the browser; otherwise,
* an empty string if the browser is not detected.</li>
* <li><i><b>found</b></i> {boolean} Indicates whether the function
* detected the browser:<br>
* <ul>
*     <li><strong>true</strong>. The browser is detected.</li>
*     <li><strong>false</strong>. The browser is not detected.</li>
* </ul>
* <li><i><b>compatible</b></i> (string} Indicates whether the browser is
* compatible with the client, which can be any of the following constants:</li>
*    <ul>
*     <li>COMPATIBLE_YES </li>
*     <li>COMPATIBLE_UNKNOWN</li>
*     <li>COMPATIBLE_NO</li>
*   </ul>
* </ul>
*  @see <i>function detectCompatibleBrowser</i>
*/
 function detectInternetExplorerAndEdge() {
  try {
    if (MY_TRACE === 1) {writeToConsole('TRACE: at detectEdge()');}
    var browserInfo = { name: "",
                         found: false,
                         compatible: COMPATIBLE_UNKNOWN
                       };
    var ver; // version number
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      var ver = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);

      if (DEBUG === 1){ writeToConsole('User has MSIE version:' + ver);}
      browserInfo.name = "Internet Explorer";
      browserInfo.found = true;
    }
    if (browserInfo.found === false) {
      var trident = ua.indexOf('Trident/');
      if (trident > 0) {
        // IE 11 => return version number
        browserInfo.name = "Internet Explorer";
        browserInfo.found = true;
        var rv = ua.indexOf('rv:');
        ver = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);

        if (DEBUG === 1){ writeToConsole('User has Trident version:' + ver);}

      }
    }
     if (browserInfo.found === false) {
       var edge = ua.indexOf('Edge/');
       if (edge > 0) {
       // Edge (IE 12+) => return version number
        browserInfo.name = "Edge";
        browserInfo.found = true;
        if (DEBUG === 1){ writeToConsole('User has Edge version:' + ver);}
        ver =  parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
       }
     }

     if ((ver === 10) || (ver === 11) || (ver >= 14)) {
        browserInfo.compatible = COMPATIBLE_YES;
     }
     return browserInfo;

} catch(e){
    if (DEBUG===1){writeToConsole("EXCEPTION in detectEdge(), name and \n\
        message: " + e.name+ " " +e.message + " ");}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    return browserInfo;
  }
} //end function detectInternetExplorerAndEdge


/**
* @summary Detects Chrome and its version. This function is called by
* <i>function detectCompatibleBrowser</i>. If the function detects the browser,
* the function verifies that the version of the browser can support the
* features required by the client.
* @description <b>Comments</b><br>
* <i>Function detectChrome</i> is customized to detect Chrome, and its version.
* The function creates an object with browser information, and returns
* a reference to the object. If the browser is not compatible with
* the client, the function displays an error message, and sets the
* <i>compatible</i> property of the object to the constant COMPATIBLE_NO.
* <br><br>
* <b>Returns</b><br>A reference to an object with the following
* properties:
* <ul>
* <li><i><b>name</b></i> {string} The name of the browser; otherwise,
* an empty string if the browser is not detected.</li>
* <li><i><b>found</b></i> {boolean} Indicates whether the function
* detected the browser:<br>
* <ul>
*     <li><strong>true</strong>. The browser is detected.</li>
*     <li><strong>false</strong>. The browser is not detected.</li>
* </ul>
* <li><i><b>compatible</b></i> (string} Indicates whether the browser is
* compatible with the client, which can be any of the following constants:</li>
*    <ul>
*     <li>COMPATIBLE_YES </li>
*     <li>COMPATIBLE_UNKNOWN</li>
*     <li>COMPATIBLE_NO</li>
*   </ul>
* </ul>
*  @see <i>function detectCompatibleBrowser</i>
*/
function detectChrome(){
  try {
    if (MY_TRACE === 1) {writeToConsole('TRACE: at detectChrome');}
    var browserInfo = { name: "",
                         found: false,
                         compatible: COMPATIBLE_UNKNOWN
                       };
    // Use object detection from Window object
    // if ((navigator.userAgent.indexOf("Chrome") !== -1 && !isEdge)
    if (!!window.chrome) { // && !!window.chrome.webstore) { //<+++Version 41
                                                       // did NOT have store!
      browserInfo.name = 'Chrome';
      browserInfo.found = true;

      if (DEBUG === 1) {
        writeToConsole('User has Chrome & user agent string: ' + navigator.userAgent);
        writeToConsole('User has Chrome appversion: ' + navigator.appVersion);
       }
    } else {
      return browserInfo; //should be empty string
    }
      //get the version
      //-->look in appVersion string for something like the
      //following: Firefox/54.0
      if (navigator.appVersion.indexOf("Chrome/")!== -1) {
        var mIndex = -1;
        mIndex = navigator.appVersion.indexOf("Chrome\/");
        //substr(pos, len);
        if (DEBUG === 1){writeToConsole('Parsed Chrome version '  +
            (navigator.appVersion).substr(mIndex +7,3));}
        if (parseInt((navigator.appVersion).substr(mIndex +7, 3),10) <= 49) {
          alert("The Web page works better with a current browser version.\n\
              Upgrade to the latest version of Chrome. Thanks.");
          browserInfo.compatible = COMPATIBLE_NO;
         } else if (parseInt((navigator.appVersion).substr(mIndex +7, 3),10) >= 50) {
           browserInfo.compatible = COMPATIBLE_YES;
           if (DEBUG === 1){writeToConsole("User has Chrome with compatible\n\
                  version.");}
         }
      } else {
        if (DEBUG === 1){writeToConsole('User has Chrome but I cannot tell\n\
            which version.');}
        // HERE I let the user continue even though I dont know the version of the browser!
      } //end get Chrome version
      return browserInfo;
  } catch(e){
    if (DEBUG===1){writeToConsole("EXCEPTION in detectChrome(), name and \n\
       message: " + e.name+ " " +e.message + " ");}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    return browserInfo;
  }
} //end function detectChrome

/**
* @summary Detects Safari and its version. This function is called by
* <i>function detectCompatibleBrowser</i>. If the function detects the browser,
* the function verifies that the version of the browser can support the
* features required by the client. The WebSocket interface is supported in
* Safari 6 and later.
* @description <b>Comments</b><br>
* <i>Function detectSafari</i> is customized to detect Safari, and its version.
* The function creates an object with browser information, and returns
* a reference to the object. If the browser is not compatible with
* the client, the function displays an error message, and sets the
* <i>compatible</i> property of the object to the constant COMPATIBLE_NO.
* <br><br>
* <b>Returns</b><br> A reference to an object with the following
* properties:
* <ul>
* <li><i><b>name</b></i> {string} The name of the browser; otherwise,
* an empty string if the browser is not detected.</li>
* <li><i><b>found</b></i> {boolean} Indicates whether the function
* detected the browser:<br>
* <ul>
*     <li><strong>true</strong>. The browser is detected.</li>
*     <li><strong>false</strong>. The browser is not detected.</li>
* </ul>
* <li><i><b>compatible</b></i> (string} Indicates whether the browser is
* compatible with the client, which can be any of the following constants:</li>
*    <ul>
*     <li>COMPATIBLE_YES </li>
*     <li>COMPATIBLE_UNKNOWN</li>
*     <li>COMPATIBLE_NO</li>
*   </ul>
* </ul>
*  @see <i>function detectCompatibleBrowser</i>
*/
function detectSafari() {
  try {
    if (MY_TRACE === 1) {writeToConsole('TRACE: at detectSafari()');}
    var browserInfo = { name: "",
                         found: false,
                         compatible: COMPATIBLE_UNKNOWN
                       };
    // Safari 3.0+ "[object HTMLElementConstructor]"
    // window.HTMLElement�returns a function which is named
    // HTMLElementConstructor(){}.
    var isSafari = ((/constructor/i.test(window.HTMLElement)) &&
                (navigator.userAgent.indexOf('Safari') !== -1 &&
                navigator.userAgent.indexOf('Chrome') === -1));
    // in use strict safari not declared, neither is the arg p
    // (function (p) {return p.toString() === "[object
    // SafariRemoteNotification]";})
    // (!window['safari'] || safari.pushNotification);
    if (isSafari === true) {// Require Safari 10 or 11
      browserInfo.name = 'Safari';
      browserInfo.found = true;
    if (DEBUG===1) {
       writeToConsole('User has Safari.');
       writeToConsole('Safari user agent string: ' + navigator.userAgent);
       writeToConsole('Safari has appVersion: ' + navigator.appVersion);
    }
     // Get version
    var safIndex;
    var fullVersion;
    var offsetVersion;

    if ((safIndex = navigator.userAgent.indexOf("Safari"))!==-1) {
      fullVersion = navigator.userAgent.substring(safIndex +7);
      if ((offsetVersion = navigator.userAgent.indexOf("Version"))!==-1) {
        saf_Version = navigator.userAgent.substring(offsetVersion+8);
      }
      if (saf_Version < 10) {
        alert("Browser version is not current. The Web page\n\
           works better with Safari version 10 or later. Thanks." );
        browserInfo.compatible = COMPATIBLE_NO;
      } else if (saf_Version >= 10) {
        browserInfo.compatible = COMPATIBLE_YES;
      } else {
         if (DEBUG === 1){writeToConsole('User has Safari; however, I cannot\n\
          tell which version.');}
          browserInfo.compatible = COMPATIBLE_YES;
         // HERE I let the user continue with the browser even though I dont
         // know the version of Safari
      }
    } //end if safIndex
  }  //end if Safari
  return browserInfo;
  } catch(e){
    if (DEBUG===1){writeToConsole("EXCEPTION in detectSafari(), name and\n\
        message: " + e.name+ " " +e.message + " ");}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    return browserInfo;
  }
} //end function detectSafari()

/**
* @summary Stops early versions of browsers from running the demo
* for the following reasons:
* <ul>
* <li>No support for the WebSocket interface.</li>
* <li>No support for the features of JQuery the client requires.</li>
* </ul>
* This function is called on the <i>JQuery ready event</i> by
* <i>function verifyRequirementsAndStartSocket</i>. To run the demo, the
* browser must support the features used by the browser&mdash;this is a
* requirement.
* @description <b>Comments</b><br>
* <i>Function detectCompatibleBrowser</i> calls the following
*  helper functions:<br>
* <ul>
* <li>detectChrome</li>
* <li>detectFirefox</li>
* <li>detectInternetExplorerAndEdge</li>
* <li>detectOpera</li>
* <li>detectSafari</li>
* </ul>
*<b>Functionality of Helper Functions</b><br>
*<i>Function detectCompatibleBrowser</i> calls each helper function
* until one helper function detects the browser. Each helper function
* returns an object with the following browser information properties:
*<ul>
* <li><i><b>name</b></i> {string} The name of the browser; otherwise,
* an empty string if the browser is not detected.</li>
* <li><i><b>found</b></i> {boolean} Indicates whether the helper function
* detected the browser:<br>
* <ul>
*     <li><strong>true</strong>. The browser is detected.</li>
*     <li><strong>false</strong>. The browser is not detected.</li>
* </ul>
* <li><i><b>compatible</b></i> (string} Indicates whether the browser is
* compatible with the client, which can be any of the following constants:</li>
*    <ul>
*     <li>COMPATIBLE_YES </li>
*     <li>COMPATIBLE_UNKNOWN</li>
*     <li>COMPATIBLE_NO</li>
*   </ul>
* </ul>
* If the helper function detects the browser, the function discovers the
* version of the browser. A helper function eliminates an incompatible
* version by setting the <i>compatible</i> property of the object to
* COMPATIBLE_NO. Following is a partial list of the browser versions
* that are too early to run the demo because they do not support the
* WebSocket interface:
* <ul>
* <li> Internet Explorer version 9 and earlier.</li>
* <li> Chrome version 49 and earlier.</li>
* <li> Edge versions 12 and 13.</li>
* <li> Firefox version 37 and earlier.</li>
* <li> Opera version 40 and earlier.</li>
* <li> Safari version 6 and earlier.</li>
* </ul>
* The helper function displays an error message to the user if the browser
* is not compatible.<br><br>
* <b>Action on an Incompatible Browser</b><br>
* <i>Function detectCompatibleBrowser</i> throws an
* exception if the <i>compatible</i> property indicates the browser is not
* compatible. <br><br>
* <b>Browsers Undetected</b><br>
* The function does not detect all browsers. However, the function allows
* undetected browsers to run the demo anyway. Following are the browsers
* undetected:<br>
* Blink, Facebook, Dolphin, Onion, Ghostery, iCab, Intego Rook, Maxthon,
* Mercury, Puffin, Grazing, Perfect, Diigo, Sleipnir, Maven, Night Web,
* Red Onion, UC, Obigo, Konqueror, and Flock.
* @throw STR_BROWSER_VERSION_TOO_EARLY
* @throw STR_UNEXPECTED_PROGRAM_RESULT <br>
*/
function detectCompatibleBrowser(){
  try {
    if (MY_TRACE === 1) {writeToConsole('starting detectCompatibleBrowser');}
    //var browserInfo = detectInternetExplorer();
    var browserInfo = detectInternetExplorerAndEdge();
    if (browserInfo.found !== true) {
       browserInfo = detectFirefox();
    }
    if (browserInfo.found !== true) {
       browserInfo = detectOpera();
    }
    if (DEBUG === 1) {writeToConsole("After Opera! ");}
      if (browserInfo.found !== true){
        browserInfo = detectSafari();
      }
    if (DEBUG === 1){writeToConsole("After Safari! ");}
    if (browserInfo.found !== true) {
         browserInfo = detectChrome();
    }
     if (DEBUG === 1){writeToConsole("After Chrome! ");}
     if (DEBUG === 1){writeToConsole(browserInfo.name +browserInfo.found
         + browserInfo.compatible);}

    if (browserInfo.found !== true) {
       browserInfo = detectEdge();
    }
    if (DEBUG === 1) {writeToConsole("After Edge! ");}
    if ((browserInfo.found === true) &&
        (browserInfo.compatible === COMPATIBLE_YES)){
      if (DEBUG === 1) {writeToConsole("found true & compatible yes!");}
      return;
    } else if (browserInfo.found === false) { //Assumption--Entire browser code
                                // was traversed, and the code did not find
                                // the make of the browser.
                               // Or, the browser is one for which we did not
                               // test, which could be any of the following:
                               // IOS, Blink, Facebook, Android, UC, and so on.
      alert(STR_SOFTWARE_PROVIDED_AS_IS + STR_BROWSER_UNTESTED);
      // Permit script execution to continue with this unknown browser
      if (DEBUG===1) {writeToConsole('Unknown browser. User Agent= ' +
          navigator.userAgent);}
    } else if (browserInfo.compatible === COMPATIBLE_NO) {
      if (MY_TRACE === 1) {writeToConsole('Browser version is too early,\n\
          throwing exception!');}
      throw new Error(STR_BROWSER_VERSION_TOO_EARLY);
      // Added Nov. 7, 2017
    } else if (browserInfo.compatible === COMPATIBLE_UNKNOWN) {
     if (DEBUG===1) {writeToConsole("COMPATIBLE_UNNOWN");}
    } else {
      if (MY_TRACE === 1) {writeToConsole('detectCompatibleBrowser() \n\
          produced an unexpected result');}
      throw new Error(STR_UNEXPECTED_PROGRAM_RESULT);
    }
  } catch (e) {
    if (DEBUG===1) {writeToConsole('EXCEPTION in detectCompatibleBrowser()'+
        "name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    throw e;
  }
}//end function detectCompatibleBrowser

 /**
 * @summary Gets the viewport size for the browser window.
 * @description
 * <b>Comments</b><br>
 * If the viewport is too small to display the Web page chart, the function
 * displays a message that asks the user to increase the size of the browser
 * window, and throws an exception.
 * <br>  The caller catches the exception, and calls <i>function endDemo</i>
 * to end client execution. The caller is <i>function
 * verifyRequirementsAndStartSocket</i> that runs on the
 * <i>JQuery ready event</i>.
 *@throws STR_BROWSER_VIEWPORT_TOO_SMALL
 * <br><br>
 * To determine whether a viewport size is too small, the function
 * compares the actual size to the following constants:
 * <ul>
 * <li>TEST_WIDTH</li>
 * <li>TEST_HEIGHT</li>
 * </ul> <br><br>
 **/
function testViewportSize() {
  try {
    var viewportWidth;
    var viewportHeight;

    if (MY_TRACE===1){writeToConsole("TRACE: at Function testViewportSize()");}
    // The more standards-compliant browsers (mozilla/netscape/opera/IE7) use
    // window.innerWidth and window.innerHeight
    if (typeof window.innerWidth !== 'undefined') {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
    } else if ((typeof document.documentElement !== 'undefined') &&
               (typeof document.documentElement.clientWidth !=='undefined') &&
               (document.documentElement.clientWidth !== 0)) {
        // IE6 in standards compliant mode (i.e. with a valid doctype
        //  as the first line in the document
        viewportWidth = document.documentElement.clientWidth;
        viewportHeight = document.documentElement.clientHeight;
    } else {// older versions of IE

      viewportWidth = document.getElementsByTagName('body')[0].clientWidth;
      viewportHeight = document.getElementsByTagName('body')[0].clientHeight;
    }
    if ((viewportWidth < TEST_WIDTH) || (viewportHeight < TEST_HEIGHT)) {

      if (DEBUG===1){ (writeToConsole("Viewport size too small: width\n\
           x height=" + viewportWidth +'x'+ viewportHeight));}
      if (MY_TRACE === 1) {writeToConsole('Viewport size too small:, \n\
           throwing exception.');}
        throw new Error (STR_BROWSER_VIEWPORT_TOO_SMALL);

    }
  } catch(e) {
    if (DEBUG===1){writeToConsole("EXCEPTION in testViewportSize()" +
        "name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    throw e;
  }
} // end func testViewportSize

/**
* @summary Validates a price.
* @description <b>Comments</b> <br><br>
* Determines whether <i>currPrice</i> is a number, and within the bounds set
* by the constants XBT_VALID_LOWER_BOUND and XBT_VALID_UPPER_BOUND.<br>
* The function is called by <i>function checkMessageForUpdate</i>
* to test the validity of the last transaction price extracted from the
* server message.
*@returns {boolean} A boolean that indicates whether the price is valid.
*@param {number} currPrice The last transaction price.
**/
function isValidData(currPrice) {
  try {
    if (MY_TRACE === 1){ writeToConsole('TRACE: isValidData');}
    // var price_from = $('.filter-price #price_from').val();
    // var price_to = $('.filter-price #price_to').val();
    var isNumberRegExp = new RegExp(/^[-+]?[0-9]+(\.[0-9]+)*$/);

    if (!isNumberRegExp.test(currPrice)) {
      if (DEBUG===1){writeToConsole ("Current price of " + currPrice +
          "is not a number");}
         //alert("Price quote received, not a number (NaN).\n");
      return false;
             // bail out here, something isn´t right!
    }
    if (!((Number(currPrice).toFixed(2)> XBT_VALID_LOWER_BOUND) &&
            (Number(currPrice).toFixed(2) < XBT_VALID_UPPER_BOUND))) {
      if (DEBUG===1){writeToConsole("Current price of " + currPrice +
          "is not within bounds.");}
      return false;
    } else {
      return true;
    }
  } catch(e) {
    if (DEBUG===1){writeToConsole("EXCEPTION in isValidData()+ name and \n\
        message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    return false;
  }
}//end function isValidData()

 /**
 * @summary Updates only the <strong>Activity</strong> box of the Web page.
 * The <strong>Activity</strong> box is
 * a table of <i>div</i> elements that are cells of the table.
 * If there is no change to a table cell in the parameter list,
 * the value void(0) is passed for the parameter. The value of
 * void(0) is the same as undefined.
 * @param {string} statusCellMsg Text to display in the element with
 *     the attribute <i>id</i> of <i>m-TableCell1-Status</i>.
 * @param {string} heartCellDisplayStyle Display style of element with
 *     the attribute <i>id</i> of<i>m-TableCell-Heart</i>.
 * @param {string} heartCellGraphic Graphic to display in the element with
 *     the attribute <i>id</i> of <i>m-TableCell-Heart</i>.
 * @description <b>Comments</b> <br>
 * HTML element attributes are defined in the file main.css.
 * The chart on the Web page is updated in
 * <i>function checkMessageForUpdate</i>&mdash;a different function.
  * <br><br>
 * This function is called by the message helper function that extracts the
 * message from the event object. For a list of message helper functions,
 * see <i>function onmessage</i>.
 */
 function updateActivityBoxGUI(statusCellMsg,
                    heartCellDisplayStyle,
                    heartCellGraphic)  {
   try {
     if (MY_TRACE === 1){writeToConsole("TRACE: at updateActivityBoxGUI");}
     if (DEBUG === 1){writeToConsole("PARAMS ARE: statusCell:" +
         statusCellMsg + "heartCellMsg:" + heartCellDisplayStyle +
         "heartCellGraphic: " + heartCellGraphic);}

     if (statusCellMsg !== undefined) {
       document.getElementById('m-TableCell1-Status').textContent =
           statusCellMsg;
     }

     if (heartCellDisplayStyle !== undefined) {
       document.getElementById("m-TableCell-Heart").style.display =
           heartCellDisplayStyle;
     }

     if (heartCellGraphic !== undefined) {
       document.getElementById("m-TableCell-Heart").innerHTML =
           heartCellGraphic;
     }
  } catch (e) {
   if (DEBUG===1){writeToConsole("EXCEPTION in updateActivityBoxGUI(), \n\
       name and message: " + e.name+ " " +e.message + " ");}
   if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  }
} //end function UpdateGUI

/**
 * @description Handles the message from BitFinex at the open event
 * for a WebSocket. The open event is a response to the creation of
 * a new WebSocket in <i>function startSocket</i>. <i>Function onopen</i>
 * is a function of the HTML 5 WebSocket interface, and is an entrypoint into
 * the application.
 * <i>Function onopen</i> also monitors the connection with BitFinex by
 * tracking the frequency of BitFinex messages.<br><br>
 * <b>Comments</b><br>  Contains the anonymous function that runs after
 * every time-out interval. The time-out interval is defined in milliseconds,
 * and is the constant TIMEOUT_INTERVAL in the client script.
 * The client sets the time-out interval with the JavaScript engine using
 * <i>function setInterval</i>.<br><br>
 * <b>Monitoring the Connection</b><br>
 * Typically, Bitinex sends a message every five seconds.
 * To track the frequency of messages, there is a collaboration between
 * the anonymous function that runs after
 * every time-out interval (the interval code), and <i>function
 * onmessage</i>, which handles messages received at the WebSocket, as follows:
 *  When <i>function onmessage</i> receives a message, it sets the global
 * variable <i>missedIntervals</i> to zero. The interval code
 * increments <i>missedIntervals</i> by one, and then
 * checks its value.
 * If there are two intervals without a message from BitFinex
 * <i>(missedIntervals===2)</i>, the interval code sends a <i>ping</i>
 * message to the server to test the WebSocket
 * connection. The interval code expects a <i>pong</i> response within
 * five seconds from the server, or the code calls <i>function endDemo</i>.
 <br>
 * @param {object} event  The event object for the open WebSocket event.
 * <i>Function onopen</i> is called by the JavaScript engine
 * when a message from the server is received at the network socket. The
 * JavaScript engine provides the message to the application-level WebSocket
 * using the event object.<br>
 **/
function onopen(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at onopen(), CONNECTED!');}
    var numberOfPings = 0; //Track the number of ping messages sent by the
                          // client.
    var numberSubscribeTrys = 0;  //Track the number of times we request
                                  // a price update subscription from BitFinex.
    // Clear the Web page GUI.
    updateActivityBoxGUI("Connected to BitFinex!", "", "");
    if (MY_TRACE === 1){writeToConsole('TRACE: BEFORE subscribe');}
    webSocketBitFinex.send(JSON.stringify({"event":"subscribe",
        "channel":"ticker","pair":"BTCUSD"}));
    if (heartbeatInterval === null) {
      missedIntervals = 0;
      heartbeatInterval = setInterval(function() {
        try {
          missedIntervals++;
          if (DEBUG===1){writeToConsole("Interval Fired: at anon \n\
              func onopen()");}
          if (DEBUG===1){writeToConsole("missedIntervals = " + missedIntervals);}

          // Test for three intervals without a message from BitFinex
          // (3 * TIMEOUT_INTERVAL), i.e: there were no calls to the message
          // handler function onmessage for 3 * TIMEOUT_INTERVAL seconds.
          if (missedIntervals === 3) {
            // When the connection is disabled or lost during the demo, the
            // sequence of messages is the following:
            // 1) "testing connection," 2) "connection test failed,"
            // and 3)"no connection."
            if (DEBUG===1){writeToConsole("Missed Messages = 3");}
            updateActivityBoxGUI("Connection test failed.", "", "");
            throw new Error("Too many intervals without a message.");
          } // end missed message equal 3

            // Test for two intervals without a message from BitFinex
            // (2 * TIMEOUT_INTERVAL), i.e: there were no calls to the message
            // handler function onmessage for 2 * TIMEOUT_INTERVAL seconds.
            if (missedIntervals === 2) {
            //Two intervals without a message (2 * TIMEOUT_INTERVAL).
            //Send a ping message to test the connection

            if (numberOfPings === 2) { //Stop the client script from pinging:
               // Send a subscribe message to try and restart the price
               // updates again!
              webSocketBitFinex.send(JSON.stringify({"event":"subscribe",
                  "channel":"ticker","pair":"BTCUSD"}));
              if (DEBUG===1){writeToConsole("Sent: Subscribe request subscription\n\
                  message!");}
              numberOfPings = 0;
              numberSubscribeTrys++;
              if (numberSubscribeTrys === 2) {
                endDemo(STR_SUB_FAILED);
              }
            } else {
              webSocketBitFinex.send(JSON.stringify({"event":"ping"}));
              if (DEBUG===1){writeToConsole("Missed Messages = 2, \n\
                  Pinging server. ");}
              numberOfPings++;
            }
            // After client sends BitFinex a ping, exchange should answer
            // with "pong" within five seconds.
            // The value of TIMEOUT_INTERVAL exceeds five seconds to provide
            // time for the V8 engine to clear the stack, and execute this
            // asynchronous code.
            //
            // Clear the heart graphic displayed on the Web page.
            updateActivityBoxGUI("No message from server for seven seconds. \n\
                Outgoing: A PING message", 'none', "(Testing connection with server.)");
          } // end missed message equal two
        } catch(e) {
          if (DEBUG===1){writeToConsole("EXCEPTION in onopen(), name and \n\
              message: " + e.name + " " + e.message);}
          if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}

          // Clear the heart graphic in case it is displayed on the Web page.
          document.getElementById("m-TableCell-Heart").style.display='none';

          if (e.message === "Too many intervals without a message.") {
           alert(STR_EITHER_NO_CONNECTION_OR_BUSY);
          } else {
            alert(STR_CHECK_CONNECTION);
          }
          endDemo(STR_EITHER_NO_CONNECTION_OR_BUSY);
        } // end catch exception in anon. function
      }, TIMEOUT_INTERVAL);
    }// closes if hearbeat === null
  } catch (e) {
    if (DEBUG===1){writeToConsole("EXCEPTION in onopen(), name and message: "
        + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  }
} //end method onopen()

/**
 * @summary Extracts the error message from the message event object,
 * and updates the GUI to indicate an incoming error message.
 * This function is a  helper function for handling an <i>error</i> message
 * sent by the server.
 * @description
 * <b>Comments</b><br>
 * This function is called by <i>function onmessage</i>, which passes a
 * reference to its event object on the call. The message event object has
 * the following two properties: 1) <i>isTrusted</i>, and 2) <i>data</i>.
 * Following is the  <i>data</i> property for an <i>error</i> message in
 * JSON format:
 *   <pre>      {
 *          "event": "error",
 *           "msg": ERROR_MSG,
 *           "code": ERROR_CODE
 *        }</pre>
 * @param {object} event The event object received by <i>function onmessage</i>
 * at the message event.
 * @returns {string} The BitFinex error string, or the constant STR_NO_ERROR.<br>
 * @see <i>Function onmessage</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 BitFinex WebSocket API</a>.
**/
function checkMessageForError(event) {
  try {
    if (MY_TRACE===1){writeToConsole('TRACE: at checkMessageForError()');}
    var objData = JSON.parse(event.data)
    var strError = STR_NO_ERROR;

    if (DEBUG===1) {writeToConsole('Error received: #'+ objData.code);}
    if (DEBUG===1){writeToConsole('event.data PARSED= ' + objData);}
      // There are two properties to a message event 1) isTrusted & 2) data
      // if a message says failure.
    switch (objData.code) {
      case 10301:  // Already subscribed
        strError = STR_NO_ERROR;  //this error is not critical.
        break;
      case 10302:  // Unknown channel
        strError = ERROR_MSG_PREFIX + "\"Subscription request failed.\"";
        break;
       case 10300:  // Subscription failed (generic)
       case 10400: // Subscription failed (generic) for an unsubscribed message.
       case 10401: // Not subscribed
         strError =  ERROR_MSG_PREFIX + "\"BitFinex subscription request \n\
             failed.\"";
         break;
       case 10000: //Unknown event
       case 10001: //Unknown pair
         strError = ERROR_MSG_PREFIX + "\"Unknown event or currency pair.\"";
         break;
       default:
          if (DEBUG===1) {writeToConsole('UNDOCUMENTED error received: #'+
              objData.code);}
          strError = ERROR_MSG_PREFIX + "Unexpected error code.";
    } //end switch
    updateActivityBoxGUI(strError, void(0),"");
    if (DEBUG === 1) {writeToConsole ("Error is: "+ strError);}
  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in checkMessageForError(), \n\
       name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  } finally {
    return strError;
  }
} // end  function checkMessageForError

/**
 * @summary Extracts the information message from the
 * message event object, and updates the GUI with the information.
 * This function is a helper function for handling an
 * <i>info</i> message sent by the server.
 * @description
 * <b>Comments</b><br>
 * This function is called by
 * <i>function onmessage</i>, which passes a reference to its message
 * event object on the call. The message event object has the following two
 * properties: 1) <i>isTrusted</i>, and 2) <i>data</i>. The <i>data</i>
 * property is in JSON format, and contains the information. <br><br>
 * In the server response to a subscription request, the
 * information is the version of the BitFinex WebSocket API the client is
 * using. At other times, the information is about service continuity.
 * For example, price updates are delayed while the Trading Engine
 *  refreshes its data.<br><br>
 * <strong>Note</strong> If there is a service delay in price updates, the
 * client does not wait on the server for service resumption. Instead, the
 * client ends the demo. For more information, see information messages
 * 20051, 20060, and 20061 in the source code for this function.
 * @param {object} event The event object received by <i>function onmessage</i>
 * at the message event.
 * @returns {string} The BitFinex information string, or the constant
 * STR_NO_ERROR.<br>
 * @see <i>Function onmessage</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 * BitFinex WebSocket API</a>.
 */
function checkMessageForInfo(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at checkMessageForInfo()');}
    var objData = JSON.parse(event.data);
    var strInfo = STR_NO_ERROR;
    if (DEBUG===1){writeToConsole('event.data PARSED= ' + objData);}
    // Message could be just version info e.g.  {"event":"info","version":1.1}
    if ("version" in objData) {
      if (DEBUG === 1){writeToConsole('VERSION INFO = '+ objData.version);}
        var str = INFO_MSG_PREFIX + "Version of Websocket API is "
            + objData.version + ".\"";
        //set the message, and clear any heartbeat graphic
        updateActivityBoxGUI( str, void(0), "");
      } else {
       // After function JSON.parse is applied, the data property/property of
       // the event object for an information message is the following:
       // { "event":"info",
       //     "code": "<CODE>",
       //     "msg": "<MSG>"
       // }
        switch(objData.code) {
          case 20051://Stop/Restart Websocket Server (try to reconnect)
          // exact msg: "Stopping. Please try to reconnect"
          // raw: {"event":"info","code":20051,"msg":"Stopping. Please try
          // to reconnect"}
          // stringified  "{\"event\":\"info\",\"code\":20051,\"msg\":\"Stopping.
          // Please try to reconnect\"}"
            strInfo = INFO_MSG_PREFIX + "\"" + objData.msg + "\"";
            break;
          case 20060:// Refreshing data from the Trading Engine.
            // Please pause any activity and resume after
            // receiving the info message 20061 (it should take 10 seconds
            // at most).
            // strError = STR_ARRIVING_MSG_PREFIX + "Info\u2014Refreshing trading engine...";
            // pause activity for 10 seconds.";
            strInfo = INFO_MSG_PREFIX + STR_UPDATES_WILL_PAUSE;
             break;
          case 20061:  // Done Refreshing data from the Trading Engine.
                       // You can resume normal activity. It is advised to
                       // unsubscribe/subscribe again all channels.prototype
                       // document.getElementById("m-TableCell-Heart").
                       // innerHTML = "<strong>Price quotes are restarting.
                       // The trading engine is refreshed.</strong>";
                       //strError = STR_ARRIVING_MSG_PREFIX + "Info\u2014Done refreshing trading";
                       // engine...resume updates.";
            strInfo = INFO_MSG_PREFIX + STR_UPDATES_WILL_RESUME;
            break;
          default:
            if (DEBUG === 1){writeToConsole('UNDOCUMENTED Info, code: ' +
               objData.code);}
            strInfo = INFO_MSG_PREFIX + STR_UNEXPECTED_PROGRAM_RESULT;
        } //end switch
      // If the info is just version info, I already updated the GUI with that
      // info. However, display the abbreviated error message set in the
      // switch statment.
      updateActivityBoxGUI(strInfo, void(0), "");
    } //end else
  } catch (e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in checkMessageForInfo(), \n\
        name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    if (DEBUG === 1){writeToConsole('Info #:' + objData.code + 'Info message: '
        + objData.message);}
  } finally {
      return strInfo;
  }
} // end checkMessageForInfo

/**
 * @summary Verifies a subscription confirmation message. This function is a
 * helper function for handling an
 * <i>subscribed</i> message sent by the server.
 * @description
 * <b>Comments</b><br>
 * This function is called by <i>function onmessage</i>, which passes
 * a reference to its event object on the call. The function verifies that
 * the currency pair subscribed to is bitcoin/U.S. Dollar, an sets the
 * variables <i>channelIdBitFinex</i> and <i>channelIdBitFinex</i>.
 * The function updates the GUI to indicate an incoming subscription
 * confirmation message. Following is the <i>event.data</i> property for
 * a subscribe message in JSON format:
 * <pre>
 {  "event":"subscribed",
    "channel":"ticker",
    "chanId":3,
    "symbol":"tBTCUSD",
    "pair":"BTCUSD" }
 </pre>
 * @throws STR_UNKNOWN_PAIR (The subscription request contains an unknown
 *                            currency pair.)
 * @param {object} event The event object received by <i>function onmessage</i>
 *  at the message event.
 * @returns {string} A string that indicates whether there was an error, which
 * can be one of the following constants:<br>
 *   STR_SUB_FAILED, or STR_NO_ERROR.<br>
 * @see <i>Function onmessage</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 * BitFinex WebSocket API</a>.
 */
function checkMessageForSubscribed(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at \n\
        checkMessageForSubscribed()');}
    if (DEBUG === 1){writeToConsole('objData.event = SUBSCRIBED');}
    var strError = STR_NO_ERROR;
    var objData = JSON.parse(event.data);
    // FOR TEST var objData = JSON.parse(event);
    if (DEBUG===1){writeToConsole('event.data PARSED= ' + objData);}
    // set message and clear heart cell
    updateActivityBoxGUI(SUB_MSG_PREFIX + "You are subscribed to Bitcoin \n\
        price updates.", void(0), "");
    // Set channel Id and name
    if (DEBUG === 1){writeToConsole('In front of channel ID init.');}
    channelIdBitFinex = objData.chanId;
    if (DEBUG === 1){writeToConsole('CHANNEL_ID='+ channelIdBitFinex);}
    channelNameBitFinex = objData.channel;

   if (!(objData.pair === CURRENCY_PAIR)) {
     if (DEBUG===1) {writeToConsole('objData.pair != tBTCUSD');}
     strError = STR_SUB_FAILED;
     throw new Error(STR_UNKNOWN_CURRENCY_PAIR+ objData.pair);
   }
 } catch(e) {
   if (DEBUG === 1) {writeToConsole ("EXCEPTION in \n\
       checkMessageForSubscribed(), name and message: " + e.name + " "
       + e.message);}
   if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
   strError = STR_SUB_FAILED;
 } finally {
    return strError;
 }
}  //end function checkMessageForSubscribed

/**
 * @summary Updates the GUI to indicate an incoming message
 * that cancels the price update subscription. This function is a
 * helper function.
 * @description
 * <b>Comments</b><br>
 * This function is called by <i>function onmessage</i> when an
 * unsubscribed message is received at the WebSocket.
 * <br><br>
 * <strong>Function never called.</strong> An <i>unsubscribed message</i> is an
 * acknowledgement of a client request to unsubscribe. However, the client
 * does not request to cancel its subscription. Consequently,
 * <i>function checkMessageForUnsubscribed</i> is not called. This function
 * is included for completeness, and as an optional implementation for
 * future releases.
 * <br>
 * @param {object} event The event object received by function onmessage
 * at the message event.<br>
 * @returns {string} STR_SUB_CANCELLED
 * @see <i>Function onmessage</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 * BitFinex WebSocket API</a>.
 **/
function checkMessageForUnsubscribed(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at \n\
        checkMessageForUnsubscribed()');}
     if (DEBUG === 1){writeToConsole('objData.event = UNSUBSCRIBED');}

     // Set message and clear the heart graphic from the Activity box.
     updateActivityBoxGUI(UNSUB_MSG_PREFIX + "\"Subscription Bitcoin updates\n\
     is cancelled.\"", void(0), "");
  } catch (e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in \n\
        checkMessageForUnsubscribed(), name and message: " + e.name + " "
        + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  } finally  {
    return STR_SUB_CANCELLED;
  }
} //end unsubscribedSubscription

/**
 * @summary Verifies a heartbeat message, and updates
 * the GUI to indicate an incoming heartbeat message.
 * This function is a helper function for handling a
 * <i>heartbeat</i> message sent by the server.
 @description <br>
 * <b>Comments</b><br>
 * If there is no activity on the WebSocket connection for five seconds,
 * the server sends a <i>heartbeat</i> message to the client.
 * A <i>heartbeat</i> message indicates that the WebSocket
 * connection is open. Any exception raised in this function is not
 * thrown to the caller. This function is called by
 * <i>function onmessage</i>,  which passes its message event object on the
 * call.
 * @param {object} event The event object received by <i>function onmessage</i>
*  at the message event.
 * @returns {string} STR_NO_ERROR
 * @see <i>Function onmessage</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 * BitFinex WebSocket API</a>.
 **/
function checkMessageForHeartbeat(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: atcheckMessageForHeartbeat()');}
    if (DEBUG === 1){writeToConsole('HEARTBEAT!');}
    updateActivityBoxGUI(HEARTBEAT_MSG_PREFIX ,void(0),
        "<img src='1206567239782949660Anonymous_heart_1_svg_thumb.png' \n\
        style='width:15px;height:15px;'>");
    } catch (e) {
      if (DEBUG === 1) {writeToConsole ("EXCEPTION in checkMesageForHeartbeat(),\n\
          name and message: " + e.name + " " + e.message);}
      if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    } finally {
      // (Best Effort here: ignore an exception
      // and hope the condition fixes itself on the next
      // message received).
      return STR_NO_ERROR;
    }
 } //end functioncheckMessageForHeartbeat

/**
 * @summary Verifies a pong message, and updates the GUI to indicate
 * an incoming pong message. This function is a helper function for handling
 * a <i>pong</i> message sent by the server.
 * @description
 * <b>Comments</b><br>
 * This function is called by
 * <i>function onmessage</i>, which passes a reference to its event object
 * on the call. Following is the <i>event.data</i> property for a pong message
 * in JSON format:
 *<pre>{"event":"pong"} </pre>
 * A <i>pong</i> message is a response to a <i>ping</i> message sent by the
 * client during execution of the time-out interval code in
 * <i>function onopen</i>.
 * @param {object} event The event object received by <i>function onmessage</i>
*  at the message event.
 * @returns {string} STR_NO_ERROR
 * @see <i>Function onmessage</i>
 * @see <i>Function onopen</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 * BitFinex WebSocket API</a>.
 **/
function checkMessageForPong(event)  {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at checkMessageForPong()');}
    if (DEBUG === 1){writeToConsole('objData = PONG!');}

    missedIntervals = 0;
    //set table Heart cell with text
    updateActivityBoxGUI(STR_ARRIVING_MSG_PREFIX+ "PONG!", void(0), "(Connection with server\n\
        verified!)" );

  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in checkMessageForPong, name\n\
        and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  } finally {
    // If exception, ignore
    return STR_NO_ERROR;
  }
} //end function checkMessageForPong

//
// Assumption for this func is that toFixed(2) was applied!!
//
function checkBaseTen(currPrice) {
  if (MY_TRACE === 1){writeToConsole('TRACE: at checkBaseTen()');}
  // Handle case of no decimal
  var strPrice = "";
  if (currPrice.toString().indexOf(".") === -1) {
    if (DEBUG === 1){writeToConsole('currPrice has no decimal.');}
    strPrice = (currPrice.toString()).concat(".00");
  } else {
    //OK, decimal present, but ensure there are two decimal places!
    var numDecimalPlaces = ((currPrice.toString().split(".")))[1].length;
    if (DEBUG === 1){writeToConsole('Number of decimals is '
        + numDecimalPlaces);}
    if (numDecimalPlaces === 0) {
      strPrice = (currPrice.toString()).concat("00");
    } else if (numDecimalPlaces === 1) {
      strPrice = (currPrice.toString()).concat("0");
    } else if (numDecimalPlaces === 2) { //10/31
      strPrice = (currPrice.toString());
    }
  } //end else
    return strPrice;
}//end function checkBaseTen


/**
 * @summary Extracts the last transaction price from the message event
 * object, and updates the GUI with the new price. This function is a helper
 * function for handling a <i>price update</i> message sent by
 * the server. The function is called by <i>function onmessage</i> that
 * passes a reference to its message event object on the call.
 * @description
 * <b>Comments</b><br>
 * A price update message includes the last transaction price as property LAST.
 * Following are all the data properties included in a price update message:
 *   <pre>   mid [price) (bid + ask) / 2
         BID	[price]	Innermost bid
         ASK	[price]	Innermost ask
         LAST   [price]	The price at which the last order executed
         low    [price]	Lowest trade price of the last 24 hours
         high	[price]	Highest trade price of the last 24 hours
         volume [price] Trading volume of the last 24 hours
         timestamp [time] The timestamp at which this information
   </pre>
 * After extracting the last transaction price, the function calls
 * <i>function isValidData</i> to validate the price.  If the price is valid,
 * the function updates the Web page by calling <i>function
 * updateActivityBoxGUI</i>. The function updates the
 * chart using <i>method addPoint</i>, a member of the Highcharts series object.
 * @param {object} event The event object received by <i>function onmessage</i>.
 * Receiving a message at the network socket triggers an event. The message is
 * delivered to the client at the application level using the event object.
*  <br>
 * @returns {string} A string that indicates whether there was an error.
 * @throws STR_GENERIC_ERROR
 * @throws STR_BAD_DATA
 * @see <i>Function onmessage</i>
 * @see <i>function updateActivityBoxGUI</i>
 * @see <i>function isValidData</i>
 * @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
 * BitFinex WebSocket API</a>.
 *@see The <a href="https://www.highcharts.com/">HighCharts API</a>.
 **/
function checkMessageForUpdate(event) { //just the data
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at testMessageForUpdate()');}
    var objData = JSON.parse(event.data);
    // FOR TEST var objData = JSON.parse(event);
    if (DEBUG===1){writeToConsole('event.data PARSED= ' + objData);}
    if (DEBUG===1){writeToConsole('data passed=[0]: ' + objData[0]);}
    if (DEBUG===1){writeToConsole('data passed=[1]: ' + objData[1]);}
    // Clear the heart graphic, in case it is displayed now
    updateActivityBoxGUI("",void(0),"");  //clear hearbeat and clear arrival
        // message
        // If not info/error, heartbeat or snapshot then data must be an update,
        // e.g., here is the price update data set with arrows drawn to indicate
        // what data each property contains:
        // "[3<--CHANNEL_ID,[2543.1, <--BID_SIZE float
        //          0.8139695,<-- bid size
        //          2543.7,<--ask
        //          0.733, <-- ask size
        //          121.9,<-- daily change
        //          0.0503,<-- daily change percent
        //          2543.8,<-- LAST
        //          16438.84877194, Timestamp
        //          2587.4,<--high
        //          2416.2]]"<--low
        // WHERE 3--at the start-- is the CHANNEL_ID
         //[ BitFinex docs say the high-level format is the following:
          //CHANNEL_ID,
          //CHANNEL_NAME,
           //[ UPDATE_MESSAGE ],
         // ] //However, channel name never shows up in their update message.
    // Channel ID at beginning of object means that the message is a price
    // update message. Note: CHANNEL NAME is not in the response,
    // only Channel ID is, and that is different than what the
    // BitFinex docs say
    var strPrice = "";
    var strError = STR_NO_ERROR;
    if (objData[0] === channelIdBitFinex) { //(objData.event != 'info'))
      if (DEBUG===1){writeToConsole('channelIdBitFinex agrees!');}
      // In case of error, just notify the user of message arrival
      // and clear any Heartbeat graphic.
      updateActivityBoxGUI(PRICE_UPPATE_MSG_PREFIX, void(0),"");
       var m_info = objData[1];// Skip over the CHANNEL_ID,
                               // and start at the array of price info
       if (DEBUG === 1){writeToConsole('UPDATE--LAST is ' + m_info[6]);}
       var currPrice = Number(Number(m_info[6]).toFixed(2));
       if (DEBUG === 1){writeToConsole('CURRENT PRICE is ' + currPrice);}
       if (!(isValidData(currPrice))) {
         if (DEBUG === 1){writeToConsole('Price failed IsValid() \n\
             test in function onMessage()');}
           strError = STR_BAD_DATA;
           throw new Error(STR_BAD_DATA);
       } else { //DATA OK
         strPrice = checkBaseTen(currPrice);
         if (strPrice === "") { //unanticipated error
           if (DEBUG === 1){writeToConsole('ERROR: currPrice is empty!');}
           strError = STR_BAD_DATA;
           throw new Error(STR_BAD_DATA);
         }
        if (DEBUG === 1){writeToConsole('PRICE to show in GUI:  ' + strPrice);}
        var price = "$" + strPrice;
        updateActivityBoxGUI(void(0), void(0), price);
        JS_CHART.series[0].addPoint([Number(Number(currPrice))], false, true);
        JS_CHART.redraw();
      } //end else DATA OK
    } else { // channelID does NOT agree with the one we received
             // with the subscription confirm message!
        strError = STR_GENERIC_ERROR;
    }
  } catch (e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in checkMessageForUpdate, \n\
        name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    strError = e.message; //STR_GENERIC_ERROR;
  } finally {
      return strError;
  }
} //end function checkMessageForUpdate(event)

/**
*@summary A function stub to represent processing a snapshot message.
* This function must extract a price snapshot from a
* message event object, and update the Web page GUI with
* any price update. Following is the information in the <i>data</i> property
* of the event object for a snapshot message:
* <pre>
 [
   CHANNEL_ID,
   CHANNEL_NAME,
   [
     [ UPDATE_MESSAGE ],
   ]
 ]
 </pre>
* @param {object} event The event object received by <i>function onmessage</i>
* at the message event.<br>
*@description <br>
* <b>Comments</b><br>
* <strong>Function never called.</strong> This function is included for
* completeness, and as an optional implementation for future releases.
* The BitFinex WebSocket API documentation version 2.0 states that a
* snapshot message is sent by the server after a subscription
* confirmation message. However, testing shows the server does not send
* the price snapshot message.
* <br>
* @returns {string} A string that indicates whether there was an error,
* which can be one of the following constants:
*  STR_GENERIC_ERROR or STR_NO_ERROR. <br>
* @see <i>Function onmessage</i>
* @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
* BitFinex WebSocket API</a>.
 */
function checkMessageForSnapshot(event){
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at checkMessageForSnapshot()');}
    var objData = JSON.parse(event.data);
    if (DEBUG===1){writeToConsole('objData=' + objData);}
    var snapshotData = objData[2];

    updateActivityBoxGUI(SNAPSHOT_MSG_PREFIX, void(0),"");
    return STR_NO_ERROR;

  } catch (e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in checkMessageForSnapshot, \n\
        name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    return STR_GENERIC_ERROR;
  } //end catch
}//end function


/**
*@summary Handles a message received at the WebSocket. This function is a
* member of the HTML 5 WebSocket interface, and is an entrypoint into the
* application. On the message event, the function is passed an event object
* by the JavaScript engine. The event object has the following two properties:
* 1) <i>isTrusted</i>, and 2) <i>data</i>. The actual message is available
* in the <i>data</i> property. <br>
* @description <b>Comment</b><br>
* The function discovers the type of the message
* by calling <i>method JSON.parse</i> on the <i>data</i> property. Based on the
* message type, the function calls one of the following helper functions,
* with the event object as the parameter:
 <ul>
   <li>checkMessageForError</li>
   <li>checkMessageForInfo</li>
   <li>checkMessageForSubscribed</li>
   <li>checkMessageForUnsubscribed</li>
   <li>checkMessageForHeartbeat</li>
   <li>checkMessageForPong</li>
   <li>checkMessageForSnapshot</li>
   <li>checkMessageForUpdate</li>
   </ul>
*The helper function extracts the message from the event object, and
*calls <i>function updateActivityBoxGUI</i> to display a summary of the message
*to the user. All helper functions return a string to <i>function onmessage</i>
*to indicate whether the demo should end. For example, if there is an error,
*the helper function displays an error message to the user, and returns an error
*string. If the error is irrecoverable, <i>function onmessage</i> ends the demo
*by calling <i>function endDemo</i>. <br><br><i>Function onmessage</i> also
*tracks the frequency of messages from the server. When the function
*receives a message, it sets the value of the global variable
*<i>missedIntervals</i> to zero. Variable <i>missedIntervals</i> tracks the
*number of intervals without a message from the server, and is analyzed by
*the client at every time-out interval. For more information,
*see <i>function onopen</i>.
*@param {object} event  The event object for the message event.
*<br>
* @throws
* <ul>
* <li>STR_UNEXPECTED_PROGRAM_RESULT</li>
* <li>STR_FAILURE_TO_PROCESS_MSG</li>
* </ul>
* @see function onopen
* @see The <a href="https://bitfinex.readme.io/v2/docs/ws-general">
* BitFinex WebSocket API</a>.
* <br>
**/
function onmessage(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at onmessage()');}
    // reset the counter for missed heartbeats or data messages
    missedIntervals = 0;  //some kind of msg was received.
    var reasonToQuitDemo = STR_GENERIC_ERROR;

    var objData = JSON.parse(event.data);
    var strData = new String(event.data); //Used by heartbeat message

    if (DEBUG===1){writeToConsole('event.data parsed = ' + objData);}
    if (DEBUG===1){writeToConsole('event.data raw = ' + event.data);}
    if (DEBUG===1){writeToConsole('event.data stringified =' +
        JSON.stringify(event.data));}

    // Clear heart graphic in case it is displayed
    updateActivityBoxGUI("Waiting...", void(0), "");
    // The handler for each type of message should return
    // a string to method onmessage(). If the string contains an error,
    // the return value then becomes the reason to end the
    // demo, i.e: endDemo(reason);
    // Function endDemo(reason) is called at the end of
    // method onmessage().
    if (objData.event === "error") {
      if (DEBUG === 1){writeToConsole('in front of ERROR test');}
      //Analyze message for error codes 10300, 10301, 10302, 10000
      reasonToQuitDemo = checkMessageForError(event);

    } else if (objData.event === 'info') {
      if (DEBUG === 1){writeToConsole('in front of INFO test');}
      reasonToQuitDemo = checkMessageForInfo(event);

    } else if (objData.event === 'subscribed'){
      if (DEBUG === 1){writeToConsole('in front of subscription test!');}
      reasonToQuitDemo = checkMessageForSubscribed(event);
    } else if (objData.event === 'unsubscribed') {
      if (DEBUG === 1){writeToConsole('in front of unsubscribed test!');}
      reasonToQuitDemo = checkMessageForUnsubscribed(event);

      // NOTE: Both snapshot and hearbeat messages start with CHANNEL_ID
      // Check for heartbeat message first
    } else if ((strData).search("hb") !== -1) { //heartbeat
      reasonToQuitDemo =checkMessageForHeartbeat(event);
    } else if ((objData[0].CHANNEL_ID === channelIdBitFinex) &&
           (objData[1].CHANNEL_NAME === channelNameBitFinex)) {
      reasonToQuitDemo = checkMessageForSnapshot(event);
    } else if (objData.event === "pong") {
      reasonToQuitDemo = checkMessageForPong(event);
    } else if (objData[0] === channelIdBitFinex) {
      reasonToQuitDemo = checkMessageForUpdate(event);
    } else {
      //if (DEBUG===1) writeToConsole("Unknown message type!");
      reasonToQuitDemo = STR_NO_ERROR; //STR_UNEXPECTED_PROGRAM_RESULT +
          // STR_LOGGED_FOR_INVESTIGATION;
      //throw new Error(reasonToQuitDemo);
    }
    if ((reasonToQuitDemo !== STR_NO_REASON) &&
        (reasonToQuitDemo !== STR_NO_ERROR)){
      if (DEBUG===1) writeToConsole(STR_FAILURE_TO_PROCESS_MSG + "Returned \n\
                         false from a checkMessageFor helper function.");
      throw new Error(reasonToQuitDemo);
    }
  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in onMessage,\n\
        name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}

    //Do not clear the table cells of the Activity box, yet.
    // The cells were reset with the appropriate text in the
    // helper function for each message type*/
    endDemo(reasonToQuitDemo);
  } finally {
    // reset the counter for missed heartbeats
    missedIntervals = 0;  //Some kind of message was received at the WebSocket.
               // Therefore, the BitFinex connection is still alive.
  }// end finally
} // end onmessage

/**
*@summary Listens for the close event, and handles the event. This function
* updates the GUI to indicate the WebSocket is closed. The
* function is a member of the HTML 5 WebSocket interface, and is an
* entrypoint into the application. This function is called by the
* JavaScript engine when there is network error, for example, no Internet
* connection.
*@description
* <b>Comments</b><br>After a network error, the first function called by
*  the JavaScript engine  is <i>Function onerror</i>.
* The call to <i>function onerror</i> is followed by a call to
* <i>function onclose</i>.
* @param {object} event The event object for the close event.
**/
function onclose(event) {
  try {
    var str;
    if (MY_TRACE === 1){writeToConsole('TRACE: at onclose()');}
    if (webSocketBitFinex === null) {
      str = STR_NO_WEBSOCKET_CREATED;
    } else {
       str = STR_NO_WEBSOCKET_CONNECTION;
    }
    updateActivityBoxGUI(str, void(0), "");
    // If connetion close is normal, the error code === 1000.
    //
    // 10-22 Comment this code out for now.
    // I do not see any reason to alert the user.
    // If there is a network error, the function onerror
    //handles it.
     if (event.code !== 1000) {
      // Test whether user online: USE OF THIS TEST IS DEBATABLE
       if (!navigator.onLine) {
         if (DEBUG === 1){writeToConsole(STR_WEBSOCKET_CLOSED +
             ": Navigator != online.");}
           //alert(STR_NO_WEBSOCKET_CONNECTION); //STR_CHECK_CONNECTION
       } else {
         if (DEBUG === 1) {writeToConsole(STR_WEBSOCKET_CLOSED +
             ": Navigator online.");}
           //alert(STR_EITHER_NO_CONNECTION_OR_BUSY);
       }
     } //end if error code != 1000
    // 10-17 If there is no network connection onerror is called two times,
    // and I believe this is from some change in the new Chrome upgrade?
    // There is now a new error that appears in the console:
    // "failed: WebSocket is closed before the connection is established."
    // in addition to the ERR: net::ERR_INTERNET_DISCONNECTED from previous
    // versions. Therefore, the script is adding two inline error dic to the
    // main Web page when endDemo is called.
    // updateActivityBoxGUI(STR_WEBSOCKET_CLOSED, void(0), "");
    // alert(STR_CHECK_CONNECTION);
  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in onclose, name and message: "
        + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  }
} //end function/method onclose()

/**
* @summary Handles an error event. <i>Function onerror</i> is a member of
* the HTML 5 WebSocket interface, and is an entrypoint into the application.
* @description
* <b>Comments</b><br>
* Displays an error message to the user, and
* calls <i>function endDemo</i> to end the demo.<br<
* @param {object} event The event object for the error event.
*<br>
**/
function onerror(event) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at onerror');}
   //Clear the heart graphic from a preceding heartbeat!
   updateActivityBoxGUI("", void(0),"");
   // There is a MessageEvent interface
    //  * defined at html.spec.whatwg.org/multipage/comms.html#network
    //  * Here is what an event object looks like:
    //  * CloseEvent {wasClean: true, code: 1005, reason: "", type: "close",
    //  *  target: WebSocket�}
    //
    if (DEBUG===1) {writeToConsole('Event =' + JSON.stringify(event));}
    if (DEBUG===1) {writeToConsole('Event type =' + event.type);}
    if (DEBUG===1) {writeToConsole('Event code =' + event.code);}
       //event message interface

    alert(STR_CHECK_CONNECTION);
    endDemo(STR_CHECK_CONNECTION); //STR_GENERIC_ERROR

  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in onerror, name and message: "
      + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}

    // Oct 17: Workaround for new behavior: two onerror callbacks by the
    // JavaScript engine when there is not network connection. There is not
    // an additional callback as a WebSocket error, as follows:
    // "failed: WebSocket is closed before the connection is established."
    // in addition to the ERR: net::ERR_INTERNET_DISCONNECTED that was called
    // in previous browser versions. To avoid two calls to endDemo, add a
    // flag that is handled in endDemo
      endDemo(STR_GENERIC_ERROR);

  }
} //end function onerror()

/**
* @summary Creates a WebSocket connected to BitFinex.
* @description <b>Comments</b><br>
* This function is called on the <i>JQuery ready event</i>. This function tests
* whether "WebSocket" is in window, the JavaScript global object.
* If WebSocket is not in window, the function throws an exception.
* Otherwise, the function trys to create the WebSocket.
* If WebSocket creation is successful, the response from the
* server is an event handled by <i>function onopen</i>, the event listener.
* @throws
* <ul>
* <li>STR_WEBSOCKET_INTERFACE_NOT_SUPPORTED</li>
* <li>STR_WEBSOCKET_NULL</li>
* </ul>
*/
 function startSocket() {
   try {
     if (MY_TRACE === 1){writeToConsole('TRACE: at startSocket()');}
     //Modernizr is NOT working for me with WebSocket, so I write my own test
     // for support of WebSocket object

     if (('WebSocket' in window) && (typeof WebSocket === 'function')) {
       if (DEBUG===1){writeToConsole('WebSockets SUPPORTED!');}
        webSocketBitFinex = new WebSocket('wss://api.bitfinex.com/ws/2');

        if (webSocketBitFinex !== null) {
           updateActivityBoxGUI(STR_WEBSOCKET_CREATED, void(0), "");
        }
     } else {
       if (DEBUG===1){writeToConsole(STR_WEBSOCKET_INTERFACE_NOT_SUPPORTED);}
       updateActivityBoxGUI(STR_NO_WEBSOCKET_CREATED, void(0), "");
       showDialog("Your browser does not support  the WebSocket interface.",
               STR_BROWSER_VERSION_TOO_EARLY_FOR_WEBSOCKETS,'prompt',false);
       throw new Error (STR_WEBSOCKET_INTERFACE_NOT_SUPPORTED);
     }
    // Test result on failure: If there is no connection to the Internet, the
    // JavaScript engine calls method onerror() of the client. The console
    // message is the following:
    // WebSocket connection to <URL> failed:
    // Error in connection establishment: net::ERR_INTERNET_DISCONNECTED
    // Then, the Javascript engine calls method onclose().
    // In the preceding case, the test for a null socket in method onclose()
    // is never executed. The engine throws the net::ERR_INTERNET_DISCONNECTED
    // exception, and it is directly caught by method onerror().
    if (webSocketBitFinex === null) {
      showDialog("Error",STR_GENERIC_ERROR,'prompt', false);
      alert(STR_NO_WEBSOCKET_CREATED + STR_GENERIC_ERROR);
      throw new Error (STR_WEBSOCKET_NULL);
    } else { //assumption: WebSocket created

      webSocketBitFinex.onopen = function(event) { onopen(event); };
      webSocketBitFinex.onclose = function(event) { onclose(event); };
      webSocketBitFinex.onmessage = function(event) { onmessage(event); };
      webSocketBitFinex.onerror = function(event) { onerror(event); };
    }
  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in start_sockets(), \n\
        name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
   throw e;
  }

} //end function startSocket()

/**
 * @summary Creates the initial chart displayed on the Web page
 * at demo startup. The function uses the Highcharts API to
 * create the chart.<br><br>
 * @description <b>Comments</b><br><br>
 * </i>Function createChart</i> is called by <i>function
 * verifyRequirementsAndStartSocket</i>  that runs on the <i>JQuery ready
 * event</i>.
 * <pre>-----------------------------------------------------------------------
  Note: The first eight prices displayed on the Web page chart are
  hard-coded prices, and not real-time prices. The prices are hard-coded to
  maintain the user experience, until a server app can be implemented.
  For more information, see "Sprint Backlog" in the readme.md file
  of the GitHub repository for the demo.
--------------------------------------------------------------------------</pre>
 * @see The <a href="https://www.highcharts.com/">HighCharts API</a>.
 * @see verifyRequirementsAndStartSocket
 **/
function createChart() {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at createChart()');}
    var options = {
      chart: {
        backgroundColor: '#333a56',  //dkgrey 22252cblue #BEC5D3 22252c #c0b3a0
        borderColor: '#3f3250',//Defaults to #335cad was #ff6666
        borderWidth: 10,  //in pixels-In styled mode, the stroke is set with
                        // the .highcharts-background class.
        renderTo: 'container_Chart',

        type: 'spline',
        animation: Highcharts.svg,

        events: {
              // Fires when the chart is finished loading.
              // load event fires AFTER images are loaded
        }
      },
        //644f7f
        colors: ['#ffffff', '##3f3250', '#3b88ad', '#8cc83c', '#ee2c2c',
            '#3b88ad','#c19fd0'],

        credits: {
            enabled: true,
            text: 'Data server: www.BitFinex.com',
            style:{ "fontSize": "10px" }
        },
        title:  {
              text: 'Bitcoin Price in U.S. Dollars',
              style:{ "color": "#ffffff", "fontSize": "16px" }
        },

        subtitle:  {
              style:{ "color": "#ffffff", "fontSize": "12px" },
              text: 'Last transaction price at BitFinex',
              margin: 5
        },
        legend: {
            borderColor: '#3f3250',
            borderWidth: 2,
            backgroundColor: '#c0b3a0',
            enabled: true
        },
        xAxis: {
                tickInterval: 10, //interval of X values
                //every pointInterval secs
                style:{ "color": "#ffffff", "fontSize": "12px"},
             title: {
                text: 'Seconds',
                margin: 10,
                style:{ "color": '#ffffff', "fontSize": "12px" }
              },
              labels: {
                style: {"color": '#ffffff'}
              }
       }, //end x-axis
       yAxis: {
            id: 'm_YAxis',
            style:{ "color": '#ffffff', "fontSize": "12px"},
            minPadding: 0.0,
            maxPadding: 0.0,
            tickInterval: .5,  //Controls the interval of the grid on y-axis
            /*endOnTick: true,*/ //may round up or round down the axis
            /*startOnTick: true,*/
            gridLineColor: '#ffffff',
            minorTickColor:'#ffffff',
            tickColor: '#ffffff',

          title: {
                text: 'Last transaction price',
                margin: 10,
                style:{ "color": '#ffffff', "fontSize": "12px" }
            },
            labels: {
                style: {"color": '#ffffff'}
            },
            plotLines: [{
              value: 0,
              width: 1,
               color: '#ffffff'//'#808080'
            }]
        },//end y-axis

        // Each series is a different line on the chart.
        // The data structure series is an array with brackets for each line,
        // where each bracket has a name and data
        // [{},{},{},{}]
       series:
       [// [0] Only one series for this demo.
          {
           style:{"color": "#ffffff", "fontSize": "14px" },

           /* Note that datetime axes are based on milliseconds,
           * so for example an interval of one day is expressed
           * as 24 * 3600 * 1000.
           */
           pointStart: 0,
           pointInterval: 10, //interval of X values every pointInterval secs
           lineWidth: 1,
           //data: [6741, 6743, 6740, 6744, 6750, 6750, 6745, 6740]
           }
       ]
    };// end options

    if (MY_TRACE === 1){writeToConsole('TRACE: before init js_chart');}

    JS_CHART = new Highcharts.Chart(options);
    if (JS_CHART !== null) {
      if (DEBUG===1) {writeToConsole('Created new HighChart object');}
    } else {
      throw new Error("Failed to create chart. JS_CHART is null.");
    }

    //alert("Here is the response from the server!" + data);
    //JS_CHART.addSeries({
      //      name: "BitFinex",//seriesOptions[i].name,
        //    pointInterval: 10,
       //  pointStart: 0,
            //lineWidth: 1,
            //data: [12000, 12743, 12740, 12744, 12750, 12750, 12745, 12740]
    //}, true);

  } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in createChart(), name and \n\
        message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    throw e;
  }
} //end createChart


/**
 * @summary  Displays a message, and ends client execution.
 * @param {string} reason The reason to end the demo, which can
 *  be any of the following user-defined constants:
 * <ul>
 * <li>STR_NO_REASON: The user pressed the <b>End Demo</b> button.</li>
 * <li>STR_SUB_FAILED: The subscription request failed.</li>
 * <li>STR_EITHER_NO_CONNECTION_OR_BUSY: There is no Internet connection, or the
 *    server is too busy to respond.</li>
 * <li>STR_BROWSER_VERSION_TOO_EARLY: The browser is not compatible
 * with the client. For example, the browser does not support the WebSocket
 * interface.</li>
 * <li>STR_BROWSER_VIEWPORT_TOO_SMALL: The browser window is not big
 * enough to display the chart on the Web page.</li>
 </ul>
 *@see <a href="https://bitfinex.readme.io/v2/docs/ws-general">BitFinex WebSocket API</a>.
 * @description <b>Comments</b><br>Performs the following operations:
 * <ul>
 * <li> Calls <i>function clearInterval</i> to clear the timer
 * set in <i>function onopen</i>.
 * </li>
 * <li>Closes the WebSocket.</li>
 * <li>Displays the reason to end the demo. The function parameter
 * <i>reason</i> is displayed in a dynamically created <i>div</i> that is
 *  appended to a static element of the Web page.<br>
 * <br><strong>Note</strong> Internet Explorer throws an exception on
 * <i>method append</i>, and does not display the Web page. The workaround is
 * to append the <i>div</i> element to the <i>document.body</i> element
 * instead of the static HTML header element.
 * </li>
 * </ul>
 **/
function endDemo(reason) {
  try {
    if (MY_TRACE === 1){writeToConsole('TRACE: at endDemo().');}
    if (DEBUG === 1){writeToConsole('reason to end Demo: ' + reason);}
     //stop the setTimeoutInterval activity of client
    if (heartbeatInterval)  {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (webSocketBitFinex) {
      webSocketBitFinex.close();
    }
    var str = new String(reason);
    if (str.indexOf(STR_UPDATES_WILL_PAUSE) !== -1) {
      reason =  " Updates should resume in 10 seconds. However, this Beta version\n\
          of the demo does not handle this case without \n\
          shutting down first. Therefore, wait 10 seconds, and then reload the \n\
          page to resume price updates.";
    }
    if (DEBUG === 1){writeToConsole("reason:", reason);}

    if (!errorDisplayed) {
      //Update GUI to say we are quitting
      errorDisplayed = true;
      var endDemoDiv = document.createElement('div');

      // Because Internet Explorer (IE) throws an exception
      // for the cc.append statement that follows, I provide the
      // workaround that follows.
      var isIE = /*@cc_on!@*/false || (!!document.documentMode);
      if (isIE === false) {
        endDemoDiv.className = "alert-stop-demo";
        endDemoDiv.style.fontSize="smaller";
        endDemoDiv.innerHTML = "<strong>The demo has ended. </strong>" +
          reason + " Thanks for visiting!"; //PROCESSES the HTML
        var cc = document.getElementById("m-h4");
        cc.append(endDemoDiv);
      } else {
         document.body.style.color="white";
         document.body.innerHTML = "<strong>The demo has ended. Thanks \n\
           for visiting! </strong>" +
           reason;
      }
    } // end if (!errorDisplayed)
  } catch (e) {
     if (DEBUG===1){writeToConsole("EXCEPTION in endDemo(),\n\
         name and message: " + e.name+ " " +e.message + " ");}
     if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
  }
} // end function endDemo()


// calculate the current window vertical offset //
function topPosition() {
  return typeof window.pageYOffset !== 'undefined' ? window.pageYOffset :
      document.documentElement && document.documentElement.scrollTop ?
      document.documentElement.scrollTop : document.body.scrollTop ?
      document.body.scrollTop : 0;
}

/**
* @summary
* Runs on the <i>JQuery ready event</i>, and handles setup of the demo
* at startup. When the Document Object Model (DOM) is fully loaded, JQuery
* fires the ready event.
* @name verifyRequirementsAndStartSocket
* @description <b>Comments</b><br>
* The variable <i>verifyRequirementsAndStartSocket</i> is set to the function
* definition, and is the parameter to the ready event function as the following
* code example illustrates:<br><br>
* <header style="font:consola; font-size:14px">
* $(document).ready(verifyRequirementsAndStartSocket());
* </header><br>
* The function is the single place for all error handling at demo startup.
* The function catches any exception thrown by the following functions
* it calls:
* <ul>
* <li><b>detectCompatibleBrowser</b>: Ensures the browser supports
* WebSockets.</li>
* <li><b>testViewportSize</b>: Ensures the browser viewing area has a
* width and height that can display the Web page chart.</li>
* <li><b>createChart</b>: Creates the chart of bitcoin last transaction
* prices displayed on the Web page.</li>
* <li><b>startSocket</b>: Opens a WebSocket with a connection to BitFinex.</li>
* </ul>
* On catching an exception, the function calls <i>function endDemo</i>.
*/

//
// Create a request to get the startup prices from our Express server
// https://radiant-fortress-26008.herokuapp.com/
// https://git.heroku.com/radiant-fortress-26008.git
var getStartUpData = function(url, callback)  {
  try {
    //alert("in getStartUpData");
    if (MY_TRACE === 1) {writeToConsole('TRACE:at getStartupData()');}
    var strError = STR_NO_ERROR;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (MY_TRACE === 1) {writeToConsole('TRACE:at onreadystatechange()');}
        if (req.readyState == 4 && req.status !== 200) {
          console.log("ERROR! ERROR! status is " + req.status);
          endDemo("Express server failed to contact the exchange!");
          //503 - service unavailable!
          // 500 internal server error
          // empty set! equal to  503
        }
        if (req.readyState == 4 && req.status == 200) {
           console.log("SUCCESS! status === 200"); //less than 400
           var dataParsed = JSON.parse(req.responseText);
           for (var i=0;i<dataParsed.length;i++) {
              //alert(parseFloat(dataParsed[i].myPrice));
              /////////////  ADD Data Check ////////////////////
              if (!(isValidData(parseFloat(dataParsed[i].myPrice)))) {
                if (DEBUG === 1){writeToConsole('Price failed IsValid() \n\
                    test in function getStartupData()');}
                  strError = STR_BAD_DATA;
                  throw new Error(STR_BAD_DATA);
              } else { //DATA OK
                var strPrice = "";
                var currPrice = parseFloat(dataParsed[i].myPrice).toFixed(2);
                strPrice = checkBaseTen(currPrice);
                if (strPrice === "") { //unanticipated error
                  if (DEBUG === 1){writeToConsole('ERROR: currPrice is empty!');}
                  strError = STR_BAD_DATA;
                  throw new Error(STR_BAD_DATA);
                } //end if empty string /////////////  END ADD CHECK ///////////////
              JS_CHART.series[0].addPoint(parseFloat(dataParsed[i].myPrice), true, false);
              //first and second chars are [ o = left square bracket plus small o
              //writeToConsole('dataParsed ='+ dataParsed.toString().charCodeAt(0));
           } // end else data OK
           //JS_CHART.series[0].addPoint(13000, true, false); <-- worked!!
           JS_CHART.redraw();
        } // end for
      }  // end if readystatechange clause
    }; // end anon func req.onreadystatechange definition
    // req.open("GET", "http://localhost:3000/", true);
    req.open("GET","https://radiant-fortress-26008.herokuapp.com/", true);
    // https://radiant-fortress-26008.herokuapp.com/
    // https://git.heroku.com/radiant-fortress-26008.git
    // Internet Explorer requires after open and before send
    //req.timeout = 20000;
    // req.ontimeout = function () {alert("The request for the historical last transactions prices \n\
    // has timed-out. (Status 503 - service unavailable.)"); endDemo("Either the service is not\n\
    // available or the request took too long and timed-out. The client could not\n\
    // contact the blockchain reader.");}
    req.send();
    //alert("The client is contacting the Express server to ask Chain.so\n\
    // a blockchain reader, for the last transactio prices. \n\
    //Starting the 10 seconds countdown."));
    //start a timer setTimeout(10000, alert();
  } catch (e) {
    if (DEBUG === 1) {writeToConsole ("From client: EXCEPTION in getStartUpData, \n\
        name and message: " + e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}
    strError = e.message; //STR_GENERIC_ERROR;
    throw new Error(strError);
  }
} //endGetStartupData

//getText('somephpfile.php', mycallback); //passing mycallback as a method

var verifyRequirementsAndStartSocket = function () {
  try {
    if (MY_TRACE === 1) {writeToConsole('TRACE; at document.ready');}
    var reason = "";
    var stopButton = document.createElement('button');
    // Any of the following functions can throw an exception.
    detectCompatibleBrowser();
    testViewportSize();
    createChart();
    updateActivityBoxGUI("Contacting CEX.IO for startup prices.", "", "");
    getStartUpData("", "");
    //for (var i=0;i<dataParsed.length;i++) {
     // alert(dataParsed[i].price);
    //}
    startSocket();
    //JS_CHART.series[0].addPoint(12300, true, false);
    //JS_CHART.series[0].addPoint(12500, true, false);
   if (DEBUG === 1) {console.log('DOCUMENT IS READY: Setting options');}

   } catch(e) {
    if (DEBUG === 1) {writeToConsole ("EXCEPTION in document).ready anon \n\
       function)(), name and message: " +
       e.name + " " + e.message);}
    if ((DEBUG===1) && (e.stack)){writeToConsole("stack: " + e.stack);}

    if (e.message === STR_BROWSER_VERSION_TOO_EARLY){
      if (DEBUG === 1) {writeToConsole('EXCEPTION in ready() event: '+
        STR_BROWSER_VERSION_TOO_EARLY);}
        alert(STR_BROWSER_VERSION_TOO_EARLY_FOR_WEBSOCKETS);
        reason = STR_BROWSER_VERSION_TOO_EARLY_FOR_WEBSOCKETS;

    } else if (e.message === STR_BROWSER_VIEWPORT_TOO_SMALL) {
       if (DEBUG === 1) {writeToConsole('EXCEPTION in ready() event: '+
           STR_BROWSER_VIEWPORT_TOO_SMALL);}
         alert(STR_BROWSER_VIEWPORT_TOO_SMALL);
         reason = STR_BROWSER_VIEWPORT_TOO_SMALL;
     } else { //There could be an STR_UNEXPECTED_PROGRAM_RESULT
             // in detectCompatibleBrowser()
       //alert(STR_GENERIC_ERROR);
       alert(e.message); //**
       reason = STR_GENERIC_ERROR;
     }
     endDemo(reason);
   } //end catch
 };  //end assignment of function

$(document).ready(verifyRequirementsAndStartSocket());

 /**
 * @summary Writes a message to the console.
 * @param {string} msg The message to write.
 * @description <b>Comments</b><br>
 *  To eliminate browsers that do not support the console object,
 *  the client calls <i>function detectCompatibleBrowser</i>
 *  before calling <i>function writeToConsole</i> .
 **/
function writeToConsole(msg) {
  if (!window.console){
      window.console = {log: function(){} };
  } else {
    //if (window.console && window.console.log)
   // console is available
   window.console.log(msg);
  }
} //end writeToConsole


 window.onbeforeunload = function() {
   if (DEBUG===1){
     writeToConsole('Closed! the socket!');
     return "Bye now!";
   }
};
