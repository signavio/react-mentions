import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

let context = require.context('./test', true, /\.spec\.js$/)
context.keys().forEach(context)
