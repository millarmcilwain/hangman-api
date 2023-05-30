# Javascript Hangman API 

This repository contains a REST API which can be used to play a game of 'Hangman'. This API allows for creating new games, checking game information, submitting guesses and deleting existing games.

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

Invalid Game IDs




Correct Gueses

Incorrect Guesses

## Deleting a game
```
DELETE /games/remove/:game_id
```
A DELETE request containing the Game ID made to this endpoint will remove the game associated with the ID from storage. Be careful as this action is irreversible.
