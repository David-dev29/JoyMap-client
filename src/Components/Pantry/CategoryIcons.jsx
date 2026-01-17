const CategoryIcons = ({ activeCategory, setActiveCategory, isTienda }) => {
    const categories = [
      {
        id: 'especial',
        name: 'Especial',
        image: 'https://i.pinimg.com/736x/72/e5/70/72e5709238cf9f95f067df4286fbd420.jpg',
      },
      {
        id: 'Abarrotes',
        name: 'Abarrotes',
        image: 'https://i.pinimg.com/736x/5a/a6/62/5aa6627eab1de39f4187fc0eda506b02.jpg',
      },
      {
        id: 'Despensa',
        name: 'Despensa',
        image: 'https://i.pinimg.com/1200x/e7/dd/8b/e7dd8bc9e7f409f7f31dddac1deaa637.jpg',
      },
      {
        id: 'Frutas',
        name: 'Frutas',
        image: 'https://i.pinimg.com/736x/38/af/a6/38afa6242f637a3c67edd116e41a6540.jpg',
      },
    ];
  
    return (
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const borderColor = isActive
              ? (isTienda ? 'border-red-600' : 'border-green-600')
              : '';
  
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`bg-white rounded-2xl p-3 md:p-4 text-center hover:scale-105 transition-transform shadow-md ${borderColor} ${isActive ? 'border-2' : ''}`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-15 h-10 mx-auto mb-2 object-cover"
                />
                {/* <div className={`text-sm font-semibold ${isActive ? (isTienda ? 'text-red-600' : 'text-green-600') : 'text-gray-700'}`}>
                  {category.name}
                </div> */}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default CategoryIcons;
  
  