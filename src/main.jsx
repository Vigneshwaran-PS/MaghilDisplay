import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persister } from 'src/redux/Store.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persister}>
        <App/>
    </PersistGate>
  </Provider>
)
