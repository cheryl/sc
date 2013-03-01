// ==UserScript==
// @name         Smilecity
// @version      0.3
// @description	 daily navigate through smilecity.co.nz earning opportunities.
// @match        http://www.smilecity.co.nz/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @copyright    2013, cheryl
// ==/UserScript==


/**/
var sc = {}; // globally used object
// regexes for figuring out where we are
sc.regexes = {};
sc.regexes.home = /www\.smilecity\.co\.nz(\/)?(default.aspx)?$/i;
sc.regexes.guessinggame = /earn\/guessinggame\.aspx\/?$/i;
sc.regexes.webclicks = /earn\/webclicks\.aspx\/?$/i;
sc.regexes.wclink = /earn\/topframe\.aspx\?adid=(\d)+$/i;
// text resources
sc.text = {};
sc.text.home = "here's what you can do to earn points right now:";
sc.text.webclicks = 'You have already earned points for clicking today';
sc.text.guessinggame = 'Autopick';
sc.text.homewebclicks = 'Click on a Web Clicks ad for 2 points.';
sc.text.homeguessinggame = 'Play the Guessing Game';
// dom objects for checking
sc.check = {};
sc.check.home = $('div:contains("'+sc.text.home+'")').length; // != or > 0, positive message exists
sc.check.guessinggame = $('#formOutline input[type=submit]').attr('disabled'); // == undefined, button isn't disabled
sc.check.webclicks = $('div:contains('+sc.text.webclicks+'.)').length; // == 0, negative message doesn't exist
sc.check.homepoll = $('div#earnNowWrap form').length; // != or > 0, form exists
sc.check.homewebclicks = $('a:contains("'+sc.text.homewebclicks+'")').length; // != or > 0, link to webclicks exists
sc.check.homeguessinggame = $('a:contains("'+sc.text.homeguessinggame+'")').length; // != or > 0, link to guessing game exists
/**/

// questions
sc.whereAreWe = function(){
	var location = 'nowhere';
	if(sc.regexes.home.test(window.location.href)){
		location = 'home';
	} else if (sc.regexes.guessinggame.test(window.location.href)){
		location = 'guessinggame';
	} else if (sc.regexes.webclicks.test(window.location.href)){
		location = 'webclicks';
	} else if (sc.regexes.wclink.test(window.location.href)){
		location = 'wclink';
	}
	console.log('-- whereAreWe: '+location+' --');
	return location;
}
sc.anythingLeftToDo = function(){
	console.log('<< anythingLeftToDo()');
	var somethingToDo = 0;
	var consoleMsg = '';
	switch(sc.here){
		case 'home':
			consoleMsg = 'home: no';
			if(sc.check.home > 0){ // ie, the div containing this text exists
				somethingToDo=1;
				consoleMsg = 'home: yes';
			}
			break;
		case 'guessinggame':
			consoleMsg = 'guessing game: no';
			if(sc.check.guessinggame == undefined){ // the submit is not disabled
				somethingToDo=1;
				consoleMsg = 'guessing game: yes';
			}
			break;
		case 'webclicks':
			// is there only one .warningWrap, or absence of .warningTxtOnly, or absence of 'You have already earned points for clicking today.' (yes)
			consoleMsg = 'webclicks: no';
			if(sc.check.webclicks == 0){ // ie, the div containing this text does not exist
				somethingToDo=1;
				consoleMsg = 'webclicks: yes';
			}
			break;
		case 'wclink':
			consoleMsg = 'wclink: we just have to go back home after it\'s loaded.';
			somethingToDo=1;
			break;
		default: // we are somewhere else, notify so we can add it to this switch
			consoleMsg = 'our current location\'s earning message is unknown: '+smilecity.here;
			break;
	}
	console.log(consoleMsg);
	console.log('>> anythingLeftToDo()');
	return somethingToDo;
}

// actions
sc.goTo = function(url){ // in 5 seconds
	setTimeout(function(){
		window.location = url;
	},5000)
	return true;
}
sc.goHome = function(){
	sc.goTo('http://www.smilecity.co.nz/default.aspx');
	return true;
}
sc.doTheFirstThing = function(){
	console.log('<< doTheFirstThing()');
	var success = 0;
	var consoleMsg = '';
	console.log('* '+sc.here);
	// if we're on the 'guessinggame' page, autopick and go home
	// if we have a poll to fill out, choose the "I'd rather not say" option if it exists and press submit
	switch(sc.here){
		case 'home':
			if(sc.check.homepoll > 0){ // poll
				consoleMsg = 'Do the poll';
			} else if(sc.check.homewebclicks > 0){ // webclicks
				var url = $('a:contains("'+sc.text.homewebclicks+'")').attr('href');
				sc.goTo(url);
			} else if(sc.check.homeguessinggame > 0) { // guessinggame
				var url = $('a:contains("'+sc.text.homeguessinggame+'")').attr('href');
				sc.goTo(url);
			} else {
				consoleMsg = 'Something needs to be done but we haven\'t learnt how to do it yet';
			}
			break;
		case 'webclicks':// click a link
			var url = $('div.wcText:first a').attr('href');
			sc.goTo(url);
			break;
		case 'wclink':// count to 15 and go home (or accounts, then home)
			setTimeout(function(){
				sc.goHome();
			},10000);
			break;
		case 'guessinggame': // autopick, then submit
			consoleMsg = 'Autopick, wait for lag, then submit.';
			var url = $('a:contains("'+sc.text.guessinggame+'")').attr('href');
			sc.goTo(url); // for some reason this takes a while..
			setTimeout(function(){
					$('div.gGameDetailsWrap input[type=submit]').click();
					}, 15000);
			break;
		default:
			// we are somewhere else, notify so we can add it to this switch
			consoleMsg = 'our current location is unknown: '+sc.here;
			break;
	}
	if(consoleMsg.length > 0){
		console.log(consoleMsg);
	}
	success = 1;
	// and then if it doesn't refresh already, always refresh after doing it to ask the sequence again
	//setTimeout(function(){
	//window.location.reload()
	//},10000);
	console.log('>> doTheFirstThing()');
	return success;
}

// properties
sc.here = sc.whereAreWe();
sc.somethingToDo = sc.anythingLeftToDo();
// lifted from http://stackoverflow.com/questions/1531093/how-to-get-current-date-in-javascript
var objToday = new Date(),
	weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
	dayOfWeek = weekday[objToday.getDay()],
	domEnder = new Array( 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th' ),
	dayOfMonth = sc.today + (objToday.getDate() < 10) ? '0' + objToday.getDate() + domEnder[objToday.getDate()] : objToday.getDate() + domEnder[parseFloat(("" + objToday.getDate()).substr(("" + objToday.getDate()).length - 1))],
	months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
	curMonth = months[objToday.getMonth()],
	curYear = objToday.getFullYear(),
	curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
	curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
	curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds(),
	curMeridiem = objToday.getHours() > 12 ? "pm" : "am";
sc.today = curHour + ":" + curMinute + ":" + curSeconds + curMeridiem + " " + dayOfWeek + " " + dayOfMonth + " " + curMonth;


$(document).ready(function(){
	/**/
	
	// START OF EXECUTABLE CODE
	// timer: in 3 hours from now, go home/refresh.
	setTimeout(function(){
		location.reload()
	},21600000);

	console.log('<< MAIN CODE'); // ask this sequence at any page load:
	if(sc.somethingToDo){
		sc.doTheFirstThing();
	} else {
		console.log('nothing to do: are we home?'); // no: are we home?
		if(sc.here == 'home'){
			console.log('yes: ok, done for now, just wait for the timer to refresh'); // yes: ok, done for now, just wait for the timer to refresh
		} else {
			sc.goHome();
			console.log('no: go home, ie ask sequence again'); // no: go home, ie ask sequence again
		}
	}
	console.log(sc.today);
	console.log('>> MAIN CODE');
	/**/
});
