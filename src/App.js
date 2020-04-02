import React from 'react';
const _ = require("lodash");
const { compose, withProps, lifecycle } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle
} = require("react-google-maps");
const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");

const MapWithASearchBox = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDXbYYXc9dMxxYgEle5RelBGv_3NTaT7fo&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  lifecycle({
    componentWillMount() {
      const refs = {}
      var newdata = []


      this.setState({
        data:[],
        isfetch:false,
        bounds: null,
        center: {
          lat: 24.860735, lng: 67.001137
        },
        populartimedata:[],
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          })
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          console.log('places length =>', places.length)



          const bounds = new window.google.maps.LatLngBounds();

          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location)
            }
          });
          const populartime = []
          const fetchdata = []
          const isfetch="false"
          var date = new Date()
          var day = date.getDay()
          var hour = date.getHours()
  

          var nextMarkers = []
      
          var nextMarkers = places.map((place,index) => ({
                    position: place.geometry.location,
                    rad:200
                  }));

                  const nextCenter = _.get(nextMarkers, '0.position', this.state.center);
                  this.setState({
                    center: nextCenter,
                    markers: nextMarkers
                  });
                           
  places.forEach((place,index) => {
 fetch(`http://192.168.2.105:5000/getdata/AIzaSyDXbYYXc9dMxxYgEle5RelBGv_3NTaT7fo&${place.place_id}`)
 .then(resp => resp.json())
 .then(resp => fetchdata.push(resp))
 .then(resp =>console.log('fetchdata=>', fetchdata))
 .then(() => index==places.length-1 ? fetchdata.forEach(data=>  data[0].populartimes ?
    populartime.push(data[0].populartimes[day].data[hour]) : populartime.push(0) 
 )  : null)
 .then(()=> index==places.length-1 ?  nextMarkers.map((markers,index)=>{
  markers.rad = populartime[index]
})
:null)
.then(()=> index==places.length-1 ?  nextMarkers.map((markers)=>{
  this.setState({nextMarkers:nextMarkers}) 
})
:null)
.then(()=> index==places.length-1 ?  this.setState({isfetch:true})
:null)
.then(()=> index==places.length-1 ?  console.log('marksers',this.state.nextMarkers)
:null)
  .then(() => this.setState({populartimedata:populartime}))
  .then(() => console.log('state =>' ,this.state.populartimedata))
})


         

        },
      })
    },
  }),
  withScriptjs,
  withGoogleMap
)(props =>

  <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={15}
    center={props.center}
    onIdle={props.onBoundsChanged}
  >
    
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Customized your placeholder"
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `240px`,
          height: `32px`,
          marginTop: `27px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`,
        }}
      />
    </SearchBox>
      {props.isfetch ? props.markers.map((marker,index)=> 
      
      <Marker key={index} position={marker.position}      
      >        
          <Circle defaultCenter={marker.position} radius= {marker.rad}  options={{strokeColor: "#ff0000",fillColor:'red'}}
          
          />
      </Marker>
      
      ):<h1>Loading...</h1>}
   
  </GoogleMap>
);


function App() {
  return (
    <div>
    <MapWithASearchBox />
    </div>
  );
}



export default App;
