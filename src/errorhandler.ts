const fs = require('fs');
require('dotenv').config();
export const checkErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message
	return String(error)
}

export const writeErrorLog = ({ message }: { message: string }) => {
	fs.writeFileSync(process.env.LOG_FILE_PATH, message);
}
