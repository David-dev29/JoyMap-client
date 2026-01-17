const CategoryTabs = ({ activeCategory, setActiveCategory, isTienda }) => {
    const tabs = ['Abarrotes', 'Despensa', 'Frutas'];
  
    return (
      <div className="px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab;
            const activeTextColor = isTienda ? 'text-red-600' : 'text-green-600';
  
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`flex-1 py-3 px-4 text-center text-sm font-medium rounded-full transition-all ${
                  isActive
                    ? `bg-white ${activeTextColor} shadow-md`
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default CategoryTabs;
  
  
  