import Product from '../model/product.model.ts';

export const recalculateCartTotals = async (cart: {
    items: { product: { toString(): string }; variantSku: string; quantity: number }[];
    totalItems: number;
    totalAmount: number;
}): Promise<void> => {
    let totalItems = 0;
    let totalAmount = 0;

    for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (!variant) continue;

        const unitPrice = Math.round((variant.price * (100 - (variant.discount || 0))) / 100);
        totalItems += item.quantity;
        totalAmount += unitPrice * item.quantity;
    }

    cart.totalItems = totalItems;
    cart.totalAmount = totalAmount;
};
