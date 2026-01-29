import { useNavigate } from "react-router-dom";

const CartSummaryModal = ({ cartItems }) => {
  const navigate = useNavigate();

  const itemCount = cartItems.length;

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price);
    const quantity = Number(item.quantity);
  
    if (!price || !quantity) return acc;
  
    if (item.product.category === "Frutas") {
      const pricePerGram = price / 1000;
      return acc + pricePerGram * quantity;
    }
  
    return acc + price * quantity;
  }, 0);
  

  return (
    <div
    id="cart-summary"
     className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 border-t border-gray-200 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3 max-w-screen mx-auto">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">
          {cartItems.length} {cartItems.length === 1 ? "producto" : "productos"}

          </span>
          <span className="text-lg font-bold text-gray-900">
            MXN {totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2 rounded-xl transition-colors shadow-md"
          onClick={() => navigate("/cart", { state: { cartItems } })}
        >
          Ver carrito
        </button>
      </div>
    </div>
  );
};

export default CartSummaryModal;





  
  
  