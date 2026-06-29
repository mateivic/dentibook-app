const priceFormatter = new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
});

export function sumPrices(items: Array<{ price: number }>): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

export function formatPrice(amount: number): string {
    if (!Number.isFinite(amount)) return "";
    return priceFormatter.format(amount);
}
