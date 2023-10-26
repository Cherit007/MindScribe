export async function checkout(secret_key:any, price_id:any) {
    try {
        const stripe = require('stripe')(secret_key);
        const paymentSession = await stripe.checkout.sessions.create({
            success_url: 'http://localhost:3000/?success=true',
            cancel_url: 'http://localhost:3000/?cancelled=true',
            line_items: [
                { price: price_id, quantity: 1 },
            ],
            mode: 'payment',
        });
        return paymentSession;
    } catch (err) {
        console.log(err);
    }
}