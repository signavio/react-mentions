import identity from 'lodash/identity'

let Radium
try {
  Radium = require('radium')
} catch(err) { 
  if (err.code === "MODULE_NOT_FOUND") {
    Radium = identity
  } else {
    throw err;
  }
}

export default Radium