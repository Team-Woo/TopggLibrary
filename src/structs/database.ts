import sqlite3 from "sqlite3";

export class db {
	sqlite: sqlite3.Database;
	ready: boolean;
	constructor(path: string) {
		this.ready = false;
		this.sqlite = new sqlite3.Database(path, (err) => {
			if (err) {
				console.error(err.message);
			}
		})
		this.sqlite.run(`
		CREATE TABLE IF NOT EXISTS voters (
			id VARCHAR NOT NULL PRIMARY KEY,
			votedAt timestamp
		);
		`);

	}

	addUser(id: string) {
		this.sqlite.run(`
		INSERT into voters 
		(id, votedAt)
		VALUES (?, ?);
		`,
			[
				id,
				new Date()
			])
	}

	hasVoted(id: string) {
		return new Promise((resolve, reject) => {
			this.sqlite.get('SELECT * FROM voters WHERE id = ?', id, (err, rows) => {
				if(err) reject(err);
				resolve(rows != undefined)
			})
		})

	}
}