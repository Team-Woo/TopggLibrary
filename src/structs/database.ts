import sqlite3 from "sqlite3";

export class db {
	db: sqlite3.Database;
	ready: boolean;
	constructor(path: string) {
		this.ready = false;
		this.db = new sqlite3.Database(path, (err) => {
			if (err) {
				console.error(err.message);
			}
		})
		this.db.run(`
		CREATE TABLE IF NOT EXISTS voters (
			id VARCHAR NOT NULL PRIMARY KEY,
			votedAt timestamp
		);
		`);

	}

	addUser(id: string) {
		this.db.run(`
		INSERT into voters 
		(id, votedAt)
		($id, $votedAt);
		`,
			{
				id,
				votedAt: new Date()
			})
	}
}