import { randomUUID } from 'crypto';
import { db, LOCAL_USER_EMAIL, LOCAL_USER_ID } from '../config/database.js';

function mapUser(row) {
	if (!row) return null;
	return {
		...row,
		is_local: Boolean(row.is_local),
	};
}

export function getUserById(id) {
	return mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

export function getUserByEmail(email) {
	return mapUser(db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email));
}

export function isUserAdmin(user) {
	if (!user) return false;
	if (user.is_local || user.is_local === 1) return true;
	return user.role === 'admin';
}

export function createUser({ email, passwordHash, isLocal = false, role, id = randomUUID() }) {
	let userRole = role;
	if (!userRole) {
		if (isLocal) {
			userRole = 'admin';
		} else {
			const countRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_local = 0").get();
			userRole = (countRow && countRow.count === 0) ? 'admin' : 'user';
		}
	}

	db.prepare(`
		INSERT INTO users (id, email, password_hash, is_local, role)
		VALUES (?, ?, ?, ?, ?)
	`).run(id, email.trim().toLowerCase(), passwordHash, isLocal ? 1 : 0, userRole);

	return getUserById(id);
}

export function getOrCreateLocalUser() {
	const existing = getUserById(LOCAL_USER_ID);
	if (existing) return existing;

	return createUser({
		id: LOCAL_USER_ID,
		email: LOCAL_USER_EMAIL,
		passwordHash: '',
		isLocal: true,
		role: 'admin',
	});
}

export function promoteUserToAdmin(email) {
	if (!email || !String(email).trim()) {
		throw new Error('Email is required to promote user to admin');
	}

	const cleanEmail = String(email).trim().toLowerCase();
	const user = getUserByEmail(cleanEmail);
	if (!user) {
		throw new Error(`User with email "${cleanEmail}" not found`);
	}

	db.prepare(`
		UPDATE users
		SET role = 'admin', updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`).run(user.id);

	return getUserById(user.id);
}

export function serializeUser(user) {
	if (!user) return null;
	return {
		id: user.id,
		email: user.email,
		isLocal: Boolean(user.is_local),
		isAdmin: isUserAdmin(user),
	};
}