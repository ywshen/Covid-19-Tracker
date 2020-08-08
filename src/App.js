import React, { useState, useEffect } from 'react';
import {MenuItem, FormControl, Select, Card, CardContent, } from '@material-ui/core'
import InfoBox from './InfoBox'
import LineGraph from "./LineGraph";
import Map from './Map'
import './App.css';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import numeral from "numeral";
import "leaflet/dist/leaflet.css"

function App() {
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState("worldwide");
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [casesType, setCasesType] = useState("cases")
    const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);

    useEffect(() => {
        fetch("https://disease.sh/v3/covid-19/all")
        .then((response) => response.json())
        .then((data) => {
            setCountryInfo(data);
        })
    } , [])

    useEffect(() => {
        const getCountriesData = async () => {
            await fetch("https://disease.sh/v3/covid-19/countries")
                .then((response) => response.json())
                .then((data) => {
                    const countries = data.map((country) => ({
                        name: country.country,
                        value: country.countryInfo.iso2,
                    }));

                    const sortedData = sortData(data);
                    setTableData(sortedData);
                    setMapCountries(data);
                    setCountries(countries);
                });
        };

        getCountriesData();
    }, []);

    const onCountryChange = async (event) => {
        const countryCode = event.target.value;
        setCountry(countryCode);

        const url = countryCode === "worldwide" ? "http://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data => {
        setCountryInfo(data);
    })
	}

  return (
      <div className="app">
          <div className="app_left">
          <div className="app_header">
              <h1>COVID-19-TRACKER</h1>
              <FormControl classname="app_dropdown">
                  <Select variant="outlined" onChange={onCountryChange} value={country}>
                      <MenuItem value="worldwide">Worldwide</MenuItem>
                      {countries.map((country) => (
                          <MenuItem value={country.value}>{country.name}</MenuItem>
                          ))}

                  </Select>
                </FormControl>
          </div>

          <div className="app_stats">
              <InfoBox 
                onClick={(e) => setCasesType("cases")}
                title="Coronavirus Cases"
                isRed
                active={casesType === "cases"}
                cases={prettyPrintStat(countryInfo.todayCases)}
                total={numeral(countryInfo.cases).format("0.0a")}
                />

              <InfoBox 
                onClick={(e) => setCasesType("recovered")}
                title="Recovered"
                active={casesType === "recovered"}
                cases={prettyPrintStat(countryInfo.todayRecovered)}
                total={numeral(countryInfo.recovered).format("0.0a")}
              />

              <InfoBox 
                onClick={(e) => setCasesType("deaths")}
                title="Deaths"
                isRed
                active={casesType === "deaths"}
                cases={prettyPrintStat(countryInfo.todayDeaths)}
                total={numeral(countryInfo.deaths).format("0.0a")}
              />
    

          </div>

          <Map 
          countries={mapCountries}
          casesType= {casesType}
          center={mapCenter}
          zoom={mapZoom}
          />

          </div>
          <Card className="app_right">
              <CardContent>
                <h3>Live Cases by Country</h3>
                <Table countries={tableData} />
                <h3>Worldwide new {casesType}</h3>
                <LineGraph casesType={casesType} />
              </CardContent>
          </Card>
        </div>
  );
}

export default App;
