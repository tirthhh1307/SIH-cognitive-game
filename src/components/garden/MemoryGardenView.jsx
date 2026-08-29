import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Droplets,
  Volume2,
  VolumeX,
  Sun,
  Music,
  Plus,
  Store,
  X,
  Coins,
  Check,
  RotateCcw,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { animate, stagger } from 'animejs';
import {
  GARDEN_PLANTS,
  MARKET_SUPPLIES
} from '../../data/gardenItems';
import {
  plantSeedInPot,
  waterGardenPot,
  fertilizeGardenPot,
  careGardenPotWithSpecial,
  collectGardenStars,
  buyGardenMarketItem,
  toggleGardenBgm
} from '../../utils/platform';
import {
  startGardenBgm,
  stopGardenBgm,
  playWaterSplashSound,
  playBloomSound,
  playClickSound,
  playStarSound,
  playSuccessSound
} from '../../utils/audio';
import { speakText } from '../../utils/speech';

export function MemoryGardenView({ state, onStateChange, onBackHome, language = 'en' }) {
  const [selectedTool, setSelectedTool] = useState('water'); // 'water' | 'fertilizer' | 'sunlight' | 'music'
  const [showMarket, setShowMarket] = useState(false);
  const [marketTab, setMarketTab] = useState('seeds'); // 'seeds' | 'supplies'
  const [activePotForSeed, setActivePotForSeed] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');
  const [flyingCoin, setFlyingCoin] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const garden = state.garden || {};
  const pots = garden.pots || [];
  const inventory = garden.inventory || { seeds: {}, water: 25, fertilizer: 6, sunlight: 3, music: 3 };
  const bgmEnabled = garden.bgmEnabled ?? true;
  const currentStars = state.stars || 0;

  const walletRef = useRef(null);
  const greenhouseRef = useRef(null);

  // Manage ambient peaceful BGM lifecycle
  useEffect(() => {
    if (bgmEnabled) {
      startGardenBgm();
    } else {
      stopGardenBgm();
    }
    return () => {
      stopGardenBgm();
    };
  }, [bgmEnabled]);

  // Anime.js 3D staggered entrance for greenhouse bamboo stands
  useEffect(() => {
    if (greenhouseRef.current) {
      animate('.bamboo-stand-slot', {
        scale: [0.75, 1],
        opacity: [0, 1],
        translateY: [40, 0],
        delay: stagger(60, { from: 'first' }),
        easing: 'easeOutElastic(1, 0.7)',
        duration: 750
      });
    }
  }, []);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const handleToggleBgm = () => {
    playClickSound();
    const nextState = toggleGardenBgm(state);
    onStateChange(nextState);
    if (!bgmEnabled) {
      startGardenBgm();
      showToast('🎵 Peaceful greenhouse chimes playing');
    } else {
      stopGardenBgm();
      showToast('🔇 Greenhouse music muted');
    }
  };

  const handleToolSelect = (tool) => {
    playClickSound();
    setSelectedTool(tool);
    if (tool === 'water') speakText('Watering can selected. Tap a plant on the bamboo stand to nourish it with fresh spring water.', null, language);
    else if (tool === 'fertilizer') speakText('Organic compost selected. Tap a plant to accelerate its growth.', null, language);
    else if (tool === 'sunlight') speakText('Himalayan sun lamp selected. Tap a blooming plant to bathe it in warm golden light.', null, language);
    else if (tool === 'music') speakText('Bamboo wind chime selected. Tap a plant to play soothing melodies.', null, language);
  };

  // Collect stars with PvZ coin arc animation into wallet
  const handleCollectStars = (pot, plantDef, event) => {
    event.stopPropagation();
    playStarSound();
    const amount = pot.starsToCollect || 10;

    // Trigger celebratory particle burst
    confetti({
      particleCount: 45,
      spread: 60,
      origin: {
        x: event.clientX ? event.clientX / window.innerWidth : 0.5,
        y: event.clientY ? event.clientY / window.innerHeight : 0.5
      },
      colors: ['#FFD700', '#FFA000', '#FFEA00', '#81C784']
    });

    // Animate star wallet counter bounce
    if (walletRef.current) {
      animate(walletRef.current, {
        scale: [1, 1.25, 1],
        duration: 400,
        easing: 'easeOutBack'
      });
    }

    const nextState = collectGardenStars(state, pot.id);
    onStateChange(nextState);
    showToast(`⭐ Harvested +${amount} Stars from ${plantDef.name}!`);
    speakText(`Gathered ${amount} golden stars from your blooming ${plantDef.name}!`, null, language);
  };

  const handlePotClick = (pot) => {
    // 1. If empty -> open seed selector for this pot
    if (!pot.plantId) {
      playClickSound();
      setActivePotForSeed(pot.id);
      return;
    }

    const plantDef = GARDEN_PLANTS.find(p => p.id === pot.plantId) || GARDEN_PLANTS[0];

    // 2. If stars ready to collect, harvest them
    if (pot.starsToCollect > 0) {
      handleCollectStars(pot, plantDef, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2, stopPropagation: () => {} });
      return;
    }

    // 3. Apply active tool
    if (selectedTool === 'water') {
      playWaterSplashSound();
      const nextState = waterGardenPot(state, pot.id, plantDef.starYield);
      onStateChange(nextState);
      showToast(`💧 Nourished ${plantDef.name}!`);

      // Animate pot bounce with Anime.js
      animate(`#stand-pot-${pot.id}`, {
        scale: [1, 1.15, 1],
        translateY: [0, -10, 0],
        duration: 450,
        easing: 'easeOutElastic(1, 0.6)'
      });

      if (pot.stage >= 3) {
        playBloomSound();
        confetti({ particleCount: 30, spread: 50, colors: ['#4CAF50', '#FFD700', '#E91E63'] });
      }
    } else if (selectedTool === 'fertilizer') {
      if ((inventory.fertilizer || 0) <= 0) {
        showToast('🌿 You need Organic Compost from the Zen Market (top-left)!');
        speakText('You are out of compost. Open the Zen Market in the top left to acquire more with stars.', null, language);
        return;
      }
      playBloomSound();
      const nextState = fertilizeGardenPot(state, pot.id, plantDef.starYield);
      onStateChange(nextState);
      showToast(`🌿 Natural compost energized ${plantDef.name}!`);
      confetti({ particleCount: 40, spread: 55, colors: ['#8BC34A', '#CDDC39', '#FFEB3B'] });
    } else if (selectedTool === 'sunlight') {
      if ((inventory.sunlight || 0) <= 0) {
        showToast('☀️ You need a Sunlight Lamp from the Zen Market!');
        return;
      }
      playBloomSound();
      const nextState = careGardenPotWithSpecial(state, pot.id, 'sunlight', plantDef.starYield * 2);
      onStateChange(nextState);
      showToast(`☀️ Himalayan sunlight blessed ${plantDef.name} with radiant blossoms!`);
      confetti({ particleCount: 60, spread: 70, colors: ['#FFA000', '#FFD54F', '#FFF9C4'] });
    } else if (selectedTool === 'music') {
      if ((inventory.music || 0) <= 0) {
        showToast('🎐 You need Bamboo Wind Chimes from the Zen Market!');
        return;
      }
      playBloomSound();
      const nextState = careGardenPotWithSpecial(state, pot.id, 'music', plantDef.starYield * 2);
      onStateChange(nextState);
      showToast(`🎐 Calming wind chimes filled ${plantDef.name} with harmony!`);
      confetti({ particleCount: 60, spread: 70, colors: ['#80CBC4', '#4DB6AC', '#009688'] });
    }
  };

  const handlePlantSeed = (plantId) => {
    if (!activePotForSeed) return;
    const available = inventory.seeds?.[plantId] ?? 0;
    if (available <= 0) {
      showToast('🌱 You do not have this seed. Buy one in the Zen Market (top-left)!');
      return;
    }

    playSuccessSound();
    const nextState = plantSeedInPot(state, activePotForSeed, plantId);
    onStateChange(nextState);
    const plantDef = GARDEN_PLANTS.find(p => p.id === plantId);
    showToast(`🌱 Planted ${plantDef?.name || 'seed'} on Stand #${activePotForSeed}!`);
    speakText(`Planted a ${plantDef?.name} seed on your bamboo stand. Give it gentle water to help it sprout!`, null, language);
    setActivePotForSeed(null);
  };

  const handleBuyItem = (item) => {
    const isSeed = Boolean(item.seedPrice);
    const price = isSeed ? item.seedPrice : item.price;
    if (currentStars < price) {
      playClickSound();
      showToast(`⭐ You need ${price - currentStars} more Stars to buy this!`);
      speakText('You need a few more stars. You can earn stars by playing gentle cognitive games!', null, language);
      return;
    }

    playSuccessSound();
    playStarSound();
    confetti({ particleCount: 45, spread: 60 });

    const buyPayload = isSeed
      ? { seedPlantId: item.id, price: item.seedPrice }
      : { type: item.type, price: item.price, amount: item.amount };

    const { state: nextState, success } = buyGardenMarketItem(state, buyPayload);
    if (success) {
      onStateChange(nextState);
      showToast(`🎉 Purchased ${item.name} for ${price} Stars!`);
      speakText(`Purchased ${item.name}! It is now in your garden inventory.`, null, language);
    }
  };

  // Group 16 pots into 4 tiered greenhouse rows (4 stands per row)
  const rows = [
    pots.slice(0, 4),
    pots.slice(4, 8),
    pots.slice(8, 12),
    pots.slice(12, 16)
  ];

  return (
    <div className="pvz-greenhouse-page" role="main" aria-label="Zen Memory Garden Greenhouse">
      {/* Top Glass Ceiling & Structural Rafters */}
      <div className="greenhouse-glass-canopy">
        <div className="sunlight-caustic-rays"></div>
        <div className="treetop-foliage-backdrop"></div>
      </div>

      {/* Top Navigation & Status Bar */}
      <header className="pvz-garden-topbar">
        {/* TOP LEFT: Zen Nursery Market & Home Back Button */}
        <div className="topbar-left-cluster">
          <button
            type="button"
            className="pvz-market-btn"
            onClick={() => {
              playClickSound();
              setShowMarket(true);
            }}
            title="Open Zen Nursery Market (Buy Seeds & Supplies)"
            aria-label="Zen Market"
          >
            <div className="market-icon-badge">
              <Store size={22} />
            </div>
            <div className="market-text-stack">
              <span className="market-label-main">ZEN MARKET</span>
              <span className="market-label-sub">Seeds & Care</span>
            </div>
          </button>

          <button
            type="button"
            className="pvz-home-btn"
            onClick={() => {
              playClickSound();
              onBackHome();
            }}
            title="Return to Main Home"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
            <span>Home</span>
          </button>
        </div>

        {/* TOP CENTER: Greenhouse Title */}
        <div className="topbar-center-title">
          <h1 className="greenhouse-title">🌱 Zen Memory Greenhouse</h1>
          <p className="greenhouse-sub">Apon Mon Peaceful Botanical Sanctuary</p>
        </div>

        {/* TOP RIGHT: Star Currency Wallet & BGM Audio Controls */}
        <div className="topbar-right-cluster">
          {/* Star Wallet */}
          <div className="pvz-star-wallet" ref={walletRef} title="Your Star Currency Balance">
            <span className="wallet-star-icon">⭐</span>
            <span className="wallet-star-count">{currentStars}</span>
            <span className="wallet-star-tag">STARS</span>
          </div>

          {/* BGM Toggle */}
          <button
            type="button"
            className={`pvz-audio-toggle ${bgmEnabled ? 'bgm-on' : 'bgm-off'}`}
            onClick={handleToggleBgm}
            title={bgmEnabled ? 'Mute Peaceful Chimes' : 'Turn On Peaceful Chimes'}
            aria-label="Toggle Peaceful Chimes BGM"
          >
            {bgmEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{bgmEnabled ? 'Chimes On' : 'Chimes Off'}</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            className="pvz-help-btn"
            onClick={() => setShowHelp(h => !h)}
            title="How to play Zen Garden"
            aria-label="Zen Garden Help"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {feedbackToast && (
        <div className="pvz-feedback-banner" role="status" aria-live="polite">
          <Sparkles size={16} />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Help Overlay Guide */}
      {showHelp && (
        <div className="pvz-help-card" onClick={() => setShowHelp(false)}>
          <div className="help-content">
            <h3>🎋 Welcome to your Zen Greenhouse!</h3>
            <ul>
              <li><strong>💧 Water Plants:</strong> Select the watering can from the tool rack and tap thirsty plants to nourish them.</li>
              <li><strong>🏪 Zen Market:</strong> Click the Market in the top-left to buy North Eastern seeds (Lotus, Kopou Orchid, Tea) using your Stars.</li>
              <li><strong>⭐ Collect Stars:</strong> Fully bloomed plants generate golden star drops! Tap them to collect currency.</li>
              <li><strong>🌿 Fertilize & Bless:</strong> Use compost and sun lamps to grow radiant blossoms.</li>
            </ul>
            <span className="help-close-hint">Tap anywhere to close</span>
          </div>
        </div>
      )}

      {/* Main 3D Greenhouse Floor Scene */}
      <div className="pvz-greenhouse-stage" ref={greenhouseRef}>
        {/* Floating Tool Rack (PvZ Right/Bottom Floating Toolbar) */}
        <div className="pvz-floating-tool-rack" role="toolbar" aria-label="Garden Tools">
          <span className="tool-rack-title">TOOLS</span>

          <button
            type="button"
            className={`tool-slot-btn ${selectedTool === 'water' ? 'active-slot' : ''}`}
            onClick={() => handleToolSelect('water')}
            title="Spring Watering Can (Unlimited)"
            aria-label="Watering Can"
          >
            <div className="tool-badge water-bg">
              <Droplets size={24} />
            </div>
            <span className="tool-label">Water</span>
            <span className="tool-qty">∞</span>
          </button>

          <button
            type="button"
            className={`tool-slot-btn ${selectedTool === 'fertilizer' ? 'active-slot' : ''}`}
            onClick={() => handleToolSelect('fertilizer')}
            title="Organic Compost (Accelerates growth)"
            aria-label="Organic Compost"
          >
            <div className="tool-badge compost-bg">
              <span className="tool-emoji">🌿</span>
            </div>
            <span className="tool-label">Compost</span>
            <span className="tool-qty">x{inventory.fertilizer || 0}</span>
          </button>

          <button
            type="button"
            className={`tool-slot-btn ${selectedTool === 'sunlight' ? 'active-slot' : ''}`}
            onClick={() => handleToolSelect('sunlight')}
            title="Sunlight Lamp (Radiant bloom)"
            aria-label="Sunlight Lamp"
          >
            <div className="tool-badge sun-bg">
              <Sun size={24} />
            </div>
            <span className="tool-label">Sunlight</span>
            <span className="tool-qty">x{inventory.sunlight || 0}</span>
          </button>

          <button
            type="button"
            className={`tool-slot-btn ${selectedTool === 'music' ? 'active-slot' : ''}`}
            onClick={() => handleToolSelect('music')}
            title="Bamboo Wind Chime (Soothing melody)"
            aria-label="Bamboo Wind Chimes"
          >
            <div className="tool-badge chime-bg">
              <Music size={24} />
            </div>
            <span className="tool-label">Chimes</span>
            <span className="tool-qty">x{inventory.music || 0}</span>
          </button>
        </div>

        {/* 4 Stepped Concrete Terraces matching PvZ Zen Garden */}
        <div className="greenhouse-terraces-container">
          {rows.map((rowPots, rowIndex) => (
            <div key={rowIndex} className={`greenhouse-terrace-row tier-${rowIndex + 1}`}>
              {/* Stepped Concrete Bench */}
              <div className="terrace-concrete-step"></div>

              {/* 4 Bamboo Mat Stands in this Row */}
              <div className="terrace-stands-row">
                {rowPots.map((pot) => {
                  const plantDef = GARDEN_PLANTS.find(p => p.id === pot.plantId);
                  const stageIndex = pot.stage || 0;
                  const stageName = plantDef?.stages?.[stageIndex] || 'Empty Stand';
                  const stageIcon = plantDef?.stageIcons?.[stageIndex] || '🪴';
                  const hasCollectibleStars = (pot.starsToCollect || 0) > 0;
                  const isRadiant = stageIndex >= 4;
                  const isThirsty = pot.plantId && (pot.waterLevel < 60 || pot.needs === 'water');

                  return (
                    <div
                      key={pot.id}
                      id={`stand-pot-${pot.id}`}
                      className={`bamboo-stand-slot ${pot.plantId ? 'has-plant' : 'empty-stand'} ${isRadiant ? 'radiant-bloom' : ''}`}
                      onClick={() => handlePotClick(pot)}
                      role="button"
                      tabIndex={0}
                      aria-label={plantDef ? `${plantDef.name}, stage ${stageName}` : `Empty Bamboo Stand ${pot.id}`}
                    >
                      {/* PvZ Thirst / Needs Care Bubble */}
                      {isThirsty && !hasCollectibleStars && (
                        <div className="pvz-care-bubble bounce-bubble" title="Needs Spring Water!">
                          <Droplets size={16} color="#0288D1" />
                          <span>Water!</span>
                        </div>
                      )}

                      {/* PvZ Spinning Golden Star Coin Drop */}
                      {hasCollectibleStars && (
                        <div
                          className="pvz-golden-star-drop"
                          onClick={(e) => handleCollectStars(pot, plantDef, e)}
                          title="Click to harvest Stars!"
                        >
                          <span className="spinning-star-coin">⭐</span>
                          <span className="star-reward-value">+{pot.starsToCollect}</span>
                        </div>
                      )}

                      {/* Plant / Blossom Visual sitting in Terracotta Pot */}
                      <div className="pot-stand-upper">
                        {pot.plantId ? (
                          <div className="plant-3d-entity">
                            <span className={`plant-icon-3d stage-${stageIndex}`}>
                              {stageIcon}
                            </span>
                            <div className="plant-title-tag">
                              <span className="plant-name-short">{plantDef?.name}</span>
                              <span className="stage-pill-mini">{stageName.split(' ')[1] || stageName}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-stand-prompt">
                            <div className="plus-stand-icon">
                              <Plus size={20} />
                            </div>
                            <span className="stand-add-text">Plant</span>
                          </div>
                        )}
                      </div>

                      {/* 3D Ceramic/Terracotta Pot Base */}
                      {pot.plantId && (
                        <div className="terracotta-pot-base">
                          <div className="pot-clay-rim"></div>
                          <div className="pot-clay-body">
                            <div className="pot-water-gauge" style={{ height: `${pot.waterLevel}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Bamboo Slat Mat with Wooden Feet (from screenshot) */}
                      <div className="bamboo-mat-structure">
                        <div className="bamboo-slats">
                          <div className="slat"></div>
                          <div className="slat"></div>
                          <div className="slat"></div>
                          <div className="slat"></div>
                          <div className="slat"></div>
                          <div className="slat"></div>
                        </div>
                        <div className="bamboo-legs">
                          <span className="leg leg-left"></span>
                          <span className="leg leg-right"></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plant Seed Selection Modal */}
      {activePotForSeed && (
        <div className="pvz-modal-backdrop" onClick={() => setActivePotForSeed(null)}>
          <div className="pvz-modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="pvz-modal-header">
              <div className="modal-header-left">
                <span className="modal-icon-badge">🌱</span>
                <div>
                  <h3 className="modal-heading">Plant Seed on Stand #{activePotForSeed}</h3>
                  <p className="modal-subheading">Select a seed from your greenhouse bag</p>
                </div>
              </div>
              <button className="pvz-modal-close" onClick={() => setActivePotForSeed(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="seed-picker-grid">
              {GARDEN_PLANTS.map(plant => {
                const count = inventory.seeds?.[plant.id] || 0;
                return (
                  <div
                    key={plant.id}
                    className={`seed-item-tile ${count > 0 ? 'in-stock' : 'out-of-stock'}`}
                    onClick={() => {
                      if (count > 0) handlePlantSeed(plant.id);
                      else {
                        setActivePotForSeed(null);
                        setShowMarket(true);
                      }
                    }}
                  >
                    <div className="seed-tile-icon">{plant.stageIcons[4]}</div>
                    <div className="seed-tile-info">
                      <h4>{plant.name}</h4>
                      <p className="seed-tile-reg">{plant.regionalName}</p>
                      <div className="seed-tile-meta">
                        <span className="tile-qty">{count > 0 ? `In Bag: ${count}` : `Need Seed (${plant.seedPrice} ⭐)`}</span>
                        <span className="tile-yield">Yield: +{plant.starYield} ⭐</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TOP-LEFT Zen Nursery Market Modal */}
      {showMarket && (
        <div className="pvz-modal-backdrop" onClick={() => setShowMarket(false)}>
          <div className="pvz-modal-card market-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="pvz-modal-header">
              <div className="modal-header-left">
                <span className="modal-icon-badge">🏪</span>
                <div>
                  <h3 className="modal-heading">Zen Nursery Market</h3>
                  <p className="modal-subheading">Exchange your Stars for authentic North Eastern seeds & garden supplies</p>
                </div>
              </div>
              <div className="market-header-stars">
                <span className="wallet-star-icon">⭐</span>
                <span className="market-stars-amt">{currentStars} Stars</span>
                <button className="pvz-modal-close" onClick={() => setShowMarket(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Market Tabs */}
            <div className="market-tab-selector">
              <button
                type="button"
                className={`tab-btn ${marketTab === 'seeds' ? 'active-tab' : ''}`}
                onClick={() => setMarketTab('seeds')}
              >
                🌸 North Eastern Seeds
              </button>
              <button
                type="button"
                className={`tab-btn ${marketTab === 'supplies' ? 'active-tab' : ''}`}
                onClick={() => setMarketTab('supplies')}
              >
                🌿 Care Supplies
              </button>
            </div>

            {/* Market Items List */}
            <div className="market-scroll-list">
              {marketTab === 'seeds' && (
                GARDEN_PLANTS.map(plant => {
                  const inBag = inventory.seeds?.[plant.id] || 0;
                  const canAfford = currentStars >= plant.seedPrice;

                  return (
                    <div key={plant.id} className="market-row-item">
                      <div className="market-item-thumb">
                        <span className="big-thumb-icon">{plant.stageIcons[4]}</span>
                        <span className="mini-seed-badge">{plant.stageIcons[0]}</span>
                      </div>
                      <div className="market-item-desc">
                        <div className="item-head-line">
                          <h4>{plant.name}</h4>
                          <span className="plant-tag-pill">{plant.category}</span>
                        </div>
                        <p className="item-reg-name">{plant.regionalName}</p>
                        <p className="item-fact-quote">{plant.funFact}</p>
                        <div className="item-stock-stats">
                          <span>Star Yield: <strong>+{plant.starYield} ⭐</strong></span>
                          <span>Owned in Bag: <strong>{inBag}</strong></span>
                        </div>
                      </div>
                      <div className="market-item-buy">
                        <div className="price-tag-gold">
                          <span>⭐</span>
                          <strong>{plant.seedPrice}</strong>
                        </div>
                        <button
                          type="button"
                          className={`btn-purchase ${canAfford ? 'can-buy' : 'cannot-buy'}`}
                          onClick={() => handleBuyItem(plant)}
                          disabled={!canAfford}
                        >
                          {canAfford ? 'Buy Seed' : 'Need Stars'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {marketTab === 'supplies' && (
                MARKET_SUPPLIES.map(supply => {
                  const count = inventory[supply.type] || 0;
                  const canAfford = currentStars >= supply.price;

                  return (
                    <div key={supply.id} className="market-row-item">
                      <div className="market-item-thumb">
                        <span className="big-thumb-icon">{supply.icon}</span>
                      </div>
                      <div className="market-item-desc">
                        <h4>{supply.name}</h4>
                        <p className="item-fact-quote">{supply.description}</p>
                        <div className="item-stock-stats">
                          <span>In Greenhouse: <strong>{count}</strong></span>
                        </div>
                      </div>
                      <div className="market-item-buy">
                        <div className="price-tag-gold">
                          <span>⭐</span>
                          <strong>{supply.price}</strong>
                        </div>
                        <button
                          type="button"
                          className={`btn-purchase ${canAfford ? 'can-buy' : 'cannot-buy'}`}
                          onClick={() => handleBuyItem(supply)}
                          disabled={!canAfford}
                        >
                          {canAfford ? `Buy x${supply.amount}` : 'Need Stars'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
