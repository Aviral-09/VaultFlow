import { promoteUserToAdmin } from '../services/userService.js';

const email = process.argv[2];

if (!email || !email.trim()) {
	console.error('Error: Email argument is required.');
	console.error('Usage: npm run bootstrap-admin -- <user-email>');
	process.exit(1);
}

try {
	const user = promoteUserToAdmin(email);
	console.log(`[Admin Bootstrap] SUCCESS: User "${user.email}" (ID: ${user.id}) has been promoted to admin.`);
	process.exit(0);
} catch (error) {
	console.error(`[Admin Bootstrap] ERROR: ${error.message}`);
	process.exit(1);
}
