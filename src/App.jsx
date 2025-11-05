
import React from 'react';
import { createRoot } from 'react-dom/client';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

const PLANTS = [
  { id: 'p1', name: 'Fiddle Leaf Fig', price: 25.0, category: 'Indoor', img: 'https://images.unsplash.com/photo-1524594154902-7e8b3d9b2f1f?auto=format&fit=crop&w=400&q=60' },
  { id: 'p2', name: 'Snake Plant', price: 18.0, category: 'Indoor', img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=60' },
  { id: 'p3', name: 'Aloe Vera', price: 12.0, category: 'Succulents', img: 'https://images.unsplash.com/photo-1501004318641-3d9f1c6ec3d8?auto=format&fit=crop&w=400&q=60' },
  { id: 'p4', name: 'Jade Plant', price: 15.0, category: 'Succulents', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=60' },
  { id: 'p5', name: 'Boston Fern', price: 20.0, category: 'Outdoor', img: 'https://images.unsplash.com/photo-1493417264967-8ec0c8a67d58?auto=format&fit=crop&w=400&q=60' },
  { id: 'p6', name: 'Monstera Deliciosa', price: 30.0, category: 'Outdoor', img: 'https://images.unsplash.com/photo-1501004318641-7b5f6c1d3f2b?auto=format&fit=crop&w=400&q=60' },
];

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: {} },
  reducers: {
    addItem: (state, action) => {
      const p = action.payload;
      if (!state.items[p.id]) state.items[p.id] = { ...p, qty: 1 };
    },
    increase: (state, action) => {
      const id = action.payload;
      if (state.items[id]) state.items[id].qty += 1;
    },
    decrease: (state, action) => {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id].qty -= 1;
        if (state.items[id].qty <= 0) delete state.items[id];
      }
    },
    removeItem: (state, action) => { delete state.items[action.payload]; },
  },
});
const store = configureStore({ reducer: { cart: cartSlice.reducer } });

const useCartTotals = () => {
  const items = useSelector((s) => s.cart.items);
  const entries = Object.values(items);
  const totalQty = entries.reduce((s, it) => s + it.qty, 0);
  const totalCost = entries.reduce((s, it) => s + it.qty * it.price, 0);
  return { entries, totalQty, totalCost };
};

function AppShell() {
  const [route, setRoute] = React.useState('landing');
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={setRoute} />
      <main className="p-6">
        {route === 'landing' && <LandingPage onGetStarted={() => setRoute('products')} />}
        {route === 'products' && <ProductListing />}
        {route === 'cart' && <CartPage onContinue={() => setRoute('products')} />}
      </main>
    </div>
  );
}

function Header({ onNavigate }) {
  const { totalQty } = useCartTotals();
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-green-700 font-bold text-xl cursor-pointer" onClick={() => onNavigate('landing')}>GreenHouse Co.</div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('products')}>Products</button>
          <button onClick={() => onNavigate('cart')} className="flex items-center gap-2">
            🛒<span>{totalQty}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function LandingPage({ onGetStarted }) {
  return (
    <section className="rounded-lg overflow-hidden shadow-md max-w-6xl mx-auto">
      <div className="relative h-64 sm:h-96 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80)' }}>
        <div className="absolute inset-0 bg-black/40 flex items-center">
          <div className="text-white max-w-2xl p-6">
            <h1 className="text-4xl font-extrabold">GreenHouse Co.</h1>
            <p className="mt-3 text-lg">We provide healthy, hand-selected houseplants to brighten your home.</p>
            <button className="mt-6 px-4 py-2 bg-green-600 rounded text-white" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductListing() {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);
  const grouped = PLANTS.reduce((acc, p) => { (acc[p.category] = acc[p.category] || []).push(p); return acc; }, {});
  return (
    <div className="max-w-6xl mx-auto">
      {Object.keys(grouped).map((cat) => (
        <section key={cat} className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-3">{cat}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {grouped[cat].map((p) => {
              const disabled = !!cartItems[p.id];
              return (
                <div key={p.id} className="border rounded p-3 flex flex-col">
                  <img src={p.img} alt={p.name} className="h-40 object-cover rounded" />
                  <h4 className="mt-2 font-semibold">{p.name}</h4>
                  <p>${p.price.toFixed(2)}</p>
                  <button className={"mt-auto px-3 py-2 rounded " + (disabled ? 'bg-gray-300' : 'bg-green-600 text-white')} onClick={() => dispatch(cartSlice.actions.addItem(p))} disabled={disabled}>{disabled ? 'Added' : 'Add to Cart'}</button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function CartPage({ onContinue }) {
  const dispatch = useDispatch();
  const { entries, totalQty, totalCost } = useCartTotals();
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
      <div>Total items: {totalQty}</div>
      <div>Total cost: ${totalCost.toFixed(2)}</div>
      {entries.map((it) => (
        <div key={it.id} className="flex items-center border rounded p-3 mt-3">
          <img src={it.img} alt={it.name} className="w-20 h-20 object-cover rounded" />
          <div className="flex-1 ml-4">
            <div>{it.name}</div><div>${it.price}</div>
            <div className="mt-2 flex gap-2 items-center">
              <button onClick={() => dispatch(cartSlice.actions.decrease(it.id))}>-</button>
              <span>{it.qty}</span>
              <button onClick={() => dispatch(cartSlice.actions.increase(it.id))}>+</button>
              <button className="ml-4 text-red-600" onClick={() => dispatch(cartSlice.actions.removeItem(it.id))}>Delete</button>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6 flex gap-3">
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={onContinue}>Continue Shopping</button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => alert('Coming Soon')}>Checkout</button>
      </div>
    </div>
  );
}

function RootApp() {
  return <Provider store={store}><AppShell /></Provider>;
}
if (typeof document !== 'undefined') {
  const root = document.getElementById('root') || (() => { const el = document.createElement('div'); el.id = 'root'; document.body.appendChild(el); return el; })();
  createRoot(root).render(<RootApp />);
}
export default RootApp;
