const keys = obj => {
  return obj === Object(obj) ? Object.keys(obj) : []
}

export default keys
