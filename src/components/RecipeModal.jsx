
import React, { useEffect } from 'react';
import { X, Youtube, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './RecipeModal.css';

const RecipeModal = ({ recipe, onClose }) => {
    const { t } = useTranslation();

    if (!recipe) return null;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push({ ingredient, measure });
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container glass-card" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose} aria-label={t('modal.close')}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <img src={recipe.strMealThumb} alt={recipe.strMeal} className="modal-image" />
                    <div className="modal-title-overlay">
                        <h2>{recipe.strMeal}</h2>
                        <div className="tags">
                            <span className="tag">{recipe.strArea}</span>
                            <span className="tag">{recipe.strCategory}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-content">
                    <div className="ingredients-section">
                        <h3>{t('modal.ingredients')}</h3>
                        <ul className="ingredients-list">
                            {ingredients.map((item, idx) => (
                                <li key={idx}>
                                    <span className="measure">{item.measure}</span>
                                    <span className="ingredient">{item.ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="instructions-section">
                        <h3>{t('modal.instructions')}</h3>
                        <p>{recipe.strInstructions}</p>

                        <div className="links">
                            {recipe.strYoutube && (
                                <a href={recipe.strYoutube} target="_blank" rel="noopener noreferrer" className="link-btn youtube">
                                    <Youtube size={20} /> {t('modal.watch_video')}
                                </a>
                            )}
                            {recipe.strSource && (
                                <a href={recipe.strSource} target="_blank" rel="noopener noreferrer" className="link-btn source">
                                    <ExternalLink size={18} /> {t('modal.view_source')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;
