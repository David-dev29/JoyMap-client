// Components/Store/ProductSizeSelector.jsx

export default function ProductSizeSelector({ sizes, selectedSize, onSelect }) {
    return (
      <div className="mt-4">
        <h3 className="text-base font-medium text-gray-900 mb-1">Elige una presentación</h3>
        <div className="space-y-2">
          {sizes.map((size, index) => {
            const selected = selectedSize === size.label;
            return (
              <div
                key={index}
                onClick={() => onSelect(size)}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition
                  ${selected ? 'border-[#E53935] bg-[#FFEBEE]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{size.label}</h4>
                  <p className="text-sm text-gray-600">MXN {size.price.toFixed(2)}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${selected ? 'border-[#E53935] bg-[#E53935]' : 'border-gray-300 bg-white'} flex items-center justify-center`}>
                  {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  