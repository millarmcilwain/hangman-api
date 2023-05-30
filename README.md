# Javascript Hangman API 

This repository contains a REST API which can be used to play a game of 'Hangman'. This API allows for creating new games, checking game information, submitting guesses and deleting existing games.

## Install
```
npm install
```

## Run the App
```
npm start
```

## Run the Tests
```
npm test
```

The app will run on port 4567

## Gameplay

This API follows adopts the traditional ruleset and game proceedure to ['Hangman'](https://en.wikipedia.org/wiki/Hangman_(game)) with some exceptions: 

1. Users are allowed a total of 6 incorrect guesses before the game is lost. 
2. A user may use each letter one per game (regardless of case). Additional guesses with a previously guessed letter will not count towards progress.

## Starting a game
```
POST /games/
```
Making a POST request to this endpoint will create a new game and return the unique Game ID which is required for subsequent requests.


## Checking game information
```
GET /games/:game_id
```
A GET request containing the Game ID made to this endpoint will return information associated with the supplied Game ID.

If a Game ID is not supplied or does not exist in storage a 404 status will be returned with a contextual message.

A successful request will return:
```
remainingGueses: How many incorrect guesses can be made before the player loses.

word: The current word to be guessed - with revealing letters based on correct guesses.

status: The current play status of the game - 'Won', 'Lost', 'In Progress'

incorrectGuesses: An array containing guessed letters that are not present in the game word.
```

## Making a guess
```
POST /games/:game_id/guesses
```
To submit a guess to the API a valid Game ID must be provided alongside a 'letter' (case insensitive) paramater in the request body.  

A correct guess will return a status 200 and an updated game object with the correctly guessed letters unmasked from the game word.
An incorrect guess will return a status 200 and an updated game object with changes to the amount of remaining guesses and an array containing the letters of incorrect guesses.

If all correct letters are guessed the game status will be set to 'Won' and no more guesses can be submitted. 
If 6 incorrect guesses are made the game status will be set to 'Lost' and no more guesses can be submitted.


## Deleting a game
```
DELETE /games/remove/:game_id
```
A DELETE request containing the Game ID made to this endpoint will remove the game associated with the ID from storage. Be careful as this action is irreversible.
