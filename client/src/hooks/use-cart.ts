import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

export interface SelectedCustomOption {
  optionName: string;
  selectedValues: string[];
  priceAdjustment: number;
}

export interface CartItem {
  lineId: string;
  productId: string;
  variantSku: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
  color?: string;
  size?: string;
  selectedOptions?: SelectedCustomOption[];
  attachedFile?: string;
  customerNote?: string;
}

interface AddItemExtras {
  selectedOptions?: SelectedCustomOption[];
  attachedFile?: string;
  customerNote?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: any, quantity: number, extras?: AddItemExtras) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

const generateLineId = () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, quantity, extras) => {
        const items = get().items;
        const hasExtras = extras?.attachedFile || extras?.customerNote;
        const optionsKey = JSON.stringify(extras?.selectedOptions || []);

        const existingItem = !hasExtras ? items.find(
          item => item.productId === product.id && item.variantSku === variant.sku
            && JSON.stringify(item.selectedOptions || []) === optionsKey
            && !item.attachedFile && !item.customerNote
        ) : null;

        const optionsExtra = extras?.selectedOptions?.reduce((sum, o) => sum + o.priceAdjustment, 0) || 0;
        const finalPrice = Number(product.price) + optionsExtra;

        if (existingItem) {
          set({
            items: items.map(item =>
              item.lineId === existingItem.lineId
                ? { ...item, quantity: item.quantity + quantity, image: variant.image || item.image }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                lineId: generateLineId(),
                productId: product.id,
                variantSku: variant.sku,
                quantity,
                price: finalPrice,
                title: product.name,
                image: variant.image || product.images[0] || "",
                color: variant.color,
                size: variant.size,
                selectedOptions: extras?.selectedOptions,
                attachedFile: extras?.attachedFile,
                customerNote: extras?.customerNote,
              },
            ],
          });
        }
      },
      removeItem: (lineId) => {
        set({
          items: get().items.filter(item => item.lineId !== lineId),
        });
      },
      updateQuantity: (lineId, quantity) => {
        set({
          items: get().items.map(item =>
            item.lineId === lineId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
