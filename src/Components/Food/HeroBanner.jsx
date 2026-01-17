import { useEffect, useState } from "react";

const HeroBannerFood = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://i.pinimg.com/1200x/a6/e0/b3/a6e0b3c889078bc99a931470ad4c481b.jpg",
    "https://i.pinimg.com/736x/51/a7/1b/51a71b0f1816640ab38f24b03af33434.jpg",
    "https://i.pinimg.com/736x/65/82/81/658281190e6802d1521b8608827b93c6.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-4">
      <div className="relative rounded-2xl overflow-hidden shadow-md h-24 md:h-40 lg:h-52">
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

      <div className="flex justify-center mt-3 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? "bg-red-500" : "bg-red-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerFood;
