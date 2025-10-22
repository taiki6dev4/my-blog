import '@testing-library/jest-dom'

// setImmediateのポリフィル
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args)
  global.clearImmediate = (id) => clearTimeout(id)
}
