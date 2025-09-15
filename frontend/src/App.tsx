import './App.css'
import TripForm from './components/forms/TripForm'
import LogSheet from './components/log/LogSheet'
import MapView from './components/map/MapView'

function App() {

  return (
    <>    
      <h1 className="text-3xl font-bold underline bg-blue-200">
        Hello world!
      </h1>
      <MapView />
      <TripForm onSubmit={() => null} />
      <LogSheet day={1} hoursDriven={[8,9,10,11,12,13,14]} />
    </>
  )
}

export default App
