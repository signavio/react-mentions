/* global jasmine */
import 'jest-enzyme'

import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
// import jasmineReporters from 'jasmine-reporters'

configure({ adapter: new Adapter() })

// jasmine.VERBOSE = true

// jasmine.getEnv().addReporter(
//   new jasmineReporters.JUnitXmlReporter({
//     consolidateAll: false,
//     savePath: './reports/junit',
//     filePrefix: 'test-results-',
//   })
// )
