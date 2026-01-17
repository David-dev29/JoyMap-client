import { useEffect, useState } from "react";

const HeroBannerDespensa = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://i.pinimg.com/1200x/26/34/cc/2634cc3afd089420d50c63e45c87397d.jpg",
    "https://i.pinimg.com/1200x/9a/d4/c2/9ad4c24191295803c19a84ba489f2f4b.jpg",
    "https://i.pinimg.com/1200x/a4/8b/ad/a48bad1be49081639c0cc3f99d304b23.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="px-4 py-6">
      <div className="relative rounded-3xl overflow-hidden shadow-lg h-36 md:h-64 lg:h-80">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide}
            alt={`Slide ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-green-500" : "bg-green-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerDespensa;
