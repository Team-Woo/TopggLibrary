import sqlite3 from "sqlite3";

export class db {
	public _sqlite: sqlite3.Database;
	ready: boolean;
	private remindAt: string;
	constructor(path: string, remindAt: number) {
		this.remindAt = remindAt.toString();
		this.ready = false;
		this._sqlite = new sqlite3.Database(path, (err) => {
			if (err) {
				console.error(err.message);
			}
		})
		this._sqlite.run(`
		CREATE TABLE IF NOT EXISTS voters (
			id VARCHAR NOT NULL PRIMARY KEY,
			votedAt timestamp
		);
		`, (err) =>{
			if(!err) this.ready = true
		});

	}

	addUser(id: string): void {
		this._sqlite.run(`
		INSERT into voters 
		(id, votedAt)
		VALUES (?, ?)
		ON CONFLICT (id) DO UPDATE
		SET votedAt = ?2;
		`,
			[
				id,
				new Date()
			])
	}

	deleteUser(id: string): void {
		this._sqlite.run(`
		DELETE FROM voters
		WHERE id = ?
		`, [id])
	}

	getUser(id: string): Promise<row> {
		return new Promise((resolve, reject) => {
			this._sqlite.get('SELECT * FROM voters WHERE id = ?', id, (err: Error, row: row) => {
				if (err) reject(err);
				resolve(row)
			})
		})
	}

	reminders(callback: (err: Error, row: row) => void) {
		this._sqlite.each(`
		SELECT *
		FROM voters
		WHERE votedAt <= unixepoch(datetime('now', '-${this.remindAt} seconds')) * 1000;
		`, callback)
	}
}

interface row {
	id: string
	votedAt: number
}