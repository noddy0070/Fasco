import Product from '../model/product.model.ts';

export const recalculateCartTotals = async (cart: {
    items: { product: { toString(): string }; variantSku: string; quantity: number }[];
    totalItems: number;
    totalAmount: number;
}): Promise<void> => {
    if (cart.items.length === 0) {
        cart.totalItems = 0;
        cart.totalAmount = 0;
        return;
    }

    // Single batched query instead of N individual findById calls.
    const productIds = cart.items.map((i) => i.product.toString());
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let totalItems = 0;
    let totalAmount = 0;

    for (const item of cart.items) {
        const product = productMap.get(item.product.toString());
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
