# TopggLibrary

It was easier to just write the library for my submission. It uses two dependancies, sqlite3 and @top-gg/sdk.
using sqlite3 allows replit support, and using the top-gg/sdk means a lot of legwork & errors are already handled.

I am not claiming this as a complete library, I've not really even tested it fully.

## Developer install & testing
Testing an npm library should use `npm link` to 'fake' a library and allow testing.
1. run in your terminal `git clone https://github.com/Team-Woo/TopggLibrary.git TopggLibrary` & `cd TopggLibrary`
2. run `npm link`
3. create a new project anywhere on your computer.
4. run `npm init -y`
5. open the new projects package.json and add the topgglibrary dependancy manually(no npm project exists yet, so `npm i topgglibrary` will not work)
```json
  "dependencies": {
    "topgglibrary": "0.0.1"
  },
```
6. run `npm link topgglibrary` in the new projects folder

#### You can now use the library as if it was downloaded from npm

------------

## Example code

```javascript
import { TopggLib } from "topgglibrary";

const topgg = new TopggLib("authorization", {
	path: "/dblwebhook",
	port: 3000,
	dbPath: "./mybot.db"
})

topgg.on("vote", (vote) => { // occurs on vote or test vote
	console.log(`Vote event: ${JSON.stringify(vote)}`)
})
topgg.on("reminder", (user) => { // occurs 12 hours after vote or test vote
	console.log(`reminder event: ${JSON.stringify(user)}`)
})
```

------------


### Features that might be useful that I've not yet implemented or enabled
- a seperate test vote event, which doesnt add the user to the database.
- or a seperate test vote event that has a seperate in memory database for testing reminders.
- errors in `event.on("reminder", fn)` should prevent removing the user from the database.
- or users should have a method to remove the user from the database in the event whenever they want to rather than automagically.
- The current method of having an interval grab all users that voted 12 hours ago and handling them in waves isnt very clean. I'd like to rewrite this to use timers on users that are about to be 12 hour ago. This would allow a longer interval time, while being accurate to nearly a second.
- A function to allow pausing/resuming the reminder interval is kind of nessecary.
- TopggOptions needs defaults.
- More error checking