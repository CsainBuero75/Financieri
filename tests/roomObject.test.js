const assert = require('node:assert/strict')
const { Room } = require('../internal_modules/websocket_modules/roomManager_modules/roomObject.js')

const fakeHost = { userId: 'host-1' }
const room = new Room('abc1234', fakeHost)

room.setSeed({
  startYear: 2020,
  startMonth: 1,
  semiAnnuallySaving: 1000,
  playtime: 24,
  seed: { stocks: {}, indexfund: {}, commodity: {} }
})

let [year, month] = room.Update()
assert.equal(year, 2020)
assert.equal(month, 1)

for (let i = 0; i < 11; i++) {
  [year, month] = room.Update()
}
assert.equal(month, 12)

;[year, month] = room.Update()
assert.equal(year, 2021)
assert.equal(month, 1)

assert.equal(room.Joinable, false)

console.log('roomObject.test.js passed')
