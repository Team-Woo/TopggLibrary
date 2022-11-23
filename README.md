# Top.gg-Voting-SDK
------------

## Example code

```javascript
const { VotingSDK } = require('@top-gg/voting-sdk');

const topgg = new VotingSDK("authorization", {
	testReminderTime: 5
})

topgg.on("vote", (vote) => {
	console.log(`Vote event: ${JSON.stringify(vote)}`)
})
topgg.on("reminder", (reminder) => {
	console.log(`reminder event: ${JSON.stringify(reminder)}`)
})
topgg.on("testVote", (vote) => {
	console.log(`test vote event: ${JSON.stringify(vote)}`)
})
topgg.on("testReminder", (reminder) => {
	console.log(`test reminder event: ${JSON.stringify(reminder)}`)
})
```

------------