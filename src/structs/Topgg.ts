import EventEmitter from 'node:events';
import express from "express";
import { db } from './database';
import { WebhookPayload } from '@top-gg/sdk';

const topgg = require("@top-gg/sdk")

export interface TopggOptions {
	path: string;
	port: number;
	reminders?: boolean;
	remindersOnByDefault: boolean;
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
	interval: NodeJS.Timer;
	constructor(private authorization: string, options: TopggOptions) {
		super();
		this.app = express();
		this.options = options;

		this.db = new db(options.path);

		this.webhook = new topgg.Webhook(authorization);


		this.app.post(this.options.path, this.webhook.listener((vote:WebhookPayload) => {

			this.db.addUser(vote.user)

			this.emit('vote', vote);
		}))

		this.app.listen(this.options.port);


		this.interval = setInterval(async () => {
			
		})


	}

}