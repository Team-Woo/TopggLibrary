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
	db: db;
	public _interval: NodeJS.Timer;
	constructor(authorization: string, options: TopggOptions) {
		super();
		this.app = express();
		this.options = options;

		this.db = new db(options.dbPath);

		this.webhook = new Webhook(authorization);


		this.app.post(this.options.path, this.webhook.listener((vote: WebhookPayload) => {

			/*
			This is not a feature in the design goals of this project, but its here if we want it down the line.
			if (vote.type === 'test') {
				this.emit('test', vote);
				return;
			}
			*/

			this.db.addUser(vote.user)

			this.emit('vote', vote);
		}))

		this.app.listen(this.options.port);


		this._interval = setInterval(async () => {
			this.db.sqlite.each(`
			SELECT *
			FROM voters
			WHERE votedAt <= unixepoch(datetime('now', '-12 hours')) * 1000;
			`, (err, row) => {
				if (err) return console.log(err);
				this.emit('reminder', row)

				this.db.sqlite.run(`
				DELETE FROM voters
				WHERE id = ?
				`, [row.id])
			})
		}, this.options.interval || 10000)

	}
}