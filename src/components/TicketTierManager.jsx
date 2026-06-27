import { useState } from "react";

const emptyTier = {
  name: "",
  price: "",
  quantity: "",
  description: "",
};

export default function TicketTierManager({ tiers, onChange }) {
  const [localTiers, setLocalTiers] = useState(
    tiers?.length > 0 ? tiers.map((t) => ({ ...emptyTier, ...t })) : [],
  );

  function updateTier(index, field, value) {
    const updated = localTiers.map((t, i) =>
      i === index ? { ...t, [field]: value } : t,
    );
    setLocalTiers(updated);
    onChange(updated);
  }

  function addTier() {
    const updated = [...localTiers, { ...emptyTier, _id: Date.now() }];
    setLocalTiers(updated);
    onChange(updated);
  }

  function removeTier(index) {
    /* if (localTiers.length === 1) return; */
    const updated = localTiers.filter((_, i) => i !== index);
    setLocalTiers(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* No tiers — free event info */}
      {localTiers.length === 0 && (
        <div
          className="bg-blue-50 border border-blue-200 rounded-xl
          px-4 py-3 text-sm text-blue-700"
        >
          Bez vrsta karata — događaj je besplatan ili ne zahtijeva rezervaciju.
          Kliknite + da dodate vrste karata.
        </div>
      )}

      {localTiers.map((tier, index) => (
        <div
          key={tier._id || tier.id || index}
          className="border border-gray-200 rounded-xl p-4 bg-gray-50"
        >
          {/*Tier header */}
          <div className=" flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Karta {index + 1}
            </span>
            {localTiers.length > 1 && (
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/*Name + price */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Naziv *
              </label>
              <input
                type="text"
                value={tier.name || ""}
                onChange={(e) => updateTier(index, "name", e.target.value)}
                placeholder="npr, General, VIP"
                className="w-full border border-gray-300 rounded-lg px-3
                py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Cijena (KM) *
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={tier.price ?? ""}
                onChange={(e) => updateTier(index, "price", e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/*Quantity and description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Broj karata *
              </label>
              <input
                type="number"
                min="1"
                value={tier.quantity ?? ""}
                onChange={(e) => updateTier(index, "quantity", e.target.value)}
                placeholder="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Opis (opcionalno)
              </label>
              <input
                type="text"
                value={tier.description || ""}
                onChange={(e) =>
                  updateTier(index, "description", e.target.value)
                }
                placeholder="npr. Uključuje backstage"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>
      ))}

      {/*Add tier btn */}
      <button
        type="button"
        onClick={addTier}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl
        py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500
        transition-colors flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Dodaj vrstu karte
      </button>
    </div>
  );
}
