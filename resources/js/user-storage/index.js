

const USER_LOCALSTORAGE_KEY = 'nasya_user';
const REMEMBERED_USER_LOCALSTORAGE_KEY = 'nasya_remembered_user'

// helper to get user from localstorage
export function getStoredUser () {
	const storedUser = localStorage.getItem(USER_LOCALSTORAGE_KEY);
	return storedUser ? JSON.parse(storedUser) : null;
}

export function setStoredUser (user) {
	if (user) {
		localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(user));
	}
}

export function clearStoredUser () {
	localStorage.removeItem(USER_LOCALSTORAGE_KEY);
}

export function setStoredRememberedUser (user) {
	localStorage.setItem(REMEMBERED_USER_LOCALSTORAGE_KEY, JSON.stringify(user));
}

export function getStoredRememberedUser () {
	const storedInfo = localStorage.getItem(REMEMBERED_USER_LOCALSTORAGE_KEY);
	return storedInfo ? JSON.parse(storedInfo) : null;
}

export function clearStoredRememberedUser () {
	localStorage.removeItem(REMEMBERED_USER_LOCALSTORAGE_KEY);
}