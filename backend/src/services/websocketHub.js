import { getUploadSessionForUser } from './uploadSessionService.js';
import { env } from '../config/env.js';
import { resolveSession, getFallbackLocalUser } from './authService.js';

const uploadSockets = new Map();

function parseCookies(cookieHeader = '') {
	return Object.fromEntries(
		String(cookieHeader || '')
			.split(';')
			.map((item) => item.trim())
			.filter(Boolean)
			.map((item) => {
				const separator = item.indexOf('=');
				if (separator === -1) return [item, ''];
				return [item.slice(0, separator), decodeURIComponent(item.slice(separator + 1))];
			}),
	);
}

export function resolveUserFromHttpRequest(request) {
	if (env.appMode === 'local') {
		return getFallbackLocalUser();
	}

	const cookies = parseCookies(request.headers.cookie || '');
	const token = cookies[env.authCookieName] || '';
	return resolveSession(token);
}

export function registerUploadSocket(userId, uploadId, socket) {
	if (!userId || !uploadId) return false;

	const session = getUploadSessionForUser(userId, uploadId);
	if (!session) {
		return false;
	}

	if (!uploadSockets.has(uploadId)) {
		uploadSockets.set(uploadId, new Set());
	}

	uploadSockets.get(uploadId).add(socket);
	return true;
}

export function unregisterUploadSocket(uploadId, socket) {
	const sockets = uploadSockets.get(uploadId);
	if (!sockets) return;
	sockets.delete(socket);
	if (!sockets.size) {
		uploadSockets.delete(uploadId);
	}
}

export function emitUploadEvent(uploadId, event) {
	const sockets = uploadSockets.get(uploadId);
	if (!sockets) return;

	for (const socket of sockets) {
		if (socket.readyState === 1) {
			socket.send(JSON.stringify(event));
		}
	}
}
