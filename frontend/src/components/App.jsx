import React from 'react'
import { Provider } from 'mobx-react'

import { mtStore } from '../stores/stores'
import MainPage from './MainPage.jsx'

export default class App extends React.Component {
  render () {
    return (
      <Provider mtStore={mtStore}>
        <div>
          <MainPage />
        </div>
      </Provider>
    )
  }
}
