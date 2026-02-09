
import React, { useState } from 'react';
import { ChefHat, ArrowRight, Star, Heart } from 'lucide-react';
import './Home.css';
import Chat from './components/Chat';

const Home = () => {
    const [showChat, setShowChat] = useState(false);

    if (showChat) {
        return <Chat />;
    }

    return (
        <div className="home-container">
            <div className="hero-content">
                <h1 className="hero-title animate-fade-in">COOKAi</h1>
                <p className="hero-subtitle animate-fade-in">Your personal AI culinary genius.</p>

                <div className="features animate-fade-in">
                    <div className="feature-item">
                        <Star color="var(--secondary)" fill="var(--secondary)" size={20} />
                        <span>Discover exciting new recipes</span>
                    </div>
                    <div className="feature-item">
                        <Heart color="var(--primary)" fill="var(--primary)" size={20} />
                        <span>Find meals with ingredients you love</span>
                    </div>
                </div>

                <button
                    className="start-btn animate-fade-in"
                    onClick={() => setShowChat(true)}
                >
                    Start Cooking <ArrowRight size={20} />
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
