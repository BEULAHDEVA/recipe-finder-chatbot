
import React, { useState, useRef, useEffect } from 'react';
import { Send, Utensils, Zap, ChefHat } from 'lucide-react';
import Message from './Message';
import RecipeModal from './RecipeModal';
import { searchRecipes, getRandomRecipe, getRecipesByArea, getRecipeById } from '../services/api';
import { popularIndianDishes, knownDishNames, indianGreetings } from '../data/indianRecipes';
import './Chat.css';

const Chat = () => {
    // Initial State with Warm Indian Greeting
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Namaste! 🙏 I am COOKAi, your personal chef with a special love for Indian cuisine! 🇮🇳 Ask me for a Biryani recipe, Butter Chicken, or anything else you crave.",
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
                    // Check name match
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
                replyText = `Ah, excellent choice! Here is my special recipe for ${recipe.strMeal}:`;
                addMessage(replyText, 'bot', recipe); // Immediate response
                return; // Stop here
            }

            // If not found locally, manage other types

            if (type === 'random') {
                // Mix of API and Local for Random - bias towards Indian
                const useLocal = Math.random() > 0.4;
                if (useLocal) {
                    const randomIdx = Math.floor(Math.random() * popularIndianDishes.length);
                    recipe = popularIndianDishes[randomIdx];
                    replyText = "Here is a delicious Indian gem for you! 🇮🇳";
                } else {
                    recipe = await getRandomRecipe();
                    if (recipe) {
                        replyText = "Here is a random culinary discovery for you.";
                    } else {
                        replyText = "I couldn't find a random recipe at the moment.";
                    }
                }
            }
            else if (type === 'area') {
                // 1. Get List of Recipes for Area
                const areaRecipes = await getRecipesByArea(query);

                if (areaRecipes && areaRecipes.length > 0) {
                    // 2. Pick a random one from the list or the first one
                    const randomIdx = Math.floor(Math.random() * Math.min(areaRecipes.length, 5));
                    const mealSummary = areaRecipes[randomIdx];

                    // 3. Fetch Full Details (Ingredients, etc.)
                    recipe = await getRecipeById(mealSummary.idMeal);

                    if (recipe) {
                        replyText = `Here is a popular ${query} dish for you:`;
                    } else {
                        replyText = `I found a ${query} dish: ${mealSummary.strMeal}, but couldn't load details.`;
                    }
                } else {
                    replyText = `I couldn't find any ${query} recipes.`;
                }
            }
            else {
                // Standard Search via API if not found locally
                // Check if it's a known indian dish name but not in our detailed list
                const isKnownIndian = knownDishNames.some(name => name.toLowerCase().includes(query.toLowerCase()));

                // Perform API Search first to see if we get a result
                const apiRecipes = await searchRecipes(query);

                if (apiRecipes && apiRecipes.length > 0) {
                    recipe = apiRecipes[0];
                    if (isKnownIndian) {
                        replyText = `Ah, ${query}! A classic Indian dish. Here is a recipe I found:`;
                    } else {
                        replyText = `I found a great match for "${query}":`;
                    }
                } else {
                    // API returned nothing
                    if (isKnownIndian) {
                        // We know it but API doesn't have it. Offer closest local Indian dish.
                        const randomFallback = popularIndianDishes[Math.floor(Math.random() * 5)]; // Pick from top 5 popular
                        replyText = `I know ${query} is a wonderful Indian dish, but I don't have the specific recipe right now. 😔\n\nHow about trying a classic ${randomFallback.strMeal} instead?`;
                        recipe = randomFallback;
                    } else {
                        replyText = `I couldn't find a recipe for "${query}". I only specialize in food and cooking!`;
                    }
                }
            }

            addMessage(replyText, 'bot', recipe);

        } catch (error) {
            console.error('Search Error:', error);
            addMessage("I'm having trouble connecting to the kitchen. Please try again later.", 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    // Chip Click Handler
    const handleChipClick = (label, type) => {
        const displayText = type === 'random' ? "Surprise me!" : `Show me ${label} food`;
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
        const greetings = ['hi', 'hello', 'hey', 'namaste', 'greetings', 'yo'];
        // Check exact match or start
        if (greetings.some(g => lowerInput === g || lowerInput.startsWith(g + ' '))) {
            const randomGreeting = indianGreetings[Math.floor(Math.random() * indianGreetings.length)];
            // Simulate "typing" delay
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), text: randomGreeting, sender: 'bot' }]);
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
                addMessage("I specialize only in culinary arts and recipes. Please ask me about food.", 'bot');
            }, 600);
            return;
        }

        handleSearch(userText, 'search');
    };

    return (
        <div className="chat-container glass-card">
            <div className="chat-header">
                <h1 className="chat-title" style={{ color: 'var(--primary)' }}>
                    <ChefHat size={32} strokeWidth={2.5} /> COOKAi
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
                    <Zap size={16} fill="currentColor" /> Random
                </button>
                <button className="chip" onClick={() => handleChipClick('Italian', 'area')}>
                    <Utensils size={14} /> Italian
                </button>
                <button className="chip" onClick={() => handleChipClick('Chinese', 'area')}>
                    <Utensils size={14} /> Chinese
                </button>
                <button className="chip" onClick={() => handleChipClick('Indian', 'area')}>
                    <Utensils size={14} /> Indian
                </button>
                <button className="chip" onClick={() => handleChipClick('Mexican', 'area')}>
                    <Utensils size={14} /> Mexican
                </button>
                <button className="chip" onClick={() => handleChipClick('Japanese', 'area')}>
                    <Utensils size={14} /> Japanese
                </button>
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for 'Biryani' or 'Butter Chicken'..."
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
