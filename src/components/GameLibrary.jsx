import React, { useMemo, useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import { CATEGORY_LABELS, GAME_CATEGORIES, GAMES } from '../data/games';
import { gameName, t } from '../data/i18n';

export function GameLibrary({ stage, onSelectGame, language = 'en' }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [together, setTogether] = useState(false);

  const visibleGames = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return GAMES.filter(game =>
      (category === 'all' || game.category === category) &&
      (stageFilter === 'all' || game.stages.includes(stageFilter)) &&
      (!needle || `${game.name} ${game.description}`.toLowerCase().includes(needle))
    );
  }, [category, query, stageFilter]);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStageFilter('all');
  };

  return (
    <section className="platform-view game-library" aria-labelledby="library-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">{t(language, 'library.eyebrow')}</p>
          <h2 id="library-title">{t(language, 'library.title')}</h2>
          <p>{t(language, 'library.subtitle')}</p>
        </div>
        <label className={`together-toggle ${together ? 'active' : ''}`}>
          <input type="checkbox" checked={together} onChange={event => setTogether(event.target.checked)} />
          <Users size={21} aria-hidden="true" />
          {t(language, 'library.together')}
        </label>
      </div>

      <div className="library-filters">
        <label className="search-field">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Search games</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder={t(language, 'library.search')} />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={event => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {GAME_CATEGORIES.map(id => <option key={id} value={id}>{CATEGORY_LABELS[id]}</option>)}
          </select>
        </label>
        <label>
          <span>Stage</span>
          <select value={stageFilter} onChange={event => setStageFilter(event.target.value)}>
            <option value="all">All stages</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </label>
      </div>

      <p className="results-count" aria-live="polite">{visibleGames.length} games shown</p>

      {visibleGames.length ? (
        <div className="library-grid">
          {visibleGames.map((game, index) => (
            <article className={`library-game-card game-accent-${index % 5}`} key={game.id}>
              <div className="library-card-top">
                <span className="game-number">{String(GAMES.indexOf(game) + 1).padStart(2, '0')}</span>
                <span className="stage-chip">{game.stages.join(' · ')}</span>
              </div>
              <p className="game-category">{CATEGORY_LABELS[game.category]}</p>
              <h3>{gameName(language, game)}</h3>
              <p>{game.description}</p>
              <button className="library-play-btn" onClick={() => onSelectGame(game, together)}>
                {t(language, 'actions.play')} {together ? `· ${t(language, 'library.together')}` : ''}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <X size={34} aria-hidden="true" />
          <h3>No games match these filters</h3>
          <button className="game-primary-btn" onClick={clearFilters}>Clear filters</button>
        </div>
      )}
    </section>
  );
}
