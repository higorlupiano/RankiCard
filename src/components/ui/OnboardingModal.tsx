import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Target, ShoppingBag, Trophy, Flame, X } from 'lucide-react';

interface OnboardingModalProps {
    onComplete: () => void;
}

interface Slide {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const slides: Slide[] = [
    {
        icon: <Star size={64} />,
        title: "Bem-vindo ao RankiCard!",
        description: "Transforme suas atividades do dia a dia em XP e suba de nível como um verdadeiro aventureiro!",
        color: "from-yellow-500 to-amber-600"
    },
    {
        icon: <Target size={64} />,
        title: "Complete Missões",
        description: "Aceite missões diárias para ganhar XP e Gold. Quanto mais difícil a missão, maior a recompensa!",
        color: "from-red-500 to-rose-600"
    },
    {
        icon: <Flame size={64} />,
        title: "Mantenha seu Streak",
        description: "Use o app todo dia para manter sua sequência ativa. Quanto maior o streak, mais bônus de XP você ganha!",
        color: "from-orange-500 to-red-600"
    },
    {
        icon: <Trophy size={64} />,
        title: "Desbloqueie Conquistas",
        description: "Complete desafios especiais para ganhar conquistas e mostrar seu progresso para todos!",
        color: "from-purple-500 to-violet-600"
    },
    {
        icon: <ShoppingBag size={64} />,
        title: "Visite a Loja",
        description: "Use seu Gold para comprar boosts de XP, badges exclusivos e títulos customizados!",
        color: "from-emerald-500 to-green-600"
    }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
    };

    const slide = slides[currentSlide];
    const isLastSlide = currentSlide === slides.length - 1;

    return (
        <div className={`
            fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md
            transition-opacity duration-300
            ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}>
            {/* Skip button */}
            <button
                onClick={handleComplete}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 transition-colors"
            >
                <X size={24} />
            </button>

            {/* Content */}
            <div className="w-full max-w-sm mx-4">
                {/* Icon with gradient background */}
                <div className={`
                    w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center
                    bg-gradient-to-br ${slide.color} shadow-2xl
                    transform transition-all duration-500
                    ${isVisible ? 'scale-100' : 'scale-50'}
                `}>
                    <div className="text-white">
                        {slide.icon}
                    </div>
                </div>

                {/* Text */}
                <div className="text-center mb-8">
                    <h2 className="font-rpg text-2xl text-white mb-3">
                        {slide.title}
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed px-4">
                        {slide.description}
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`
                                w-2 h-2 rounded-full transition-all duration-300
                                ${i === currentSlide
                                    ? 'w-8 bg-yellow-400'
                                    : 'bg-gray-600 hover:bg-gray-500'
                                }
                            `}
                        />
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between px-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentSlide === 0}
                        className={`
                            flex items-center gap-1 px-4 py-2 rounded-lg font-rpg text-sm
                            transition-all
                            ${currentSlide === 0
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-300 hover:text-white'
                            }
                        `}
                    >
                        <ChevronLeft size={18} />
                        Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        className={`
                            flex items-center gap-1 px-6 py-2 rounded-lg font-rpg text-sm font-bold
                            transition-all transform hover:scale-105
                            bg-gradient-to-r ${slide.color} text-white shadow-lg
                        `}
                    >
                        {isLastSlide ? 'Começar!' : 'Próximo'}
                        {!isLastSlide && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
