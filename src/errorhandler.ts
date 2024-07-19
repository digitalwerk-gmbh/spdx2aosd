const fs = require('fs');
export const checkErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message
	return String(error)
}

export const writeErrorLog = ({ message }: { message: string }) => {
	fs.writeFileSync('error.log', message);
}
