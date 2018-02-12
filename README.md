# Demo <img src='images/i-roman-large.png'>: Bitcoin Price in Real Time—an Implementation of the HTML 5 WebSocket Interface 
## A Demo with a <em font-size="14" style= "color:#ff6666;"><b>WebSocket!</b></em> :blush:
##### Beta Version 1.0
###### This document was first issued on November 1, 2017.
 
## Welcome to the README!
WebSockets are cool! They enable servers to push data to clients. 

The sections that follow describe the source code files, functionality, and known issues of the demo.   

## Source Code Files
Following are the source code files for the demo:

* js-client-socket.js: Contains the source code of the JavaScript client.

* css/maincss.css: Contains the Cascading Style Sheets, level 3 (CSS3) code to style the Web page.

* index.html: Contains the HTML code for the Web page.

### Required Scripts
The JavaScript client requires the following scripts to run:

* highcharts.js: The JavaScript client uses the  [Highcharts API]('https://www.highcharts.com/') to
    create the chart on the Web page of the demo.

* jquery-3.2.1.js: The JavaScript client uses the JQuery *ready* event to begin script execution.

An external reference to each script is included in the index.html file.

## Functionality

 As shown in the graphic that follows, the JavaScript client gets real-time bitcoin prices from a
 Bitfinex WebSocket server and displays the prices in a chart.<br><br>
![Foto of Web page.](images/web-page-price-update-small.png "The Web page with a chart that updates.")


## Known Issues
This section provides information about known issues in Beta Version 1 of the demo.

* **Insufficient Testing of the JavaScript Client with Small Viewports**

   * Code in the CSS3 file proportionally sizes the font and Document Object Model (DOM) elements  
     in rem units. Media queries in the CSS3 file style Web page elements. However, this CSS3 code was 
     not extensively tested with small viewports (less than 768 pixels in width).
  
* **No Testing of the JavaScript Client on the iOS Mobile Operating System** 

   * The JavaScript client was only tested with Safari on an OS X operating system.

* **The JavaScript Client Freezes when Run with Konqueror, a Linux Browser**

   * The Javascript client does not draw the Web page chart. It is not clear whether the script is even loading.




    
  
