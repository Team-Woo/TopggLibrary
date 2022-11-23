import EventEmitter from 'node:events';
import express from "express";
import { db } from './structs/database';
import { WebhookPayload, Webhook } from '@top-gg/sdk';

/*
		this.options = {
			path: options.path ?? "/topggwebhook",
			port: options.port ?? 3000,
			dbPath: options.dbPath ?? "./voters.db",
			reminderTime: options.reminderTime ?? '12 hours',
			interval: options.interval ?? 10000,
			testDbPath: options.testDbPath ?? ':memory:',
			testReminderTime: options.testReminderTime ?? '30 seconds'
		};
*/

export interface TopggOptions {
	/** The webhook URL path e.g. http://ip:port/<b>PATH</b> 
	 * @defaultValue '/topggwebhook' */
	path?: string;
	/** The webhook URL port e.g. http://ip:<b>PORT</b>/path 
	 * @defaultValue 3000 */
	port?: number;
	/** The sqlite database location 
	 * @defaultValue './voters.db' */
	dbPath?: string;
	/** The number of seconds to wait before firing the remind event
	 * @defaultValue 43200 e.g. 12 hours */
	reminderTime?: number;
	/** The number of seconds between checking the database for reminders.
		 * @defaultValue 10 */
	interval?: number;
	/** The sqlite database location for test votes
	 * @defaultValue ':memory:' :memory: uses a temporary in memory database */
	testDbPath?: string;
	/** The number of seconds to wait before firing the remind event
	 * @defaultValue 30 e.g. 30 seconds */
	testReminderTime?: number;
}
interface _TopggOptions {
	path: string;
	port: number;
	dbPath: string;
	reminderTime: number;
	interval: number;
	testDbPath: string;
	testReminderTime: number;
}

export class VotingSDK extends EventEmitter {
	/** 
	 * The expressjs app
	 * @see [Expressjs](http://expressjs.com/en/4x/api.html#app)
	 * */
	public app: express.Application;
	private options: _TopggOptions;

	/**
 * An event when someone votes
 * @event
 * @example
 * ```js
 * topgg.on("vote", (vote) => {
 * 	console.log(`Vote event: ${JSON.stringify(vote)}`)
 * })
 * ```
 */
	static ON_VOTE = "vote";

	/**
	 * An event when you can remind someone
	 * @event
	 * @example
	 * ```js
	 * topgg.on("reminder", (reminder) => {
	 * 	console.log(`reminder event: ${JSON.stringify(reminder)}`)
	 * })
	 * ```
	 */
	static ON_REMINDER = "reminder";



	/**
* An event when someone uses the "send test" button on Top.gg
* @event
* @example
* ```js
* topgg.on("testVote", (vote) => {
* 	console.log(`Vote event: ${JSON.stringify(vote)}`)
* })
* ```
*/
	static ON_TEST_VOTE = "testVote";

	/**
	 * A reminder event for when someone uses the "send test" button on Top.gg
	 * @event
	 * @example
	 * ```js
	 * topgg.on("testReminder", (reminder) => {
	 * 	console.log(`reminder event: ${JSON.stringify(reminder)}`)
	 * })
	 * ```
	 */
	static ON_TEST_REMINDER = "testReminder";

	private webhook;
	private _db: db;
	private _interval: NodeJS.Timer;
	private _testDb: db;

	/**
	 * Create a new vote SDK instance
	 * @param authorization Webhook authorization to verify requests
	 */
	constructor(authorization: string, options: TopggOptions = {}) {
		super();

		this.app = express();

		this.options = {
			path: options.path ?? "/topggwebhook",
			port: options.port ?? 3000,
			dbPath: options.dbPath ?? "./voters.db",
			reminderTime: options.reminderTime ?? 43200,
			interval: options.interval ?? 10000,
			testDbPath: options.testDbPath ?? ':memory:',
			testReminderTime: options.testReminderTime ?? 30
		};

		this._db = new db(this.options.dbPath, this.options.reminderTime);
		this._testDb = new db(this.options.testDbPath, this.options.testReminderTime);

		this.webhook = new Webhook(authorization);


		this.app.post(this.options.path, this.webhook.listener((vote: WebhookPayload) => {

			if (vote.type === 'test') {
				this.emit('testVote', vote);
				this._testDb.addUser(vote.user);
				return;
			}

			this.emit('vote', vote);
			this._db.addUser(vote.user)
		}))

		this.app.listen(this.options.port);


		this._interval = setInterval(async () => {
			this._db.reminders(
				(err, row) => {
					if (err) return console.error(err);
					this.emit('reminder', row)
					this._db.deleteUser(row.id)
				}
			)
			this._testDb.reminders(
				(err, row) => {
					if (err) return console.error(err);
					this.emit('testReminder', row)
					this._testDb.deleteUser(row.id)
				}
			)
		},
			this.options.interval);

	}

	/**
	 * 
	 * @param id a user or member id
	 * @returns true if the user voted within the past 12 hours
	 * 
	 * @example 
	 * ```js
	 * 	const voted = await topgg.hasVoted(user.id)
	 * ```
	 */
	async hasVoted(id: string): Promise<boolean> {
		return ((await this._db.getUser(id)) != undefined)
	}

	/**
	 * 
	 * @param id a user or member id
	 * @returns the timestamp the user voted at if they have voted in the past 12 hours or undefined if they havent voted within the past 12 hours.
	 * 
	 * @example
	 * ```js
	 *  const voted = await topgg.votedAt(user.id)
	 * ```
	 */
	async votedAt(id: string): Promise<number | undefined> {
		return (await this._db.getUser(id))?.votedAt;
	}

}