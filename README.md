# Javascript Hangman API 

This repository contains a REST API which can be used to play a game of 'Hangman'. This application allows for creating new games, checking game information, submitting guesses and deleting existing games.

## Install
Ensure Node packages are installed before starting the application.
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

The app will run on port 4567.


## Starting a game
```
POST /games/
```
Making a POST request to this endpoint will create a new game and return the unique Game ID which is required for subsequent requests. Guesses may now be made on the returned Game ID.


## Checking game information
```
GET /games/:game_id
```
A GET request containing the Game ID made to this endpoint will return information associated with the supplied Game ID.

If a Game ID is not supplied or does not exist in storage a 404 status will be returned with a contextual message.

A successful request will return:
```
remainingGuesses: How many incorrect guesses can be made before the player loses.

word: The current word to be guessed - with revealing letters based on correct guesses.

status: The current play status of the game - 'Won', 'Lost', 'In Progress'

incorrectGuesses: An array containing guessed letters that are not present in the game word.
```


## Making a guess
```
POST /games/:game_id/guesses
```
To submit a guess a valid Game ID must be provided alongside a 'letter' (case insensitive) parameter in the request body.  

A successful request will return:
```
message: A contextual message with information regarding the most recent request on this endpoint.

remainingGuesses: How many incorrect guesses can be made before the player loses.

word: The current word to be guessed - with revealing letters based on correct guesses.

status: The current play status of the game - 'Won', 'Lost', 'In Progress'

incorrectGuesses: An array containing guessed letters that are not present in the game word.
```

A correct guess will return an updated game object with the correctly guessed letters unmasked from the game word.

An incorrect guess will return an updated game object with changes to the amount of remaining guesses and an array containing the letters of incorrect guesses. Each incorrect guess decrements the remainingGuesses counter by 1.




## Completed Games
If all correct letters are guessed the game status will be set to 'Won' and no more guesses can be submitted. 
If 6 incorrect guesses are made the game status will be set to 'Lost' and no more guesses can be submitted.


## Deleting a game
```
DELETE /games/remove/:game_id
```
A DELETE request containing the Game ID made to this endpoint will remove the game associated with the ID from storage. Be careful as this action is irreversible.
