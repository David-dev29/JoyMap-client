import React from 'react';

const subcategoriesMap = {
  especial: ["Promociones", "Combo Desayuno", "Nuevo", "Populares"],
  Hamburguesas: [
    "Clásicas",
    "Doble carne",
    "Con tocino",
    "Pollo",
    "Veganas",
    "Infantiles"
  ],
  Tacos: [
    "Al pastor",
    "De bistec",
    "De suadero",
    "De tripa",
    "Campechanos",
    "De pollo"
  ],
  Pizza: [
    "Margarita",
    "Pepperoni",
    "Hawaiana",
    "Mexicana",
    "Cuatro quesos",
    "Vegetariana"
  ]
};


const CategoryTabs = ({ activeCategory, activeSubcategory, setActiveSubcategory }) => {
  const subcategories = subcategoriesMap[activeCategory] || [];

  return (
    <div className="sticky top-[64px] z-30 bg-white">
  <div className="border-b border-gray-200 ml-4 mr-4"></div>
  <div className="px-4 sm:px-6 lg:px-8">
    <nav className="flex space-x-8 overflow-x-auto custom-scroll-hide" role="tablist">
      {subcategories.map((subcat) => (
        <button
          key={subcat}
          onClick={() => setActiveSubcategory(subcat)}
          className={`relative py-3 px-1 text-sm font-medium transition-colors duration-200 focus:outline-none whitespace-nowrap ${
            activeSubcategory === subcat
              ? 'text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          role="tab"
          aria-selected={activeSubcategory === subcat}
        >
          {subcat}
          {activeSubcategory === subcat && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
          )}
        </button>
      ))}
    </nav>
  </div>
  <div className="border-b border-gray-200 ml-4 mr-4"></div>

  <style jsx>{`
    .custom-scroll-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .custom-scroll-hide::-webkit-scrollbar {
      display: none;
    }
  `}</style>
</div>

  );
};

export default CategoryTabs;
  
  
  