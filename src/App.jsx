import React, { useState, useEffect, useRef } from 'react';
import { importedPoems } from './importedPoems';

function App() {
  const [poems] = useState(importedPoems || []);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('warm'); // 'warm', 'charcoal', 'rose'
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12);
  
  // Sharing Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Focus Mode State
  const [focusMode, setFocusMode] = useState(false);

  // Audio Ambient Player State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const biography = "Alberto fue un hombre de letras y profunda sensibilidad humana. Cada uno de sus versos es un reflejo de su amor por la familia, la naturaleza y la sencillez de la vida cotidiana.\n\nA través de esta colección digital, su familia honra su memoria, compartiendo su legado poético con el mundo. Sus palabras continúan resonando como un canto libre de amor y melancolía.";

  // Hash-based router
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      setFocusMode(false); // Reset focus mode on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync theme class with body element
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Determine current view and selected poem
  let view = 'home';
  let selectedPoem = null;

  if (currentHash === '#/biografia') {
    view = 'biografia';
  } else if (currentHash.startsWith('#/poem/')) {
    const slug = currentHash.replace('#/poem/', '');
    selectedPoem = poems.find(p => p.slug === slug);
    if (selectedPoem) {
      view = 'poem';
    }
  }

  // Update document title dynamically
  useEffect(() => {
    if (view === 'poem' && selectedPoem) {
      document.title = `${selectedPoem.title} - vahema.com`;
    } else if (view === 'biografia') {
      document.title = `Sobre el Autor - vahema.com`;
    } else {
      document.title = `vahema.com - Antología de Poemas`;
    }
  }, [view, selectedPoem]);

  // Filter poems based on search query
  const filteredPoems = poems.filter(poem => 
    poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poem.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Featured poem (always 'A MI PADRE')
  const featuredPoem = poems.find(p => p.title.toUpperCase().includes('A MI PADRE')) || (poems.length > 0 ? poems[0] : null);
  
  // List of remaining poems
  const listPoems = searchQuery 
    ? filteredPoems 
    : poems.filter(p => p.id !== (featuredPoem ? featuredPoem.id : null));

  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleShare = () => {
    if (!selectedPoem) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#/poem/${selectedPoem.slug}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerToast('¡Enlace del poema copiado al portapapeles!');
    }).catch(() => {
      triggerToast('Error al copiar el enlace.');
    });
  };

  const handleRandomPoem = () => {
    if (poems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * poems.length);
    const randomPoem = poems[randomIndex];
    window.location.hash = `#/poem/${randomPoem.slug}`;
  };

  // Toggle ambient soundtrack
  const toggleAmbientAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(() => {
        triggerToast('Haga clic de nuevo para reproducir el audio.');
      });
    }
  };

  // Helper to split poem content into animated paragraphs
  const renderAnimatedContent = (contentHtml) => {
    // We can parse the HTML string paragraphs and wrap them in animated containers
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const paragraphs = Array.from(doc.querySelectorAll('p, div'));
    
    // If no paragraphs found, split by newlines
    if (paragraphs.length === 0) {
      return <div className="poem-paragraph-animated" style={{ animationDelay: '0.2s' }} dangerouslySetInnerHTML={{ __html: contentHtml }} />;
    }

    return paragraphs.map((p, index) => {
      const delay = `${0.15 + index * 0.1}s`;
      if (!p.textContent.trim()) return null;
      return (
        <p 
          key={index} 
          className="poem-paragraph-animated" 
          style={{ animationDelay: delay }} 
          dangerouslySetInnerHTML={{ __html: p.innerHTML }}
        />
      );
    });
  };

  const getExcerpt = (htmlString) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.slice(0, 140) + (text.length > 140 ? '...' : '');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`poetry-site ${focusMode ? 'focus-mode-active' : ''}`}>
      
      {/* Hidden audio player for ambient music */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" // Soft piano ambient loop track
        loop
      />

      <header className="site-header">
        <div className="container">
          <div className="header-top">
            <h1 className="logo">
              <a href="#/">vahema<span>.com</span></a>
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Minimalist Audio Player Toggle with Wave Animation */}
              <button 
                className={`ambient-audio-btn ${isAudioPlaying ? 'playing' : ''}`} 
                onClick={toggleAmbientAudio}
                title={isAudioPlaying ? "Mute ambient music" : "Play ambient music"}
              >
                <div className="audio-wave">
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                </div>
                <span>Música de lectura</span>
              </button>

              {/* Theme Selector */}
              <div className="theme-selector" aria-label="Seleccionar tema">
                <button 
                  className={`theme-btn theme-btn-warm ${theme === 'warm' ? 'active' : ''}`}
                  onClick={() => setTheme('warm')}
                  title="Tema Cálido / Libro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span>Cálido</span>
                </button>
                
                <button 
                  className={`theme-btn theme-btn-charcoal ${theme === 'charcoal' ? 'active' : ''}`}
                  onClick={() => setTheme('charcoal')}
                  title="Tema Carbón / Oscuro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Carbón</span>
                </button>
                
                <button 
                  className={`theme-btn theme-btn-rose ${theme === 'rose' ? 'active' : ''}`}
                  onClick={() => setTheme('rose')}
                  title="Tema Rosa Arcilla"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Arcilla</span>
                </button>
              </div>
            </div>
          </div>
          <p className="tagline font-serif">Antología poética para el alma y la reflexión.</p>
          
          {/* Nav Menu */}
          <nav className="nav-menu">
            <a href="#/" className={`nav-link ${view === 'home' || view === 'poem' ? 'active' : ''}`}>Colección</a>
            <a href="#/biografia" className={`nav-link ${view === 'biografia' ? 'active' : ''}`}>Sobre el Autor</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          
          {view === 'home' && (
            <section id="home-view" className="view">
              
              {/* Featured Poem */}
              {!searchQuery && featuredPoem && (
                <div className="featured-poem-card" style={{ padding: '2rem 1.5rem' }}>
                  <span className="featured-badge">Poema Destacado</span>
                  <div className="featured-content">
                    <h2 className="featured-title font-serif" style={{ textAlign: 'center', marginBottom: '0.25rem', fontSize: '2.2rem' }}>{featuredPoem.title}</h2>
                    <span className="featured-date" style={{ textAlign: 'center', display: 'block', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', maxWidth: '160px', marginLeft: 'auto', marginRight: 'auto' }}>{formatDate(featuredPoem.date)}</span>
                    
                    <div 
                      className="poem-detail-body font-serif" 
                      style={{ margin: '0 auto 1.5rem auto', maxWidth: '540px' }}
                      dangerouslySetInnerHTML={{ __html: featuredPoem.content }} 
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <a className="btn-read-featured" href={`#/poem/${featuredPoem.slug}`}>
                        Abrir Lector Completo (Compartir / Imprimir) &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Box */}
              <div className="search-bar-wrapper">
                <input 
                  type="text" 
                  id="search-input" 
                  placeholder="Buscar poemas, versos o palabras clave..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Buscar poemas"
                />
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              {/* Section Header */}
              <div className="section-title-wrapper">
                <h3 className="section-title font-serif">
                  {searchQuery ? 'Resultados de búsqueda' : 'Colección Completa'}
                </h3>
                <span className="section-count">{filteredPoems.length} poemas</span>
              </div>

              {filteredPoems.length === 0 ? (
                <div className="empty-state">
                  No se encontraron poemas que coincidan con tu búsqueda. Intenta con otra palabra.
                </div>
              ) : (
                <>
                  <div className="poems-grid">
                    {listPoems.slice(0, visibleCount).map(poem => (
                      <a key={poem.id} className="poem-card" href={`#/poem/${poem.slug}`}>
                        <span className="card-date">{formatDate(poem.date)}</span>
                        <h3 className="card-title font-serif">{poem.title}</h3>
                        <p className="card-excerpt">{getExcerpt(poem.content)}</p>
                        <span className="read-more">Leer poema &rarr;</span>
                      </a>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {listPoems.length > visibleCount && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                      <button className="load-more-btn font-serif" onClick={handleLoadMore}>
                        Cargar más poemas &darr;
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {view === 'poem' && (
            <section id="poem-view" className="view">
              <div className="poem-header-actions">
                <a href="#/" className="back-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Volver a la colección
                </a>
                
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Focus Mode Toggle */}
                  <button className={`focus-toggle-btn ${focusMode ? 'active' : ''}`} onClick={() => setFocusMode(!focusMode)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    {focusMode ? "Modo Enfoque" : "Modo Enfoque"}
                  </button>

                  {/* Share Button */}
                  <button className="share-btn" onClick={handleShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Compartir
                  </button>

                  {/* Print Button */}
                  <button className="print-btn" onClick={() => window.print()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Imprimir
                  </button>
                </div>
              </div>
              
              <article className="poem-article">
                <div className="decorative-top-line"></div>
                <h2 className="poem-detail-title font-serif">{selectedPoem.title}</h2>
                <div className="poem-detail-date">{formatDate(selectedPoem.date)}</div>
                
                {/* Paragraphs with staggered fade-in animations */}
                <div className="poem-detail-body font-serif">
                  {renderAnimatedContent(selectedPoem.content)}
                </div>
                
                <div className="editorial-separator">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <div className="signature-name">Alberto</div>
                
                {selectedPoem.tags && selectedPoem.tags.length > 0 && (
                  <div className="poem-tags">
                    {selectedPoem.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {view === 'biografia' && (
            <section className="view">
              <div className="poem-article">
                <div className="bio-section">
                  <div className="bio-photo-frame">
                    <div className="bio-photo-placeholder font-serif">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Fotografía del Autor</span>
                    </div>
                  </div>
                  
                  <div className="bio-text">
                    <h2 className="font-serif">Alberto</h2>
                    <span className="featured-date" style={{ margin: 0 }}>Homenaje a su memoria</span>
                    <div className="decorative-top-line" style={{ margin: '1rem 0', width: '40px' }}></div>
                    <p className="font-serif" style={{ whiteSpace: 'pre-wrap' }}>{biography}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Floating Random Poem Action Button */}
      <button className="floating-random-btn" onClick={handleRandomPoem} title="Leer poema aleatorio">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      </button>

      {/* Toast Notification */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-logo font-serif">vahema<span>.com</span></div>
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
          <p className="credits">Diseñado y optimizado para una lectura poética libre de distracciones.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
