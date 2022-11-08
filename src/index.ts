import EventEmitter from 'node:events';
import express from "express";
import { db } from './structs/database';
import { WebhookPayload, Webhook } from '@top-gg/sdk';

export interface TopggOptions {
	path: string;
	port: number;
	dbPath: string;
	interval?: number;
}

export class TopggLib extends EventEmitter {
	public app: express.Application;
	public options: TopggOptions;

	private webhook;
	private _db: db;
	private _interval: NodeJS.Timer;
	constructor(authorization: string, options: TopggOptions) {
		super();
		this.app = express();
		this.options = options;

		this._db = new db(options.dbPath);

		this.webhook = new Webhook(authorization);


		this.app.post(this.options.path, this.webhook.listener((vote: WebhookPayload) => {

			/*
			This is not a feature in the design goals of this project, but its here if we want it down the line.
			if (vote.type === 'test') {
				this.emit('test', vote);
				return;
			}
			*/
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
		},
			this.options.interval || 10000);

	}

	/**
	 * 
	 * @param id a user or memeber id
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

}