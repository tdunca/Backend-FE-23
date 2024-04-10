# About the project

This repository contains the sorce code for my backend-assignment.
It was a mandatory assignment for my ongoing education in FrontEnd-Developing.
Thunder Client was used to demonstrate functions, since the project does not have any Front-End.

### Requirements:

Create a backend service for a chat app. Information about channels and messages needs to be stored in a database.
There has to be a special channel called broadcast that is permanent. Everyone can read this channel and everyone can send messages to this channel.

Endpoints
The Api needs to contain the following end points:

- GET /api/broadcast - retrieve all messages sent to the broadcast channel
- POST /api/broadcast - create a new message in the broadcast channel
- GET /api/channel/ - retrieve a list of all the channels
- GET /api/channel/:id - retrieves a message in a specific channel
- PUT /api/channel/ - creates a new channel. The channel name needs to be included
- POST /api/channel/:id - create a new message in a specific, previously created channel. The content in a message needs to be at least user and text
