'use strict';

// Tennis Pro 2026 - Group 04

// player variables
let playerName   = "";
let playerNation = "";
let playerAge    = "";
let playerMoney  = 0;     // will be set by the server via /newgame
let playerPoints = 0;
let playerRank   = 0;     // will be set by the server via /newgame

// game variables
let currentMonthIndex  = 0;
let selectedTournament = null;
let currentRoundIndex  = 0;
let matchScore         = 0;

let roundsOrder = ["Quarter Finals", "Semi Finals", "Finals"];

let months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

// game rules
let TRAVEL_FEE = 5000;
let FEE_RATE   = 0.02; // entry fee is 2% of the prize money

// background image for each screen
let screenBackgrounds = {
    'screen-1': '../img/tennis-net.jpeg',
    'screen-2': '../img/old-raquet.jpeg',
    'screen-3': '../img/airport-terminal.jpeg',
    'screen-4': '../img/airplane-wing.jpeg',
    'screen-5': '../img/tennis-clay.jpeg',
    'screen-6': '../img/trophy.jpeg'
};

// this function shows the correct screen and changes the background
function goToScreen(screenId) {
    // hide all screens first
    let allScreens = document.querySelectorAll('.screen-container');
    for (let i = 0; i < allScreens.length; i++) {
        allScreens[i].classList.remove('active');
    }
    // show the one we want
    document.getElementById(screenId).classList.add('active');

    // change the background image of the page
    document.body.style.backgroundImage = "url('" + screenBackgrounds[screenId] + "')";
}


// screen 1 - get player name, nation and age from the form
document.getElementById('form-intro').addEventListener('submit', async function(e) {
    e.preventDefault(); // stop the page from reloading

    playerName   = e.target.name.value;
    playerNation = e.target.nation.value;
    playerAge    = e.target.age.value;

    // call the python server to get the starting money and rank
    // try...catch prevents the app from crashing if the server is offline
    try {
        let response = await fetch("http://127.0.0.1:5000/newgame?player=" + playerName);
        let data     = await response.json();
        playerMoney  = data.money;
        playerRank   = data.rank;
    } catch (error) {
        alert("Cannot connect to the server. Make sure app.py is running!");
        return;
    }

    // fill in the story text with the player info
    document.getElementById('display-name').textContent        = playerName;
    document.getElementById('display-name-repeat').textContent = playerName;
    document.getElementById('display-name-final').textContent  = playerName;
    document.getElementById('display-nation').textContent      = playerNation;
    document.getElementById('display-age').textContent         = playerAge;
    document.getElementById('display-heritage').textContent    = playerMoney.toLocaleString();

    goToScreen('screen-2');
});


// screen 2 - continue button goes to the first month
document.querySelector('#screen-2 .btn-continue').addEventListener('click', function() {
    currentMonthIndex = 0;
    loadMonth();
});


// screen 3 - load the tournaments for the current month from the server
async function loadMonth() {
    let monthName = months[currentMonthIndex];

    // update the title and wallet
    document.getElementById('screen-3_title').textContent = "Circuit: " + monthName;
    document.getElementById('wallet').textContent = "Wallet: $" + playerMoney.toLocaleString();

    // reset the info panel
    document.getElementById('display-tournament-name').textContent = "Select a tournament";
    document.getElementById('display-points').textContent          = "Points: -";
    document.getElementById('display-prize').textContent           = "Prize: -";
    document.getElementById('display-fee').textContent             = "Fee: -";
    document.getElementById('display-total-cost').textContent      = "Total cost: -";
    selectedTournament = null;

    // try block: we attempt to call the Python server
    // if the server is offline, the catch block runs instead of crashing the app
    try {
        // fetch sends a request to the Flask server asking for tournaments this month
        let response    = await fetch("http://127.0.0.1:5000/get_tournaments?month=" + monthName);
        // .json() converts the server response into a JavaScript array we can use
        let tournaments = await response.json();

        // calculate the entry fee and total cost for each tournament
        for (let i = 0; i < tournaments.length; i++) {
            tournaments[i].fee       = tournaments[i].prize_money * FEE_RATE;
            tournaments[i].totalCost = tournaments[i].fee + TRAVEL_FEE;
        }

        // build the tournament list on screen 3
        let listEl = document.getElementById('tournaments_list');
        listEl.innerHTML = ""; // clear the list from the previous month

        for (let i = 0; i < tournaments.length; i++) {
            let t    = tournaments[i];
            let item = document.createElement('div');
            item.className   = 'tournament-item';
            item.textContent = t.name + " - " + t.city;

            // if the player cannot afford this tournament, disable it
            if (playerMoney < t.totalCost) {
                item.className += ' disabled';
                item.addEventListener('click', function() {
                    // show why it is disabled in the info panel
                    document.getElementById('display-tournament-name').textContent = "❌ Not enough money!";
                    document.getElementById('display-points').textContent          = "You need $" + t.totalCost.toLocaleString();
                    document.getElementById('display-prize').textContent           = "You have $" + Math.round(playerMoney).toLocaleString();
                    document.getElementById('display-fee').textContent             = "Pick a cheaper tournament.";
                    document.getElementById('display-total-cost').textContent      = "";
                });
            } else {
                item.addEventListener('click', makeSelectHandler(t));
            }

            listEl.appendChild(item);
        }

        goToScreen('screen-3');

    } catch (error) {
        // catch block: runs only if the fetch failed (server offline or connection error)

        alert("Cannot connect to the server. Make sure app.py is running!");
    }
}

// we need a separate function here because of how JavaScript handles
// variables inside loops - without this, all items would show the last tournament
function makeSelectHandler(t) {
    return function() {
        selectedTournament = t;

        // remove highlight from all items
        let allItems = document.querySelectorAll('.tournament-item');
        for (let i = 0; i < allItems.length; i++) {
            allItems[i].classList.remove('selected');
        }
        // highlight the one we clicked
        event.currentTarget.classList.add('selected');

        // show the tournament details
        document.getElementById('display-tournament-name').textContent = t.name;
        document.getElementById('display-points').textContent          = "Points: " + t.points;
        document.getElementById('display-prize').textContent           = "Prize: $" + t.prize_money.toLocaleString();
        document.getElementById('display-fee').textContent             = "Fee: $" + t.fee.toLocaleString();
        document.getElementById('display-total-cost').textContent      = "Total cost: $" + t.totalCost.toLocaleString() + " (fee + travel)";
    };
}


// screen 3 continue button - travel to the tournament
document.querySelector('#screen-3 .btn-continue').addEventListener('click', function() {
    if (selectedTournament === null) {
        alert("Please select a tournament first!");
        return;
    }

    // subtract the cost from the player's wallet
    playerMoney -= selectedTournament.totalCost;

    // show the travel animation on screen 4
    document.getElementById('screen-4').innerHTML =
        '<div class="travel-wrapper">' +
        '<p class="travel-to">✈️ Flying to ' + selectedTournament.city + '...</p>' +
        '<div class="plane-track"><span class="plane-icon">✈</span></div>' +
        '</div>';

    goToScreen('screen-4');

    // after 2.5 seconds go to the match screen
    setTimeout(function() {
        setupMatchScreen();
        goToScreen('screen-5');
    }, 1000);
});


// screen 5 - set up the match
function setupMatchScreen() {
    document.getElementById('tournament_name_header').textContent = selectedTournament.name;

    // calculate the match score using skill and difficulty
    // random number between 30 and 70, plus skill bonus, divided by difficulty
    let randomNumber = Math.random() * 40 + 30;
    let diffCoef     = getDiffCoef(selectedTournament.points);
    matchScore       = (randomNumber + 10) / diffCoef;

    // reset the buttons
    document.getElementById('btn-quarter').className    = 'btn-match';
    document.getElementById('btn-semi').className       = 'btn-match';
    document.getElementById('btn-final').className      = 'btn-match';
    document.getElementById('btn-quarter').textContent  = 'QUARTER FINAL';
    document.getElementById('btn-semi').textContent     = 'SEMI FINAL';
    document.getElementById('btn-final').textContent    = 'FINAL';

    // reset the summary box
    document.getElementById('display-final-pos').textContent     = "Click the rounds in order!";
    document.getElementById('display-earning').textContent       = "";
    document.getElementById('display-wallet-update').textContent = "";
    document.getElementById('display-rank-update').textContent   = "";

    // remove the continue button from the previous month if it exists
    let oldBtn = document.querySelector('#screen-5 .btn-continue');
    if (oldBtn) {
        oldBtn.remove();
    }

    currentRoundIndex = 0;
}

// returns the difficulty based on the tournament category
function getDiffCoef(points) {
    if (points === 250)  return 1.0;   // ATP 250
    if (points === 500)  return 1.15;  // ATP 500
    if (points === 1000) return 1.25;  // Masters 1000
    if (points === 2000) return 1.4;   // Grand Slam
    return 1.0;
}

// this runs when the player clicks a round button
function revealRound(roundIndex) {
    // the player must click the rounds in order
    if (roundIndex !== currentRoundIndex) {
        alert("Play the rounds in order!");
        return;
    }

    // get the right button
    let button;
    if (roundIndex === 0) button = document.getElementById('btn-quarter');
    if (roundIndex === 1) button = document.getElementById('btn-semi');
    if (roundIndex === 2) button = document.getElementById('btn-final');

    // check if the player won this round
    let roundThresholds = [0, 35, 60]; // min score needed for each round
    let playerWon = matchScore >= roundThresholds[roundIndex];

    if (playerWon) {
        button.className  = 'btn-match win';
        button.textContent = roundsOrder[roundIndex] + " ✅";
        currentRoundIndex++;

        // if it was the final, check if champion
        if (roundIndex === 2) {
            if (matchScore >= 80) {
                button.textContent = "🏆 CHAMPION!";
            }
            showMatchSummary();
        }
    } else {
        // player lost
        button.className   = 'btn-match loss';
        button.textContent = roundsOrder[roundIndex] + " ❌";
        showMatchSummary();
    }
}

// connect the round buttons to the revealRound function
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn-quarter').addEventListener('click', function() { revealRound(0); });
    document.getElementById('btn-semi').addEventListener('click',    function() { revealRound(1); });
    document.getElementById('btn-final').addEventListener('click',   function() { revealRound(2); });
});


// calculate earnings and update the player stats after the match
function showMatchSummary() {
    // find the prize percentage based on how far the player got
    let rewardPerc = 0.35; // default: quarter finals
    if (matchScore >= 80)      rewardPerc = 1.00; // champion
    else if (matchScore >= 60) rewardPerc = 0.70; // finals
    else if (matchScore >= 35) rewardPerc = 0.50; // semi finals

    let earnedMoney  = selectedTournament.prize_money * rewardPerc;
    let earnedPoints = selectedTournament.points * rewardPerc;

    // update the player
    playerMoney  += earnedMoney;
    playerPoints += earnedPoints;
    playerRank    = Math.max(1, 250 - Math.floor(playerPoints / 20));

    // find the position name to display
    let positionName = "Quarter Finals";
    if (matchScore >= 80)      positionName = "Champion";
    else if (matchScore >= 60) positionName = "Finals";
    else if (matchScore >= 35) positionName = "Semi Finals";

    // show the results in the summary box
    document.getElementById('display-final-pos').textContent     = "Final position: " + positionName;
    document.getElementById('display-earning').textContent       = "Earnings: +$" + Math.round(earnedMoney).toLocaleString();
    document.getElementById('display-wallet-update').textContent = "New balance: $" + Math.round(playerMoney).toLocaleString();
    document.getElementById('display-rank-update').textContent   = "Updated rank: #" + playerRank;

    // add a continue button to go to the next month
    let btn = document.createElement('button');
    btn.className   = 'btn-continue';
    btn.textContent = 'Continue';
    btn.addEventListener('click', function() {
        currentMonthIndex++;
        if (currentMonthIndex < months.length) {
            loadMonth(); // next month
        } else {
            showSeasonEnd(); // season is over
        }
    });
    document.getElementById('screen-5').appendChild(btn);
}


// screen 6 - show the final results at the end of the season
function showSeasonEnd() {
    let items = document.querySelectorAll('#screen-6 ul li');
    items[0].textContent = "Final ranking: #" + playerRank;
    items[1].textContent = "Wallet: $" + Math.round(playerMoney).toLocaleString();

    if (playerRank === 1) {
        document.getElementById('ending-text').textContent =
            "👑 CONGRATULATIONS " + playerName + "! You are World Number 1! 🎾";
    } else {
        document.getElementById('ending-text').textContent =
            "Season over, " + playerName + ". You finished ranked #" + playerRank + ". Your family is proud! ❤️";
    }

    goToScreen('screen-6');
}