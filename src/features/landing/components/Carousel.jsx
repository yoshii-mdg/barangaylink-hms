import { useState, useEffect } from 'react';

export default function Carousel({ images = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    // Default images if none provided
    const carouselImages = images.length > 0 ? images : [
        {
            id: 1,
            src: '/src/assets/images/slides-1.jpg',
            alt: 'Barangay Building 1',
        },
        {
            id: 2,
            src: '/src/assets/images/slides-2.png',
            alt: 'Barangay Building 2',
        }
    ];

    // Auto-play carousel
    useEffect(() => {
        if (!autoPlay || carouselImages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                (prevIndex + 1) % carouselImages.length
            );
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [autoPlay, carouselImages.length]);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
        );
        setAutoPlay(false);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            (prevIndex + 1) % carouselImages.length
        );
        setAutoPlay(false);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setAutoPlay(false);
    };

    if (carouselImages.length === 0) return null;

    return (
        <div className="relative overflow-hidden -mb-32 md:-mb-40 -mx-8 md:-mx-12 top-25">
            {/* Carousel Container */}
            <div className="relative h-150 w-[90%] mx-auto">
                {/* Images */}
                {carouselImages.map((image, index) => (
                    <div
                        key={image.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                        />
                        {/* Black Opacity Overlay */}
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                ))}

                {/* Left Arrow Button */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full transition-all duration-300"
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Right Arrow Button */}
                <button
                    onClick={goToNext}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full transition-all duration-300"
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {carouselImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-white w-8 md:w-10'
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}