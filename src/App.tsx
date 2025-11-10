import React, { useState, useRef } from 'react';
import { Search, Map, Globe2, X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import WorldMap from './components/WorldMap';
import CountrySearch from './components/CountrySearch';
import ColorPicker from './components/ColorPicker';
import { countries } from './data/countries';

// ISO 3166-1 numeric to alpha-3 country code mapping
const numericToAlpha3: Record<string, string> = {
  '004': 'AFG', '008': 'ALB', '012': 'DZA', '024': 'AGO', '032': 'ARG',
  '051': 'ARM', '036': 'AUS', '040': 'AUT', '031': 'AZE', '044': 'BHS',
  '050': 'BGD', '112': 'BLR', '056': 'BEL', '084': 'BLZ', '204': 'BEN',
  '064': 'BTN', '068': 'BOL', '070': 'BIH', '072': 'BWA', '076': 'BRA',
  '096': 'BRN', '100': 'BGR', '854': 'BFA', '108': 'BDI', '116': 'KHM',
  '120': 'CMR', '124': 'CAN', '140': 'CAF', '148': 'TCD', '152': 'CHL',
  '156': 'CHN', '170': 'COL', '178': 'COG', '188': 'CRI', '191': 'HRV',
  '192': 'CUB', '196': 'CYP', '203': 'CZE', '276': 'DEU', '262': 'DJI',
  '214': 'DOM', '180': 'COD', '218': 'ECU', '818': 'EGY', '222': 'SLV',
  '226': 'GNQ', '232': 'ERI', '233': 'EST', '231': 'ETH', '242': 'FJI',
  '246': 'FIN', '250': 'FRA', '266': 'GAB', '270': 'GMB', '268': 'GEO',
  '276': 'DEU', '288': 'GHA', '300': 'GRC', '320': 'GTM', '324': 'GIN',
  '624': 'GNB', '328': 'GUY', '332': 'HTI', '340': 'HND', '348': 'HUN',
  '352': 'ISL', '356': 'IND', '360': 'IDN', '364': 'IRN', '368': 'IRQ',
  '372': 'IRL', '376': 'ISR', '380': 'ITA', '384': 'CIV', '388': 'JAM',
  '392': 'JPN', '400': 'JOR', '398': 'KAZ', '404': 'KEN', '414': 'KWT',
  '417': 'KGZ', '418': 'LAO', '428': 'LVA', '422': 'LBN', '426': 'LSO',
  '430': 'LBR', '434': 'LBY', '440': 'LTU', '442': 'LUX', '450': 'MDG',
  '454': 'MWI', '458': 'MYS', '466': 'MLI', '478': 'MRT', '484': 'MEX',
  '498': 'MDA', '496': 'MNG', '499': 'MNE', '504': 'MAR', '508': 'MOZ',
  '104': 'MMR', '516': 'NAM', '524': 'NPL', '528': 'NLD', '554': 'NZL',
  '558': 'NIC', '562': 'NER', '566': 'NGA', '408': 'PRK', '807': 'MKD',
  '578': 'NOR', '512': 'OMN', '586': 'PAK', '591': 'PAN', '598': 'PNG',
  '600': 'PRY', '604': 'PER', '608': 'PHL', '616': 'POL', '620': 'PRT',
  '634': 'QAT', '642': 'ROU', '643': 'RUS', '646': 'RWA', '682': 'SAU',
  '686': 'SEN', '688': 'SRB', '694': 'SLE', '703': 'SVK', '705': 'SVN',
  '706': 'SOM', '710': 'ZAF', '410': 'KOR', '728': 'SSD', '724': 'ESP',
  '144': 'LKA', '729': 'SDN', '740': 'SUR', '752': 'SWE', '756': 'CHE',
  '760': 'SYR', '158': 'TWN', '762': 'TJK', '834': 'TZA', '764': 'THA',
  '626': 'TLS', '768': 'TGO', '788': 'TUN', '792': 'TUR', '795': 'TKM',
  '800': 'UGA', '804': 'UKR', '784': 'ARE', '826': 'GBR', '840': 'USA',
  '858': 'URY', '860': 'UZB', '862': 'VEN', '704': 'VNM', '732': 'ESH',
  '887': 'YEM', '894': 'ZMB', '716': 'ZWE'
};

const TOTAL_COUNTRIES = 193;

function App() {
  const [visitedCountries, setVisitedCountries] = useState<Record<string, string>>({});
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const contentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleCountrySelect = (countryCode: string) => {
    setVisitedCountries(prev => {
      const newVisited = { ...prev };
      
      if (countryCode in newVisited) {
        delete newVisited[countryCode];
      } else {
        newVisited[countryCode] = selectedColor;
      }
      
      return newVisited;
    });
  };

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    setVisitedCountries(prev => {
      const newVisited = { ...prev };
      Object.keys(newVisited).forEach(key => {
        newVisited[key] = newColor;
      });
      return newVisited;
    });
  };

  const handleCountrySearch = (countryCode: string | null) => {
    if (!countryCode) {
      return;
    }

    setSelectedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryCode)) {
        newSet.delete(countryCode);
      } else {
        newSet.add(countryCode);
      }
      return newSet;
    });
  };

  const getCountryName = (numericCode: string): string => {
    const alpha3Code = numericToAlpha3[numericCode];
    if (!alpha3Code) {
      console.warn(`No alpha-3 code found for numeric code: ${numericCode}`);
      return 'Unknown Country';
    }
    
    const country = countries.find(c => c.code === alpha3Code);
    if (!country) {
      console.warn(`No country found for alpha-3 code: ${alpha3Code}`);
      return 'Unknown Country';
    }
    
    return country.name;
  };

  const handleSaveImage = async () => {
    const mapContainer = mapRef.current;
    if (!mapContainer) return;

    try {
      const width = mapContainer.clientWidth;
      const height = mapContainer.clientHeight;
      const scale = Math.min(2, window.devicePixelRatio || 1);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = `${width}px`;
      tempContainer.style.height = `${height}px`;
      tempContainer.style.backgroundColor = '#ffffff';

      const clone = mapContainer.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.transition = 'none';
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.backgroundColor = '#ffffff';

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: width,
        height: height
      });

      document.body.removeChild(tempContainer);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wander-map.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="md:pl-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Wander Map
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 pr-6">
            <button
              onClick={handleSaveImage}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Save as Image
            </button>
            <ColorPicker
              color={selectedColor}
              onChange={handleColorChange}
            />
          </div>
        </div>
        
        <div ref={contentRef} className="flex flex-col-reverse md:flex-row gap-4">
          <div className="w-full md:w-1/4 md:pl-6 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center gap-2 mb-3 min-h-[28px]">
                  <Globe2 className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">Statistics</h2>
                </div>
                <div className="flex justify-between items-center min-h-[24px]">
                  <span className="text-gray-600 inline-flex items-center">Visited Countries</span>
                  <span className="font-semibold text-gray-900 inline-flex items-center">{Object.keys(visitedCountries).length}/{TOTAL_COUNTRIES}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4 min-h-[28px]">
                <Map className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 flex items-center">Visited Countries</h2>
              </div>

              <div className="relative flex items-center gap-2 bg-gray-50 rounded-lg mb-4">
                <Search size={18} className="text-gray-500 absolute left-2" />
                <CountrySearch 
                  onSelect={handleCountrySelect}
                  onSearch={handleCountrySearch}
                  className="pl-8 py-1.5"
                />
              </div>
              
              {Object.keys(visitedCountries).length === 0 ? (
                <p className="text-gray-500 text-sm inline-flex items-center min-h-[24px]">
                  No countries visited yet. Start by selecting countries on the map!
                </p>
              ) : (
                <div data-country-tags className="flex flex-wrap gap-2">
                  {Object.entries(visitedCountries).map(([code, color]) => (
                    <div
                      key={code}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm whitespace-nowrap"
                      style={{ 
                        backgroundColor: color,
                        color: '#fff',
                        textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                        lineHeight: '1.5',
                        height: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0 12px'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>{getCountryName(code)}</span>
                      <button
                        onClick={() => handleCountrySelect(code)}
                        className="ml-1 hover:opacity-80 transition-opacity"
                        aria-label="Remove country"
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%',
                          padding: '0 0 0 4px'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-3/4 md:pr-6">
            <div ref={mapRef} className="bg-white rounded-xl shadow-lg p-6">
              <WorldMap 
                visitedCountries={visitedCountries}
                selectedCountries={selectedCountries}
              />
            </div>
          </div>
        </div>

        <div className="md:hidden flex flex-col items-center gap-4 px-6 pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveImage}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Save as Image
            </button>
            <ColorPicker
              color={selectedColor}
              onChange={handleColorChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;