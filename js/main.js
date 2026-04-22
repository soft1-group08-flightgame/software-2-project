'use strict';
/* 1. show map using Leaflet library. (L comes from the Leaflet library) */
/*
const map = L.map('map', {tap: false});
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 7);
 */

// global variables

// icons

// form for player name
const formIntro = document.getElementById('form-intro');
const introButton = formIntro.querySelector('button');
console.log(introButton);

introButton.addEventListener('click', function(e) {
  e.preventDefault(); // Prevent submit behaviour

  // Catching form data
  const name = formIntro.querySelector('input[name=name]');
  const nation = formIntro.querySelector('input[name=nation]');
  const age = formIntro.querySelector('input[name=age]');

  // Fill in the text gaps with form data
  document.getElementById('display-name').textContent = name.value;;
  document.getElementById('display-name-repeat').textContent = name.value;
  document.getElementById('display-nation').textContent = nation.value;
  document.getElementById('display-age').textContent = age.value;

  // Switch screens
  document.getElementById('screen-1').classList.remove('active');
  document.getElementById('screen-2').classList.add('active');
});

const screen2Button = document.querySelector('#screen-2 button');
console.log(screen2Button);
screen2Button.addEventListener('click', function(e) {
  document.getElementById('screen-2').classList.remove('active');
  document.getElementById('screen-3').classList.add('active');
})


// function to fetch data from API

// function to update game status

// function to show weather at selected airport

// function to check if any goals have been reached

// function to update goal data and goal table in UI

// function to check if game is over

// function to set up game
// this is the main function that creates the game and calls the other functions

// event listener to hide goal splash
