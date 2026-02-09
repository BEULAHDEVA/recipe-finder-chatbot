
import React, { useState } from 'react';
import { ChefHat, ArrowRight, Star, Heart, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Home.css';
import Chat from './components/Chat';

const Home = () => {
    const { t, i18n } = useTranslation();
    const [showChat, setShowChat] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    if (showChat) {
        return <Chat />;
    }

    return (
        <div className="home-container">
            {/* Language Switcher */}
            <div className="language-switcher">
                <Globe size={20} color="var(--text-secondary)" />
                <button
                    className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}>EN</button>
                <button
                    className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`}
                    onClick={() => changeLanguage('hi')}>हिंदी</button>
                <button
                    className={`lang-btn ${i18n.language === 'es' ? 'active' : ''}`}
                    onClick={() => changeLanguage('es')}>ES</button>
                <button
                    className={`lang-btn ${i18n.language === 'kn' ? 'active' : ''}`}
                    onClick={() => changeLanguage('kn')}>ಕೆಎನ್</button>
            </div>

            <div className="hero-content">
                <h1 className="hero-title animate-fade-in">{t('home.title')}</h1>
                <p className="hero-subtitle animate-fade-in">{t('home.subtitle')}</p>

                <div className="features animate-fade-in">
                    <div className="feature-item">
                        <Star color="var(--secondary)" fill="var(--secondary)" size={20} />
                        <span>{t('home.feature1')}</span>
                    </div>
                    <div className="feature-item">
                        <Heart color="var(--primary)" fill="var(--primary)" size={20} />
                        <span>{t('home.feature2')}</span>
                    </div>
                </div>

                <button
                    className="start-btn animate-fade-in"
                    onClick={() => setShowChat(true)}
                >
                    {t('home.button')} <ArrowRight size={20} />
                </button>
            </div>

            <div className="hero-image animate-fade-in">
                <div className="circle-bg"></div>
                <img
                    src="https://www.themealdb.com/images/media/meals/xxpqsy1511452222.jpg"
                    alt="Delicious Food"
                    className="food-img food-img-1"
                />
                <img
                    src="https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg"
                    alt="Spicy Food"
                    className="food-img food-img-2"
                />
            </div>
        </div>
    );
};

export default Home;
