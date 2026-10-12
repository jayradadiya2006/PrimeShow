import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const movies = [
  {
    id: 1,
    badge: 'BLOCKBUSTER',
    title: 'mirzapur',
    tagline: 'Enter the Uncharted Regions of Pandora in Native IMAX 3D',
    description: 'Enter the Uncharted Regions of Pandora in Native IMAX 3D',
    rating: '9.4 (43K)',
    languages: 'English • Hindi • Tamil • Telugu',
    image: 'https://i.ytimg.com/vi/5vMWZhHPlaw/maxresdefault.jpg',
    movieId: 'mov_1'
  },
  {
    id: 2,
    badge: 'SUPERHERO',
    title: 'Spider-Man: No Way Home',
    tagline: 'The Multiverse Unfolds with Ultimate Action',
    description: 'The Multiverse Unfolds with Ultimate Action',
    rating: '9.2 (85K)',
    languages: 'English • Hindi • Tamil • Telugu',
    image: 'https://www.androidauthority.com/wp-content/uploads/2021/12/spider-man-no-way-home-1.jpg',
    movieId: 'mov_2'
  },
  {
    id: 3,
    badge: 'COMEDY',
    title: 'Dhamaal 4',
    tagline: 'Get Ready for Double the Laughter & Madness',
    description: 'Get Ready for Double the Laughter & Madness',
    rating: '8.9 (28K)',
    languages: 'Hindi',
    image: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/medium/dhamaal-4-et00452553-1783600284.jpg',
    movieId: 'mov_3'
  },
  {
    id: 4,
    badge: 'MUST WATCH',
    title: 'cocktail 2',
    tagline: 'Watch the Big Screen Magic in PrimeShow IMAX',
    description: 'Watch the Big Screen Magic in PrimeShow IMAX',
    rating: '9.0 (15K)',
    languages: 'Hindi • English',
    image: 'https://mykinoplex.com/media/bdc8eb75-d1b-4853365e10.webp',
    movieId: 'mov_1'
  },
  {
    id: 5,
    badge: 'LATEST RELEASE',
    title: 'bhooth bangla',
    tagline: 'Experience Ultra Luxury Cinema with Premium Comfort',
    description: 'Experience Ultra Luxury Cinema with Premium Comfort',
    rating: '9.5 (50K)',
    languages: 'Hindi • English • Gujarati',
    image: 'https://timesofindia.indiatimes.com/thumb/msid-130320231,width-1280,height-720,resizemode-4/130320231.jpg',
    movieId: 'mov_2'
  },
];

export const HeroCarousel = ({ onSelectMovie, onBookNow, setActiveTab }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1
    );
  };

  const currentMovie = movies[currentIndex];

  const handleContainerClick = () => {
    if (onSelectMovie) {
      onSelectMovie(currentMovie.movieId || 'mov_1');
    }
  };

  return (
    <div
      className="hero-carousel-container cursor-pointer"
      style={{ backgroundImage: `url(${currentMovie.image})` }}
      onClick={handleContainerClick}
    >
      {/* Background Gradient Overlay */}
      <div className="hero-overlay"></div>

      {/* Main Text & Description Content */}
      <div className="hero-left-content">
        <span className="hero-badge">{currentMovie.badge}</span>
        <h1 className="hero-title">{currentMovie.title}</h1>
        <p className="hero-subtitle">{currentMovie.tagline}</p>
        <p className="hero-desc">{currentMovie.description}</p>

        <div className="hero-meta">
          <span className="hero-rating">★ {currentMovie.rating}</span>
          <span className="hero-languages">{currentMovie.languages}</span>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="hero-controls" onClick={(e) => e.stopPropagation()}>
        <div className="dots-container">
          {movies.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>

        <div className="nav-arrows">
          <button className="arrow-btn" onClick={handlePrev}>
            &#10094;
          </button>
          <button className="arrow-btn" onClick={handleNext}>
            &#10095;
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
