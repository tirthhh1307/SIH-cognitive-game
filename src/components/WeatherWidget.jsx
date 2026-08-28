import React, { useState, useEffect, useCallback } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, MapPin, RefreshCw, Volume2 } from 'lucide-react';
import { speakText } from '../utils/speech';
import { playClickSound } from '../utils/audio';

const WEATHER_CODE_MAP = {
  0: { label: { en: 'Sunny & Clear', as: 'ফৰকাল বতৰ', hi: 'धूप और साफ़', mni: 'নুমিৎ থোকপা', trp: 'সাল কাহাম' }, icon: 'sun' },
  1: { label: { en: 'Mainly Sunny', as: 'প্ৰায় ফৰকাল', hi: 'हल्की धूप', mni: 'নুমিৎ মঙাল', trp: 'সাল মঙাল' }, icon: 'cloud-sun' },
  2: { label: { en: 'Partly Cloudy', as: 'পাতল ডাৱৰীয়া', hi: 'आंशिक बादल', mni: 'লৈচিল তাবা', trp: 'নোকপা ক্তুং' }, icon: 'cloud-sun' },
  3: { label: { en: 'Overcast & Calm', as: 'শান্ত ডাৱৰীয়া', hi: 'बादल और शांत', mni: 'শান্ত লৈচিল', trp: 'শান্ত নোকপা' }, icon: 'cloud' },
  45: { label: { en: 'Misty & Fresh', as: 'কুঁৱলী আৰু স্নিগ্ধ', hi: 'ताज़ा कोहरा', mni: 'মৈখুম মঙাল', trp: 'কুঁৱলী' }, icon: 'wind' },
  48: { label: { en: 'Gentle Mist', as: 'মৃদু কুঁৱলী', hi: 'हल्की धुंध', mni: 'মৃদু মৈখুম', trp: 'মৃদু কুঁৱলী' }, icon: 'wind' },
  51: { label: { en: 'Light Drizzle', as: 'পাতল বৰষুণ', hi: 'हल्की फुहारें', mni: 'চিক্না নোং চুরা', trp: 'মচা নোং' }, icon: 'cloud-rain' },
  53: { label: { en: 'Gentle Rain', as: 'মৃদু বৰষুণ', hi: 'सुहानी बारिश', mni: 'নুংঙাইবা নোং', trp: 'কাহাম নোং' }, icon: 'cloud-rain' },
  55: { label: { en: 'Pleasant Showers', as: 'আনন্দদায়ক বৰষুণ', hi: 'सुखद बौछारें', mni: 'নোংজু চুরা', trp: 'নোং কাহাম' }, icon: 'cloud-rain' },
  61: { label: { en: 'Light Rain', as: 'পাতল বৰষুণ', hi: 'हल्की वर्षा', mni: 'নোং চুরা', trp: 'নোং' }, icon: 'cloud-rain' },
  63: { label: { en: 'Rainy Breeze', as: 'বৰষুণৰ বতাহ', hi: 'बारिश और हवा', mni: 'নোং অমসুং নুংশিৎ', trp: 'নোং অমসুং নোবার' }, icon: 'cloud-rain' },
  65: { label: { en: 'Cool Rain', as: 'শীতল বৰষুণ', hi: 'शीतल वर्षा', mni: 'শীতল নোং', trp: 'শীতল নোং' }, icon: 'cloud-rain' },
  71: { label: { en: 'Soft Snow', as: 'কোমল তুষাৰপাত', hi: 'हल्की बर्फबारी', mni: 'উন চুরা', trp: 'উন' }, icon: 'snow' },
  80: { label: { en: 'Passing Showers', as: 'বৰষুণৰ ধাৰ', hi: 'हल्की फुहार', mni: 'নোং চুরা', trp: 'নোং' }, icon: 'cloud-rain' },
  95: { label: { en: 'Thunder Breeze', as: 'মেঘৰ গৰ্জন', hi: 'हल्की गरज', mni: 'নোংথোই', trp: 'মেঘনি গৰ্জন' }, icon: 'lightning' }
};

export function WeatherWidget({ language = 'en' }) {
  const [weather, setWeather] = useState(() => {
    try {
      const saved = localStorage.getItem('sanjibani_weather_cache');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      temp: 24,
      apparent: 25,
      conditionCode: 0,
      city: 'Guwahati, Assam',
      isDay: 1,
      windSpeed: 7
    };
  });

  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchWeatherForCoords = useCallback(async (lat, lon, detectedCity = null) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`,
        { signal: controller.signal }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const current = data.current || {};
        let city = detectedCity;

        if (!city) {
          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
              { signal: AbortSignal.timeout(4000) }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const place = geoData.locality || geoData.city || geoData.principalSubdivision;
              const region = geoData.principalSubdivision;
              city = place ? (region && place !== region ? `${place}, ${region}` : place) : 'Your Location';
            }
          } catch {
            city = 'Local Weather';
          }
        }

        const nextWeather = {
          temp: Math.round(current.temperature_2m ?? 24),
          apparent: Math.round(current.apparent_temperature ?? 25),
          conditionCode: current.weather_code ?? 0,
          city: city || 'Your Area',
          isDay: current.is_day ?? 1,
          windSpeed: Math.round(current.wind_speed_10m ?? 7)
        };

        setWeather(nextWeather);
        try {
          localStorage.setItem('sanjibani_weather_cache', JSON.stringify(nextWeather));
        } catch {}
      }
    } catch {
      // Keep existing or friendly default
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  }, [fetchWeatherForCoords]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const conditionInfo = WEATHER_CODE_MAP[weather.conditionCode] || WEATHER_CODE_MAP[0];
  const conditionLabel = conditionInfo.label[language] || conditionInfo.label.en;

  const renderIcon = () => {
    switch (conditionInfo.icon) {
      case 'sun':
        return <Sun size={26} className="weather-icon-sun" />;
      case 'cloud-sun':
        return <CloudSun size={26} className="weather-icon-cloudsun" />;
      case 'cloud':
        return <Cloud size={26} className="weather-icon-cloud" />;
      case 'cloud-rain':
        return <CloudRain size={26} className="weather-icon-rain" />;
      case 'lightning':
        return <CloudLightning size={26} className="weather-icon-lightning" />;
      case 'snow':
        return <Snowflake size={26} className="weather-icon-snow" />;
      case 'wind':
        return <Wind size={26} className="weather-icon-wind" />;
      default:
        return <Sun size={26} className="weather-icon-sun" />;
    }
  };

  const handleSpeakWeather = (e) => {
    e.stopPropagation();
    try { playClickSound(); } catch {}
    setIsSpeaking(true);
    const speechMap = {
      en: `The weather in ${weather.city} is currently ${weather.temp} degrees Celsius, ${conditionLabel}. Have a peaceful and joyful day!`,
      as: `${weather.city}ত এতিয়া উষ্ণতা ${weather.temp} ডিগ্ৰী চেলচিয়াছ, ${conditionLabel}। আপোনাৰ দিনটো শান্তিময় হওক!`,
      hi: `${weather.city} में अभी तापमान ${weather.temp} डिग्री सेल्सियस है, ${conditionLabel}। आपका दिन शुभ और मंगलमय हो!`,
      mni: `${weather.city}দা হৌজিক তাপমান ${weather.temp} দিগ্রী চেলসিয়সনি, ${conditionLabel}। অদোমগী নুমিৎ অসি শান্তিময় ওইরসনু!`,
      trp: `${weather.city} ও তাগুক তাপমাত্রা ${weather.temp} ডিগ্রী, ${conditionLabel}। নিনি সাল কাহাম ক্তুং!`
    };
    const textToSpeak = speechMap[language] || speechMap.en;
    speakText(textToSpeak, () => setIsSpeaking(false), language);
  };

  return (
    <aside className="weather-corner-widget" aria-label="Local weather status">
      <div className="weather-badge-icon-wrap" title={conditionLabel}>
        {renderIcon()}
      </div>

      <div className="weather-info-block">
        <div className="weather-top-row">
          <span className="weather-location-name">
            <MapPin size={13} className="weather-pin-icon" aria-hidden="true" />
            {weather.city}
          </span>
          <button 
            type="button" 
            className={`weather-action-btn ${loading ? 'spinning' : ''}`}
            onClick={detectLocation}
            title="Refresh local weather"
            aria-label="Refresh weather"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="weather-temp-row">
          <span className="weather-temperature">{weather.temp}°C</span>
          <span className="weather-condition-text">{conditionLabel}</span>
        </div>
      </div>

      <button
        type="button"
        className={`weather-speak-btn ${isSpeaking ? 'active-speaking' : ''}`}
        onClick={handleSpeakWeather}
        title="Hear weather forecast"
        aria-label="Listen to weather announcement"
      >
        <Volume2 size={16} />
      </button>
    </aside>
  );
}
