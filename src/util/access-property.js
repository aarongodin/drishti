export default function accessProperty (obj, prop, def) {
	const parts = prop.split('.');
	const result = parts.reduce((acc, p) => acc ? acc[p] : undefined, obj);
	return result === undefined ? def : result;
}
