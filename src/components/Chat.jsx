
import React, { useState, useRef, useEffect } from 'react';
import { Send, Utensils, Zap, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Message from './Message';
import RecipeModal from './RecipeModal';
import { sendMessage, translateRecipe } from '../services/api';
import './Chat.css';

const Chat = () => {
    const { t, i18n } = useTranslation();

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

    // Recipe View Handler with Translation
    const handleViewRecipe = async (recipe) => {
        // Open with original content first for speed
        setSelectedRecipe(recipe);

        // Attempt translation if applicable via backend
        if (i18n.language && i18n.language !== 'en') {
            try {
                const translated = await translateRecipe(recipe, i18n.language);
                if (translated) setSelectedRecipe(translated);
            } catch (error) {
                console.warn("Recipe translation failed", error);
            }
        }
    };

    // Generic Search Handler via Python Backend
    const handleSearch = async (query, type = 'search') => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            // Call Python Backend
            const result = await sendMessage(query, type, i18n.language);

            if (result.error) {
                addMessage("Error: " + result.error, 'bot');
            } else {
                if (result.detectedLanguage && result.detectedLanguage !== i18n.language) {
                    // Optionally switch UI language based on response
                    // But let's trust the backend translated the reply already.
                }

                addMessage(result.reply, 'bot', result.recipe);
            }

        } catch (error) {
            console.error('Search Error:', error);
            addMessage("I am having trouble thinking right now...", 'bot');
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
    const handleSend = async (e) => {
        e.preventDefault();
        const userText = input.trim();
        if (!userText) return;

        addMessage(userText, 'user');
        setInput('');

        // Let the backend handle logic (Greetings, Context, etc.)
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
                        onViewRecipe={handleViewRecipe}
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
