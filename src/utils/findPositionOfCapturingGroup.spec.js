import expect from 'expect'
import findPositionOfCapturingGroup from './findPositionOfCapturingGroup'

describe('#findPositionOfCapturingGroup', () => {
  const testData = {
    '@[__display__](__id__)': { display: 0, id: 1 },
    '{{__id__#__display__}}': { display: 1, id: 0 },
    '{{__id__}}': { display: 0, id: 0 },
    '{{__display__}}': { display: 0, id: 0 },
  }

  Object.keys(testData).forEach(key => {
    const markup = key
    const positions = testData[key]

    it(`should return ${
      positions.display
    } for the 'display' position in markup '${markup}'`, () => {
      expect(findPositionOfCapturingGroup(markup, 'display')).toEqual(
        positions.display
      )
    })

    it(`should return ${
      positions.id
    } for the 'id' position in markup '${markup}'`, () => {
      expect(findPositionOfCapturingGroup(markup, 'id')).toEqual(positions.id)
    })
  })
})
