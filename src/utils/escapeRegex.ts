// escape RegExp special characters https://stackoverflow.com/a/9310752/5142490
const escapeRegex = (str: string) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

export default escapeRegex
