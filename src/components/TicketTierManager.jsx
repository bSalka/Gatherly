import { useState } from "react";

const emptyTier = {
  name: "",
  price: "",
  quantity: "",
  description: "",
  maxPerUser: "",
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
    const updated = localTiers.filter((_, i) => i !== index);
    setLocalTiers(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* No tiers — free event info */}
      {localTiers.length === 0 && (
        <div className="alert-info text-sm">
          Bez vrsta karata - događaj je besplatan ili ne zahtijeva rezervaciju.
          Kliknite + da dodate vrste karata.
        </div>
      )}

      {localTiers.map((tier, index) => (
        <div
          key={tier._id || tier.id || index}
          className="border border-gray-200 dark:border-gray-600
           rounded-xl p-4 bg-gray-50 dark:bg-gray-500"
        >
          {/*Tier header */}
          <div className=" flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
              Karta {index + 1}
            </span>
            {localTiers.length > 1 && (
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="text-red-400 hover:text-red-600
                 dark:text-red-600 dark:hover:text-red-800 transition-colors"
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
              <label className="block text-xs text-muted mb-1">Naziv *</label>
              <input
                type="text"
                value={tier.name || ""}
                onChange={(e) => updateTier(index, "name", e.target.value)}
                placeholder="npr. General, VIP"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Cijena (KM) *
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={tier.price ?? ""}
                onChange={(e) => updateTier(index, "price", e.target.value)}
                placeholder="0"
                className="input"
              />
            </div>
          </div>

          {/*Quantity and description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">
                Broj karata *
              </label>
              <input
                type="number"
                min="1"
                value={tier.quantity ?? ""}
                onChange={(e) => updateTier(index, "quantity", e.target.value)}
                placeholder="npr. 100"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Opis (opcionalno)
              </label>
              <input
                type="text"
                value={tier.description || ""}
                onChange={(e) =>
                  updateTier(index, "description", e.target.value)
                }
                placeholder="npr. Uključuje backstage"
                className="input"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs text-muted mb-1">
              Maksimalno karata po korisniku (opcionalno)
            </label>
            <input
              type="number"
              min="1"
              value={tier.maxPerUser ?? ""}
              onChange={(e) => updateTier(index, "maxPerUser", e.target.value)}
              placeholder="npr. 4 ili (prazno bez limita)"
              className="input"
            />
            {tier.maxPerUser && (
              <p className="text-xs text-gray-400 mt-1">
                Jedan korisnik može kupiti najviše {tier.maxPerUser} karte za
                ovaj događaj.
              </p>
            )}
          </div>
        </div>
      ))}

      {/*Add tier btn */}
      <button
        type="button"
        onClick={addTier}
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600
         rounded-xl py-3 text-sm text-gray-500 dark:text-gray-400
        hover:border-blue-400 dark:hover:border-blue-500
        hover:text-blue-500 dark:hover:text-blue-600
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
