import React, { useState, useEffect } from 'react';
import { Globe, ChevronLeft, ChevronRight, Volume2, Sparkles, Heart } from 'lucide-react';
import { POSITIVE_NEWS } from '../data/positiveNews';
import { speakText } from '../utils/speech';
import { playClickSound, playSuccessSound } from '../utils/audio';

export function PositiveNewsWidget({ language = 'en' }) {
  const [index, setIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [heartSparkle, setHeartSparkle] = useState(false);
  const [cheerCount, setCheerCount] = useState(12);

  const currentNews = POSITIVE_NEWS[index] || POSITIVE_NEWS[0];
  const title = currentNews.title[language] || currentNews.title.en;
  const summary = currentNews.summary[language] || currentNews.summary.en;

  // Auto-cycle positive news every 14 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % POSITIVE_NEWS.length);
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e) => {
    e.stopPropagation();
    try { playClickSound(); } catch {}
    setIndex(prev => (prev === 0 ? POSITIVE_NEWS.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    try { playClickSound(); } catch {}
    setIndex(prev => (prev + 1) % POSITIVE_NEWS.length);
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    try { playClickSound(); } catch {}
    setIsSpeaking(true);
    const fullText = `${title}. ${summary}`;
    speakText(fullText, () => setIsSpeaking(false), language);
  };

  const handleCheer = (e) => {
    e.stopPropagation();
    try { playSuccessSound(); } catch {}
    setCheerCount(c => c + 1);
    setHeartSparkle(true);
    setTimeout(() => setHeartSparkle(false), 1200);
  };

  const widgetHeaderMap = {
    en: 'Positive World News',
    as: 'বিশ্বৰ ইতিবাচক বাৰ্তা',
    hi: 'सकारात्मक विश्व समाचार',
    mni: 'মালেমগী অফবা পাউ',
    trp: 'বিশ্বনি কাহাম খবৰ'
  };

  const headerTitle = widgetHeaderMap[language] || widgetHeaderMap.en;

  return (
    <aside className="positive-news-widget" aria-label="Positive world news">
      <div className="news-badge-wrap">
        <div className="news-icon-circle" title={currentNews.tag}>
          <Globe size={22} className="news-globe-icon" aria-hidden="true" />
        </div>
      </div>

      <div className="news-content-block">
        <div className="news-top-bar">
          <div className="news-tag-pill">
            <Sparkles size={11} className="sparkle-mini" aria-hidden="true" />
            <span>{currentNews.tag}</span>
          </div>
          <span className="news-category-label">{headerTitle}</span>
        </div>

        <h4 className="news-headline" title={title}>
          {title}
        </h4>
        <p className="news-summary-text">
          {summary}
        </p>

        <div className="news-bottom-nav">
          <div className="news-pagination-dots">
            {POSITIVE_NEWS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`news-dot ${i === index ? 'active-dot' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Go to story ${i + 1}`}
              />
            ))}
          </div>

          <div className="news-actions-group">
            <button
              type="button"
              className="news-cheer-btn"
              onClick={handleCheer}
              title="Celebrate this good news!"
              aria-label="Celebrate news"
            >
              <Heart size={14} className={heartSparkle ? 'heart-bounce' : ''} fill={heartSparkle ? '#E53935' : 'none'} color={heartSparkle ? '#E53935' : '#E53935'} />
              <span className="cheer-count">{cheerCount}</span>
            </button>

            <button
              type="button"
              className={`news-voice-btn ${isSpeaking ? 'active-speaking' : ''}`}
              onClick={handleSpeak}
              title="Listen to story"
              aria-label="Listen to positive news"
            >
              <Volume2 size={14} />
            </button>

            <div className="news-arrow-buttons">
              <button
                type="button"
                className="news-nav-arrow"
                onClick={handlePrev}
                title="Previous story"
                aria-label="Previous story"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="news-nav-arrow"
                onClick={handleNext}
                title="Next story"
                aria-label="Next story"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
