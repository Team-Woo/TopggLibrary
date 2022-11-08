import EventEmitter from 'node:events';
import express from "express";
import { db } from './structs/database';
import topgg, { WebhookPayload } from '@top-gg/sdk';

export interface TopggOptions {
	path: string;
	port: number;
	interval?: number;
}

export interface VoteParameters {
	bot?: string;
	guild?: string;
	type: "upvote" | "test";
	isWeekend: boolean | undefined;
	query: string | undefined;
}

export class Topgg extends EventEmitter {
	public app: express.Application;
	public options: TopggOptions;
	private webhook;
	db: db;
	private _interval: NodeJS.Timer;
	constructor(private authorization: string, options: TopggOptions) {
		super();
		this.app = express();
		this.options = options;

		this.db = new db(options.path);

		this.webhook = new topgg.Webhook(authorization);


		this.app.post(this.options.path, this.webhook.listener((vote: WebhookPayload) => {

			this.db.addUser(vote.user)

			this.emit('vote', vote);
		}))

		this.app.listen(this.options.port);


		this._interval = setInterval(async () => {
			this.db.db.each(`
			SELECT *
			FROM voters
			WHERE votedAt >= NOW() - INTERVAL 12 HOUR;
			`, (err, row) => {
				if(err) return console.log(err.message);
				console.log(row)
				this.emit('reminder', row)
			})
		}, this.options.interval || 10000)


	}

}