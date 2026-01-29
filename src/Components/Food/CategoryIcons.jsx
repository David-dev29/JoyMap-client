import BackToTopButton from "./BackToTopButton";

const CategoryIcons = ({ activeCategory, setActiveCategory, isTienda }) => {
    const categories = [
      {
        id: 'especial',
        name: 'Especial',
        image: 'https://i.pinimg.com/736x/72/e5/70/72e5709238cf9f95f067df4286fbd420.jpg',
      },
      {
        id: 'Hamburguesas',
        name: 'Hamburguesas',
        image: 'https://i.pinimg.com/1200x/17/68/ea/1768ea64918f618d4a9c9be36d4965aa.jpg',
      },
      {
        id: 'Tacos',
        name: 'Tacos',
        image: 'https://i.pinimg.com/1200x/ae/89/30/ae8930f8540b72f8454877ddd5c4a5e5.jpg',
      },
      {
        id: 'Pizza',
        name: 'Pizza',
        image: 'https://i.pinimg.com/1200x/b6/b2/a7/b6b2a79610c712b4a60fc93e72740bff.jpg',
        // image: 'https://i.pinimg.com/1200x/e8/ec/c0/e8ecc0bf88cc04e3c6f02177fc0e4b29.jpg',
      },
    ];
  


    
    return (
      <div className="px-4 py-4">
        <div className="flex justify-between gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center bg-white rounded-2xl p-2 w-20 sm:w-24 hover:scale-105 transition-transform shadow-md ${
                activeCategory === category.id ? 'border-2 border-rose-700' : ''
              }`}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-md mb-1"
              />
              <span
                className={`text-[10px] sm:text-xs text-center font-medium leading-tight ${
                  activeCategory === category.id ? 'text-rose-700' : 'text-gray-700'
                }`}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>
        <BackToTopButton></BackToTopButton>
      </div>
    );
  };
  
  export default CategoryIcons;
  
  