# Backend Test

## Scenario

🔥 Welcome !

You have just been recruited by Bunji as a Backend Engineer.
In order for the sales team to sign a deal with the biggest real estate network of France, we have been asked to
synchronize events between Bunji app and their Google calendar (two way sync).

You voluntered to be the Lead Dev on this task

## 🎯 Goal

The goal is to be able to create a simplified two way calendar sync between :

- our dummy Bunji event app
- a dummy simplfied Google Calendar API

The idea is to be able to test your :

- technical skills
- code quality

## 🗂️ Guidelines

- You should use the Bunji dummy Node.js app as a starting Point (this repo)
- you are free to add any library you deem necessary
- here is the documentation for the dummy google calendar dummy api (it is protected by api token) : https://github.com/chrisbag/google-events-dummy
- bear in mind that the bunji and google events models are slightly different
- to simplify approach, ignore timzeones
- feel free to add any required fields to the Bunji event or user models but do not modify existing fields
- events will have to be associated to the correct users.
- you are free to refactor, modify the project structure accordingly
- please add any relevant documentation
- no need to add any kind of database
- you can add tests wherever if might think it necessary (not compulsory but appreciated)

## ✅ Acceptation Criteria

1. Synchronize Bunji events with Google Calendar

- [ ] when an event is created on Bunji, it should be added on the Google Calendar
- [ ] when an event is updated on Bunji, it should be updated on the Google Calendar
- [ ] when an event is delete on Bunji, it should be deleted on the google Calendar

2. Synchronize Google Calendar events with Bunji events (suppose the google API does not offer webhooks)

- [ ] when an event is created on Google Calendar, it should be added to the Bunji App
- [ ] when an event is update on Google Calendar, it should be added to Bunji app
- [ ] when an event is deleted on the google calendar, it should be deleted on Bunji App

3. Copy code to your github (or other) repository, create new branch to code the feature and then submit a PR

# ❓ Bunji Dummy App info

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/chrisbag/backend-test-events
   ```

2. Install dependencies

```
   cd backend-test-events
   yarn install
```

## Usage

### Development

To run the application in development mode, use the following command:

```
yarn dev
```

### Production

To build the application for production and run the compiled JavaScript code, use the following commands:

```
yarn build
yarn start
```

## API Endpoints

### Routes

- POST /events - Create a new event.
- GET /events - Get all events.
- GET /events/:id - Get a specific event by ID.
- PATCH /events/:id - Update a specific event by ID.
- DELETE /events/:id - Delete a specific event by ID.

### Event Schema

Events have the following fields:

- id: Unique identifier for the event - string
- idDone - Indicates whether the event is completed or not - boolean
- description: Description of the event - text | null
- startAtDate: Start date of the event - text - YYYY-MM-DD
- startAtTime: Start time of the event - text - HH:mm
- endAtDate: End date of the event - text - YYYY-MM-DD
- startAtTime: End time of the event - text - HH:mm
- userId: Id of the user attached to the event - number (must be an exisiting user)

### User Schema

Users have the following fields:

- id: Unique identifier for the user - number
- firstName: firstname of the user - string
- lastName: lastName of the user - string
- googleId: googleId of the user - number
