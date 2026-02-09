
import React, { useState, useRef, useEffect } from 'react';
import { Send, Utensils, Zap, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Message from './Message';
import RecipeModal from './RecipeModal';
import { searchRecipes, getRandomRecipe, getRecipesByArea, getRecipeById } from '../services/api';
import { popularIndianDishes, knownDishNames } from '../data/indianRecipes';
import './Chat.css';

const Chat = () => {
    const { t } = useTranslation();

    // Initial State
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: t('chat.greeting'),
            sender: 'bot'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Helper to add message
    const addMessage = (text, sender, recipe = null) => {
        setMessages(prev => [...prev, { id: Date.now(), text, sender, recipe }]);
    };

    // Generic Search Handler
    const handleSearch = async (query, type = 'search') => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            let recipe = null;
            let replyText = '';
            let localMatch = null;

            // 1. Check Local Indian Database First (Priority)
            if (type === 'search' || type === 'indian_priority') {
                const lowerQuery = query.toLowerCase();
                localMatch = popularIndianDishes.find(d => {
                    // Check strict name match
                    if (d.strMeal.toLowerCase().includes(lowerQuery)) return true;
                    if (lowerQuery.includes(d.strMeal.toLowerCase())) return true;

                    // Check Keywords/Aliases if available
                    if (d.keywords && Array.isArray(d.keywords)) {
                        return d.keywords.some(k =>
                            k.toLowerCase().includes(lowerQuery) ||
                            lowerQuery.includes(k.toLowerCase())
                        );
                    }
                    return false;
                });
            }

            if (localMatch) {
                // Found locally!
                recipe = localMatch;
                replyText = t('chat.search_responses.found_local', { meal: recipe.strMeal });
                addMessage(replyText, 'bot', recipe);
                return;
            }

            // If not found locally, manage other types

            if (type === 'random') {
                const useLocal = Math.random() > 0.4;
                if (useLocal) {
                    const randomIdx = Math.floor(Math.random() * popularIndianDishes.length);
                    recipe = popularIndianDishes[randomIdx];
                    replyText = t('chat.search_responses.found_random') + (recipe.strArea === 'Indian' ? " 🇮🇳" : "");
                } else {
                    recipe = await getRandomRecipe();
                    if (recipe) {
                        replyText = t('chat.search_responses.found_random');
                    } else {
                        replyText = t('chat.search_responses.error');
                    }
                }
            }
            else if (type === 'area') {
                const areaRecipes = await getRecipesByArea(query);

                if (areaRecipes && areaRecipes.length > 0) {
                    const randomIdx = Math.floor(Math.random() * Math.min(areaRecipes.length, 5));
                    const mealSummary = areaRecipes[randomIdx];
                    recipe = await getRecipeById(mealSummary.idMeal);

                    if (recipe) {
                        replyText = t('chat.search_responses.found_area', { area: query });
                    } else {
                        replyText = t('chat.search_responses.found_area', { area: query }) + ` (${mealSummary.strMeal})`;
                    }
                } else {
                    replyText = t('chat.search_responses.not_found', { query: query });
                }
            }
            else {
                // Standard Search via API
                const isKnownIndian = knownDishNames.some(name => name.toLowerCase().includes(query.toLowerCase()));
                const apiRecipes = await searchRecipes(query);

                if (apiRecipes && apiRecipes.length > 0) {
                    recipe = apiRecipes[0];
                    if (isKnownIndian) {
                        replyText = t('chat.search_responses.found_api', { query: query });
                    } else {
                        replyText = t('chat.search_responses.found_api', { query: query });
                    }
                } else {
                    if (isKnownIndian) {
                        const randomFallback = popularIndianDishes[Math.floor(Math.random() * 5)];
                        replyText = t('chat.search_responses.not_found', { query: query }) + `\n\nHow about trying ${randomFallback.strMeal}?`;
                        recipe = randomFallback;
                    } else {
                        replyText = t('chat.search_responses.not_found', { query: query });
                    }
                }
            }

            addMessage(replyText, 'bot', recipe);

        } catch (error) {
            console.error('Search Error:', error);
            addMessage(t('chat.search_responses.error'), 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    // Chip Click Handler
    const handleChipClick = (label, type) => {
        // Translation keys for chip responses are tricky, mapping back label to key
        // Simple map for this demo:
        let displayKey;
        if (type === 'random') displayKey = 'random';
        else displayKey = label.toLowerCase();

        const displayText = t(`chat.chip_responses.${displayKey}`, { defaultValue: `Show me ${label}` });

        addMessage(displayText, 'user');
        handleSearch(label, type);
    };

    // Text Input Handler
    const handleSend = (e) => {
        e.preventDefault();
        const userText = input.trim();
        if (!userText) return;

        addMessage(userText, 'user');
        setInput('');

        const lowerInput = userText.toLowerCase();

        // Greeting Handler
        const greetings = ['hi', 'hello', 'hey', 'namaste', 'greetings', 'yo', 'hola'];
        if (greetings.some(g => lowerInput === g || lowerInput.startsWith(g + ' '))) {
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), text: t('chat.greeting'), sender: 'bot' }]);
            }, 600);
            return;
        }

        // Context Check
        const nonFoodTriggers = [
            'weather', 'president', 'capital', 'movie', 'song', 'game',
            'who is', 'what is the meaning', 'politics', 'sports', 'football',
            'cricket', 'news', 'stock', 'bitcoin'
        ];

        if (nonFoodTriggers.some(trigger => lowerInput.includes(trigger))) {
            setTimeout(() => {
                addMessage(t('chat.specialty_warning'), 'bot');
            }, 600);
            return;
        }

        handleSearch(userText, 'search');
    };

    return (
        <div className="chat-container glass-card">
            <div className="chat-header">
                <h1 className="chat-title" style={{ color: 'var(--primary)' }}>
                    <ChefHat size={32} strokeWidth={2.5} /> {t('chat.title')}
                </h1>
            </div>

            <div className="messages-area">
                {messages.map((msg) => (
                    <Message
                        key={msg.id}
                        message={msg}
                        onViewRecipe={setSelectedRecipe}
                    />
                ))}

                {isLoading && (
                    <div className="loading-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="suggestion-chips">
                <button className="chip" onClick={() => handleChipClick('Random', 'random')}>
                    <Zap size={16} fill="currentColor" /> {t('chat.chips.random')}
                </button>
                <button className="chip" onClick={() => handleChipClick('Italian', 'area')}>
                    <Utensils size={14} /> {t('chat.chips.italian')}
                </button>
                <button className="chip" onClick={() => handleChipClick('Chinese', 'area')}>
                    <Utensils size={14} /> {t('chat.chips.chinese')}
                </button>
                <button className="chip" onClick={() => handleChipClick('Indian', 'area')}>
                    <Utensils size={14} /> {t('chat.chips.indian')}
                </button>
                <button className="chip" onClick={() => handleChipClick('Mexican', 'area')}>
                    <Utensils size={14} /> {t('chat.chips.mexican')}
                </button>
                <button className="chip" onClick={() => handleChipClick('Japanese', 'area')}>
                    <Utensils size={14} /> {t('chat.chips.japanese')}
                </button>
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()}>
                    <Send size={20} />
                </button>
            </form>

            {/* Modal Details */}
            {selectedRecipe && (
                <RecipeModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}
        </div>
    );
};

export default Chat;
