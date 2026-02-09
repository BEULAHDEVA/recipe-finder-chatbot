
import React from 'react';
import { Bot, User } from 'lucide-react';
import './Message.css';

const Message = ({ message, onViewRecipe }) => {
    const isUser = message.sender === 'user';

    return (
        <div className={`message-container ${isUser ? 'user' : 'bot'}`}>
            <div className="message-content">
                {/* Avatar */}
                <div className={`avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div className="bubble-wrapper">
                    <div className="bubble">
                        {message.text}
                    </div>

                    {/* Recipe Card Preview (if available) */}
                    {message.recipe && !isUser && (
                        <div className="recipe-preview-card" onClick={() => onViewRecipe(message.recipe)}>
                            <img
                                src={message.recipe.strMealThumb}
                                alt={message.recipe.strMeal}
                                className="preview-image"
                            />
                            <div className="preview-info">
                                <h3>{message.recipe.strMeal}</h3>
                                <p>{message.recipe.strArea} • {message.recipe.strCategory}</p>
                                <button
                                    className="view-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewRecipe(message.recipe);
                                    }}
                                >
                                    View full recipe
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
