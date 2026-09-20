import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import { env } from './config/env.js';
import { attachAuthContext } from './middleware/authMiddleware.js';

export function createApp() {
	const app = express();

	const configuredOrigins = [
		env.corsOrigin,
		env.frontendUrl,
		'http://localhost:5173',
		'http://localhost:8080',
	]
		.filter(Boolean)
		.flatMap((item) => String(item).split(',').map((o) => o.trim()))
		.filter(Boolean);

	const allowedOriginsSet = new Set(configuredOrigins);

	app.use(
		cors({
			origin: (origin, callback) => {
				if (!origin) return callback(null, true);
				if (allowedOriginsSet.has(origin)) {
					return callback(null, true);
				}
				try {
					const reqHostname = new URL(origin).hostname;
					for (const allowed of allowedOriginsSet) {
						try {
							if (new URL(allowed).hostname === reqHostname) {
								return callback(null, true);
							}
						} catch {}
					}
				} catch {}
				console.warn(`[CORS] Blocked request from origin: ${origin}`);
				return callback(new Error('Not allowed by CORS'), false);
			},
			credentials: true,
		}),
	);
	app.use((req, res, next) => {
		res.cookie ??= (name, value, options = {}) => {
			const directives = [`${name}=${encodeURIComponent(value)}`];
			if (options.httpOnly) directives.push('HttpOnly');
			if (options.sameSite) directives.push(`SameSite=${options.sameSite}`);
			if (options.secure) directives.push('Secure');
			directives.push(`Path=${options.path || '/'}`);
			if (options.maxAge === 0) directives.push('Max-Age=0');
			res.append('Set-Cookie', directives.join('; '));
		};
		res.clearCookie ??= (name, options = {}) => {
			res.cookie(name, '', { ...options, maxAge: 0 });
		};
		next();
	});
	app.use(express.json());
	app.use(attachAuthContext);

	app.get('/', (req, res) => {
		const frontendUrl = env.frontendUrl || 'http://localhost:5173';
		if (req.accepts('html')) {
			return res.redirect(frontendUrl);
		}
		res.json({
			name: 'VaultFlow API',
			status: 'online',
			frontend: frontendUrl,
			health: '/api/health',
		});
	});

	app.use('/api', healthRoutes);
	app.use('/api', authRoutes);
	app.use('/api', accountRoutes);
	app.use('/api', fileRoutes);
	app.use('/api', uploadRoutes);
	app.use('/api', settingsRoutes);
	app.use('/api', allocationRoutes);
	app.use('/api', adminRoutes);

	app.use((error, _req, res, _next) => {
		console.error('[API Error]', error);
		const rawMessage = error?.message || '';
		let safeMessage = rawMessage;

		if (/client_secret\s*=|authSecret|tokenHash/i.test(rawMessage)) {
			safeMessage = 'A server error occurred.';
		}

		const status = /Authentication required/.test(rawMessage)
			? 401
			: /Invalid|required|already|available|not found|unsupported|failed|Unable|Password|email/i.test(rawMessage)
				? 400
				: 500;

		res.status(status).json({
			error: safeMessage || 'Internal server error',
		});
	});

	return app;
}
